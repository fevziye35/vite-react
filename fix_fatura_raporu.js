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
        <h2 class="page-title">Fatura Raporu</h2>

        <div class="selection-section">
            <div class="section-header bg-gray-header">
                <i class="fa-solid fa-file-invoice"></i>
                Rapor Filtresi
            </div>
            
            <div class="content-box">
                <div class="form-group mb-20">
                    <label style="font-weight: bold; margin-bottom: 10px; display: block; color: #555;">Rapor Türü</label>
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="reportType" value="all" checked style="accent-color: #2563eb; width: 18px; height: 18px;"> Tüm Faturalar
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="reportType" value="sales" style="accent-color: #2563eb; width: 18px; height: 18px;"> Satış Faturaları
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="radio" name="reportType" value="purchases" style="accent-color: #2563eb; width: 18px; height: 18px;"> Alış Faturaları
                        </label>
                    </div>
                </div>

                <div class="filter-row" style="display: flex; gap: 20px; align-items: flex-end; margin-bottom: 20px;">
                    <div class="filter-group" style="flex: 1;">
                        <label style="font-size: 13px; font-weight: bold; color: #555; display: block; margin-bottom: 5px;">Başlangıç Tarihi:</label>
                        <input type="date" class="form-control w-100" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                    <div class="filter-group" style="flex: 1;">
                        <label style="font-size: 13px; font-weight: bold; color: #555; display: block; margin-bottom: 5px;">Bitiş Tarihi:</label>
                        <input type="date" class="form-control w-100" style="padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                    </div>
                </div>

                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
                    <a href="#" onclick="event.preventDefault(); alert('Rapor başarıyla üretildi.');" class="btn btn-dark-blue p-20" style="display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-list-check"></i> Fatura Raporu Getir
                    </a>
                </div>
            </div>
        </div>
    </main>

    ${wrapperEndMatch[0].replace('</body>\\n\\n</html>', '')}
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            document.title = "Fatura Raporu";
        });
    </script>
</body>
</html>
`;

newHtml = newHtml.replace(/<title>Satış Yap<\/title>/g, '<title>Fatura Raporu</title>');
// Remove active state from sidebar for Satış Yap
newHtml = newHtml.replace(/<a href="satis_yap\.html" class="active">/, '<a href="satis_yap.html">');

fs.writeFileSync(path.join(__dirname, 'fatura_raporu.html'), newHtml, 'utf8');
console.log('Successfully fixed fatura_raporu.html');
