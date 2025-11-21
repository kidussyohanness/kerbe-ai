// Centralized content management for maintainability and localization

export const HERO_CONTENT = {
  title: "Turn Your Business Documents Into Smart Insights",
  subtitle: "Transform financial reports, balance sheets, and business documents into actionable intelligence with AI-powered analytics. Get instant KPIs, risk detection, and strategic recommendations.",
  description: "Powered by advanced AI • Real-time analytics • Enterprise-grade security",
  ctaText: "Start Analyzing Now",
  ctaHref: "/dashboard"
};

export const HOW_IT_WORKS_CONTENT = {
  title: "How It Works",
  steps: [
    {
      title: "Upload Your Documents",
      description: "Upload balance sheets, income statements, cash flow statements, or any business document. We support PDF, Excel, CSV, Word documents, and scanned images with OCR technology.",
      animationDelay: "0s"
    },
    {
      title: "AI Extracts & Validates",
      description: "Our AI extracts structured financial data from your documents, validates mathematical equations, detects errors and anomalies, and calculates confidence scores for each analysis.",
      animationDelay: "0.2s"
    },
    {
      title: "Access Insights & Chat",
      description: "View real-time KPIs on your dashboard, chat with KAI about your financial data, and access all your analyzed documents from one central location.",
      animationDelay: "0.4s"
    }
  ]
};

export const FEATURES_CONTENT = {
  title: "Why Choose KERBÉ AI?",
  features: [
    {
      title: "Instant Analysis",
      description: "Get comprehensive analysis in seconds with AI-powered extraction and validation",
      icon: "Zap"
    },
    {
      title: "AI Chat Assistant",
      description: "Ask KAI anything about your financial data - get instant answers and insights",
      icon: "Bot"
    },
    {
      title: "Real-Time KPIs",
      description: "Track 8+ key metrics including cash flow, profitability, and working capital",
      icon: "BarChart3"
    },
    {
      title: "Smart Detection",
      description: "Automatic anomaly detection, error flagging, and confidence scoring",
      icon: "Search"
    },
    {
      title: "8 Document Types",
      description: "Balance sheets, income statements, cash flow, orders, inventory, and more",
      icon: "FileText"
    },
    {
      title: "Enterprise Security",
      description: "Google OAuth authentication with complete data isolation and privacy",
      icon: "Shield"
    },
    {
      title: "Document Management",
      description: "Organize, search, and access all your documents with persistent storage",
      icon: "Folder"
    },
    {
      title: "Always Accessible",
      description: "Cloud-based platform accessible from any device, anywhere, anytime",
      icon: "Globe"
    }
  ]
};

export const STATS_CONTENT = {
  title: "Trusted by Businesses Worldwide",
  stats: [
    {
      value: "8+",
      label: "Document Types Supported",
      description: "Balance sheets, income statements, cash flow, and more"
    },
    {
      value: "<100ms",
      label: "Analysis Speed",
      description: "Lightning-fast AI processing"
    },
    {
      value: "100%",
      label: "Data Accuracy",
      description: "Mathematical validation & confidence scoring"
    },
    {
      value: "24/7",
      label: "AI Assistant",
      description: "KAI is always ready to help"
    }
  ]
};

