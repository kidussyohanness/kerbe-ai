import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

// Extend the Profile type to include Google-specific properties
interface GoogleProfile {
  picture?: string;
  email?: string;
  name?: string;
  sub?: string;
}

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("⚠️  Google OAuth credentials not configured. Sign-in will not work.");
}

if (!process.env.NEXTAUTH_SECRET) {
  console.warn("⚠️  NEXTAUTH_SECRET not configured. This may cause authentication issues.");
}

export const authOptions: NextAuthOptions = {
  // No adapter needed - we're using JWT strategy which stores session in JWT token
  // User data is managed separately via Prisma when needed
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-client-secret",
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log("Sign in callback:", { user, account, profile });
      
      // Ensure profile picture is captured from Google
      if (account?.provider === "google" && profile) {
        const googleProfile = profile as GoogleProfile;
        if (googleProfile.picture) {
          user.image = googleProfile.picture;
        }
      }
      
      // Create or update User record in database to ensure consistent userId
      if (user.email && account?.provider === "google" && profile) {
        try {
          const googleProfile = profile as GoogleProfile;
          const googleId = googleProfile.sub;
          
          // Try to find existing user by email or googleId
          let dbUser = await prisma.user.findFirst({
            where: {
              OR: [
                { email: user.email },
                { googleId: googleId }
              ]
            }
          });
          
          if (!dbUser) {
            // Create new user in database
            dbUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || undefined,
                image: user.image || undefined,
                googleId: googleId,
                emailVerified: new Date()
              }
            });
            console.log(`Created new user in database: ${dbUser.id}`);
            
            // Try to migrate documents from test users to this new Google user
            // Look for test users created around the same time or with similar patterns
            try {
              const testUsers = await prisma.user.findMany({
                where: {
                  AND: [
                    { googleId: null },
                    { email: { startsWith: 'test-' } }
                  ]
                },
                include: {
                  documents: {
                    select: { id: true }
                  }
                }
              });
              
              // Migrate documents from test users to the new Google user
              for (const testUser of testUsers) {
                if (testUser.documents.length > 0) {
                  await prisma.userDocument.updateMany({
                    where: { userId: testUser.id },
                    data: { userId: dbUser.id }
                  });
                  console.log(`Migrated ${testUser.documents.length} documents from test user ${testUser.id} to Google user ${dbUser.id}`);
                }
              }
            } catch (migrationError) {
              console.error("Document migration failed (non-critical):", migrationError);
              // Continue - migration failure shouldn't block sign-in
            }
          } else {
            // Update existing user with latest info
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                name: user.name || dbUser.name,
                image: user.image || dbUser.image,
                googleId: googleId || dbUser.googleId,
                emailVerified: dbUser.emailVerified || new Date()
              }
            });
            console.log(`Updated existing user in database: ${dbUser.id}`);
          }
          
          // Set user.id to the database ID for consistent userId
          user.id = dbUser.id;
        } catch (error) {
          console.error("Failed to create/update user in database:", error);
          // Continue with sign-in even if database operation fails
        }
      }
      
      return true;
    },
    async session({ session, token }) {
      if (session?.user && token) {
        (session.user as { id?: string }).id = token.id as string;
        // Ensure profile picture is available in session
        if (token.image) {
          session.user.image = token.image as string;
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Use the database user ID (set in signIn callback) for consistency
        // This ensures the same userId is used across all sessions
        if (user.id) {
          token.id = user.id;
        } else if (user.email) {
          // Fallback: try to find user by email if ID not set
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: user.email }
            });
            if (dbUser) {
              token.id = dbUser.id;
            } else {
              // Last resort: generate from email (but this should rarely happen)
              token.id = `user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
            }
          } catch (error) {
            console.error("Error finding user by email:", error);
            token.id = user.email ? `user_${user.email.replace(/[^a-zA-Z0-9]/g, '_')}` : undefined;
          }
        }
        
        // Store profile picture in token
        if (user.image) {
          token.image = user.image;
        }
      }
      
      // Also capture from profile on first sign in
      if (account?.provider === "google" && profile && !token.id) {
        const googleProfile = profile as GoogleProfile;
        if (googleProfile.picture) {
          token.image = googleProfile.picture;
        }
        // Try to find user by googleId if token.id not set
        if (googleProfile.sub) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { googleId: googleProfile.sub }
            });
            if (dbUser) {
              token.id = dbUser.id;
            }
          } catch (error) {
            console.error("Error finding user by googleId:", error);
          }
        }
      }
      
      return token;
    },
  },
  debug: process.env.NODE_ENV === "development",
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};