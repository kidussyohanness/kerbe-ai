"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  MessageSquare, 
  FileText,
  LogOut
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Executive KPIs & top actions"
  },
  {
    name: "KAI",
    href: "/dashboard/chat",
    icon: MessageSquare,
    description: "Chat with your financial data"
  },
  {
    name: "My Documents",
    href: "/dashboard/documents",
    icon: FileText,
    description: "Upload & manage documents"
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    try {
      await signOut({ 
        callbackUrl: '/',
        redirect: true 
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 flex-col bg-glass-bg-secondary/80 backdrop-blur-xl border-r border-white/10 hidden lg:flex shadow-xl">
      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-3 py-6 overflow-y-auto">
        <ul role="list" className="flex flex-1 flex-col space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const IconComponent = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-accent-blue/20 to-accent-purple/20 text-accent-blue shadow-sm border border-accent-blue/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-white/5"
                  }`}
                >
                  {/* Icon Container */}
                  <div 
                    className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                      isActive 
                        ? "shadow-lg shadow-blue-500/30" 
                        : "bg-white/5 group-hover:bg-white/10"
                    }`}
                    style={isActive ? {
                      background: 'linear-gradient(135deg, #00d4ff 0%, #ff6b35 100%)'
                    } : {}}
                  >
                    <IconComponent className={`w-5 h-5 transition-colors ${
                      isActive ? "text-white" : "text-text-secondary group-hover:text-accent-blue"
                    }`} />
                  </div>
                  
                  {/* Navigation text */}
                  <div className="flex-1 min-w-0">
                    <span className={`block ${isActive ? 'font-semibold' : 'font-medium'} group-hover:translate-x-0.5 transition-transform duration-200`}>
                      {item.name}
                    </span>
                    <span className={`text-xs mt-0.5 block ${isActive ? 'text-accent-blue/70' : 'text-text-muted/70'}`}>
                      {item.description}
                    </span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-accent-blue to-accent-purple shadow-sm" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info - Enhanced */}
      <div className="flex-shrink-0 border-t border-white/10 p-4 bg-glass-bg-secondary/50">
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all duration-200 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Click to sign out"
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || 'User'}
              className="w-10 h-10 rounded-xl object-cover border-2 border-white/20 group-hover:border-accent-orange/50 transition-colors shadow-sm"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:shadow-lg transition-shadow">
              {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-semibold text-text-primary truncate group-hover:text-accent-orange transition-colors">
              {session?.user?.name || 'User'}
            </p>
            <p className="text-xs text-text-muted truncate">
              {session?.user?.email || 'Not signed in'}
            </p>
          </div>
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <LogOut className="w-4 h-4 text-text-secondary group-hover:text-accent-orange transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
}
