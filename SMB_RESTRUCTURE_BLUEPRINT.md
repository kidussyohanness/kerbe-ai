# 🏗️ SMB Platform Restructure - Implementation Blueprint

**Status:** 🚧 **In Progress** - Core Foundation Complete  
**Date:** October 17, 2025

---

## ✅ **COMPLETED: Core Foundation**

### **1. New Document Types** ✅

**File:** `src/types/smbDocumentTypes.ts`

**BARE MINIMUM Documents (Required Monthly, 24-36 months preferred):**
- ✅ `pl_income_statement` - P&L / Income Statement
- ✅ `balance_sheet` - AR, AP, Inventory, Cash
- ✅ `bank_statement` - Bank statements (12-24 months)
- ✅ `revenue_detail` - Invoice-level data
- ✅ `payroll_summary` - Monthly headcount & totals
- ✅ `inventory_report` - On-hand, purchases, write-offs

**NICE TO HAVE Documents (Supplemental):**
- ✅ `trial_balance` - GL export
- ✅ `vendor_list` - Vendor terms
- ✅ `tax_return` - Tax returns
- ✅ `debt_schedule` - Debt details
- ✅ `budget_actuals` - Budget vs. actuals
- ✅ `crm_pipeline` - CRM/pipeline data

**Each document type includes:**
- Display name & description
- Priority level (required/recommended/optional)
- Insights unlocked
- Recommended upload frequency
- Data completeness scoring

---

### **2. SMB Metrics & Formulas** ✅

**File:** `src/services/smbMetrics.ts`

**Implemented Formulas:**

```typescript
// Working Capital
DSO = AR / (Total Revenue / Days)              // Days Sales Outstanding
DPO = AP / (COGS / Days)                       // Days Payable Outstanding
DIO = Inventory / (COGS / Days)                // Days Inventory Outstanding
CCC = DSO + DIO - DPO                          // Cash Conversion Cycle

// Cash & Runway
Runway = Current Cash / |Avg Monthly Burn|

// Growth & Performance
Gross Margin % = (Revenue - COGS) / Revenue * 100
EBITDA Margin = (Net Income + Est. D&A) / Revenue * 100
Revenue Growth MoM = (Current - Previous) / Previous * 100
Revenue Growth YoY = (Current - Year Ago) / Year Ago * 100

// Efficiency
Revenue per FTE = Total Revenue / Headcount
Cost per FTE = Operating Expenses / Headcount

// Risk
Customer Concentration (HHI) = Σ(customer_share²)
Seasonality Index = Current Month / 12-Month Avg
```

**Action Recommendations Engine:**
- Generates top 5 actions with $ impact
- Prioritizes by urgency (high/medium/low)
- Provides specific action steps
- Links to source data

---

## 🎯 **NEW INFORMATION ARCHITECTURE**

### **Overview** - 🚧 Next

**What to Show:**
```
┌─────────────────────────────────────────────────────────┐
│ KPI Cards (6):                                          │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│ │ Revenue  │ │  GM %    │ │   Cash   │ │  Burn    │  │
│ │  (TTM)   │ │          │ │          │ │  Rate    │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
│ ┌──────────┐ ┌──────────┐                             │
│ │  Runway  │ │   CCC    │                             │
│ │ (months) │ │  (days)  │                             │
│ └──────────┘ └──────────┘                             │
│                                                         │
│ 3 Key Tiles:                                           │
│ ┌─────────────────┐ ┌─────────────────┐ ┌──────────┐ │
│ │ What Changed    │ │ Top Risk        │ │Quick Win │ │
│ │ (vs last month) │ │ (attention req) │ │(easy $ ) │ │
│ └─────────────────┘ └─────────────────┘ └──────────┘ │
│                                                         │
│ Top 3 Actions (with $ impact):                         │
│ 🎯 Accelerate Collections → +$82k cash, +1.6mo runway │
│ 💰 Improve Gross Margins → +$15k monthly profit       │
│ ⚠️  Reduce Customer Concentration → -15% risk         │
└─────────────────────────────────────────────────────────┘
```

**Page:** `/dashboard`

---

### **Sales & Customers** - 📋 Planned

**What to Show:**
- Revenue growth trends (MoM, YoY)
- Price × Volume decomposition
- Product/channel/customer mix
- Customer concentration analysis
- Churn and repeat rate
- Actions to optimize

**Page:** `/dashboard/sales`

---

### **Costs & Margins** - 📋 Planned

**What to Show:**
- Gross margin bridge (price, cost, mix)
- Vendor exposure & concentration
- Payroll vs. sales ratio
- Operating expense breakdown
- Actions to improve margins

