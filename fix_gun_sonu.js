const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'gun_sonu_raporu.html');
let html = fs.readFileSync(filePath, 'utf8');

const newMainContent = `
    <main class="main-content">
        <h2 class="page-title">Gün Sonu Raporu</h2>

        <div class="mb-20" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="index.html" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #1f3a60 0%, #112240 100%); font-size: 15px; border: none; cursor: pointer;">
                <i class="fa-solid fa-arrow-left"></i> Giriş Ekranına Dön
            </a>
            <button id="btnGetReport" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%); font-size: 15px; border: none; cursor: pointer;">
                <i class="fa-solid fa-calendar-day"></i> Gün Sonu Raporu Al
            </button>
        </div>

        <div class="selection-section">
            <div class="section-header bg-gray-header">
                <i class="fa-solid fa-file-invoice"></i> Rapor Kriterleri
            </div>
            
            <div class="content-box">
                <div class="filter-row" style="display: flex; gap: 40px; align-items: flex-end; background-color: #f7f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ebf0f4; flex-wrap: wrap;">
                    
                    <div style="display: flex; flex-direction: column; gap: 5px;">
                        <label style="font-size: 13px; font-weight: bold; color: #555;">Tarih Seçiniz:</label>
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <input type="date" class="form-control" id="raporTarihi" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px; width: 160px;">
                        </div>
                    </div>

                </div>

                <div id="reportResult" style="margin-top: 30px; display: none;">
                    <div class="table-container">
                        <table class="customer-table w-100">
                            <thead>
                                <tr class="bg-gray-header">
                                    <th class="p-15" style="border-radius: 8px 0 0 0;">Kategori</th>
                                    <th>İşlem Adedi</th>
                                    <th>Toplam Gelir</th>
                                    <th>Toplam Gider</th>
                                    <th style="border-radius: 0 8px 0 0;">Nakit Akışı (Net)</th>
                                </tr>
                            </thead>
                            <tbody id="reportTableBody">
                                <tr>
                                    <td colspan="5" style="padding: 40px; text-align: center; color: #888; font-style: italic;">
                                        Günün özet verileri aranıyor... Lütfen bekleyiniz.
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

// Wait, the file might try to register an event on `btnGetReport`.
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
            
            setTimeout(() => {
                const tbody = document.getElementById('reportTableBody');
                if (tbody) {
                    tbody.innerHTML = '<tr><td colspan="5" style="padding: 40px; text-align: center; color: #888; font-style: italic;">Seçtiğiniz tarihte kasa veya banka hareketi bulunamadı.</td></tr>';
                }
            }, 800);
        });
     </script></body>`);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully modernized gun_sonu_raporu.html');
