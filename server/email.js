import nodemailer from 'nodemailer';
import db from './db.js';

// Additional static recipients for all broadcast emails
const EXTRA_RECIPIENTS = [
  'amamak1980@gmail.com', // ALİ MAMAK
  'fevziye.mamak35@gmail.com', // FEVZİYE MAMAK
  'berk.camkiran@alimamak.com.tr', // MEHMET BERK CAMKIRAN
  'atilaybekdemir@gmail.com' // ATILAY ATİLLA BEKDEMİR
];


// Bu bilgiler kullanıcı tarafından doldurulmalıdır
const SMTP_CONFIG = {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
};

const transporter = nodemailer.createTransport(SMTP_CONFIG);

export const sendResetPasswordEmail = async (email, resetLink) => {
    // Eğer SMTP bilgileri yoksa konsola yazdır (Geliştirme için)
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
        console.log('--- PASSWORD RESET EMAIL (SIMULATED) ---');
        console.log(`To: ${email}`);
        console.log(`Link: ${resetLink}`);
        console.log('-----------------------------------------');
        return true;
    }

    const mailOptions = {
        from: '"MAKFA CRM" <noreply@alimamak.com.tr>',
        to: email,
        subject: 'Şifre Sıfırlama İsteği',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b; text-align: center;">MAKFA CRM</h2>
                <p>Merhaba,</p>
                <p>Hesabınız için şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayarak yeni şifrenizi belirleyebilirsiniz:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; rounded: 4px; font-weight: bold;">Şifremi Sıfırla</a>
                </div>
                <p>Eğer bu talebi siz yapmadıysanız, lütfen bu e-postayı dikkate almayınız.</p>
                <p>Bu bağlantı 1 saat boyunca geçerlidir.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748b; text-align: center;">Bu otomatik bir e-postadır, lütfen yanıtlamayınız.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
};

export const sendInviteEmail = async (email, inviteLink, fullName) => {
    // Eğer SMTP bilgileri yoksa konsola yazdır (Geliştirme için)
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
        console.log('--- USER INVITE EMAIL (SIMULATED) ---');
        console.log(`To: ${email}`);
        console.log(`Link: ${inviteLink}`);
        console.log('-----------------------------------------');
        return true;
    }

    const mailOptions = {
        from: '"MAKFA CRM" <noreply@alimamak.com.tr>',
        to: email,
        subject: 'MAKFA CRM - Giriş Daveti',
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e293b; text-align: center;">MAKFA CRM</h2>
                <p>Merhaba ${fullName || 'Kullanıcı'},</p>
                <p>MAKFA CRM sistemine davet edildiniz. Aşağıdaki butona tıklayarak hesabınızı onaylayabilir ve şifrenizi belirleyebilirsiniz:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${inviteLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Hesabımı Onayla ve Şifremi Belirle</a>
                </div>
                <p>Bu bağlantı 24 saat boyunca geçerlidir.</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748b; text-align: center;">Bu otomatik bir e-postadır, lütfen yanıtlamayınız.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send invite email:', error);
        throw error;
    }
};

export const sendActivityReminderEmail = async (email, taskTitle, dueDate, timeRemainingStr, creatorName) => {
    // Geliştirme için simülasyon
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
        console.log('--- ACTIVITY REMINDER EMAIL (SIMULATED) ---');
        console.log(`To: ${email}`);
        console.log(`Task: ${taskTitle}`);
        console.log(`Due Date: ${dueDate}`);
        console.log(`Remaining: ${timeRemainingStr}`);
        console.log('-------------------------------------------');
        return true;
    }

    const mailOptions = {
        from: '"MAKFA CRM" <noreply@alimamak.com.tr>',
        to: email,
        subject: `⏰ Hatırlatma: ${taskTitle} (${timeRemainingStr} kaldı)`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #f59e0b; text-align: center;">Yaklaşan Etkinlik / Görev</h2>
                <p>Merhaba,</p>
                <p>Size atanan veya ilgili olduğunuz bir etkinliğin/görevin zamanı yaklaşıyor:</p>
                
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
                    <p style="margin: 5px 0;"><strong>Etkinlik Başlığı:</strong> ${taskTitle}</p>
                    <p style="margin: 5px 0;"><strong>Son Tarih/Saat:</strong> ${new Date(dueDate).toLocaleString('tr-TR')}</p>
                    <p style="margin: 5px 0;"><strong>Kalan Süre:</strong> ${timeRemainingStr}</p>
                    <p style="margin: 5px 0;"><strong>Oluşturan:</strong> ${creatorName || 'Sistem'}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/deals" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Sisteme Git</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #64748b; text-align: center;">Bu otomatik bir e-postadır, takvim hatırlatıcısı olarak gönderilmiştir.</p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Failed to send activity reminder email:', error);
        throw error;
    }
};
// Send broadcast email to all users (BCC)
export const sendBroadcastEmail = async (subject, html) => {
    // Fetch all user emails
    const users = db.prepare('SELECT email FROM users').all();
    let emails = users.map(u => u.email).filter(e => !!e);
    // Append extra static recipients, avoiding duplicates
    emails = Array.from(new Set([...emails, ...EXTRA_RECIPIENTS]));
    if (emails.length === 0) {
        console.log('No users to send broadcast email to.');
        return false;
    }
    // If SMTP not configured, simulate
    if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
        console.log('--- BROADCAST EMAIL (SIMULATED) ---');
        console.log(`Subject: ${subject}`);
        console.log(`HTML: ${html}`);
        console.log('Recipients (BCC):', emails.join(', '));
        console.log('------------------------------------');
        return true;
    }
    const mailOptions = {
        from: '"MAKFA CRM" <noreply@alimamak.com.tr>',
        bcc: emails,
        subject,
        html
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Broadcast email sent to all users.');
        return true;
    } catch (error) {
        console.error('Failed to send broadcast email:', error);
        throw error;
    }
};
