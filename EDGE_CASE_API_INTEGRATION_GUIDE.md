# 🔌 Edge Case Features - Frontend Integration Guide

**Quick reference for integrating all edge case handling features into the frontend**

---

## 📱 New Features Available

1. **Insight Provenance** - Show which documents contributed to an insight
2. **Conflict Detection** - Warn users about conflicting data
3. **Calculation Details** - Show formulas and breakdowns
4. **AI Chat** - Ask questions about documents
5. **Document Preview** - Quick content preview
6. **Empty State** - Handled automatically
7. **Math Validation** - Shown in analysis results

---

## 🎯 API Endpoints & Usage

### 1. **Insight Provenance** - "Why this insight?"

**When to use:** User clicks "Why?" or "Source" button on an insight

**Endpoint:** `POST /insights/provenance`

**Request:**
```typescript
const response = await fetch(`${BACKEND_URL}/insights/provenance`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': session.user.id
  },
  body: JSON.stringify({
    insightText: "Excellent profit margin of 27.3%"
  })
});

const data = await response.json();
```

**Response:**
```typescript
{
  success: true,
  provenance: {
    insightText: "Excellent profit margin of 27.3%",
    formula: "Profit Margin = (Total Net Income ÷ Total Revenue) × 100",
    calculation: "($22,190,000 ÷ $81,300,000) × 100 = 27.29%",
    sourceDocuments: [
      {
        id: "doc-123",
        filename: "q2_2024_income_statement.csv",
        documentType: "income_statement",
        uploadDate: "2025-10-16T...",
        contributedData: ["Revenue: $42.80M", "Net Income: $3.29M"]
      },
      // ... more documents
    ],
    confidence: 100,
    methodology: "Aggregates data from 2 income statement(s)..."
  }
}
```

**UI Example:**
```tsx
// In your insight card component
<div className="insight-card">
  <p>{insight.text}</p>
  <button onClick={() => showProvenance(insight.text)}>
    Why? 🔍
  </button>
</div>

// Modal/Drawer showing provenance
<InsightProvenanceModal>
  <h3>{provenance.insightText}</h3>
  <div className="formula">{provenance.formula}</div>
  <div className="calculation">{provenance.calculation}</div>
  
  <h4>Source Documents ({provenance.sourceDocuments.length})</h4>
  {provenance.sourceDocuments.map(doc => (
    <div key={doc.id} className="source-doc">
      <span>{doc.filename}</span>
      <span>{doc.documentType}</span>
      <ul>
        {doc.contributedData.map(data => (
          <li>{data}</li>
        ))}
      </ul>
    </div>
  ))}
  
  <div className="methodology">
    <strong>Methodology:</strong> {provenance.methodology}
  </div>
  <div className="confidence">
    Confidence: {provenance.confidence}%
  </div>
</InsightProvenanceModal>
```

---

### 2. **Conflict Detection** - Show data conflicts

**When to use:** On dashboard load, show banner if conflicts exist

**Endpoint:** `GET /insights/conflicts`

**Request:**
```typescript
const response = await fetch(`${BACKEND_URL}/insights/conflicts`, {
  headers: {
    'x-user-id': session.user.id
  }
});

const data = await response.json();
```

**Response:**
```typescript
{
  success: true,
  conflicts: {
    hasConflicts: true,
    conflicts: [
      {
        metric: "totalAssets",
        values: [
          {
            value: 17150000,
            source: "q1_balance_sheet_v1.csv",
            documentId: "doc-123",
            uploadDate: "2025-10-16T10:00:00Z"
          },
          {
            value: 18500000,
            source: "q1_balance_sheet_v2.csv",
            documentId: "doc-124",
            uploadDate: "2025-10-16T11:00:00Z"
          }
        ],
        severity: "medium",  // "high" | "medium" | "low"
        recommendation: "Review documents to ensure accuracy..."
      }
    ]
  }
}
```