**Page:** `/dashboard/costs`

---

### **Working Capital** - 📋 Planned

**What to Show:**
```
Tabs: AR | AP | Inventory

AR Tab:
  • DSO trend & peer benchmark
  • Aging buckets (0-30, 31-60, 61-90, 90+)
  • Rollforward: Beg + Sales - Collections = End
  • Top 10 late payers
  • Action: Accelerate collections ($ impact)

AP Tab:
  • DPO trend
  • Payment terms analysis
  • Top vendors
  • Action: Optimize payment timing

Inventory Tab:
  • DIO trend
  • Turnover ratio
  • Stockouts & dead stock
  • Write-off analysis
  • Action: Optimize inventory levels
```

**Page:** `/dashboard/working-capital`

---

### **Cash & Runway** - 📋 Planned

**What to Show:**
- Cash waterfall (Operating + Investing + Financing)
- Book↔Bank reconciliation
- Upcoming cash events calendar
- Runway projection (3 scenarios)
- Burn rate trend
- Actions to extend runway

**Page:** `/dashboard/cash-runway`

---

### **Forecast & Scenarios** - 📋 Planned

**What to Show:**
- Driver-based 12-18 month model
- Revenue forecast (seasonality-adjusted)
- Expense forecast (fixed + variable)
- Cash flow forecast
- **Interactive sliders:**
  - Price: ±5% → $ impact
  - DSO: ±7 days → cash impact
  - Hiring: ±2 FTEs → expense impact

**Page:** `/dashboard/forecast`

---

### **Data Quality & Reconciliation** - 📋 Planned

**What to Show:**
```
Data Health Score: 87/100

Document Freshness:
✅ P&L: Last uploaded 2 days ago
✅ Bank: Last uploaded 1 week ago
⚠️  AR: Last uploaded 45 days ago (STALE)

Completeness:
✅ Required docs: 5/5 (100%)
⚠️  Recommended: 2/3 (67%) - Missing vendor list
○  Optional: 1/4 (25%)

Data Depth:
✅ 24 months of history (target: 24+)

Reconciliation Status:
✅ Cash: Book vs. Bank matched (±$127)
⚠️  AR Rollforward: Off by $3,482 (0.8%)
✅ AP Rollforward: Matched

Anomalies Detected (3):
⚠️  Revenue spike in Aug (47% above trend) - needs review
⚠️  Unusual GM drop in Sep (32% → 21%) - freight reclass?
○  Duplicate invoice detected: INV-4821

Actions:
1. Upload fresh AR aging (last: 45 days ago)
2. Review revenue spike in August
3. Investigate GM variance in September
```

**Page:** `/dashboard/data-quality`

---

## 📊 **WHAT INSIGHTS EACH DOC UNLOCKS**

| Document Type | Key Insights |
|---------------|--------------|
| **P&L** | Revenue growth, GM%, opex mix, EBITDA, seasonality |
| **Balance Sheet** | DSO, DPO, DIO, cash conversion cycle, working capital needs |
| **Bank Statements** | Cash truth, timing differences, fraud/duplicates, runway |
| **Revenue Detail** | Price vs. volume, mix analysis, concentration, churn/repeat |
| **Payroll** | Run-rate, hiring cadence, cost per FTE, revenue per FTE |
| **Inventory** | Turns, stockouts, dead stock %, margin leakage |

---

## 🔄 **CLIENT ONBOARDING TEMPLATE**

**What to send to new clients:**

```
📧 Subject: Quick Start - Upload Your Financial Data

Hi [Client],

To get started with your financial intelligence platform, please upload 
the last 24-36 months of these documents:

✅ REQUIRED (monthly):
1. P&L / Income Statement
2. Balance Sheet (or at minimum: AR, AP, Inventory, Cash balances)
3. Bank Statements (last 12-24 months)
4. Revenue Detail (invoice-level: date, amount, product, customer)
5. Payroll Summary (monthly headcount & total payroll)

✅ RECOMMENDED (if applicable):
6. Inventory Report (on-hand quantities, purchases, write-offs)

📎 Formats: CSV, Excel, or PDF

Once uploaded, you'll instantly see:
• Your cash runway
• Top 3 actions with $ impact
• Complete financial dashboard

Questions? Reply to this email.

[Upload Button]
```

---

## 🎨 **UI COMPONENT PATTERN**

**Every page follows this structure:**

