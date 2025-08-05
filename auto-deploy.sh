#!/bin/bash

# Avtomatik deploy script
set -e

echo "🚀 Prox ilovasini VPS serverga deploy qilish boshlandi..."

# Ranglar
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funksiyalar
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Server ma'lumotlarini so'rash
read -p "VPS server IP manzilini kiriting: " SERVER_IP
read -p "SSH username ni kiriting (default: root): " SSH_USER
SSH_USER=${SSH_USER:-root}
read -p "Domain nomini kiriting (masalan: example.com): " DOMAIN_NAME

echo "📋 Deploy ma'lumotlari:"
echo "Server IP: $SERVER_IP"
echo "SSH User: $SSH_USER"
echo "Domain: $DOMAIN_NAME"
echo ""

read -p "Davom etishni xohlaysizmi? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# SSH orqali serverga ulanish va deploy qilish
echo "🔗 Serverga ulanish va deploy qilish..."

ssh $SSH_USER@$SERVER_IP << EOF
    set -e
    
    echo "📦 Sistema paketlarini yangilash..."
    apt update && apt upgrade -y
    
    echo "🔧 Node.js o'rnatish..."
    if ! command -v node &> /dev/null; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    echo "📥 Git o'rnatish..."
    if ! command -v git &> /dev/null; then
        apt install git -y
    fi
    
    echo "⚙️ PM2 o'rnatish..."
    if ! command -v pm2 &> /dev/null; then
        npm install -g pm2
    fi
    
    echo "📁 Loyiha papkasini yaratish..."
    mkdir -p /opt/prox-app
    cd /opt/prox-app
    
    echo "📥 Loyihani yuklab olish..."
    if [ -d ".git" ]; then
        git pull origin main
    else
        git clone https://github.com/lenos777/Prox.git .
    fi
    
    echo "📦 Dependencies o'rnatish..."
    npm install
    
    echo "🏗️ Loyihani build qilish..."
    npm run build
    
    echo "⚙️ Environment faylini sozlash..."
    if [ ! -f ".env" ]; then
        cat > .env << EOL
# MongoDB Connection
MONGODB_URI=mongodb+srv://opscoder:PRv5ASUw6d5Qunz7@cluster0.s5obnul.mongodb.net/proX?retryWrites=true&w=majority&appName=Cluster0

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)

# Server Port
PORT=8080

# Environment
NODE_ENV=production

TELEGRAM_BOT_TOKEN=8038376421:AAFtbldLbquVurnRlc6mf08k_bx6xEwcc1I
SITE_URL=http://$DOMAIN_NAME
EOL
    fi
    
    echo "🚀 PM2 bilan ishga tushirish..."
    pm2 stop prox-app 2>/dev/null || true
    pm2 delete prox-app 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
    
    echo "🌐 Nginx o'rnatish..."
    if ! command -v nginx &> /dev/null; then
        apt install nginx -y
    fi
    
    echo "⚙️ Nginx konfiguratsiyasi..."
    cat > /etc/nginx/sites-available/prox-app << EOL
server {
    listen 80;
    server_name $DOMAIN_NAME www.$DOMAIN_NAME;
    
    client_max_body_size 10M;
    
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
    
    location /uploads/ {
        alias /opt/prox-app/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOL
    
    ln -sf /etc/nginx/sites-available/prox-app /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    nginx -t
    systemctl restart nginx
    systemctl enable nginx
    
    echo "🔥 Firewall sozlash..."
    ufw --force enable
    ufw allow 22
    ufw allow 80
    ufw allow 443
    
    echo "📊 Holat tekshirish..."
    pm2 status
    systemctl status nginx --no-pager
    
    echo "✅ Deploy muvaffaqiyatli yakunlandi!"
    echo "🌐 Saytingiz manzili: http://$DOMAIN_NAME"
    echo "📊 PM2 monitoring: pm2 monit"
    echo "📋 Loglar: pm2 logs prox-app"
EOF

print_success "Deploy jarayoni yakunlandi!"
print_warning "SSL sertifikat o'rnatish uchun quyidagi buyruqni serverde bajaring:"
echo "sudo certbot --nginx -d $DOMAIN_NAME -d www.$DOMAIN_NAME"
echo ""
print_success "Saytingiz tayyor: http://$DOMAIN_NAME"