@echo off
echo 🚀 Prox loyihasini VPS ga deploy qilish
echo Server: 45.92.173.33
echo Domain: prox.uz
echo.

echo 📋 SSH orqali serverga ulanish va deploy boshlash...
echo.

REM SSH orqali serverga ulanish va barcha buyruqlarni bajarish
ssh root@45.92.173.33 "
set -e
echo '📦 Sistema paketlarini yangilash...'
apt update && apt upgrade -y

echo '🔧 Node.js o'\''rnatish...'
if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo '✅ Node.js o'\''rnatildi: '$(node --version)
else
    echo '✅ Node.js allaqachon o'\''rnatilgan: '$(node --version)
fi

echo '📥 Git o'\''rnatish...'
if ! command -v git >/dev/null 2>&1; then
    apt install git -y
    echo '✅ Git o'\''rnatildi'
else
    echo '✅ Git allaqachon o'\''rnatilgan'
fi

echo '⚙️ PM2 o'\''rnatish...'
if ! command -v pm2 >/dev/null 2>&1; then
    npm install -g pm2
    echo '✅ PM2 o'\''rnatildi'
else
    echo '✅ PM2 allaqachon o'\''rnatilgan'
fi

echo '🌐 Nginx o'\''rnatish...'
if ! command -v nginx >/dev/null 2>&1; then
    apt install nginx -y
    echo '✅ Nginx o'\''rnatildi'
else
    echo '✅ Nginx allaqachon o'\''rnatilgan'
fi

echo '📁 Loyiha papkasini yaratish...'
mkdir -p /opt/prox-app
cd /opt/prox-app

echo '📥 Loyihani yuklab olish...'
if [ -d '.git' ]; then
    echo 'Loyiha mavjud, yangilanish...'
    git pull origin main || git pull origin master
else
    echo 'Loyihani klonlash...'
    git clone https://github.com/lenos777/Prox.git .
fi

echo '⚙️ Environment faylini yaratish...'
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://opscoder:PRv5ASUw6d5Qunz7@cluster0.s5obnul.mongodb.net/proX?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=prox-super-secret-jwt-key-production-2025
PORT=8080
NODE_ENV=production
TELEGRAM_BOT_TOKEN=8038376421:AAFtbldLbquVurnRlc6mf08k_bx6xEwcc1I
SITE_URL=http://prox.uz
EOF

echo '📦 Dependencies o'\''rnatish...'
npm install

echo '🏗️ Loyihani build qilish...'
npm run build

echo '📁 Kerakli papkalarni yaratish...'
mkdir -p uploads/courses
mkdir -p logs

echo '⚙️ PM2 ecosystem faylini yaratish...'
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
    max_memory_restart: '1G',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
EOF

echo '🚀 PM2 bilan ishga tushirish...'
pm2 stop prox-app 2>/dev/null || true
pm2 delete prox-app 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup ubuntu -u root --hp /root

echo '🌐 Nginx konfiguratsiyasini yaratish...'
cat > /etc/nginx/sites-available/prox-app << 'EOF'
server {
    listen 80;
    server_name prox.uz www.prox.uz 45.92.173.33;
    
    client_max_body_size 10M;
    
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    location /uploads/ {
        alias /opt/prox-app/uploads/;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
        access_log off;
    }
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

echo '🔗 Nginx ni faollashtirish...'
ln -sf /etc/nginx/sites-available/prox-app /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

echo '🧪 Nginx konfiguratsiyasini tekshirish...'
nginx -t

echo '🔄 Nginx ni qayta ishga tushirish...'
systemctl restart nginx
systemctl enable nginx

echo '🔥 Firewall sozlash...'
ufw --force enable
ufw allow 22
ufw allow 80
ufw allow 443

echo '⏳ Ilovaning ishga tushishini kutish...'
sleep 10

echo '🔍 Holat tekshirish...'
echo 'PM2 holati:'
pm2 status

echo ''
echo 'Nginx holati:'
systemctl status nginx --no-pager -l

echo ''
echo 'Port tekshirish:'
netstat -tlnp | grep :8080 || echo 'Port 8080 ochiq emas'
netstat -tlnp | grep :80 || echo 'Port 80 ochiq emas'

echo ''
echo '🧪 API test qilish...'
sleep 5
curl -s http://localhost:8080/api/ping && echo ' ✅ Local API ishlayapti' || echo ' ❌ Local API ishlamayapti'
curl -s http://45.92.173.33/api/ping && echo ' ✅ Tashqi API ishlayapti' || echo ' ❌ Tashqi API ishlamayapti'

echo ''
echo '✅ Deploy jarayoni yakunlandi!'
echo '🌐 Saytingiz manzili: http://prox.uz'
echo '🌐 IP orqali: http://45.92.173.33'
echo ''
echo '📊 Foydali buyruqlar:'
echo '  - Loglarni ko'\''rish: pm2 logs prox-app'
echo '  - Monitoring: pm2 monit'
echo '  - Qayta ishga tushirish: pm2 restart prox-app'
echo '  - Nginx loglar: tail -f /var/log/nginx/error.log'
"

echo.
echo 🎉 Deploy muvaffaqiyatli yakunlandi!
echo 🌐 Saytingiz tayyor:
echo    - http://prox.uz
echo    - http://45.92.173.33
echo.
echo 📝 Keyingi qadamlar:
echo    1. prox.uz domenini 45.92.173.33 IP ga yo'naltiring (DNS A record)
echo    2. SSL sertifikat o'rnating: ssh root@45.92.173.33 "certbot --nginx -d prox.uz -d www.prox.uz"

pause