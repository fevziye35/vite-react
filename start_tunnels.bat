
@echo off
echo 🚀 Cloudflare Tunnels baslatiliyor...

:: Backend Tunnel (3001)
echo 📡 Backend tüneli baslatiliyor (Port 3001)...
start "" .\cloudflared.exe tunnel --url http://localhost:3001

:: Frontend Tunnel (5173)
echo 📡 Frontend tüneli baslatiliyor (Port 5173)...
start "" .\cloudflared.exe tunnel --url http://localhost:5173

echo.
echo ✅ Tüneller baslatildi. Lütfen loglari kontrol edin ve URL'leri tarayiciniza yapistirin.
pause
