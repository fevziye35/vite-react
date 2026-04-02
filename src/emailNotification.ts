import emailjs from '@emailjs/browser';

const RECIPIENTS = [
  'fevziye.mamak35@gmail.com',
  'amamak1980@gmail.com',
  'berk.camkiran@alimamak.com.tr',
  'export.sales@alimamak.com.tr'
];

export const sendActivityMail = async (tableName: string, data: any) => {
  const serviceId = 'service_u1cjg94'; 
  const templateId = 'template_odoud0n'; 
  const publicKey = 'ggEE0Y0SqN9BMmGfs';

  // Eğer EmailJS'e her maili ayrı ayrı atmak istiyorsak:
  try {
    const promises = RECIPIENTS.map(async (email) => {
      // Sadece şık ve kisa bir bilgilendirme metni oluşturuyoruz
      let kisaMesaj = `Sisteme yeni bir kayıt eklendi. (Tablo: ${tableName})`;
      
      if (tableName === 'offers') {
        kisaMesaj = `Sisteme başarıyla yeni bir TEKLİF eklendi! ✨\nTeklif Numarası: ${data.offer_number || 'Bilinmiyor'}\nToplam Tutar: $${data.total_amount || 0}`;
      } else if (tableName === 'deals') {
        kisaMesaj = `Müjde! Sisteme yeni bir ANLAŞMA (Deal) eklendi! 🚀\nAnlaşma Miktarı: $${data.amount || 0}`;
      }

      const templateParams = {
        subject: tableName === 'offers' ? 'YENİ TEKLİF BİLDİRİMİ' : 'YENİ CRM BİLDİRİMİ', 
        content: kisaMesaj, 
        to_email: email
      };
      return emailjs.send(serviceId, templateId, templateParams, publicKey);
    });

    await Promise.all(promises);
    console.log(`Fevziye Hanım, mail başarıyla toplam ${RECIPIENTS.length} ekip arkadaşınıza gönderildi! ✅`);
  } catch (error: any) {
    console.error('Mail gönderilirken hata oluştu:', error);
    if (error && error.text) {
        console.error('Hata Detayı (Bunu bana yazınız):', error.text);
    }
  }
};