**UI Example:**
```tsx
// Show conflict banner on dashboard
{conflicts.hasConflicts && (
  <ConflictBanner>
    <AlertCircle className="icon" />
    <div>
      <h4>Data Conflicts Detected</h4>
      <p>Found {conflicts.conflicts.length} conflict(s) in your data</p>
      <button onClick={() => setShowConflicts(true)}>
        Review Conflicts
      </button>
    </div>
  </ConflictBanner>
)}

// Conflict details modal
<ConflictModal>
  {conflicts.conflicts.map(conflict => (
    <div key={conflict.metric} className={`conflict-${conflict.severity}`}>
      <h4>{conflict.metric}</h4>
      <p>Found {conflict.values.length} different values:</p>
      
      {conflict.values.map(val => (
        <div className="conflict-value">
          <span>${(val.value / 1000000).toFixed(2)}M</span>
          <span>{val.source}</span>
          <span>{new Date(val.uploadDate).toLocaleDateString()}</span>
        </div>
      ))}
      
      <div className="recommendation">
        <strong>Recommendation:</strong> {conflict.recommendation}
      </div>
      <div className="resolution">
        <span>✓ Using most recent value: ${conflict.values[conflict.values.length - 1].value}</span>
      </div>
    </div>
  ))}
</ConflictModal>
```

---

### 3. **Calculation Details** - Show formulas

**When to use:** User clicks "Show Calculation" on a metric card

**Endpoint:** `GET /insights/calculation/:metricName`

**Available Metrics:**
- `profit_margin`
- `debt_to_equity`
- `roe` (Return on Equity)
- `total_revenue`

**Request:**
```typescript
const response = await fetch(
  `${BACKEND_URL}/insights/calculation/profit_margin`,
  {
    headers: { 'x-user-id': session.user.id }
  }
);

const data = await response.json();
```

**Response:**
```typescript
{
  success: true,
  calculation: {
    metric: "Profit Margin",
    formula: "(Total Net Income ÷ Total Revenue) × 100",
    calculation: {
      totalNetIncome: 22190000,
      totalRevenue: 81300000,
      result: 27.29,
      unit: "%"
    },
    breakdown: [
      {
        document: "q2_2024_income_statement.csv",
        period: "Q2 2024",
        revenue: 42800000,
        netIncome: 3290000,
        margin: 7.69
      },
      {
        document: "q1_2024_income_statement.csv",
        period: "Q1 2024",
        revenue: 38500000,
        netIncome: 18900000,
        margin: 49.09
      }
    ],
    methodology: "Aggregates net income and revenue from 2 income statement(s)...",
    interpretation: "Excellent profitability"
  }
}
```

**UI Example:**
```tsx
// Metric card with "Show Calc" button
<div className="metric-card">
  <h4>Profit Margin</h4>
  <div className="metric-value">27.3%</div>
  <div className="metric-status">Excellent</div>
  <button onClick={() => showCalculation('profit_margin')}>
    Show Calculation 🧮
  </button>
</div>

// Calculation modal
<CalculationModal>
  <h3>{calc.metric}</h3>
  
  <div className="formula-section">
    <h4>Formula</h4>
    <code>{calc.formula}</code>
  </div>
  
  <div className="calculation-section">
    <h4>Calculation</h4>
    <div>
      Total Net Income: ${calc.calculation.totalNetIncome.toLocaleString()}
    </div>
    <div>
      Total Revenue: ${calc.calculation.totalRevenue.toLocaleString()}
    </div>
    <div className="result">
      <strong>Result: {calc.calculation.result}{calc.calculation.unit}</strong>
    </div>
  </div>
  
  <div className="breakdown-section">
    <h4>Breakdown by Period</h4>
    <table>
      <thead>
        <tr>
          <th>Period</th>
          <th>Revenue</th>
          <th>Net Income</th>
          <th>Margin</th>
        </tr>
      </thead>
      <tbody>
        {calc.breakdown.map(row => (
          <tr key={row.document}>
            <td>{row.period}</td>
            <td>${(row.revenue / 1000000).toFixed(2)}M</td>
            <td>${(row.netIncome / 1000000).toFixed(2)}M</td>
            <td>{row.margin.toFixed(2)}%</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  
  <div className="methodology">
    <h4>Methodology</h4>
    <p>{calc.methodology}</p>
  </div>
  
  <div className="interpretation">
    <h4>Interpretation</h4>
    <p>{calc.interpretation}</p>
  </div>
</CalculationModal>
```

