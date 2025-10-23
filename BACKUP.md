# Backup Strategy - Thaka Jabe Platform

This document outlines the comprehensive backup strategy for the Thaka Jabe platform deployed on Ubuntu 24.04 VPS.

## Backup Overview

Our backup strategy covers three main areas:
1. **Database Backups** - MongoDB Atlas and local backups
2. **Code Repository** - Git-based version control
3. **File Uploads** - Static files and user uploads

## 1. Database Backups

### MongoDB Atlas (Recommended)

If using MongoDB Atlas, backups are automatically handled:

1. **Enable Atlas Backups**
   - Go to your MongoDB Atlas dashboard
   - Navigate to your cluster
   - Enable "Backup" in the cluster settings
   - Configure backup frequency (continuous or daily)

2. **Backup Retention**
   - Set retention period (7-30 days recommended)
   - Enable point-in-time recovery
   - Configure backup policies

### Local MongoDB Backups

For local MongoDB instances:

#### Automated Backup Script

Create `/var/www/backup-mongodb.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="thakajabe"
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --db $DB_NAME --out $BACKUP_DIR/thakajabe_$DATE

# Compress backup
cd $BACKUP_DIR
tar -czf thakajabe_$DATE.tar.gz thakajabe_$DATE/
rm -rf thakajabe_$DATE/

# Remove old backups
find $BACKUP_DIR -name "thakajabe_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "MongoDB backup completed: thakajabe_$DATE.tar.gz"
```

Make it executable:
```bash
chmod +x /var/www/backup-mongodb.sh
```

#### Setup Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/backup-mongodb.sh >> /var/log/mongodb-backup.log 2>&1
```

### Database Restore

```bash
# Extract backup
cd /var/backups/mongodb
tar -xzf thakajabe_YYYYMMDD_HHMMSS.tar.gz

# Restore database
mongorestore --db thakajabe thakajabe_YYYYMMDD_HHMMSS/thakajabe/
```

## 2. Code Repository Backups

### Git-based Backup

The code is automatically backed up through Git:

1. **Push to Remote Repository**
   ```bash
   # Frontend
   cd /var/www/thakajabe
   git add .
   git commit -m "Production deployment"
   git push origin main

   # Backend
   cd /var/www/thaka_jabe-server
   git add .
   git commit -m "Production deployment"
   git push origin main
   ```

2. **Multiple Remote Repositories**
   - Primary: GitHub/GitLab
   - Secondary: Bitbucket or another Git provider
   - Local: Regular pushes to both remotes

### Automated Git Backup Script

Create `/var/www/backup-git.sh`:

```bash
#!/bin/bash

# Configuration
REPOS=("/var/www/thakajabe" "/var/www/thaka_jabe-server")
BACKUP_REMOTE="backup-origin"

echo "Starting Git backup..."

for repo in "${REPOS[@]}"; do
    echo "Backing up $repo..."
    cd $repo
    
    # Add all changes
    git add .
    
    # Commit if there are changes
    if ! git diff --staged --quiet; then
        git commit -m "Automated backup $(date)"
    fi
    
    # Push to all remotes
    git push origin main
    git push $BACKUP_REMOTE main 2>/dev/null || echo "Backup remote not configured"
done

echo "Git backup completed!"
```

Setup cron job:
```bash
# Add to crontab
0 3 * * * /var/www/backup-git.sh >> /var/log/git-backup.log 2>&1
```

## 3. File Uploads Backup

### Uploads Directory Backup

Create `/var/www/backup-uploads.sh`:

```bash
#!/bin/bash

# Configuration
UPLOADS_DIR="/var/www/uploads"
BACKUP_DIR="/var/backups/uploads"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
cd $UPLOADS_DIR
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz .

# Remove old backups
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Uploads backup completed: uploads_$DATE.tar.gz"
```

Setup cron job:
```bash
# Add to crontab
0 4 * * * /var/www/backup-uploads.sh >> /var/log/uploads-backup.log 2>&1
```

### Cloud Storage Backup

For additional security, sync uploads to cloud storage:

#### AWS S3 Sync

```bash
# Install AWS CLI
sudo apt install awscli -y

