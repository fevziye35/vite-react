const fs = require('fs');
const path = require('path');

const satisHtml = fs.readFileSync(path.join(__dirname, 'satis_yap.html'), 'utf8');

// We need to parse satis_yap.html's navigation and header
const headMatch = satisHtml.match(/<head>[\s\S]*?<\/head>/);
const navMatch = satisHtml.match(/<nav class="sidebar">[\s\S]*?<\/nav>/);
const headerMatch = satisHtml.match(/<header class="header">[\s\S]*?<\/header>/);
const wrapperEndMatch = satisHtml.match(/<script src="translations\.js"><\/script>[\s\S]*/);

let newHtml = `<!DOCTYPE html>
<html lang="tr">

${headMatch[0]}

<body>

    ${navMatch[0]}

    ${headerMatch[0]}

    <!-- Main Content -->
    <main class="main-content">
        <h2 class="page-title">e-Müstahsil Listesi</h2>

        <div class="mb-20" style="display: flex; gap: 10px;">
            <a href="e_mustahsil.html" class="btn btn-dark-blue p-20">
                <i class="fa-solid fa-plus"></i> Yeni Müstahsil
            </a>
            <button class="btn btn-dark-blue p-20" style="background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);">Durum Güncelle</button>
        </div>

        <div class="data-section" style="margin-top: 20px; border: 1px solid #dcdcdc; border-radius: 12px; background: #fff; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.03);">
            <div class="section-header" style="background-color: #aeb9c3; color: #1f3a60; padding: 12px 15px; font-weight: bold; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-pen-to-square"></i>
                e-Müstahsil Listesi
            </div>
            
            <div class="section-content" style="padding: 20px;">
                <!-- Filters -->
                <div class="filter-row" style="display: flex; gap: 20px; align-items: flex-end; background-color: #f7f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ebf0f4; margin-bottom: 20px;">
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                        <label style="font-size: 13px; font-weight: bold; color: #555;">Başlangıç Tarihi:</label>
                        <input type="date" id="startDate" class="form-control" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px;">
                    </div>
                    <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                        <label style="font-size: 13px; font-weight: bold; color: #555;">Bitiş Tarihi:</label>
                        <div class="input-with-btn" style="display: flex;">
                            <input type="date" id="endDate" class="form-control" style="border-radius: 8px 0 0 8px; border: 1px solid #dce0e4; padding: 8px 12px; flex: 1; border-right: none;">
                            <button class="btn btn-secondary" style="border-radius: 0 8px 8px 0; padding: 8px 15px;" aria-label="Ara"><i class="fa-solid fa-search"></i></button>
                        </div>
                    </div>
                    <div class="filter-group search-group" style="flex: 2; margin-top: auto;">
                        <div class="input-with-btn" style="display: flex; width: 100%;">
                            <input type="text" class="form-control" placeholder="Ara" style="border-radius: 8px 0 0 8px; border: 1px solid #dce0e4; padding: 8px 12px; width: 100%; border-right: none;">
                            <button class="btn btn-secondary" style="border-radius: 0 8px 8px 0; padding: 8px 15px;" aria-label="Ara"><i class="fa-solid fa-search"></i></button>
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <table class="customer-table w-100">
                        <thead>
                            <tr class="bg-gray-header">
                                <th class="p-15">Ünvan</th>
                                <th>Yetkili</th>
                                <th>Tarih</th>
                                <th>Saat</th>
                                <th>Genel Toplam</th>
                                <th>Türü</th>
                                <th>e-Müstahsil Durumu</th>
                                <th class="text-right">No</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Empty State or Data -->
                            <tr><td colspan="8" class="text-center" style="padding: 20px; color: #999;">Kayıt bulunamadı.</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    ${wrapperEndMatch[0].replace('</body>\\n\\n</html>', '')}
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Set default dates
            const today = new Date();
            const lastYear = new Date();
            lastYear.setFullYear(today.getFullYear() - 1);

            document.getElementById('startDate').value = lastYear.toISOString().split('T')[0];
            document.getElementById('endDate').value = today.toISOString().split('T')[0];
            
            // Adjust title
            document.title = "e-Müstahsil Listesi";
        });
    </script>
</body>
</html>
`;

// Clean up mismatched titles just in case
newHtml = newHtml.replace(/<title>Satış Yap<\/title>/g, '<title>e-Müstahsil Listesi</title>');

fs.writeFileSync(path.join(__dirname, 'e_mustahsil_listesi.html'), newHtml, 'utf8');
console.log('Successfully fixed e_mustahsil_listesi.html');
