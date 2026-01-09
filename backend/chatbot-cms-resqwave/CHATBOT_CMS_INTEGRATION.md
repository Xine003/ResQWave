# Chatbot CMS Integration

This backend now integrates with Sanity CMS to manage chatbot content dynamically instead of using hardcoded strings.

## Architecture

```
Frontend → Backend API → Sanity CMS
                ↓
           Gemini AI (with Sanity content as context)
```

## Environment Variables

Add these to your `.env` file in the backend:

```env
# Sanity Configuration
SANITY_PROJECT_ID=5u9e9skw
SANITY_DATASET=production

# Existing variables
GEMINI_API_KEY=your_key_here
```

## Sanity Schemas

The following content types are available in Sanity Studio:

1. **Chatbot Settings** (singleton)
   - System name, description, welcome message
   - Contact information (email, phone, support hours)
   - Default language, max response length
   - Maintenance mode

2. **Chatbot Capabilities**
   - System capabilities with keywords
   - Detailed points for each capability
   - Display order and active status

3. **FAQ Items**
   - Questions and answers grouped by category
   - Keywords for AI matching
   - User role information
   - Active status

4. **User Guidance**
   - Step-by-step instructions
   - Short answers for quick responses
   - Primary user role and fallback notes
   - Related guidance linking

5. **Clarification Messages**
   - Friendly fallback messages
   - Tone settings (friendly, helpful, professional, casual)
   - Suggested topics

6. **Safety Tips**
   - Emergency preparedness guidance
   - Categorized by urgency level
   - Priority-based tips
   - Related tips linking

## API Endpoints

### Existing Endpoints
- `POST /api/chatbot/chat` - Generate AI response
- `POST /api/chatbot/translate` - Translate to Tagalog

### New Endpoints
- `POST /api/chatbot/refresh-context` - Manually refresh context cache from Sanity
- `GET /api/chatbot/settings` - Get current chatbot settings

## How It Works

1. **Context Building**: The backend queries Sanity CMS to fetch all active chatbot content
2. **Caching**: Context is cached for 5 minutes to reduce API calls
3. **AI Generation**: Gemini AI uses the Sanity content as context to generate responses
4. **Dynamic Updates**: Content editors can update responses in Sanity Studio without code changes

## Managing Content

### Start Sanity Studio

```bash
cd backend/chatbot-cms-resqwave
npm install
npm run dev
```

Studio will be available at `http://localhost:3333`

### Deploying Schema Changes

After modifying schema files:

```bash
cd backend/chatbot-cms-resqwave
npx sanity schema deploy
```

### Refreshing Backend Context

After making content changes in Sanity Studio, refresh the backend cache:

```bash
curl -X POST http://localhost:5000/api/chatbot/refresh-context
```

Or it will auto-refresh after 5 minutes.

## Content Guidelines

1. **Keywords**: Add relevant keywords to help AI match user queries
2. **Conciseness**: Keep answers brief (2-3 sentences)
3. **User Roles**: Clearly specify which roles can access/perform actions
4. **Active Status**: Only active content is used by the AI
5. **Display Order**: Controls priority when multiple matches exist

## Benefits

- ✅ Non-technical team members can update chatbot responses
- ✅ No code changes needed for content updates
- ✅ Version control through Sanity's built-in history
- ✅ Preview changes before publishing
- ✅ Structured content with validation
- ✅ Better maintainability and scalability
