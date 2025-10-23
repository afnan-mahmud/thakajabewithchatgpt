# Deployment Guide - Ubuntu 24.04 VPS

This guide covers deploying the Thaka Jabe full-stack application on Ubuntu 24.04 VPS.

## Prerequisites

- Ubuntu 24.04 VPS with root access
- Domain names configured (e.g., `thakajabe.com`, `api.thakajabe.com`)
- SSL certificates (Let's Encrypt recommended)

## Server Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Node.js 20

```bash
# Install NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install pnpm

```bash
npm install -g pnpm
pnpm --version
```

### 4. Install PM2

```bash
npm install -g pm2
pm2 --version
```

### 5. Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Install MongoDB

```bash
# Import MongoDB public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create MongoDB list file
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 7. Install Certbot (for SSL)

```bash
sudo apt install certbot python3-certbot-nginx -y
```

## Application Deployment

### 1. Create Application Directories

```bash
sudo mkdir -p /var/www/thakajabe
sudo mkdir -p /var/www/thaka_jabe-server
sudo mkdir -p /var/www/uploads
sudo chown -R $USER:$USER /var/www/thakajabe
sudo chown -R $USER:$USER /var/www/thaka_jabe-server
sudo chown -R $USER:$USER /var/www/uploads
```

### 2. Clone and Setup Frontend

```bash
cd /var/www/thakajabe
git clone <your-frontend-repo> .
pnpm install
pnpm build

# Create environment file
sudo nano .env.local
```

Add frontend environment variables:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.thakajabe.com/api
NEXT_PUBLIC_IMG_BASE_URL=https://api.thakajabe.com
NEXT_PUBLIC_FB_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_TIKTOK_PIXEL_ID=your_tiktok_pixel_id
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DB_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXTAUTH_URL=https://thakajabe.com
NEXTAUTH_SECRET=your_nextauth_secret_key_here
```

### 3. Clone and Setup Backend

```bash
cd /var/www/thaka_jabe-server
git clone <your-backend-repo> .
pnpm install
pnpm build

# Create uploads directory
mkdir -p uploads

# Create environment file
sudo nano .env
```

Add backend environment variables:
```env
PORT=8080
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/thakajabe
JWT_SECRET=your_jwt_secret_key_here
SSL_STORE_ID=your_ssl_store_id
SSL_STORE_PASSWD=your_ssl_store_password
SSL_SUCCESS_URL=https://thakajabe.com/payment/success
SSL_FAIL_URL=https://thakajabe.com/payment/fail
SSL_CANCEL_URL=https://thakajabe.com/payment/cancel
SSL_IPN_URL=https://api.thakajabe.com/payments/ssl/ipn
FB_PIXEL_ACCESS_TOKEN=your_facebook_pixel_access_token
TIKTOK_ACCESS_TOKEN=your_tiktok_access_token
TIKTOK_PIXEL_ID=your_tiktok_pixel_id
TIKTOK_TEST_EVENT_CODE=your_tiktok_test_event_code
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_FIREBASE_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

## PM2 Configuration

### 1. Create PM2 Ecosystem File

Create `/var/www/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [
    {
      name: 'thakajabe-frontend',
      cwd: '/var/www/thakajabe',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/thakajabe-frontend-error.log',
      out_file: '/var/log/pm2/thakajabe-frontend-out.log',
      log_file: '/var/log/pm2/thakajabe-frontend.log'
    },
    {
      name: 'thakajabe-backend',
      cwd: '/var/www/thaka_jabe-server',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/var/log/pm2/thakajabe-backend-error.log',
      out_file: '/var/log/pm2/thakajabe-backend-out.log',
      log_file: '/var/log/pm2/thakajabe-backend.log'
    }
  ]
};
```

### 2. Start Applications with PM2

```bash
# Create log directory
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Start applications
pm2 start /var/www/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided by the command above
```

## Nginx Configuration

### 1. Create Frontend Nginx Config

Create `/etc/nginx/sites-available/thakajabe`:

```nginx
server {
    listen 80;
    server_name thakajabe.com www.thakajabe.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name thakajabe.com www.thakajabe.com;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/thakajabe.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/thakajabe.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    # Frontend proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 2. Create Backend Nginx Config

Create `/etc/nginx/sites-available/api-thakajabe`:

```nginx
server {
    listen 80;
    server_name api.thakajabe.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.thakajabe.com;

    # SSL Configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/api.thakajabe.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.thakajabe.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # CORS headers
    add_header Access-Control-Allow-Origin "https://thakajabe.com" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://thakajabe.com";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        add_header Access-Control-Allow-Credentials "true";
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type 'text/plain; charset=utf-8';
        add_header Content-Length 0;
        return 204;
    }

    # API proxy
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files (uploads)
    location /uploads/ {
        alias /var/www/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Enable Sites and Restart Nginx

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/thakajabe /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/api-thakajabe /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## SSL Certificate Setup

### 1. Obtain SSL Certificates

```bash
# For main domain
sudo certbot --nginx -d thakajabe.com -d www.thakajabe.com

# For API subdomain
sudo certbot --nginx -d api.thakajabe.com
```

### 2. Setup Auto-renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Add to crontab for auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 'Nginx Full'

# Allow MongoDB (if needed from external)
sudo ufw allow 27017
```

## Monitoring and Maintenance

### 1. PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs

# Restart applications
pm2 restart all

# Monitor resources
pm2 monit
```

### 2. Nginx Logs

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### 3. Application Logs

```bash
# PM2 logs
pm2 logs thakajabe-frontend
pm2 logs thakajabe-backend

# System logs
sudo journalctl -u nginx
sudo journalctl -u mongod
```

## Deployment Script

Create a deployment script `/var/www/deploy.sh`:

```bash
#!/bin/bash

echo "Starting deployment..."

# Frontend deployment
echo "Deploying frontend..."
cd /var/www/thakajabe
git pull origin main
pnpm install
pnpm build
pm2 restart thakajabe-frontend

# Backend deployment
echo "Deploying backend..."
cd /var/www/thaka_jabe-server
git pull origin main
pnpm install
pnpm build
pm2 restart thakajabe-backend

echo "Deployment completed!"
```

Make it executable:
```bash
chmod +x /var/www/deploy.sh
```

## Troubleshooting

### Common Issues

1. **PM2 not starting on boot**
   ```bash
   pm2 startup
   # Follow the instructions
   pm2 save
   ```

2. **Nginx configuration errors**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **MongoDB connection issues**
   ```bash
   sudo systemctl status mongod
   sudo systemctl restart mongod
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew --dry-run
   ```

### Performance Optimization

1. **Enable Nginx caching**
2. **Configure PM2 cluster mode**
3. **Setup Redis for session storage**
4. **Implement CDN for static assets**

## Security Checklist

- [ ] Firewall configured
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] MongoDB secured
- [ ] Environment variables protected
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring setup

## Backup Strategy

See [BACKUP.md](./BACKUP.md) for detailed backup procedures.
