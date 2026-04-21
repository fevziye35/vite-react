const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'cek_raporu.html');
let html = fs.readFileSync(filePath, 'utf8');

const newMainContent = `
    <main class="main-content">
        <h2 class="page-title">Çek ve Senet Raporu</h2>

        <div class="mb-20" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="cek_senet.html" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #1f3a60 0%, #112240 100%); font-size: 15px; border: none; cursor: pointer;">
                <i class="fa-solid fa-arrow-left"></i> Çek & Senet Ekranına Dön
            </a>
            <button id="btnGetReport" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%); font-size: 15px; border: none; cursor: pointer;">
                <i class="fa-solid fa-money-check"></i> Raporu Hazırla
            </button>
        </div>

        <div class="selection-section">
            <div class="section-header bg-gray-header">
                <i class="fa-solid fa-file-invoice"></i> Rapor Kriterleri
            </div>
            
            <div class="content-box">
                <div class="filter-row" style="display: flex; gap: 40px; align-items: flex-end; background-color: #f7f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ebf0f4; flex-wrap: wrap;">
                    
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: bold; color: #555;">Vade Tarihi Aralığı:</label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: #555; font-size: 14px; font-weight: 500;">
                                <input type="checkbox" id="tumZamanlar" style="width: 16px; height: 16px; accent-color: #1f3a60;"> Tüm Zamanlar
                            </label>
                            <input type="date" class="form-control" id="baslangicTarihi" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px; width: 140px;">
                            <span style="color: #888;">-</span>
                            <input type="date" class="form-control" id="bitisTarihi" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px; width: 140px;">
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: bold; color: #555;">Durumu Seçiniz:</label>
                        <select class="form-control" id="evrakDurumu" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px; width: 220px;">
                            <option value="all">Tümü (Çek ve Senetler)</option>
                            <option value="bekliyor">Sadece Bekleyenler</option>
                            <option value="odendi">Sadece Ödenenler/Tahsil Edilenler</option>
                            <option value="karsiliksiz">Karşılıksız/İade</option>
                        </select>
                    </div>

                </div>

                <div id="reportResult" style="margin-top: 30px; display: none;">
                    <div class="table-container">
                        <table class="customer-table w-100">
                            <thead>
                                <tr class="bg-gray-header">
                                    <th class="p-15" style="border-radius: 8px 0 0 0;">Vade Tarihi</th>
                                    <th>Cari / İlgili Kişi</th>
                                    <th>Evrak No</th>
                                    <th>Durum</th>
                                    <th style="border-radius: 0 8px 0 0;">Tutar</th>
                                </tr>
                            </thead>
                            <tbody id="reportTableBody">
                                <tr>
                                    <td colspan="5" style="padding: 40px; text-align: center; color: #888; font-style: italic;">
                                        Seçilen kriterlere uygun çek veya senet bulunamadı.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </main>
`;

html = html.replace(/<main class="main-content">[\s\S]*?(?=<\/main>)/, newMainContent.replace('</main>', ''));
html = html.replace(
    /document\.getElementById\('btnGetReport'\)\.addEventListener\('click', function \(\) \{[\s\S]*?\}\);/,
    `document.getElementById('btnGetReport')?.addEventListener('click', function () {
            const reportResult = document.getElementById('reportResult');
            if (reportResult) reportResult.style.display = 'block';
        });`
);
if (!html.includes("document.getElementById('btnGetReport')?.addEventListener")) {
     html = html.replace(/<\/body>/, `<script>
        document.getElementById('btnGetReport')?.addEventListener('click', function () {
            const reportResult = document.getElementById('reportResult');
            if (reportResult) reportResult.style.display = 'block';
        });
     </script></body>`);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully modernized cek_raporu.html');