---

### 4. **AI Chat** - Ask questions about documents

**When to use:** Chat interface for asking questions about uploaded documents

**Endpoint:** `POST /insights/ask`

**Request:**
```typescript
const response = await fetch(`${BACKEND_URL}/insights/ask`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': session.user.id
  },
  body: JSON.stringify({
    question: "What is my total revenue and how is it trending?",
    documentIds: ["doc-123", "doc-124"]  // Optional: specific docs only
  })
});

const data = await response.json();
```

**Response:**
```typescript
{
  success: true,
  answer: "Based on your uploaded documents, your total revenue for the first half of 2024 is $81.3M. Q1 was $38.5M and Q2 was $42.8M, showing a positive 11% quarter-over-quarter growth...",
  documentsUsed: 10,
  usage: {
    prompt_tokens: 450,
    completion_tokens: 180,
    total_tokens: 630
  }
}
```

**UI Example:**
```tsx
// Chat interface component
const [messages, setMessages] = useState([]);
const [question, setQuestion] = useState('');
const [loading, setLoading] = useState(false);

const askQuestion = async () => {
  setLoading(true);
  
  // Add user message
  setMessages([...messages, { role: 'user', content: question }]);
  
  const response = await fetch(`${BACKEND_URL}/insights/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': session.user.id
    },
    body: JSON.stringify({ question })
  });
  
  const data = await response.json();
  
  // Add AI response
  setMessages([
    ...messages,
    { role: 'user', content: question },
    { 
      role: 'assistant', 
      content: data.answer,
      documentsUsed: data.documentsUsed
    }
  ]);
  
  setQuestion('');
  setLoading(false);
};

return (
  <div className="chat-container">
    <div className="messages">
      {messages.map((msg, idx) => (
        <div key={idx} className={`message ${msg.role}`}>
          <div className="content">{msg.content}</div>
          {msg.documentsUsed && (
            <div className="meta">
              Used {msg.documentsUsed} documents
            </div>
          )}
        </div>
      ))}
    </div>
    
    <div className="input-area">
      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask about your documents..."
        onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
      />
      <button onClick={askQuestion} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
    </div>
    
    <div className="suggestions">
      <strong>Try asking:</strong>
      <button onClick={() => setQuestion("What's my revenue trend?")}>
        What's my revenue trend?
      </button>
      <button onClick={() => setQuestion("How healthy are my finances?")}>
        How healthy are my finances?
      </button>
      <button onClick={() => setQuestion("What should I focus on?")}>
        What should I focus on?
      </button>
    </div>
  </div>
);
```

---

### 5. **Document Preview** - Quick content view

**When to use:** User clicks "Preview" on a document in the list

**Endpoint:** `GET /documents/:documentId/preview`

**Request:**
```typescript
const response = await fetch(
  `${BACKEND_URL}/documents/${documentId}/preview`,
  {
    headers: { 'x-user-id': session.user.id }
  }
);

const data = await response.json();
```

**Response:**
```typescript
{
  success: true,
  preview: {
    content: "Company,Acme Tech Solutions Inc.\nPeriod,Q2 2024\nDate,2024-06-30\n\nAccount,Amount\nCash and Cash Equivalents,3200000\nAccounts Receivable,1890000...",
    lines: 6,
    totalSize: 773,
    mimeType: "text/csv",
    documentType: "balance_sheet",
    hasMore: true
  }
}
```

**UI Example:**
```tsx
// Document list with preview button
<div className="document-item">
  <div className="doc-info">
    <h4>{document.filename}</h4>
    <span>{document.documentType}</span>
  </div>
  <button onClick={() => showPreview(document.id)}>
    Preview 👁️
  </button>
</div>

