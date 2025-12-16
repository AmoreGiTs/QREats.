#!/bin/bash
# fix-auth.sh

echo "🔧 Fixing NextAuth JWT Issues for QREats"

# 1. Backup current env
if [ -f .env ]; then
  cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# 2. Ensure stable development environment exists
# (We already created .env.development.local in step 918)

# 3. Clear all caches
rm -rf .next
rm -rf node_modules/.cache
rm -rf /tmp/next-auth-*

echo "✅ Cleared all caches"

# 4. Generate startup script
cat > start-dev.sh << 'EOF'
#!/bin/bash

# Clear any existing auth sessions
rm -f /tmp/next-auth-*

# Start dev server with clean auth state
NEXT_AUTH_DEBUG=1 \
NEXT_PUBLIC_DEBUG_AUTH=1 \
npm run dev
EOF

chmod +x start-dev.sh

echo "✅ Created startup script"

echo ""
echo "🎯 NEXT STEPS:"
echo "1. Run: ./start-dev.sh"
echo "2. Navigate to: http://localhost:3000/demo-restaurant/admin"
echo "3. Login with: admin@demo.com / demopassword123"
echo ""
echo "🔒 Your auth is now stabilized for development."
