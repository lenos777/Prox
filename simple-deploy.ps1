# Simple PowerShell deployment script for Prox
Write-Host "🚀 Prox loyihasini VPS ga deploy qilish" -ForegroundColor Green
Write-Host "Server: 45.92.173.33" -ForegroundColor Cyan
Write-Host "Domain: prox.uz" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Quyidagi buyruqlarni VPS serverda bajaring:" -ForegroundColor Yellow
Write-Host ""

$commands = @"
# 1. Serverga ulanish
ssh root@45.92.173.33

# 2. Sistema yangilash
apt update && apt upgrade -y

# 3. Node.js o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# 4. Git va PM2 o'rnatish
apt install git nginx -y
npm install -g pm2

# 5. Loyihani yuklab olish
mkdir -p /opt/prox-app
cd /opt/prox-app
git clone https://github.com/lenos777/Prox.git .

# 6. Environment sozlash
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://opscoder:PRv5ASUw6d5Qunz7@cluster0.s5obnul.mongodb.net/proX?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=prox-super-secret-jwt-key-production-2025
PORT=8080
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8038376421:AAFtbldLbquVurnRlc6mf08k_bx6xEwcc1I
SITE_URL=http://prox.uz
EOF

# 7. Build va ishga tushirish
npm install
npm run build
mkdir -p uploads/courses logs

# 8. PM2 konfiguratsiya
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'prox-app',
    script: 'dist/server/node-build.mjs',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
EOF

# 9. PM2 bilan ishga tushirish
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 10. Nginx sozlash
cat > /etc/nginx/sites-available/prox-app << 'EOF'
server {
    listen 80;
    server_name prox.uz www.prox.uz 45.92.173.33;
    
    client_max_body_size 10M;
    
    location /api/ {
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
    
    location /uploads/ {
        alias /opt/prox-app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 11. Nginx faollashtirish
ln -sf /etc/nginx/sites-available/prox-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx

# 12. Firewall sozlash
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443

# 13. Holat tekshirish
pm2 status
systemctl status nginx
"@

Write-Host $commands -ForegroundColor White

Write-Host ""
Write-Host "🔧 Avtomatik deploy uchun:" -ForegroundColor Yellow
Write-Host "   .\vps-deploy.sh (Linux/WSL da)" -ForegroundColor White
Write-Host ""
Write-Host "📝 Deploy tugagandan keyin:" -ForegroundColor Yellow
Write-Host "   1. prox.uz domenini 45.92.173.33 ga yo'naltiring" -ForegroundColor White
Write-Host "   2. SSL o'rnating: certbot --nginx -d prox.uz -d www.prox.uz" -ForegroundColor White