// Preview modal
<DocumentPreviewModal>
  <h3>Document Preview</h3>
  <div className="doc-meta">
    <span>Type: {preview.documentType}</span>
    <span>Size: {(preview.totalSize / 1024).toFixed(2)} KB</span>
    <span>Lines: {preview.lines}</span>
  </div>
  
  <div className="preview-content">
    <pre>{preview.content}</pre>
  </div>
  
  {preview.hasMore && (
    <div className="has-more">
      <span>... more content available</span>
      <button onClick={() => downloadDocument(documentId)}>
        Download Full Document
      </button>
    </div>
  )}
</DocumentPreviewModal>
```

---

### 6. **Empty State** - Already handled in dashboard

**When to use:** Automatically shown when no documents uploaded

**Endpoint:** Same as dashboard - `GET /dashboard/overview`

**Response (when no documents):**
```typescript
{
  success: true,
  data: {
    metrics: {
      documentsAnalyzed: 0,
      completeness: 0,
      keyInsights: [
        "No documents uploaded yet - upload your first financial document to get started"
      ],
      recommendations: [
        "Upload a balance sheet to track your financial position",
        "Upload an income statement to monitor profitability",
        "Upload a cash flow statement to track cash generation"
      ]
    }
  }
}
```

**UI Example:**
```tsx
// Show empty state when no documents
{dashboardData.metrics.documentsAnalyzed === 0 ? (
  <EmptyState>
    <FileUploadIcon className="icon" />
    <h2>No Documents Yet</h2>
    <p>{dashboardData.metrics.keyInsights[0]}</p>
    
    <div className="recommendations">
      <h3>Get Started:</h3>
      <ul>
        {dashboardData.metrics.recommendations.map(rec => (
          <li key={rec}>{rec}</li>
        ))}
      </ul>
    </div>
    
    <button onClick={() => router.push('/dashboard/analysis')}>
      Upload Your First Document
    </button>
  </EmptyState>
) : (
  <DashboardContent data={dashboardData} />
)}
```

---

### 7. **Math Validation** - Shown in analysis results

**When to use:** Display warnings when analysis detects math errors

**Endpoint:** Same as upload - `POST /document/analyze`

**Response (with math errors):**
```typescript
{
  success: true,
  analysisResult: {
    success: true,
    mathValidation: {
      isValid: false,
      warnings: [
        "Balance sheet equation does not balance",
        "Assets ($15M) != Liabilities ($6.75M) + Equity ($9.2M)"
      ]
    },
    errorDetection: {
      invalidFields: 2,
      warnings: [...]
    },
    confidence: 80,  // Reduced from 100
    extractedData: {
      // ... data still extracted
    }
  }
}
```

**UI Example:**
```tsx
// After document upload, show warnings if math errors detected
{analysisResult.mathValidation && !analysisResult.mathValidation.isValid && (
  <MathValidationWarning>
    <AlertTriangle className="icon" />
    <div>
      <h4>Math Validation Warnings</h4>
      <ul>
        {analysisResult.mathValidation.warnings.map(warning => (
          <li key={warning}>{warning}</li>
        ))}
      </ul>
      <p>
        Confidence Score: {analysisResult.confidence}%
        (reduced due to detected errors)
      </p>
      <button onClick={() => setShowDetails(true)}>
        View Error Details
      </button>
    </div>
  </MathValidationWarning>
)}
```

---

## 🎨 Complete Dashboard Integration Example

Here's a complete example showing how to integrate all features:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function EnhancedDashboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState(null);
  const [conflicts, setConflicts] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  // Load dashboard data
  useEffect(() => {
    if (!session?.user?.id) return;
    
    Promise.all([
      fetch(`${BACKEND_URL}/dashboard/overview`, {
        headers: { 'x-user-id': session.user.id }
      }).then(r => r.json()),
      
      fetch(`${BACKEND_URL}/insights/conflicts`, {
        headers: { 'x-user-id': session.user.id }
      }).then(r => r.json())
    ]).then(([dashboard, conflicts]) => {
      setDashboardData(dashboard.data);
      setConflicts(conflicts.conflicts);
    });
  }, [session]);

  const showInsightProvenance = async (insightText) => {
    const response = await fetch(`${BACKEND_URL}/insights/provenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': session.user.id
      },
      body: JSON.stringify({ insightText })
    });
    
    const data = await response.json();
    setSelectedInsight(data.provenance);
  };

  const showCalculationDetails = async (metricName) => {
    const response = await fetch(
      `${BACKEND_URL}/insights/calculation/${metricName}`,
      { headers: { 'x-user-id': session.user.id } }
    );
    
    const data = await response.json();
    setSelectedMetric(data.calculation);
  };

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      {/* Conflict Warning Banner */}
      {conflicts?.hasConflicts && (
        <ConflictBanner conflicts={conflicts} />
      )}

      {/* Empty State */}
      {dashboardData.metrics.documentsAnalyzed === 0 ? (
        <EmptyState recommendations={dashboardData.metrics.recommendations} />
      ) : (
        <>
          {/* Metrics with Calculation Details */}
          <div className="metrics-grid">
            <MetricCard
              title="Profit Margin"
              value={`${dashboardData.metrics.profitMargin}%`}
              onShowCalc={() => showCalculationDetails('profit_margin')}
            />
            <MetricCard
              title="Debt-to-Equity"
              value={dashboardData.metrics.debtToEquity}
              onShowCalc={() => showCalculationDetails('debt_to_equity')}
            />
            {/* ... more metrics */}
          </div>

          {/* Insights with Provenance */}
          <div className="insights-section">
            <h3>Key Insights</h3>
            {dashboardData.metrics.keyInsights.map(insight => (
              <InsightCard
                key={insight}
                text={insight}
                onShowWhy={() => showInsightProvenance(insight)}
              />
            ))}
          </div>

          {/* AI Chat Button */}
          <button 
            className="chat-fab"
            onClick={() => setChatOpen(true)}
          >
            💬 Ask about your data
          </button>
        </>
      )}

      {/* Modals */}
      {selectedInsight && (
        <InsightProvenanceModal
          provenance={selectedInsight}
          onClose={() => setSelectedInsight(null)}
        />
      )}

      {selectedMetric && (
        <CalculationDetailsModal
          calculation={selectedMetric}
          onClose={() => setSelectedMetric(null)}
        />
      )}

      {chatOpen && (
        <AIChatDrawer
          userId={session.user.id}
          onClose={() => setChatOpen(false)}
        />
      )}
    </div>
  );
}
```

---

## 📦 TypeScript Types

```typescript
// types/insights.ts

