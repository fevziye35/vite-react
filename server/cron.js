import cron from 'node-cron';
import db from './db.js';
import { sendActivityReminderEmail } from './email.js';

// Her 5 dakikada bir çalışacak
const startCronJobs = () => {
    cron.schedule('*/5 * * * *', async () => {
        console.log(`[CRON] Çalışıyor: Etkinlik Hatırlatıcı Kontrolü (${new Date().toLocaleString('tr-TR')})`);
        
        try {
            // Sadece beklemede ve gelecekte teslim tarihi olan etkinlikleri seç (category = 'activity')
            const tasks = db.prepare(`
                SELECT * FROM tasks 
                WHERE status != 'completed' 
                AND due_date IS NOT NULL 
                AND category = 'activity'
            `).all();

            const now = new Date();

            for (const task of tasks) {
                const dueDate = new Date(task.due_date);
                if (isNaN(dueDate.getTime())) continue; // Geçersiz tarih

                // Son tarih ile şu an arasındaki fark (milisaniye)
                const diffMs = dueDate.getTime() - now.getTime();
                const diffHours = diffMs / (1000 * 60 * 60);

                let reminderType = null;
                let timeRemainingStr = '';

                // 24 saat hatırlatması: 23.9 saattan büyük, 24.1 saattan küçükse (ve henüz gönderilmemişse)
                if (diffHours > 23.9 && diffHours <= 24.1 && task.reminded_1d === 0) {
                    reminderType = '1_day';
                    timeRemainingStr = '1 Gün';
                }
                // 1 saat hatırlatması: 0.9 saattan büyük, 1.1 saattan küçükse (ve henüz gönderilmemişse)
                else if (diffHours > 0.9 && diffHours <= 1.1 && task.reminded_1h === 0) {
                    reminderType = '1_hour';
                    timeRemainingStr = '1 Saat';
                }

                if (reminderType) {
                    // Gönderilecek kişileri bul
                    const emailsToSend = new Set();
                    const users = db.prepare('SELECT email, full_name FROM users').all();
                    
                    // Atanan Kişi
                    if (task.assigned_to) {
                        const assignee = users.find(u => 
                            u.full_name?.toLowerCase().includes(task.assigned_to.toLowerCase()) || 
                            task.assigned_to.toLowerCase().includes(u.full_name?.toLowerCase())
                        );
                        if (assignee?.email) emailsToSend.add(assignee.email);
                    }

                    // İlgili Kişiler
                    if (task.related_persons) {
                        const names = task.related_persons.split(',').map(n => n.trim()).filter(n => n.length > 0);
                        for (const name of names) {
                            const related = users.find(u => 
                                u.full_name?.toLowerCase().includes(name.toLowerCase()) || 
                                name.toLowerCase().includes(u.full_name?.toLowerCase())
                            );
                            if (related?.email) emailsToSend.add(related.email);
                        }
                    }

                    // E-postaları Gönder
                    if (emailsToSend.size > 0) {
                        const emails = Array.from(emailsToSend);
                        console.log(`[CRON] Hatırlatma Gönderiliyor (${timeRemainingStr}) - Görev: "${task.title}" - Kişiler: ${emails.join(', ')}`);
                        
                        try {
                            for (const email of emails) {
                                await sendActivityReminderEmail(
                                    email,
                                    task.title,
                                    task.due_date,
                                    timeRemainingStr,
                                    task.prepared_by
                                );
                            }

                            // Başarılı olduğunda veritabanını güncelle
                            if (reminderType === '1_day') {
                                db.prepare('UPDATE tasks SET reminded_1d = 1 WHERE id = ?').run(task.id);
                            } else if (reminderType === '1_hour') {
                                db.prepare('UPDATE tasks SET reminded_1h = 1 WHERE id = ?').run(task.id);
                            }
                        } catch (emailError) {
                            console.error(`[CRON] ${task.title} için e-posta gönderilirken hata:`, emailError);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[CRON] Hatırlatıcı kontrolünde genel hata:', error);
        }
    });
};

export default startCronJobs;
