@echo off
:loop
npx localtunnel --port 3001 --subdomain makfacrm
echo ⚠️ Baglantı koptu, yeniden baslatiliyor...
timeout /t 3 >nul
goto loop
