const fs = require('fs');
const path = require('path');

const taksitPath = path.join(__dirname, 'taksit_rapor.html');
const satisPath = path.join(__dirname, 'satis_raporu.html');

let html = fs.readFileSync(taksitPath, 'utf8');

// Replace standard texts
html = html.replace(/<title>Taksit Takip Gelişmiş Rapor<\/title>/g, '<title>Satış Raporu</title>');
html = html.replace(/<h2 class="page-title">Taksit Takip Gelişmiş Rapor<\/h2>/g, '<h2 class="page-title">Gelişmiş Satış Raporu</h2>');

// Replace active sidebar item
html = html.replace(/<a href="taksit_rapor.html" class="active">/g, '<a href="taksit_rapor.html">');
html = html.replace(/<a href="satis_raporu.html">/g, '<a href="satis_raporu.html" class="active">');

// Replace navigation buttons
html = html.replace(/<a href="taksit_takip.html"/g, '<a href="satis_yap.html"');
html = html.replace(/Taksit Takibe Dön/g, 'Satış Ekranına Dön');

// Replace Section Header Icon
html = html.replace(/<i class="fa-solid fa-calendar-days"><\/i> Rapor Kriterleri/g, '<i class="fa-solid fa-cart-shopping"></i> Rapor Kriterleri');

// Replace select box for criteria
const filterTypeRegex = /<label[^>]*>Listelemek İstediğiniz Taksit Türünü Seçiniz:<\/label>[\s\S]*?<\/select>/;
const newFilterSelect = `<label style="font-size: 13px; font-weight: bold; color: #555;">Satış Belgesi Türü:</label>
                        <select class="form-control" id="salesDocType" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px; width: 250px;">
                            <option value="all" selected>Tüm Satışlar</option>
                            <option value="invoice">Sadece Faturalar</option>
                            <option value="waybill">Sadece İrsaliyeler</option>
                            <option value="return">Satış İadeleri</option>
                        </select>`;
html = html.replace(filterTypeRegex, newFilterSelect);

// Replace Table Headers
const tableHeadersRegex = /<thead>[\s\S]*?<\/thead>/;
const newHeaders = `<thead>
                                <tr class="bg-gray-header">
                                    <th class="p-15" style="border-radius: 8px 0 0 0;">Tarih</th>
                                    <th>Fatura / İrsaliye No</th>
                                    <th>Cari / Müşteri</th>
                                    <th>Belge Türü</th>
                                    <th style="border-radius: 0 8px 0 0;">Tutar</th>
                                </tr>
                            </thead>`;
html = html.replace(tableHeadersRegex, newHeaders);

// Replace Table Body placeholder
html = html.replace(/colspan="5"/g, 'colspan="5"'); 

// Write the file
fs.writeFileSync(satisPath, html, 'utf8');
console.log('Successfully created satis_raporu.html');
