import emailjs from '@emailjs/browser';

export const sendActivityMail = async (tableName: string, data: any) => {
  const serviceId = 'service_u1cjg94'; 
  const templateId = 'template_v888qcr'; 
  const publicKey = 'ggEE0Y0SqN9BMmGfs';

  const templateParams = {
    subject: tableName, 
    content: JSON.stringify(data, null, 2), 
  };

  try {
    const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
    console.log('Fevziye Hanım, mail başarıyla gönderildi! ✅', result.text);
  } catch (error) {
    console.error('Mail gönderilirken hata oluştu:', error);
  }
};