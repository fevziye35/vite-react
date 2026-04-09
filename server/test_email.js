import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || '',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
    tls: {
        rejectUnauthorized: false
    }
};

console.log('Testing SMTP with:', { ...SMTP_CONFIG, auth: { ...SMTP_CONFIG.auth, pass: '****' } });

const transporter = nodemailer.createTransport(SMTP_CONFIG);

async function test() {
    try {
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        const info = await transporter.sendMail({
            from: `"MAKFA CRM Test" <${SMTP_CONFIG.auth.user}>`,
            to: 'fevziye.mamak35@gmail.com',
            subject: 'SMTP Test',
            text: 'This is a test email from MAKFA CRM.'
        });
        console.log('✅ Email sent successfully:', info.messageId);
    } catch (error) {
        console.error('❌ SMTP/Email error:', error);
    }
}

test();