# Configure AWS credentials
aws configure

# Create sync script
cat > /var/www/sync-uploads-s3.sh << 'EOF'
#!/bin/bash
aws s3 sync /var/www/uploads/ s3://your-bucket-name/uploads/ --delete
echo "Uploads synced to S3: $(date)"
EOF

chmod +x /var/www/sync-uploads-s3.sh

# Add to crontab (every 6 hours)
0 */6 * * * /var/www/sync-uploads-s3.sh >> /var/log/s3-sync.log 2>&1
```

#### Google Cloud Storage

```bash
# Install gsutil
curl https://sdk.cloud.google.com | bash
source ~/.bashrc

# Create sync script
cat > /var/www/sync-uploads-gcs.sh << 'EOF'
#!/bin/bash
gsutil -m rsync -r -d /var/www/uploads/ gs://your-bucket-name/uploads/
echo "Uploads synced to GCS: $(date)"
EOF

chmod +x /var/www/sync-uploads-gcs.sh
```

## 4. Complete System Backup

### Full System Backup Script

Create `/var/www/backup-full-system.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/full-system"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR

echo "Starting full system backup..."

# Backup application directories
tar -czf $BACKUP_DIR/applications_$DATE.tar.gz \
    -C /var/www \
    --exclude=node_modules \
    --exclude=.git \
    thakajabe thaka_jabe-server

# Backup configuration files
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /etc/nginx/sites-available \
    /etc/nginx/sites-enabled \
    /var/www/ecosystem.config.js

# Backup environment files (without sensitive data)
cp /var/www/thakajabe/.env.local $BACKUP_DIR/frontend.env.example
cp /var/www/thaka_jabe-server/.env $BACKUP_DIR/backend.env.example

# Remove sensitive data from env files
sed -i 's/=.*/=your_value_here/g' $BACKUP_DIR/frontend.env.example
sed -i 's/=.*/=your_value_here/g' $BACKUP_DIR/backend.env.example

# Create backup manifest
cat > $BACKUP_DIR/manifest_$DATE.txt << EOF
Full System Backup - $DATE
============================

Contents:
- Applications: applications_$DATE.tar.gz
- Configuration: config_$DATE.tar.gz
- Environment examples: frontend.env.example, backend.env.example

Restore Instructions:
1. Extract applications: tar -xzf applications_$DATE.tar.gz -C /var/www/
2. Extract config: tar -xzf config_$DATE.tar.gz -C /
3. Restore environment files with actual values
4. Run: pnpm install in both app directories
5. Run: pnpm build in both app directories
6. Restart services: pm2 restart all

EOF

# Remove old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "manifest_*.txt" -mtime +$RETENTION_DAYS -delete

echo "Full system backup completed: $BACKUP_DIR"
```

## 5. Backup Monitoring

### Backup Status Check Script

Create `/var/www/check-backups.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIRS=("/var/backups/mongodb" "/var/backups/uploads" "/var/backups/full-system")
ALERT_EMAIL="admin@thakajabe.com"

echo "Checking backup status..."

for dir in "${BACKUP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        # Check if backup exists from last 24 hours
        recent_backup=$(find $dir -name "*.tar.gz" -mtime -1 | wc -l)
        if [ $recent_backup -eq 0 ]; then
            echo "WARNING: No recent backup found in $dir"
            # Send email alert (requires mailutils)
            echo "No recent backup found in $dir" | mail -s "Backup Alert" $ALERT_EMAIL
        else
            echo "OK: Recent backup found in $dir"
        fi
    else
        echo "ERROR: Backup directory $dir does not exist"
    fi
done

