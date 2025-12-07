#!/bin/bash

# =============================================================================
# LMS Deployment Script
# Free Education in Nepal - Automated VPS Setup
# =============================================================================
# Usage: bash deploy.sh
# Run this script on your VPS server as user with sudo privileges
# =============================================================================

set -e  # Exit on any error

echo "=========================================="
echo "🚀 LMS Deployment Script"
echo "Free Education in Nepal"
echo "=========================================="
echo ""

# =============================================================================
# CONFIGURATION VARIABLES
# =============================================================================
PROJECT_DIR="/home/zwicky/lms"
BACKEND_PORT=5005
FRONTEND_PORT=3002
BACKEND_DOMAIN="server.freeeducationinnepal.com.np"
FRONTEND_DOMAINS="lms.freeeducationinnepal.com.np freeeducationinnepal.com.np www.freeeducationinnepal.com.np"
USER="zwicky"

# =============================================================================
# STEP 1: Create Backend NGINX Configuration
# =============================================================================
echo "📝 Creating backend NGINX configuration..."

sudo tee /etc/nginx/sites-available/lms-backend > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name server.freeeducationinnepal.com.np;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    client_max_body_size 50M;
    
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    location / {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
    
    location /api-docs {
        proxy_pass http://localhost:5005/api-docs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /health {
        proxy_pass http://localhost:5005/health;
        access_log off;
        proxy_set_header Host $host;
    }
    
    location /uploads {
        proxy_pass http://localhost:5005/uploads;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public, max-age=86400";
    }
    
    access_log /var/log/nginx/lms-backend-access.log;
    error_log /var/log/nginx/lms-backend-error.log warn;
}
EOF

echo "✅ Backend NGINX config created"

# =============================================================================
# STEP 2: Create Frontend NGINX Configuration
# =============================================================================
echo "📝 Creating frontend NGINX configuration..."

sudo tee /etc/nginx/sites-available/lms-frontend > /dev/null <<'EOF'
server {
    listen 80;
    listen [::]:80;
    
    server_name lms.freeeducationinnepal.com.np freeeducationinnepal.com.np www.freeeducationinnepal.com.np;
    
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    client_max_body_size 10M;
    
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
    
    location /_next/static {
        proxy_pass http://localhost:3002/_next/static;
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }
    
    location /_next/image {
        proxy_pass http://localhost:3002/_next/image;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=86400";
    }
    
    location /sw.js {
        proxy_pass http://localhost:3002/sw.js;
        proxy_set_header Host $host;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    location /manifest.json {
        proxy_pass http://localhost:3002/manifest.json;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=3600";
    }
    
    location /icons {
        proxy_pass http://localhost:3002/icons;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    location ~* ^/(favicon\.ico|robots\.txt|sitemap\.xml)$ {
        proxy_pass http://localhost:3002$uri;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=86400";
        access_log off;
    }
    
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|woff|woff2|ttf|eot|otf)$ {
        proxy_pass http://localhost:3002$uri;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=2592000";
        access_log off;
    }
    
    access_log /var/log/nginx/lms-frontend-access.log;
    error_log /var/log/nginx/lms-frontend-error.log warn;
    
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    gzip_disable "msie6";
}
EOF

echo "✅ Frontend NGINX config created"

# =============================================================================
# STEP 3: Enable Sites
# =============================================================================
echo "🔗 Enabling sites..."

# Remove old symlinks if they exist
sudo rm -f /etc/nginx/sites-enabled/lms-backend
sudo rm -f /etc/nginx/sites-enabled/lms-frontend

# Create new symlinks
sudo ln -s /etc/nginx/sites-available/lms-backend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/lms-frontend /etc/nginx/sites-enabled/

echo "✅ Sites enabled"

# =============================================================================
# STEP 4: Test NGINX Configuration
# =============================================================================
echo "🧪 Testing NGINX configuration..."

if sudo nginx -t; then
    echo "✅ NGINX configuration is valid"
else
    echo "❌ NGINX configuration has errors!"
    exit 1
fi

# =============================================================================
# STEP 5: Reload NGINX
# =============================================================================
echo "🔄 Reloading NGINX..."

sudo systemctl reload nginx
echo "✅ NGINX reloaded successfully"

# =============================================================================
# STEP 6: Setup Backend
# =============================================================================
echo ""
echo "=========================================="
echo "📦 Setting up Backend..."
echo "=========================================="

cd $PROJECT_DIR/backend

# Copy production env
if [ -f .env.production ]; then
    cp .env.production .env
    echo "✅ Environment file copied"