export const DOCUMENT_TYPES_CONTENT = {
  title: "Comprehensive Document Support",
  subtitle: "Upload any business document and get instant AI-powered analysis",
  documentTypes: [
    {
      name: "Balance Sheets",
      icon: "BarChart3",
      description: "Assets, liabilities, and equity analysis with automatic equation validation",
      features: ["Current Assets", "Fixed Assets", "Debt Analysis", "Equity Tracking"]
    },
    {
      name: "Income Statements",
      icon: "DollarSign",
      description: "Revenue, expenses, and profit analysis with margin calculations",
      features: ["Revenue Breakdown", "Expense Tracking", "Profit Margins", "Growth Analysis"]
    },
    {
      name: "Cash Flow Statements",
      icon: "TrendingUp",
      description: "Operating, investing, and financing activities with cash runway insights",
      features: ["Operating Cash Flow", "Investing Activities", "Financing Activities", "Cash Runway"]
    },
    {
      name: "Financial Reports",
      icon: "FileSpreadsheet",
      description: "Comprehensive financial analysis with budget vs actual comparisons",
      features: ["Budget Analysis", "Variance Detection", "ROE Calculations", "Trend Forecasting"]
    },
    {
      name: "Order Sheets",
      icon: "ShoppingCart",
      description: "Sales and purchase order tracking with customer/supplier analytics",
      features: ["Order Tracking", "Customer Analytics", "Supplier Management", "Transaction History"]
    },
    {
      name: "Inventory Reports",
      icon: "Package",
      description: "Stock levels, SKU management, and inventory valuation",
      features: ["Stock Levels", "SKU Tracking", "Supplier Info", "Valuation Analysis"]
    },
    {
      name: "Customer Reports",
      icon: "Users",
      description: "Customer segmentation, lifetime value, and behavior analytics",
      features: ["Segmentation", "LTV Analysis", "Behavior Tracking", "Retention Metrics"]
    },
    {
      name: "Supplier Reports",
      icon: "Truck",
      description: "Supplier relationship management and performance tracking",
      features: ["Performance Metrics", "Relationship Tracking", "Cost Analysis", "Reliability Scores"]
    }
  ]
};

export const AI_CAPABILITIES_CONTENT = {
  title: "Powered by Advanced AI",
  subtitle: "Experience the future of business intelligence",
  capabilities: [
    {
      title: "Intelligent Data Extraction",
      description: "AI automatically extracts structured data from unstructured documents with high accuracy",
      icon: "Search"
    },
    {
      title: "Mathematical Validation",
      description: "Automatic equation checking ensures your balance sheets and calculations are correct",
      icon: "CheckCircle"
    },
    {
      title: "Anomaly Detection",
      description: "AI flags unusual patterns, errors, and potential issues before they become problems",
      icon: "AlertTriangle"
    },
    {
      title: "Confidence Scoring",
      description: "Every analysis includes a confidence score so you know how reliable the insights are",
      icon: "BarChart3"
    },
    {
      title: "Natural Language Chat",
      description: "Ask KAI questions in plain English and get instant answers about your financial data",
      icon: "MessageCircle"
    },
    {
      title: "Strategic Recommendations",
      description: "Get AI-generated suggestions to improve cash flow, reduce costs, and grow revenue",
      icon: "Lightbulb"
    }
  ]
};

export const USE_CASES_CONTENT = {
  title: "Real-World Use Cases",
  subtitle: "See how businesses use KERBÉ AI to make smarter decisions",
  useCases: [
    {
      title: "Financial Health Monitoring",
      description: "Upload monthly financials and instantly track KPIs like cash runway, profitability ratios, and working capital trends.",
      icon: "BarChart3",
      benefit: "Stay ahead of financial issues"
    },
    {
      title: "Investor Reporting",
      description: "Generate comprehensive reports with confidence scores and AI insights to impress investors and stakeholders.",
      icon: "TrendingUp",
      benefit: "Professional reporting made easy"
    },
    {
      title: "Budget Planning",
      description: "Compare actuals vs budget, identify variances, and get AI recommendations for better budget allocation.",
      icon: "DollarSign",
      benefit: "Smarter budget decisions"
    },
    {
      title: "Risk Management",
      description: "Automatically detect anomalies, flag potential issues, and get early warnings about financial risks.",
      icon: "Shield",
      benefit: "Proactive risk mitigation"
    },
    {
      title: "Quick Financial Analysis",
      description: "Chat with KAI to instantly understand your financial position without digging through spreadsheets.",
      icon: "Zap",
      benefit: "Instant financial clarity"
    },
    {
      title: "Document Organization",
      description: "Centralize all financial documents, search across them, and maintain a complete audit trail.",
      icon: "Folder",
      benefit: "Never lose track of documents"
    }
  ]
};

export const CTA_CONTENT = {
  title: "Ready to Transform Your Business?",
  description: "Join businesses using KERBÉ AI to make data-driven decisions, reduce manual work, and gain actionable insights.",
  ctaText: "Get Started Free Today",
  ctaHref: "/dashboard"
};

export const CONTACT_CONTENT = {
  title: "Get In Touch",
  description: "Have questions about KERBÉ AI? Want to learn more about our features? We're here to help you succeed."
};
