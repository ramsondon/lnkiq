#!/bin/bash
# Setup script for lnkiq authentication

echo "=== lnkiq Setup Script ==="
echo ""

# Generate AUTH_SECRET
AUTH_SECRET=$(openssl rand -base64 32)
echo "Generated AUTH_SECRET: $AUTH_SECRET"
echo ""

echo "=== Next Steps ==="
echo ""
echo "1. Get your DATABASE_URL from Vercel:"
echo "   - Go to: https://vercel.com/dashboard"
echo "   - Select your project → Settings → Environment Variables"
echo "   - Copy the DATABASE_URL value"
echo ""
echo "2. Create .env.local file with:"
echo ""
echo "DATABASE_URL=\"your-neon-connection-string\""
echo "AUTH_SECRET=\"$AUTH_SECRET\""
echo ""
echo "3. Push database schema:"
echo "   npx prisma db push"
echo ""
echo "4. Set up OAuth providers (add to .env.local):"
echo "   - Google: https://console.cloud.google.com/apis/credentials"
echo "   - GitHub: https://github.com/settings/developers"
echo "   - Apple: https://developer.apple.com"
echo "   - Microsoft: https://portal.azure.com"
echo ""
echo "5. Add same env vars to Vercel project settings"
echo ""
