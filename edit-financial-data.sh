#!/bin/bash

# Financial Data Editor Script
# Helps edit financial data in SQLite database

DB_PATH="analytics-platform-backend/prisma/dev.db"

if [ ! -f "$DB_PATH" ]; then
  echo "❌ Database not found at $DB_PATH"
  exit 1
fi

echo "💰 Financial Data Editor"
echo "========================"
echo ""

# List all income statements
echo "📊 Income Statements Found:"
sqlite3 -header -column "$DB_PATH" "
SELECT 
  id,
  originalName,
  json_extract(analysisResults, '$.extractedData.period') as period,
  json_extract(analysisResults, '$.extractedData.totalRevenue') as revenue,
  json_extract(analysisResults, '$.extractedData.netIncome') as profit
FROM user_documents 
WHERE documentType='income_statement'
  AND analysisResults IS NOT NULL
ORDER BY json_extract(analysisResults, '$.extractedData.period');
"
echo ""

# Prompt for editing
echo "To edit data, you can use:"
echo ""
echo "1. Interactive SQLite shell:"
echo "   sqlite3 $DB_PATH"
echo ""
echo "2. Direct SQL command:"
echo "   sqlite3 $DB_PATH \"UPDATE user_documents SET analysisResults = json_set(analysisResults, '$.extractedData.netIncome', 500000) WHERE id='your-doc-id';\""
echo ""
echo "3. Use DB Browser for SQLite (GUI):"
echo "   https://sqlitebrowser.org/"
echo ""
echo "4. Example - Update profit for specific document:"
echo "   sqlite3 $DB_PATH \"UPDATE user_documents SET analysisResults = json_set(analysisResults, '$.extractedData.totalRevenue', 1000000, '$.extractedData.netIncome', 200000) WHERE id='DOCUMENT_ID_HERE';\""
echo ""

