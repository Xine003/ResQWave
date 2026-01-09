# Seeding Initial Chatbot Content

This script populates your Sanity Studio with all the predefined chatbot answers, FAQs, safety tips, and settings.

## Prerequisites

You need a Sanity API token with write permissions.

### Getting a Sanity Token:

1. **Via Sanity CLI** (Recommended):
   ```bash
   cd chatbot-cms-resqwave
   npx sanity manage
   ```
   This opens your project settings in the browser. Go to **API** → **Tokens** → **Add API Token**
   - Name: "Seed Script Token"
   - Permissions: **Editor** or **Administrator**
   - Copy the token

2. **Or visit**: https://www.sanity.io/manage/personal/tokens

### Setting the Token:

**Option 1: Environment Variable (Recommended)**
```bash
# Windows PowerShell
$env:SANITY_TOKEN="your_token_here"

# Linux/Mac
export SANITY_TOKEN="your_token_here"
```

**Option 2: Add to .env file**
```bash
echo "SANITY_TOKEN=your_token_here" > .env
```

## Running the Seed Script

```bash
cd chatbot-cms-resqwave
npm install @sanity/client
npm run seed
```

## What Gets Created

The script creates:

✅ **1 Chatbot Settings** - System configuration, contact info, welcome message
✅ **1 Chatbot Capability** - "Interpret Distress Signals" with all details
✅ **7 FAQ Items** - Purpose, benefits, technology, operation, users, dashboard, community
✅ **6 User Guidance** - SOS alerts, dashboard, community info, flood emergency, signals, settings
✅ **5 Clarification Messages** - Friendly fallback responses
✅ **6 Safety Tips** - Flood safety, emergency kit, family plan, power outage, evacuation, staying informed

**Total: 26 documents**

## After Seeding

1. Open Sanity Studio at http://localhost:3333
2. View and edit all the content
3. Make any adjustments you need
4. Content is immediately available to the backend API

## Notes

- The script only needs to be run **once**
- If you run it again, it will create duplicate documents
- To reset, delete documents in Studio and re-run the seed
- All documents are marked as "active" by default

## Troubleshooting

**Error: "Insufficient permissions"**
- Make sure your token has Editor or Administrator permissions

**Error: "Document already exists"**
- The script creates new documents each time
- Delete existing documents in Studio first, or modify the script to update instead

**Token not found**
- Make sure SANITY_TOKEN environment variable is set
- Or add it to a .env file in the chatbot-cms-resqwave directory
