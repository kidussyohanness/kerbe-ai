'use client';

import React, { useRef, useState } from 'react';
import { TrendingUp, DollarSign, BarChart3, FileText, Package, Users, ShoppingCart, FileSpreadsheet, TrendingDown, Minus, ChevronDown, ChevronUp, Clock, Percent, RefreshCw, Shield, AlertTriangle, Lightbulb, Bot, MessageCircle } from 'lucide-react';

type HowItWorksSliderProps = {
  className?: string;
  autoSlide?: boolean;
  slideInterval?: number;
};

// Generate a well-distributed array of documents
const generateDocuments = () => {
  const documents: Array<{title: string, rotation: number, x: number, y: number, content: string[]}> = [];
  
  // Balance Sheets - Only one in front for diversity
  const balanceSheets = [
    { title: 'Balance Sheet Q4 2024', rotation: -8, x: 3, y: 5, content: ['ASSETS', 'Current Assets', 'Cash: $1,250,000', 'Accounts Receivable: $850,000', 'Inventory: $420,000', 'Total Current Assets: $2,520,000', '', 'LIABILITIES', 'Accounts Payable: $320,000'] },
  ];
  
  // Income Statements - More variety in front
  const incomeStatements = [
    { title: 'Income Statement Q4', rotation: -5, x: 28, y: 8, content: ['REVENUE', 'Product Sales: $5,200,000', 'Service Revenue: $1,800,000', 'Total Revenue: $7,000,000', '', 'EXPENSES', 'COGS: $3,500,000', 'Net Income: $1,400,000'] },
    { title: 'Income Statement Q3', rotation: 4, x: 42, y: 15, content: ['REVENUE', 'Q3 Revenue: $6,800,000', 'Q2 Revenue: $6,200,000', 'Growth: +9.7%', '', 'PROFIT', 'Gross Profit: $4,080,000'] },
    { title: 'Income Statement Q2', rotation: -3, x: 20, y: 20, content: ['REVENUE', 'Q2 Revenue: $6,200,000', 'Q1 Revenue: $5,800,000', 'Growth: +6.9%', '', 'PROFIT', 'Net Profit: $1,240,000'] },
  ];
  
  // Cash Flow Statements - More variety
  const cashFlows = [
    { title: 'Cash Flow Statement', rotation: -7, x: 8, y: 22, content: ['OPERATING ACTIVITIES', 'Net Income: $1,400,000', 'Depreciation: $120,000', 'Operating CF: $1,435,000', '', 'INVESTING', 'CapEx: -$250,000'] },
    { title: 'Cash Flow Q3', rotation: 5, x: 35, y: 28, content: ['OPERATING ACTIVITIES', 'Net Income: $1,360,000', 'Depreciation: $115,000', 'Operating CF: $1,383,000', '', 'INVESTING', 'CapEx: -$240,000'] },
    { title: 'Cash Flow Q2', rotation: -4, x: 15, y: 35, content: ['OPERATING ACTIVITIES', 'Net Income: $1,240,000', 'Depreciation: $110,000', 'Operating CF: $1,265,000', '', 'INVESTING', 'CapEx: -$220,000'] },
  ];
  
  // Bank Statements - Recent months
  const bankStatements = [
    { title: 'Bank Statement Nov', rotation: -6, x: 18, y: 35, content: ['BANK STATEMENT', 'Opening Balance: $1,180,000', 'Deposits: $580,000', 'Withdrawals: $510,000', 'Closing Balance: $1,250,000', '', 'TRANSACTIONS', 'Total: 247'] },
    { title: 'Bank Statement Oct', rotation: 3, x: 45, y: 38, content: ['BANK STATEMENT', 'Opening Balance: $1,120,000', 'Deposits: $620,000', 'Withdrawals: $560,000', 'Closing Balance: $1,180,000', '', 'TRANSACTIONS', 'Total: 231'] },
    { title: 'Bank Statement Sep', rotation: -4, x: 12, y: 48, content: ['BANK STATEMENT', 'Opening Balance: $1,050,000', 'Deposits: $600,000', 'Withdrawals: $530,000', 'Closing Balance: $1,120,000', '', 'TRANSACTIONS', 'Total: 218'] },
    { title: 'Bank Statement Dec', rotation: 2, x: 38, y: 45, content: ['BANK STATEMENT', 'Opening Balance: $1,250,000', 'Deposits: $620,000', 'Withdrawals: $580,000', 'Closing Balance: $1,290,000', '', 'TRANSACTIONS', 'Total: 265'] },
  ];
  
  // Payroll Summaries
  const payrolls = [
    { title: 'Payroll Summary Nov', rotation: 7, x: 25, y: 42, content: ['PAYROLL - NOV 2024', 'Headcount: 145', 'Total Payroll: $725,000', 'Avg Salary: $5,000', '', 'DEPARTMENTS', 'Sales: 45', 'Engineering: 38'] },
    { title: 'Payroll Summary Oct', rotation: -3, x: 38, y: 52, content: ['PAYROLL - OCT 2024', 'Headcount: 142', 'Total Payroll: $710,000', 'Avg Salary: $5,000', '', 'DEPARTMENTS', 'Sales: 44'] },
  ];
  
  // Revenue Details
  const revenueDetails = [
    { title: 'Revenue Detail Nov', rotation: -2, x: 5, y: 30, content: ['REVENUE DETAIL', 'Invoice #1001: $12,500', 'Invoice #1002: $8,300', 'Invoice #1003: $15,200', 'Total Invoices: 342', '', 'CUSTOMERS', 'Top 10: 65%'] },
    { title: 'Revenue Detail Oct', rotation: 6, x: 32, y: 45, content: ['REVENUE DETAIL', 'Invoice #0951: $11,200', 'Invoice #0952: $9,800', 'Invoice #0953: $14,500', 'Total Invoices: 328', '', 'CUSTOMERS', 'Top 10: 68%'] },
    { title: 'Revenue Detail Dec', rotation: -1, x: 50, y: 30, content: ['REVENUE DETAIL', 'Invoice #1101: $13,200', 'Invoice #1102: $9,500', 'Invoice #1103: $16,800', 'Total Invoices: 358', '', 'CUSTOMERS', 'Top 10: 67%'] },
  ];
  
  // Order Sheets
  const orders = [
    { title: 'Order Sheet Dec', rotation: -3, x: 22, y: 58, content: ['ORDERS - DEC 2024', 'Order #1234: $45,000', 'Order #1235: $32,000', 'Order #1236: $28,500', 'Total: $105,500', '', 'STATUS', 'Pending: 12'] },
    { title: 'Order Sheet Nov', rotation: 4, x: 48, y: 62, content: ['ORDERS - NOV 2024', 'Order #1123: $38,000', 'Order #1124: $42,500', 'Order #1125: $29,000', 'Total: $109,500', '', 'STATUS', 'Shipped: 28'] },
    { title: 'Order Sheet Oct', rotation: -2, x: 30, y: 65, content: ['ORDERS - OCT 2024', 'Order #1023: $42,000', 'Order #1024: $35,000', 'Order #1025: $31,500', 'Total: $108,500', '', 'STATUS', 'Shipped: 25'] },
  ];
  
  // Financial Reports (comprehensive - also popular)
  const financialReports = [
    { title: 'Financial Report Q3', rotation: 3, x: 10, y: 18, content: ['BUDGET vs ACTUAL', 'Revenue: $6.8M / $6.3M', 'Expenses: $5.4M / $5.6M', 'Variance: +$300K', '', 'METRICS', 'ROE: 17.8%'] },
    { title: 'Financial Report Q4', rotation: -2, x: 25, y: 12, content: ['BUDGET vs ACTUAL', 'Revenue: $7.0M / $6.5M', 'Expenses: $5.6M / $5.8M', 'Variance: +$200K', '', 'METRICS', 'ROE: 18.5%'] },
    { title: 'Budget Actuals', rotation: 6, x: 43, y: 55, content: ['BUDGET vs ACTUAL', 'Revenue: $7.0M / $6.5M', 'Expenses: $5.6M / $5.8M', 'Variance: +$200K', '', 'PERFORMANCE', 'On Target: 85%'] },
  ];
  
  // Other documents (less popular)
  const others = [
    { title: 'Inventory Report', rotation: -5, x: 40, y: 25, content: ['INVENTORY STATUS', 'SKU-001: 1,250 units', 'SKU-002: 850 units', 'SKU-003: 420 units', 'Total Value: $420,000', '', 'SUPPLIERS', 'Supplier A'] },
    { title: 'Customer Report', rotation: 2, x: 15, y: 55, content: ['CUSTOMER ANALYTICS', 'Total Customers: 245', 'New Customers: 18', 'Churn Rate: 2.5%', 'LTV: $45,000', '', 'TOP CUSTOMERS', 'ABC Corp: $125K'] },
    { title: 'Supplier Report', rotation: -6, x: 50, y: 48, content: ['SUPPLIER PERFORMANCE', 'Total Suppliers: 32', 'Avg Payment Terms: 30 days', 'On-time Delivery: 94%', '', 'TOP SUPPLIERS', 'Supplier A: $180K'] },
    { title: 'Tax Return 2023', rotation: 5, x: 30, y: 35, content: ['TAX RETURN 2023', 'Gross Income: $78,500,000', 'Deductions: $12,300,000', 'Taxable Income: $66,200,000', '', 'TAX PAID', 'Federal: $13,240,000'] },
    { title: 'Debt Schedule', rotation: -4, x: 7, y: 65, content: ['DEBT SCHEDULE', 'Total Debt: $3,200,000', 'Short-term: $1,800,000', 'Long-term: $1,400,000', '', 'INTEREST', 'Annual: $192,000'] },
    { title: 'CRM Pipeline', rotation: -3, x: 20, y: 25, content: ['CRM PIPELINE', 'Total Leads: 1,245', 'Qualified: 342', 'Closed Won: 89', 'Conversion: 7.1%', '', 'VALUE', 'Pipeline: $4.2M'] },
    { title: 'Vendor List', rotation: 4, x: 35, y: 62, content: ['VENDOR LIST', 'Total Vendors: 32', 'Payment Terms: 30 days', 'Total AP: $320,000', '', 'TOP VENDORS', 'Vendor A: $85K'] },
    { title: 'Trial Balance', rotation: -5, x: 52, y: 32, content: ['TRIAL BALANCE', 'Total Debits: $10,650,000', 'Total Credits: $10,650,000', 'Balance: $0', '', 'ACCOUNTS', 'Total: 156'] },
    { title: 'Balance Sheet Q3 2024', rotation: 3, x: 55, y: 50, content: ['ASSETS', 'Current Assets: $2,450,000', 'Fixed Assets: $8,200,000', 'Total Assets: $10,650,000', '', 'EQUITY', 'Share Capital: $5,000,000'] },
    { title: 'Expense Report Q4', rotation: -2, x: 8, y: 50, content: ['EXPENSE REPORT', 'Operating Expenses: $2,100,000', 'Marketing: $450,000', 'R&D: $380,000', 'Total: $2,930,000', '', 'VARIANCE', 'Budget: $3.0M'] },
    { title: 'Accounts Receivable', rotation: 4, x: 60, y: 20, content: ['ACCOUNTS RECEIVABLE', 'Total AR: $850,000', 'Aging 0-30: $520,000', 'Aging 31-60: $230,000', 'Aging 60+: $100,000', '', 'DSO', '32 days'] },
  ];
  
  // Reorder so most popular documents come LAST (highest z-index, appear on top)
  // Mix popular documents for diversity - don't have all balance sheets on top
  // Most popular (appear on top): Mix of Income Statements, Cash Flows, Financial Reports, Balance Sheets
  // Less popular (appear behind): Others, Orders, Payrolls, Revenue Details, Bank Statements
  return [
    ...others,
    ...orders,
    ...payrolls,
    ...revenueDetails,
    ...bankStatements,
    // Mix popular documents for diversity in front layer
    ...balanceSheets, // Only one balance sheet in front
    ...cashFlows, // Cash flow statements
    ...financialReports, // Financial reports
    ...incomeStatements, // Income statements (most visible)
  ];
};

