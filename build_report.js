const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'cari_raporu.html'))) {
    let raporHtml = fs.readFileSync(path.join(__dirname, 'cari_raporu.html'), 'utf8');
    raporHtml = raporHtml.replace(/Cari Ekstresi/g, 'Fatura Raporu');
    raporHtml = raporHtml.replace(/Cari Raporu/g, 'Fatura Raporu');
    raporHtml = raporHtml.replace(/<title>.*<\/title>/g, '<title>Fatura Raporu</title>');
    
    // Also change the customer selection text to just 'Report Filter' conceptually
    raporHtml = raporHtml.replace(/Rapor Alınacak Cari Seçimi/g, 'Fatura Filtreleme Formu');
    
    fs.writeFileSync(path.join(__dirname, 'fatura_raporu.html'), raporHtml, 'utf8');
    console.log('Created fatura_raporu.html from cari_raporu.html');
}