# Check disk space
DISK_USAGE=$(df /var/backups | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Backup disk usage is ${DISK_USAGE}%"
    echo "Backup disk usage is ${DISK_USAGE}%" | mail -s "Disk Space Alert" $ALERT_EMAIL
fi

echo "Backup check completed"
```

Setup monitoring cron job:
```bash
# Add to crontab (daily at 6 AM)
0 6 * * * /var/www/check-backups.sh >> /var/log/backup-monitor.log 2>&1
```

## 6. Disaster Recovery

### Recovery Procedures

#### 1. Complete System Recovery

```bash
# 1. Setup new server (follow deployment guide)
# 2. Restore applications
cd /var/backups/full-system
tar -xzf applications_YYYYMMDD_HHMMSS.tar.gz -C /var/www/

# 3. Restore configuration
tar -xzf config_YYYYMMDD_HHMMSS.tar.gz -C /

# 4. Restore environment files
cp frontend.env.example /var/www/thakajabe/.env.local
cp backend.env.example /var/www/thaka_jabe-server/.env
# Edit with actual values

# 5. Install dependencies and build
cd /var/www/thakajabe && pnpm install && pnpm build
cd /var/www/thaka_jabe-server && pnpm install && pnpm build

# 6. Restore database
mongorestore --db thakajabe /path/to/mongodb/backup/

# 7. Restore uploads
tar -xzf uploads_YYYYMMDD_HHMMSS.tar.gz -C /var/www/uploads/

# 8. Start services
pm2 start /var/www/ecosystem.config.js
```

#### 2. Database-Only Recovery

```bash
# Stop application
pm2 stop thakajabe-backend

# Restore database
mongorestore --db thakajabe /path/to/mongodb/backup/

# Start application
pm2 start thakajabe-backend
```

#### 3. File-Only Recovery

```bash
# Stop application
pm2 stop all

# Restore uploads
tar -xzf uploads_YYYYMMDD_HHMMSS.tar.gz -C /var/www/uploads/

# Start application
pm2 start all
```

## 7. Backup Testing

### Regular Backup Testing

Create `/var/www/test-backups.sh`:

```bash
#!/bin/bash

echo "Testing backup integrity..."

# Test MongoDB backup
LATEST_MONGO_BACKUP=$(ls -t /var/backups/mongodb/*.tar.gz | head -1)
if [ -f "$LATEST_MONGO_BACKUP" ]; then
    echo "Testing MongoDB backup: $LATEST_MONGO_BACKUP"
    tar -tzf "$LATEST_MONGO_BACKUP" > /dev/null
    if [ $? -eq 0 ]; then
        echo "✓ MongoDB backup is valid"
    else
        echo "✗ MongoDB backup is corrupted"
    fi
fi

# Test uploads backup
LATEST_UPLOADS_BACKUP=$(ls -t /var/backups/uploads/*.tar.gz | head -1)
if [ -f "$LATEST_UPLOADS_BACKUP" ]; then
    echo "Testing uploads backup: $LATEST_UPLOADS_BACKUP"
    tar -tzf "$LATEST_UPLOADS_BACKUP" > /dev/null
    if [ $? -eq 0 ]; then
        echo "✓ Uploads backup is valid"
    else
        echo "✗ Uploads backup is corrupted"
    fi
fi

echo "Backup testing completed"
```

## 8. Backup Schedule Summary

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| MongoDB | Daily | 7 days | `/var/backups/mongodb/` |
| Uploads | Daily | 30 days | `/var/backups/uploads/` |
| Full System | Weekly | 7 days | `/var/backups/full-system/` |
| Git Push | Daily | Permanent | Remote repositories |
| Cloud Sync | Every 6 hours | Permanent | AWS S3/GCS |

## 9. Backup Security

### Encryption

```bash
# Encrypt sensitive backups
gpg --symmetric --cipher-algo AES256 /var/backups/mongodb/thakajabe_20240101_020000.tar.gz
```

### Access Control

```bash
# Secure backup directories
chmod 700 /var/backups
chown -R root:root /var/backups
```

## 10. Monitoring and Alerts

### Email Alerts Setup

```bash
# Install mailutils
sudo apt install mailutils -y

# Configure postfix
sudo dpkg-reconfigure postfix

# Test email
echo "Test email" | mail -s "Test" admin@thakajabe.com
```

### Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/thakajabe-backups

# Add:
/var/log/mongodb-backup.log
/var/log/uploads-backup.log
/var/log/git-backup.log
/var/log/backup-monitor.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
}
```

This comprehensive backup strategy ensures data safety and quick recovery in case of any disaster.
