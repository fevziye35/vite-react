
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

async function start() {
    console.log('🚀 CRM Global Erisim Baslatiliyor...');

    // 1. Backend Tunnel
    console.log('📡 Backend tüneli kuruluyor...');
    const backendCf = spawn('..\\cloudflared.exe', ['tunnel', '--url', 'http://localhost:3001'], { cwd: __dirname });
    let backendUrl = '';

    backendCf.stderr.on('data', (data) => {
        const msg = data.toString();
        const match = msg.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match && !backendUrl) {
            backendUrl = match[0];
            console.log(`✅ Backend URL: ${backendUrl}`);
            
            // Env güncelle
            const envPath = path.join(rootDir, '.env');
            let envContent = fs.readFileSync(envPath, 'utf8');
            envContent = envContent.replace(/VITE_API_URL=.*/, `VITE_API_URL=${backendUrl}`);
            fs.writeFileSync(envPath, envContent);
            console.log('📝 .env dosyası güncellendi.');
            
            // Backend'i başlat
            console.log('⚙️ Backend sunucusu baslatiliyor...');
            spawn('node', ['index.js'], { cwd: __dirname, stdio: 'inherit' });
        }
    });

    // 2. Frontend Tunnel
    console.log('📡 Frontend tüneli kuruluyor...');
    const frontendCf = spawn('..\\cloudflared.exe', ['tunnel', '--url', 'http://localhost:5173'], { cwd: __dirname });
    let frontendUrl = '';

    frontendCf.stderr.on('data', (data) => {
        const msg = data.toString();
        const match = msg.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match && !frontendUrl) {
            frontendUrl = match[0];
            console.log('\n=========================================');
            console.log('🌍 CRM ŞU AN DÜNYADAN ERİŞİLEBİLİR!');
            console.log(`🔗 ADRES: ${frontendUrl}`);
            console.log('=========================================\n');
            console.log('💡 Bu adresi hem telefonunuzda hem bilgisayarınızda kullanabilirsiniz.');
        }
    });
}

start().catch(console.error);
