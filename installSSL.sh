#!/bin/bash

# Purpose: Automate the installation of a Let's Encrypt SSL certificate for a given domain
# Usage: sudo ./install_letsencrypt_cert.sh <domain_name> [--nginx]
# Example: sudo ./install_letsencrypt_cert.sh example.com
#          sudo ./install_letsencrypt_cert.sh example.com --nginx
# Requirements: Ubuntu, Nginx installed, domain pointed to server's public IP, ports 80/443 open

# Exit on any error
set -e

# Check if script is run as root
if [ "$EUID" -ne 0 ]; then
    echo "Error: This script must be run as root (use sudo)"
    exit 1
fi

# Check if a domain name is provided
if [ -z "$1" ]; then
    echo "Error: No domain name provided"
    echo "Usage: $0 <domain_name> [--nginx]"
    exit 1
fi

# Assign domain name from first argument
DOMAIN="$1"
USE_NGINX_PLUGIN=false

# Check if --nginx flag is provided
if [ "$2" == "--nginx" ]; then
    USE_NGINX_PLUGIN=true
fi

# Log file for debugging
LOG_FILE="/var/log/letsencrypt_script.log"
echo "Starting Let's Encrypt certificate installation for $DOMAIN at $(date)" >> "$LOG_FILE"

# Function to log messages
log() {
    echo "$1" | tee -a "$LOG_FILE"
}

# Check if Certbot is installed, install if not
if ! command -v certbot &> /dev/null; then
    log "Certbot not found, installing..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    log "Error: Nginx is not installed"
    exit 1
fi

# Verify domain resolves to this server's IP
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short "$DOMAIN" | tail -n 1)
if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    log "Warning: Domain $DOMAIN resolves to $DOMAIN_IP, but server IP is $SERVER_IP"
    log "Ensure DNS is correctly configured before proceeding"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Aborting"
        exit 1
    fi
fi

# Generate or ensure DH parameters file exists
DHPARAM_FILE="/etc/nginx/ssl/dhparam.pem"
if [ ! -f "$DHPARAM_FILE" ]; then
    log "Generating DH parameters (this may take a few minutes)..."
    mkdir -p /etc/nginx/ssl
    openssl dhparam -out "$DHPARAM_FILE" 2048 >> "$LOG_FILE" 2>&1
    chmod 600 "$DHPARAM_FILE"
fi

if [ "$USE_NGINX_PLUGIN" = true ]; then
    # Use Certbot with Nginx plugin (Nginx must be running)
    log "Running Certbot with --nginx plugin for $DOMAIN"
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" >> "$LOG_FILE" 2>&1
else
    # Stop Nginx to free port 80 for standalone mode
    log "Stopping Nginx to free port 80..."
    systemctl stop nginx

    # Verify port 80 is free
    if netstat -tuln | grep ':80' > /dev/null; then
        log "Error: Port 80 is still in use"
        exit 1
    fi

    # Run Certbot in standalone mode
    log "Running Certbot in standalone mode for $DOMAIN"
    certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN" >> "$LOG_FILE" 2>&1

    # Start Nginx after certificate installation
    log "Starting Nginx..."
    systemctl start nginx
fi

# Verify Nginx configuration
log "Testing Nginx configuration..."
if ! nginx -t >> "$LOG_FILE" 2>&1; then
    log "Error: Nginx configuration test failed"
    exit 1
fi

# Reload Nginx to apply changes
log "Reloading Nginx..."
systemctl reload nginx

# Test automatic renewal
log "Testing certificate renewal process..."
if certbot renew --dry-run >> "$LOG_FILE" 2>&1; then
    log "Renewal test successful"
else
    log "Warning: Renewal test failed, check $LOG_FILE for details"
fi

# Ensure Certbot renewal timer is enabled
log "Enabling Certbot renewal timer..."
systemctl enable certbot.timer >> "$LOG_FILE" 2>&1
systemctl start certbot.timer >> "$LOG_FILE" 2>&1

log "Certificate installation completed for $DOMAIN"
log "Certificate files are located in /etc/letsencrypt/live/$DOMAIN/"
log "Check $LOG_FILE for detailed logs"

# Reminder for Nginx configuration
echo
echo "Next steps:"
echo "1. Update your Nginx configuration for $DOMAIN to include:"
echo "   ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;"
echo "   ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;"
echo "   ssl_dhparam /etc/nginx/ssl/dhparam.pem;"
echo "2. Test your SSL setup at https://www.ssllabs.com/ssltest/"