else
    echo "⚠️  .env.production not found, skipping..."
fi

# Update PORT in .env
if [ -f .env ]; then
    sed -i "s/PORT=5000/PORT=$BACKEND_PORT/g" .env
    echo "✅ Backend port updated to $BACKEND_PORT"
fi

# Generate session secret if needed
if grep -q "GENERATE_SECURE_SESSION_SECRET" .env 2>/dev/null; then
    SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    sed -i "s/GENERATE_SECURE_SESSION_SECRET_ON_VPS/$SESSION_SECRET/g" .env
    echo "✅ Session secret generated"
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

# Seed database
echo "🌱 Seeding database..."
npm run seed || echo "⚠️  Seeding failed or already completed"

# Build backend
echo "🏗️  Building backend..."
npm run build

# Create logs directory
mkdir -p logs

echo "✅ Backend setup complete"

# =============================================================================
# STEP 7: Setup Frontend
# =============================================================================
echo ""
echo "=========================================="
echo "📦 Setting up Frontend..."
echo "=========================================="

cd $PROJECT_DIR/frontend

# Copy production env
if [ -f .env.production ]; then
    cp .env.production .env.local
    echo "✅ Environment file copied"
else
    echo "⚠️  .env.production not found, skipping..."
fi

# Install dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🏗️  Building frontend..."
npm run build

# Create logs directory
mkdir -p logs

echo "✅ Frontend setup complete"

# =============================================================================
# STEP 8: Setup PM2
# =============================================================================
echo ""
echo "=========================================="
echo "🔧 Setting up PM2..."
echo "=========================================="

cd $PROJECT_DIR

# Stop existing PM2 processes
pm2 delete all 2>/dev/null || echo "No existing PM2 processes"

# Start applications
echo "🚀 Starting applications with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup startup script
echo "⚙️  Setting up PM2 startup..."
pm2 startup | tail -n 1 | sudo bash || echo "⚠️  PM2 startup already configured"

echo "✅ PM2 configured successfully"

# =============================================================================
# STEP 9: Configure Firewall
# =============================================================================
echo ""
echo "=========================================="
echo "🔥 Configuring Firewall..."
echo "=========================================="

sudo ufw allow $BACKEND_PORT/tcp
sudo ufw allow $FRONTEND_PORT/tcp
sudo ufw allow 'Nginx Full'

echo "✅ Firewall configured"

# =============================================================================
# STEP 10: Status Check
# =============================================================================
echo ""
echo "=========================================="
echo "📊 Checking Status..."
echo "=========================================="

echo ""
echo "PM2 Status:"
pm2 status

echo ""
echo "NGINX Status:"
sudo systemctl status nginx --no-pager | head -n 3

echo ""
echo "Port Check:"
sudo lsof -i :$BACKEND_PORT | head -n 2 || echo "⚠️  Backend not running on port $BACKEND_PORT"
sudo lsof -i :$FRONTEND_PORT | head -n 2 || echo "⚠️  Frontend not running on port $FRONTEND_PORT"

# =============================================================================
# STEP 11: SSL Certificate Installation (Optional)
# =============================================================================
echo ""
echo "=========================================="
echo "🔐 SSL Certificate Setup"
echo "=========================================="
echo ""
echo "To install SSL certificates, run:"
echo ""
echo "sudo certbot --nginx -d $BACKEND_DOMAIN"
echo "sudo certbot --nginx -d lms.freeeducationinnepal.com.np -d freeeducationinnepal.com.np -d www.freeeducationinnepal.com.np"
echo ""
read -p "Do you want to install SSL certificates now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo certbot --nginx -d $BACKEND_DOMAIN
    sudo certbot --nginx -d lms.freeeducationinnepal.com.np -d freeeducationinnepal.com.np -d www.freeeducationinnepal.com.np
    echo "✅ SSL certificates installed"
else
    echo "⏭️  Skipping SSL installation"
fi

# =============================================================================
# DEPLOYMENT COMPLETE
# =============================================================================
echo ""
echo "=========================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "✅ Backend API: http://$BACKEND_DOMAIN"
echo "✅ Frontend App: http://lms.freeeducationinnepal.com.np"
echo ""
echo "📊 View logs: pm2 logs"
echo "🔄 Restart apps: pm2 restart all"
echo "📈 Monitor: pm2 monit"
echo ""
echo "Default Login Credentials:"
echo "  Admin:   admin@lms.com / admin123"
echo "  Teacher: teacher@lms.com / teacher123"
echo "  Student: student@lms.com / student123"
echo ""
echo "=========================================="