```typescript
<PageLayout>
  {/* KPI Cards */}
  <MetricCards>
    {metrics.map(m => (
      <MetricCard
        value={m.value}
        trend={m.trend}
        benchmark={m.benchmark}
        onExplain={() => showProvenance(m)}
      />
    ))}
  </MetricCards>

  {/* Trend Charts */}
  <TrendSection>
    <LineChart data={historicalData} />
  </TrendSection>

  {/* Driver Breakdown */}
  <DriverBreakdown>
    <WaterfallChart segments={drivers} />
  </DriverBreakdown>

  {/* Anomalies */}
  <AnomalyList>
    {anomalies.map(a => (
      <AnomalyCard
        title={a.title}
        impact={a.impact}
        explanation={a.llm_explanation}
      />
    ))}
  </AnomalyList>

  {/* Actions */}
  <ActionRecommendations>
    {actions.map(a => (
      <ActionCard
        title={a.title}
        impact={`${a.impact.metric}: $${a.impact.amount.toLocaleString()}`}
        urgency={a.urgency}
        steps={a.action_steps}
        sourceData={a.source_data}
      />
    ))}
  </ActionRecommendations>
</PageLayout>
```

---

## 🛠️ **IMPLEMENTATION STATUS**

### **✅ COMPLETE:**
- [x] Document type system (12 types with metadata)
- [x] SMB metrics formulas (DSO, DPO, DIO, CCC, Runway, etc.)
- [x] Action recommendation engine
- [x] Customer concentration analysis
- [x] Data completeness scoring

### **🚧 IN PROGRESS:**
- [ ] New executive dashboard (/dashboard)
- [ ] Update sidebar navigation
- [ ] Implement action cards with $ impact

### **📋 PLANNED:**
- [ ] Sales & Customers page
- [ ] Costs & Margins page
- [ ] Working Capital page (AR/AP/Inventory tabs)
- [ ] Cash & Runway page
- [ ] Forecast & Scenarios page
- [ ] Data Quality page
- [ ] Backend integration for new metrics
- [ ] Real data processing for invoice-level analysis

---

## 🎯 **QUICK WINS TO IMPLEMENT NEXT**

### **1. Update Dashboard Overview** (Highest Priority)

Replace current dashboard with exec KPIs:
- 6 KPI cards: Revenue (TTM), GM%, Cash, Burn, Runway, CCC
- 3 insight tiles: What Changed, Top Risk, Quick Win
- Top 3 actions with $ impact
- Data completeness score

**Files to modify:**
- `src/app/dashboard/page.tsx`
- Create `src/components/ExecKPICard.tsx`
- Create `src/components/ActionRecommendationCard.tsx`

### **2. Update Upload Page**

Show the new document types with:
- Required vs. Optional indicators
- What insights each unlocks
- Data completeness progress bar

**Files to modify:**
- `src/app/dashboard/analysis/page.tsx`

### **3. Update Sidebar Navigation**

New structure:
```
Dashboard (Overview)
Sales & Customers
Costs & Margins
Working Capital
Cash & Runway
Forecast
My Documents
Data Quality
```

**Files to modify:**
- `src/components/Sidebar.tsx`

---

## 📚 **DELIVERABLES TO CLIENTS**

**What owners get:**

1. **Cash Runway Dashboard**
   - Exact # of months
   - Levers to extend it (with $ impact)

2. **Top 3 Monthly Actions**
   - $ impact estimate
   - Specific steps
   - Links to source data rows

3. **Simple Forecast**
   - 12-18 month projection
   - Interactive sliders (price, DSO, hiring)
   - Scenario comparison

4. **Data Health Report**
   - Freshness & completeness
   - Reconciliation status
   - "Fix this" prompts

---

## 🚀 **NEXT STEPS**

**To complete this restructure:**

1. ✅ **Done:** Core types & formulas
2. **Next:** Update dashboard with exec KPIs
3. **Then:** Add new navigation pages
4. **Then:** Integrate real data processing
5. **Finally:** Add forecast & scenario builder

**Estimated time to complete:** 2-3 sessions

---

## 📖 **REFERENCE**

**Key Files:**
- `src/types/smbDocumentTypes.ts` - Document type definitions
- `src/services/smbMetrics.ts` - Metrics & formulas
- This guide: Implementation roadmap

**Formulas Quick Reference:**
```
DSO = AR / (Revenue / 365)
DPO = AP / (COGS / 365)
DIO = Inventory / (COGS / 365)
CCC = DSO + DIO - DPO
Runway = Cash / |Monthly Burn|
HHI = Σ(share²)
```

---

**Status:** Core foundation complete ✅  
**Ready for:** Dashboard implementation 🎯  
**Goal:** Ship value-first SMB financial intelligence 🚀

