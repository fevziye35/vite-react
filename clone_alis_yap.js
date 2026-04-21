const fs = require('fs');
const path = require('path');

const satisHtml = fs.readFileSync(path.join(__dirname, 'satis_yap.html'), 'utf8');

// We perform surgical replacements on the raw string to morph it into alis_yap.html
let alisHtml = satisHtml;

// 1. Title and heading
alisHtml = alisHtml.replace(/<title>Satış Yap<\/title>/g, '<title>Alış Yap</title>');
alisHtml = alisHtml.replace(/<h2 class="page-title">Satış Yap<\/h2>/g, '<h2 class="page-title">Alış Yap</h2>');

// 2. Button link
alisHtml = alisHtml.replace(/href="satis_yeni\.html"/g, 'href="new_account.html"');

// 3. Selection section header
alisHtml = alisHtml.replace(/Satış Yapılacak Cari Seçimi/g, 'Alış Yapılacak Cari Seçimi');

// 4. IDs and JS function names
alisHtml = alisHtml.replace(/salesSearchInput/g, 'purchaseSearchInput');
alisHtml = alisHtml.replace(/salesCustomerTable/g, 'purchaseCustomerTable');
alisHtml = alisHtml.replace(/loadSalesCustomers/g, 'loadPurchaseCustomers');
alisHtml = alisHtml.replace(/selectCustomerForSale/g, 'selectCustomerForPurchase');

// 5. Redirection link inside the JS
alisHtml = alisHtml.replace(/satis_faturasi\.html\?cari_id=/g, 'alis_faturasi.html?cari_id=');

// 6. Sidebar active state
// satis_yap.html currently has: <li><a href="satis_yap.html" class="active">
alisHtml = alisHtml.replace(/class="active">(.*?)(Satış\s*Yap)/, '>$1$2');

fs.writeFileSync(path.join(__dirname, 'alis_yap.html'), alisHtml, 'utf8');
console.log('Successfully cloned satis_yap.html into alis_yap.html and adapted for purchasing.');