const DOCUMENTS = generateDocuments();


export default function HowItWorksSlider({
  className = '',
  autoSlide = false,
  slideInterval = 5000,
}: HowItWorksSliderProps) {
  const [reveal, setReveal] = useState(0.30);
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // drag
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); // Prevent text selection
    setDragging(true);
  };
  const onPointerUp = () => setDragging(false);
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragging || !ref.current) return;
    e.preventDefault(); // Prevent text selection during drag
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setReveal(Math.min(1, Math.max(0, x / rect.width)));
  };
  
  // Prevent text selection on mouse down
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 0) { // Left mouse button
      e.preventDefault();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* window */}
      <div
        ref={ref}
        role="region"
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerMove={onPointerMove}
        onMouseDown={onMouseDown}
        className="
          relative overflow-hidden rounded-2xl
          border border-white/10 backdrop-blur
          bg-white/5 shadow-[0_0_40px_rgba(34,211,238,0.15)]
          ring-1 ring-cyan-300/20
          select-none
        "
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-black/30 border-b border-white/10">
          <div className="flex gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500/80" />
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400/80" />
            <span className="inline-block w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="ml-3 text-base md:text-lg font-medium text-white/80 truncate">
            Transform Documents → Insights
          </div>
        </div>

        <div className="relative h-[640px] md:h-[720px] overflow-hidden select-none">
          {/* Left side - Documents (clipped from right) */}
          <div
            className="absolute inset-0"
            style={{ 
              clipPath: `inset(0 ${Math.max(0, (1 - reveal) * 100)}% 0 0)`,
              zIndex: reveal <= 0.5 ? 2 : 1
            }}
          >
            <DocumentsPanel />
          </div>

          {/* Right side - KPIs (clipped from left) */}
          <div
            className="absolute inset-0"
            style={{ 
              clipPath: `inset(0 0 0 ${Math.max(0, reveal * 100)}%)`,
              zIndex: reveal > 0.5 ? 2 : 1
            }}
          >
            <KPIPanel />
          </div>

          {/* handle - positioned exactly at the split with higher z-index */}
          <div
            role="slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(reveal * 100)}
            tabIndex={0}
            className="absolute top-0 bottom-0 z-30 pointer-events-none"
            style={{ left: `${reveal * 100}%`, transform: 'translateX(-50%)' }}
          >
            <div className="pointer-events-auto h-full w-1 md:w-1.5 bg-cyan-400 shadow-[0_0_30px_rgba(34,211,238,1)] rounded-full" />
            <div className="pointer-events-auto absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] md:text-xs font-medium bg-black/80 border border-white/20 rounded-full text-white/90 backdrop-blur-sm">
              drag
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentsPanel() {
  return (
    <div className="absolute inset-0 p-2 flex flex-col select-none">
      <div className="w-full h-full rounded-xl border border-white/10 bg-black/50 overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 text-sm font-medium tracking-wide uppercase text-white/60 border-b border-white/10 bg-white/5 flex-shrink-0 select-none">
          Your Documents
        </div>
        <div className="p-2 h-full relative overflow-hidden bg-gradient-to-br from-black/60 to-black/40 flex-1 min-h-0 select-none">
          {/* Messy overlapping documents with real content */}
          <div className="relative w-full h-full">
            {DOCUMENTS.map((doc, i) => (
              <div
                key={i}
                className="absolute"
                style={{
                  left: `${doc.x}%`,
                  top: `${doc.y}%`,
                  transform: `rotate(${doc.rotation}deg)`,
                  zIndex: i,
                }}
              >
                <div className="bg-white/95 text-black p-4 md:p-5 rounded shadow-2xl border border-gray-300 max-w-[220px] md:max-w-[260px] select-none">
                  <div className="font-bold text-base mb-2 border-b border-gray-300 pb-1 select-none">
                    {doc.title}
                  </div>
                  <div className="text-sm md:text-base leading-tight space-y-0.5 font-mono select-none">
                    {doc.content.map((line, idx) => (
                      <div key={idx} className={line === '' ? 'h-1' : ''}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIPanel() {
  // 16 KPIs total: 4 columns x 4 rows (most important on the right)
  // Reorganized so most popular KPIs are in columns 3-4 (right side)
  const allMetrics = [
    // Row 1: Less critical on left, important on right
    { label: 'DSO', value: '32 days', trend: 'down', icon: Clock, color: 'text-purple-500' },
    { label: 'DPO', value: '28 days', trend: 'stable', icon: Clock, color: 'text-blue-500' },
    { label: 'Cash', value: '$1.25M', trend: 'up', icon: DollarSign, color: 'text-accent-blue', hasChart: true, chartData: [15, 16, 17, 18, 19, 20, 18, 19, 20, 21, 22, 20] },
    { label: 'Runway', value: '18 months', trend: 'up', icon: Clock, color: 'text-accent-green' },
    
    // Row 2: Less critical on left, important on right
    { label: 'DIO', value: '45 days', trend: 'down', icon: Clock, color: 'text-purple-400' },
    { label: 'Current Ratio', value: '2.4', trend: 'stable', icon: Shield, color: 'text-indigo-600' },
    { label: 'Free Cash Flow', value: '$1.18M', trend: 'up', icon: TrendingUp, color: 'text-accent-purple', hasChart: true, chartData: [0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.08, 1.12, 1.15, 1.18, 1.2] },
    { label: 'Revenue Growth', value: '+23%', trend: 'up', icon: Percent, color: 'text-accent-orange', hasChart: true, chartData: [15, 16, 17, 18, 19, 20, 21, 22, 22.5, 23, 23.2, 23.5] },
    
    // Row 3: Less critical on left, important on right
    { label: 'Quick Ratio', value: '1.8', trend: 'stable', icon: Shield, color: 'text-indigo-500' },
    { label: 'Debt Ratio', value: '0.32', trend: 'stable', icon: Shield, color: 'text-yellow-600' },
    { label: 'Gross Margin %', value: '42.5%', trend: 'up', icon: Percent, color: 'text-green-600', hasChart: true, chartData: [38, 39, 40, 40.5, 41, 41.5, 42, 42.2, 42.3, 42.4, 42.5, 42.6] },
    { label: 'Operating Margin %', value: '20.0%', trend: 'up', icon: TrendingUp, color: 'text-blue-600' },
    
    // Row 4: Less critical on left, important on right
    { label: 'Net Margin %', value: '18.2%', trend: 'up', icon: BarChart3, color: 'text-green-500' },
    { label: 'EBITDA Margin', value: '25.3%', trend: 'up', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Cash Conversion Cycle', value: '49 days', trend: 'down', icon: RefreshCw, color: 'text-purple-600', hasChart: true, chartData: [55, 53, 52, 51, 50, 49, 48, 49, 48, 49, 49, 48] },
    { label: 'Interest Coverage', value: '7.3x', trend: 'up', icon: Shield, color: 'text-red-600' },
  ];

  const renderChart = (data: number[], isPercentage = false) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 100;
    const height = 30;
    const stepX = width / (data.length - 1);
    
    const points = data.map((value, i) => {
      const x = i * stepX;
      const normalizedValue = (value - min) / range;
      const y = height - (normalizedValue * height * 0.7) - (height * 0.15); // Leave some padding
      return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${points} ${width},${height} 0,${height}`;

    return (
      <div className="h-10 mt-1.5 relative flex-shrink-0">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {/* Gradient area fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(34, 211, 238, 0.3)" />
              <stop offset="100%" stopColor="rgba(34, 211, 238, 0.05)" />
            </linearGradient>
          </defs>
          {/* Area fill */}
          <polygon
            points={areaPoints}
            fill="url(#chartGradient)"
          />
          {/* Main line */}
          <polyline
            points={points}
            fill="none"
            stroke="rgb(34, 211, 238)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Data points */}
          {data.map((_, i) => {
            const x = i * stepX;
            const normalizedValue = (data[i] - min) / range;
            const y = height - (normalizedValue * height * 0.7) - (height * 0.15);
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="1.5"
                fill="rgb(34, 211, 238)"
                stroke="rgba(0, 0, 0, 0.3)"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const criticalIssues = [
    { title: 'Cash Runway Declining', description: 'Down to 18 months from 19.5', severity: 'medium' },
    { title: 'Customer Concentration', description: 'Top customer = 42% revenue', severity: 'high' },
  ];

  const quickTips = [
    { tip: 'Runway Management', detail: 'Green: ≥12 mo | Yellow: 6-12 mo | Red: <6 mo' },
    { tip: 'Margin Health', detail: 'GM% drop >2pp MoM = Red flag' },
    { tip: 'Working Capital', detail: 'CCC rising ≥2 months or >60 days = Red' },
  ];

  const chatHistory = [
    { role: 'user', message: 'What\'s our cash runway?' },
    { role: 'ai', message: 'Your cash runway is 18 months based on current burn rate of $185K/month.' },
    { role: 'user', message: 'How can we improve it?' },
    { role: 'ai', message: 'Consider accelerating collections (DSO currently 32 days) and extending vendor payment terms. This could add 2-3 months to your runway.' },
  ];

  return (
    <div className="absolute inset-0 p-2 flex flex-col select-none">
      <div className="w-full h-full rounded-xl border border-white/10 bg-black/50 overflow-hidden flex flex-col">
        <div className="px-4 py-2.5 text-sm font-medium tracking-wide uppercase text-white/60 border-b border-white/10 bg-white/5 flex-shrink-0 select-none">
          Executive Dashboard
        </div>
        <div className="p-2 h-full overflow-hidden flex gap-2 flex-1 min-h-0 select-none">
          {/* Left 2/3 - KPIs Grid */}
          <div className="flex-[2] overflow-hidden min-h-0">
            <div className="grid grid-cols-4 gap-1.5 h-full">
              {allMetrics.map((metric, i) => (
                <div
                  key={i}
                  className="glass-container glass-gradient p-2.5 border border-white/10 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <metric.icon size={18} className={metric.color} />
                    {metric.trend === 'up' && (
                      <TrendingUp size={14} className="text-green-400" />
                    )}
                    {metric.trend === 'down' && (
                      <TrendingDown size={14} className="text-green-400" />
                    )}
                    {metric.trend === 'stable' && (
                      <Minus size={14} className="text-yellow-400" />
                    )}
                  </div>
                  <div className="text-sm text-white/60 mb-1.5 leading-tight">{metric.label}</div>
                  <div className="text-base font-bold text-white mb-1.5">{metric.value}</div>
                  {metric.hasChart && metric.chartData && (
                    <div className="mt-1 flex-shrink-0">
                      {renderChart(metric.chartData)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right 1/3 - Sidebar */}
          <div className="flex-1 flex flex-col gap-1 overflow-hidden min-h-0">
            {/* Critical Issues Section */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={16} className="text-red-500" />
                <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                  Critical Issues
                </h3>
              </div>
              <div className="space-y-1">
                {criticalIssues.map((issue, i) => (
                  <div
                    key={i}
                    className="glass-container glass-red p-2 border border-red-200/30 rounded"
                  >
                    <div className="flex items-start gap-1.5">
                      <div className={`w-2 h-2 rounded-full mt-0.5 ${
                        issue.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-red-300 mb-1 leading-tight">
                          {issue.title}
                        </div>
                        <div className="text-xs text-red-200/80 leading-tight">
                          {issue.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips Section */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={16} className="text-yellow-400" />
                <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                  Quick Tips
                </h3>
              </div>
              <div className="space-y-1">
                {quickTips.map((tip, i) => (
                  <div
                    key={i}
                    className="glass-container glass-blue p-2.5 border border-white/10 rounded"
                  >
                    <div className="text-xs font-semibold text-accent-blue mb-1 leading-tight">
                      {tip.tip}
                    </div>
                    <div className="text-[10px] text-white/60 leading-tight">
                      {tip.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* KAI Chat Section */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
                <Bot size={16} className="text-accent-blue" />
                <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wide">
                  KAI Chat
                </h3>
              </div>
              <div className="glass-container glass-gradient border border-white/10 rounded flex-1 flex flex-col overflow-hidden p-2 min-h-0">
                <div className="flex-1 overflow-hidden space-y-2 min-h-0">
                  {chatHistory.map((chat, i) => (
                    <div
                      key={i}
                      className={`flex gap-1.5 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {chat.role === 'ai' && (
                        <Bot size={14} className="text-accent-blue mt-0.5 flex-shrink-0" />
                      )}
                      <div
                        className={`max-w-[85%] p-2.5 rounded ${
                          chat.role === 'user'
                            ? 'bg-accent-blue/20 text-white text-sm'
                            : 'bg-white/5 text-white/80 text-sm'
                        }`}
                      >
                        {chat.message}
                      </div>
                      {chat.role === 'user' && (
                        <div className="w-5 h-5 rounded-full bg-accent-blue/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] text-white font-semibold">U</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-1.5 flex gap-1.5 items-center flex-shrink-0">
                  <input
                    type="text"
                    placeholder="Ask KAI..."
                    className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white/80 placeholder-white/40 focus:outline-none focus:border-accent-blue/50"
                    readOnly
                  />
                  <MessageCircle size={16} className="text-accent-blue" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

