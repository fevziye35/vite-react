const fs = require('fs');
const path = require('path');

const satisHtml = fs.readFileSync(path.join(__dirname, 'satis_yap.html'), 'utf8');

// 1. Create satis_iade.html (Cari Selection Page)
let satisIadeHtml = satisHtml;
satisIadeHtml = satisIadeHtml.replace(/<title>.*?<\/title>/g, '<title>Satış İadesi</title>');
satisIadeHtml = satisIadeHtml.replace(/<h2 class="page-title">.*?<\/h2>/g, '<h2 class="page-title">Satış İadesi</h2>');
satisIadeHtml = satisIadeHtml.replace(/href="satis_yeni\.html"/g, 'href="new_account.html"');
satisIadeHtml = satisIadeHtml.replace(/Satış Yapılacak Cari Seçimi/g, 'İade Yapılacak Cari Seçimi');

satisIadeHtml = satisIadeHtml.replace(/salesSearchInput/g, 'satisIadeSearchInput');
satisIadeHtml = satisIadeHtml.replace(/salesCustomerTable/g, 'satisIadeCustomerTable');
satisIadeHtml = satisIadeHtml.replace(/loadSalesCustomers/g, 'loadsatisIadeCustomers');
satisIadeHtml = satisIadeHtml.replace(/selectCustomerForSale/g, 'selectsatisIadeCustomer');

// Redirection
satisIadeHtml = satisIadeHtml.replace(/satis_faturasi\.html\?cari_id=/g, 'satis_iade_detay.html?cari_id=');
satisIadeHtml = satisIadeHtml.replace(/class="active">(.*?)(Satış\s*Yap)/, '>$1$2');

fs.writeFileSync(path.join(__dirname, 'satis_iade.html'), satisIadeHtml, 'utf8');
console.log('Created satis_iade.html');

// 2. Create satis_iade_detay.html (By cloning alis_iade_detay.html and swapping terms)
if (fs.existsSync(path.join(__dirname, 'alis_iade_detay.html'))) {
    let detayHtml = fs.readFileSync(path.join(__dirname, 'alis_iade_detay.html'), 'utf8');
    
    // Quick replacements
    detayHtml = detayHtml.replace(/Alış İade/g, 'Satış İade');
    detayHtml = detayHtml.replace(/Alış İadesi/g, 'Satış İadesi');
    detayHtml = detayHtml.replace(/Alış/g, 'Satış'); // careful with this
    // We already have 'Satın Alınan' etc depending on the code, let's keep it safe
    detayHtml = detayHtml.replace(/<title>.*<\/title>/g, '<title>Satış İade Faturası</title>');
    
    fs.writeFileSync(path.join(__dirname, 'satis_iade_detay.html'), detayHtml, 'utf8');
    console.log('Created satis_iade_detay.html');
}

// 3. Create fatura_raporu.html (Clone satis_raporu.html)
if (fs.existsSync(path.join(__dirname, 'satis_raporu.html'))) {
    let raporHtml = fs.readFileSync(path.join(__dirname, 'satis_raporu.html'), 'utf8');
    raporHtml = raporHtml.replace(/Satış Raporu/g, 'Fatura Raporu');
    raporHtml = raporHtml.replace(/<title>.*<\/title>/g, '<title>Fatura Raporu</title>');
    fs.writeFileSync(path.join(__dirname, 'fatura_raporu.html'), raporHtml, 'utf8');
    console.log('Created fatura_raporu.html');
}

// 4. Update faturalar.html to remove the alert and link properly
let faturalarHtml = fs.readFileSync(path.join(__dirname, 'faturalar.html'), 'utf8');

// Update Satış İadesi
faturalarHtml = faturalarHtml.replace(
    /<a href="#" onclick="event\.preventDefault\(\); alert\('Bu modül yapım aşamasındadır\.'\);" class="btn-toolbar btn-secondary">\s*<i class="fa-solid fa-rotate-left"><\/i> Satış İadesi\s*<\/a>/g,
    '<a href="satis_iade.html" class="btn-toolbar btn-secondary"><i class="fa-solid fa-rotate-left"></i> Satış İadesi</a>'
);
// Update Fatura Raporu
faturalarHtml = faturalarHtml.replace(
    /<a href="#" onclick="event\.preventDefault\(\); alert\('Bu modül yapım aşamasındadır\.'\);" class="btn-toolbar btn-orange">\s*<i class="fa-solid fa-chart-bar"><\/i> Fatura Raporu\s*<\/a>/g,
    '<a href="fatura_raporu.html" class="btn-toolbar btn-orange"><i class="fa-solid fa-chart-bar"></i> Fatura Raporu</a>'
);

fs.writeFileSync(path.join(__dirname, 'faturalar.html'), faturalarHtml, 'utf8');
console.log('Updated faturalar.html links');
