# VPS Deploy Qo'llanmasi

## 1. VPS serverga ulanish
```bash
ssh root@your-server-ip
# yoki
ssh username@your-server-ip
```

## 2. Kerakli dasturlarni o'rnatish

### Node.js o'rnatish
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Git o'rnatish
```bash
sudo apt update
sudo apt install git -y
```

### PM2 o'rnatish (Process Manager)
```bash
sudo npm install -g pm2
```

## 3. Loyihani yuklab olish
```bash
cd /opt
sudo git clone https://github.com/lenos777/Prox.git prox-app
sudo chown -R $USER:$USER /opt/prox-app
cd /opt/prox-app
```

## 4. Dependencies o'rnatish va build qilish
```bash
npm install
npm run build
```

## 5. Environment o'zgaruvchilarini sozlash
```bash
nano .env
```

`.env` faylida quyidagilarni o'zgartiring:
```
NODE_ENV=production
SITE_URL=http://your-domain.com
PORT=8080
```

## 6. PM2 bilan ishga tushirish
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 7. Nginx o'rnatish va sozlash
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/prox-app
```

Nginx konfiguratsiyasi:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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
```

Nginx ni faollashtirish:
```bash
sudo ln -s /etc/nginx/sites-available/prox-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. Firewall sozlash
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 9. SSL sertifikat o'rnatish (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## 10. Foydali buyruqlar

### Loglarni ko'rish
```bash
pm2 logs prox-app
```

### Ilovani qayta ishga tushirish
```bash
pm2 restart prox-app
```

### Yangilanishlarni olish
```bash
cd /opt/prox-app
git pull origin main
npm install
npm run build
pm2 restart prox-app
```

### Monitoring
```bash
pm2 monit
```

## Docker bilan deploy (alternativ)

Agar Docker ishlatmoqchi bo'lsangiz:

```bash
# Docker o'rnatish
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose o'rnatish
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Loyihani ishga tushirish
cd /opt/prox-app
docker-compose up -d
```

## Troubleshooting

### Port band bo'lsa
```bash
sudo lsof -i :8080
sudo kill -9 PID_NUMBER
```

### Nginx xatolari
```bash
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx
```

### PM2 xatolari
```bash
pm2 logs prox-app --lines 100
pm2 describe prox-app
```