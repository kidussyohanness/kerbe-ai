# AI Integration Setup Guide

This guide explains how to configure AI providers for the Kerbe AI analytics platform.

## Quick Start (Mock Mode)

The platform comes with a mock AI mode enabled by default, which provides basic responses without requiring API keys. This is perfect for testing the MVP.

## Real AI Provider Setup

To enable real AI functionality, you need to:

1. **Choose an AI Provider** and get an API key
2. **Set environment variables** in your `.env` file
3. **Restart the backend server**

### Supported Providers

#### 1. OpenAI (Recommended)
- **Model**: GPT-3.5-turbo
- **Cost**: ~$0.002 per 1K tokens
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)

```bash
# In your .env file
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

#### 2. Anthropic Claude
- **Model**: Claude-3-haiku
- **Cost**: ~$0.25 per 1M tokens
- **Setup**: Get API key from [Anthropic Console](https://console.anthropic.com/)

```bash
# In your .env file
AI_PROVIDER="anthropic"
ANTHROPIC_API_KEY="sk-ant-your-anthropic-api-key-here"
```

#### 3. DeepSeek
- **Model**: DeepSeek-chat
- **Cost**: Very affordable
- **Setup**: Get API key from [DeepSeek Platform](https://platform.deepseek.com/)

```bash
# In your .env file
AI_PROVIDER="deepseek"
DEEPSEEK_API_KEY="sk-your-deepseek-api-key-here"
```

## Environment Configuration

Create a `.env` file in the `analytics-platform-backend` directory:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/kerbe_analytics"
DIRECT_URL="postgresql://username:password@localhost:5432/kerbe_analytics"

# Server Configuration
NODE_ENV="development"
PORT=8787

# AI Provider Configuration
AI_PROVIDER="openai"  # or "anthropic", "deepseek", "mock"
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Authentication Configuration
NEXTAUTH_DATABASE_URL="postgresql://username:password@localhost:5432/kerbe_auth"
NEXTAUTH_DIRECT_URL="postgresql://username:password@localhost:5432/kerbe_auth"
NEXTAUTH_SECRET="your-nextauth-secret-here"
AUTH_USE_DB="1"
```

## Testing the AI Integration

1. **Start the backend server**:
   ```bash
   cd analytics-platform-backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd analytics-platform-frontend
   npm run dev
   ```

3. **Test the chat functionality**:
   - Navigate to `/dashboard/chat`
   - Upload a business document (CSV, PDF, etc.)
   - Ask questions about your business data
   - The AI should provide contextual responses

## Features

### Document Processing
- **PDF files**: Text extraction using pdf-parse
- **Word documents**: Text extraction using mammoth
- **Excel files**: Data extraction using xlsx
- **Images**: OCR text extraction using Tesseract.js
- **CSV files**: Direct text processing

### AI Capabilities
- **Context-aware responses** based on uploaded documents
- **Chat history** persistence
- **Business-focused prompts** optimized for Ethiopian companies
- **Multi-provider support** with fallback handling

### Error Handling
- **Graceful fallbacks** when AI services are unavailable
- **Mock responses** for development and testing
- **Detailed error logging** for debugging

## Troubleshooting

### Common Issues

1. **"API key not configured" error**
   - Check that your `.env` file has the correct API key
   - Verify the `AI_PROVIDER` matches your chosen provider
   - Restart the backend server after making changes

2. **"AI service error" in responses**
   - Check your API key is valid and has credits
   - Verify your internet connection
   - Check the server logs for detailed error messages

3. **Mock responses instead of real AI**
   - Ensure `AI_PROVIDER` is not set to "mock"
   - Verify your API key is properly configured
   - Check that the AI service is responding correctly

### Debug Mode

To see detailed AI service logs, check the backend console output when making chat requests.

## Cost Optimization

- **Mock mode**: Free, good for development
- **OpenAI**: Most cost-effective for small to medium usage
- **Anthropic**: Best for complex reasoning tasks
- **DeepSeek**: Most affordable option

## Next Steps

Once you have AI working, you can:
1. Upload business documents to provide context
2. Ask questions about your data and get intelligent responses
3. Use the chat history to build on previous conversations
4. Integrate with your existing business workflows

The AI assistant is specifically trained to understand Ethiopian business context and provide relevant insights for local companies.
