#!/bin/bash

# Quick Database Viewer Script
# Helps view and understand your SQLite database

DB_PATH="analytics-platform-backend/prisma/dev.db"

if [ ! -f "$DB_PATH" ]; then
  echo "❌ Database not found at $DB_PATH"
  exit 1
fi

echo "📊 SQLite Database Viewer"
echo "========================"
echo ""

# Show database size
DB_SIZE=$(du -h "$DB_PATH" | cut -f1)
echo "📁 Database Size: $DB_SIZE"
echo ""

# Show all tables
echo "📋 Tables in database:"
sqlite3 "$DB_PATH" ".tables"
echo ""

# Count records in key tables
echo "📊 Record Counts:"
echo "  Users: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM users;")"
echo "  Documents: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM user_documents;")"
echo "  Chat Messages: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM chat_messages;" 2>/dev/null || echo '0 (table may not exist yet)')"
echo ""

# Show sample users
echo "👥 Users (Sample):"
sqlite3 -header -column "$DB_PATH" "SELECT id, email, name, createdAt FROM users LIMIT 5;"
echo ""

# Show sample documents
echo "📄 Documents (Sample):"
sqlite3 -header -column "$DB_PATH" "SELECT id, originalName, documentType, status, createdAt FROM user_documents ORDER BY createdAt DESC LIMIT 5;"
echo ""

# Show financial data sample
echo "💰 Financial Data Sample (from documents):"
sqlite3 -header -column "$DB_PATH" "
SELECT 
  id,
  originalName,
  documentType,
  json_extract(analysisResults, '$.extractedData.period') as period,
  json_extract(analysisResults, '$.extractedData.totalRevenue') as revenue,
  json_extract(analysisResults, '$.extractedData.netIncome') as profit
FROM user_documents 
WHERE documentType IN ('income_statement', 'balance_sheet', 'cash_flow')
  AND analysisResults IS NOT NULL
LIMIT 5;
" 2>/dev/null || echo "  No financial data found (or JSON format different)"
echo ""

echo "💡 Tips:"
echo "  - Use 'sqlite3 $DB_PATH' to open interactive shell"
echo "  - Use DB Browser for SQLite for GUI: https://sqlitebrowser.org/"
echo "  - Run 'sqlite3 $DB_PATH \"SELECT * FROM users;\"' to query data"
echo ""