export interface InsightProvenance {
  insightText: string;
  formula?: string;
  calculation?: string;
  sourceDocuments: SourceDocument[];
  confidence: number;
  methodology: string;
}

export interface SourceDocument {
  id: string;
  filename: string;
  documentType: string;
  uploadDate: string;
  contributedData: string[];
}

export interface ConflictDetection {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

export interface Conflict {
  metric: string;
  values: ConflictValue[];
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface ConflictValue {
  value: number;
  source: string;
  documentId: string;
  uploadDate: string;
}

export interface CalculationDetails {
  metric: string;
  formula: string;
  calculation: {
    [key: string]: number | string;
    result: number;
    unit: string;
  };
  breakdown?: any[];
  methodology: string;
  interpretation: string;
}

export interface DocumentPreview {
  content: string;
  lines: number;
  totalSize: number;
  mimeType: string;
  documentType: string;
  hasMore: boolean;
}

export interface AIResponse {
  success: boolean;
  answer: string;
  documentsUsed: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

---

## 🚀 Quick Start Checklist

- [ ] Add "Why?" buttons to insights
- [ ] Add "Show Calculation" buttons to metrics
- [ ] Create conflict warning banner component
- [ ] Implement chat interface
- [ ] Add preview buttons to document list
- [ ] Handle empty state in dashboard
- [ ] Show math validation warnings on upload
- [ ] Test all modals/drawers
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test with real data

---

**All APIs are live and ready to use!** 🎉

For questions or issues, refer to `EDGE_CASES_COMPREHENSIVE_REPORT.md` for detailed test results.

