# Prox loyihasini VPS ga deploy qilish yo'riqnomasi
Write-Host "🚀 Prox loyihasini VPS ga deploy qilish" -ForegroundColor Green
Write-Host "Server: 45.92.173.33" -ForegroundColor Cyan
Write-Host "Domain: prox.uz" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Quyidagi buyruqlarni ketma-ket bajaring:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣ Serverga ulanish:" -ForegroundColor Cyan
Write-Host "   ssh root@45.92.173.33" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣ Sistema yangilash:" -ForegroundColor Cyan
Write-Host "   apt update; apt upgrade -y" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣ Node.js o'rnatish:" -ForegroundColor Cyan
Write-Host "   curl -fsSL https://deb.nodesource.com/setup_18.x | bash -" -ForegroundColor White
Write-Host "   apt-get install -y nodejs" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣ Git, Nginx va PM2 o'rnatish:" -ForegroundColor Cyan
Write-Host "   apt install git nginx -y" -ForegroundColor White
Write-Host "   npm install -g pm2" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣ Loyihani yuklab olish:" -ForegroundColor Cyan
Write-Host "   mkdir -p /opt/prox-app" -ForegroundColor White
Write-Host "   cd /opt/prox-app" -ForegroundColor White
Write-Host "   git clone https://github.com/lenos777/Prox.git ." -ForegroundColor White
Write-Host ""

Write-Host "6️⃣ Environment faylini yaratish:" -ForegroundColor Cyan
Write-Host "   nano .env" -ForegroundColor White
Write-Host "   (Quyidagi ma'lumotlarni kiriting:)" -ForegroundColor Gray
Write-Host ""
Write-Host "MONGODB_URI=mongodb+srv://opscoder:PRv5ASUw6d5Qunz7@cluster0.s5obnul.mongodb.net/proX?retryWrites=true&w=majority&appName=Cluster0" -ForegroundColor DarkGray
Write-Host "JWT_SECRET=prox-super-secret-jwt-key-production-2025" -ForegroundColor DarkGray
Write-Host "PORT=8080" -ForegroundColor DarkGray
Write-Host "NODE_ENV=production" -ForegroundColor DarkGray
Write-Host "TELEGRAM_BOT_TOKEN=8038376421:AAFtbldLbquVurnRlc6mf08k_bx6xEwcc1I" -ForegroundColor DarkGray
Write-Host "SITE_URL=http://prox.uz" -ForegroundColor DarkGray
Write-Host ""

Write-Host "7️⃣ Build va kerakli papkalar:" -ForegroundColor Cyan
Write-Host "   npm install" -ForegroundColor White
Write-Host "   npm run build" -ForegroundColor White
Write-Host "   mkdir -p uploads/courses logs" -ForegroundColor White
Write-Host ""

Write-Host "8️⃣ PM2 konfiguratsiya yaratish:" -ForegroundColor Cyan
Write-Host "   nano ecosystem.config.js" -ForegroundColor White
Write-Host "   (Quyidagi konfiguratsiyani kiriting:)" -ForegroundColor Gray
Write-Host ""

Write-Host "9️⃣ PM2 bilan ishga tushirish:" -ForegroundColor Cyan
Write-Host "   pm2 start ecosystem.config.js" -ForegroundColor White
Write-Host "   pm2 save" -ForegroundColor White
Write-Host "   pm2 startup" -ForegroundColor White
Write-Host ""

Write-Host "🔟 Nginx sozlash:" -ForegroundColor Cyan
Write-Host "   nano /etc/nginx/sites-available/prox-app" -ForegroundColor White
Write-Host "   ln -sf /etc/nginx/sites-available/prox-app /etc/nginx/sites-enabled/" -ForegroundColor White
Write-Host "   rm -f /etc/nginx/sites-enabled/default" -ForegroundColor White
Write-Host "   nginx -t" -ForegroundColor White
Write-Host "   systemctl restart nginx" -ForegroundColor White
Write-Host ""

Write-Host "1️⃣1️⃣ Firewall sozlash:" -ForegroundColor Cyan
Write-Host "   ufw --force enable" -ForegroundColor White
Write-Host "   ufw allow 22" -ForegroundColor White
Write-Host "   ufw allow 80" -ForegroundColor White
Write-Host "   ufw allow 443" -ForegroundColor White
Write-Host ""

Write-Host "1️⃣2️⃣ Holat tekshirish:" -ForegroundColor Cyan
Write-Host "   pm2 status" -ForegroundColor White
Write-Host "   systemctl status nginx" -ForegroundColor White
Write-Host "   curl http://localhost:8080" -ForegroundColor White
Write-Host ""

Write-Host "📝 Deploy tugagandan keyin:" -ForegroundColor Yellow
Write-Host "   1. prox.uz domenini 45.92.173.33 IP ga yo'naltiring (DNS A record)" -ForegroundColor White
Write-Host "   2. SSL sertifikat o`rnating:" -ForegroundColor White
Write-Host "      apt install certbot python3-certbot-nginx -y" -ForegroundColor Gray
Write-Host "      certbot --nginx -d prox.uz -d www.prox.uz" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 Avtomatik deploy uchun bash script ishlatish:" -ForegroundColor Yellow
Write-Host "   bash vps-deploy.sh" -ForegroundColor White
Write-Host ""

Write-Host "✅ Sayt manzillari:" -ForegroundColor Green
Write-Host "   - http://prox.uz" -ForegroundColor White
Write-Host "   - http://45.92.173.33" -ForegroundColor White