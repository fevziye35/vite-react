const fs = require('fs');
const path = require('path');

const satisHtml = fs.readFileSync(path.join(__dirname, 'satis_yap.html'), 'utf8');

// Parse basic layout components from satis_yap.html
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
        <h2 class="page-title">E-SMM Listesi</h2>

        <!-- Action Buttons (Replacing old tabs) -->
        <div class="mb-20" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="e_smm_fatura_olustur.html" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #1f3a60 0%, #112240 100%);">
                <i class="fa-solid fa-plus"></i> Fatura Oluştur
            </a>
            <button class="btn btn-dark-blue p-20 mb-10" onclick="switchTab('status')" style="background: linear-gradient(135deg, #2c3e50 0%, #1a252f 100%);">
                <i class="fa-solid fa-satellite-dish"></i> Durum Sorgula
            </button>
            <button class="btn btn-dark-blue p-20 mb-10" onclick="switchTab('list')" style="background: linear-gradient(135deg, #1f3a60 0%, #112240 100%);">
                <i class="fa-solid fa-list-check"></i> Fatura Listesi
            </button>
            <button class="btn btn-dark-blue p-20 mb-10" onclick="switchTab('settings')" style="background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);">
                <i class="fa-solid fa-gear"></i> Ayarlar
            </button>
        </div>

        <div class="selection-section">
            <div class="section-header bg-gray-header">
                <i class="fa-solid fa-file-signature"></i>
                E-SMM Yönetimi
            </div>
            
            <div class="content-box">
                <!-- Content sections mapped by JS -->
                
                <!-- LIST CONTENT -->
                <div id="content-list" class="tab-content" style="display: block;">
                    <div class="filter-row" style="display: flex; gap: 20px; align-items: flex-end; background-color: #f7f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ebf0f4; margin-bottom: 20px;">
                        <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <label style="font-size: 13px; font-weight: bold; color: #555;">Başlangıç Tarihi:</label>
                            <input type="date" id="startDate" class="form-control" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px;">
                        </div>
                        <div class="filter-group" style="display: flex; flex-direction: column; gap: 5px; flex: 1;">
                            <label style="font-size: 13px; font-weight: bold; color: #555;">Bitiş Tarihi:</label>
                            <input type="date" id="endDate" class="form-control" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px;">
                        </div>
                        <div>
                            <button class="btn btn-dark-blue" onclick="filterData()" style="height: 40px; padding: 0 25px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">Listele</button>
                        </div>
                    </div>

                    <div style="margin-bottom: 15px; display: flex; align-items: center; gap: 10px;">
                        <label style="font-size: 13px; font-weight: 500; color: #555;">Sayfada Gösterilecek Veri Sayısı:</label>
                        <select id="rowsPerPage" onchange="updateRowsPerPage()" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #dce0e4; height: 35px;">
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>

                    <div class="table-container">
                        <table class="customer-table w-100">
                            <thead>
                                <tr class="bg-gray-header">
                                    <th class="p-15" style="border-radius: 8px 0 0 0;">Fatura No</th>
                                    <th>Ünvan</th>
                                    <th>Tarih</th>
                                    <th>Tutar</th>
                                    <th>Durum</th>
                                    <th style="border-radius: 0 8px 0 0;">Görüntüle</th>
                                </tr>
                            </thead>
                            <tbody id="tableBody">
                                <tr>
                                    <td colspan="6" style="padding: 40px; text-align: center; color: #888; font-style: italic;">
                                        Sayfada listelecek veri sayısı: 0<br>
                                        Toplam Kayıt Bulundu.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- SETTINGS CONTENT -->
                <div id="content-settings" class="tab-content" style="display: none; padding: 10px;">
                    <h3 style="margin-bottom: 20px; color: #1f3a60; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 10px;">E-SMM Ayarları</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="grid-column: 1 / -1;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">Servis URL</label>
                            <select id="serviceUrl" class="form-control w-100" style="padding: 10px; border-radius: 8px; border: 1px solid #dce0e4;">
                                <option value="http://einvoiceservicestest.isnet.net.tr/InvoiceService/Servi">http://einvoiceservicestest.isnet.net.tr/InvoiceService/Servi</option>
                                <option value="https://api.example.com/esmm">https://api.example.com/esmm</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">API Kullanıcı</label>
                            <input type="text" id="apiUser" class="form-control w-100" style="padding: 10px; border-radius: 8px; border: 1px solid #dce0e4;" placeholder="API kullanıcı adı">
                        </div>
                        <div>
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">API Şifre</label>
                            <input type="password" id="apiPassword" class="form-control w-100" style="padding: 10px; border-radius: 8px; border: 1px solid #dce0e4;" placeholder="API şifre">
                        </div>
                        <div style="grid-column: 1 / -1;">
                            <label style="display: block; font-weight: 600; margin-bottom: 8px; color: #333;">API Türü</label>
                            <select id="apiType" class="form-control w-100" style="padding: 10px; border-radius: 8px; border: 1px solid #dce0e4;">
                                <option value="isNet">isNet</option>
                                <option value="other">Diğer</option>
                            </select>
                        </div>
                    </div>
                    <div style="margin-top: 30px; text-align: right;">
                        <button class="btn btn-dark-blue p-20" onclick="saveSettings()">Ayarları Kaydet</button>
                    </div>
                </div>

                <!-- CREATE CONTENT (Shortcut added to top buttons, keeping tab here briefly) -->
                <div id="content-create" class="tab-content" style="display: none; text-align: center; padding: 40px;">
                    <a href="e_smm_fatura_olustur.html" class="btn btn-dark-blue p-20" style="font-size: 18px; padding: 20px 40px;">
                        <i class="fa-solid fa-plus"></i> Yeni E-SMM Oluştur Sayfasına Git
                    </a>
                </div>

                <!-- STATUS CONTENT -->
                <div id="content-status" class="tab-content" style="display: none; padding: 40px; text-align: center; color: #777;">
                    <i class="fa-solid fa-satellite-dish" style="font-size: 40px; color: #ccc; margin-bottom: 15px;"></i>
                    <p>Durum sorgulama formu yakında eklenecek.</p>
                </div>
            </div>
        </div>
    </main>

    ${wrapperEndMatch[0].replace('</body>\\n\\n</html>', '')}
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            if(document.getElementById('endDate')) document.getElementById('endDate').value = today.toISOString().split('T')[0];
            if(document.getElementById('startDate')) document.getElementById('startDate').value = thirtyDaysAgo.toISOString().split('T')[0];
            
            // Adjust title
            document.title = "E-SMM Listesi";
            loadSettings();
        });

        // Tab switching logic reused
        function switchTab(tabName) {
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            const selectedContent = document.getElementById('content-' + tabName);
            if (selectedContent) {
                selectedContent.style.display = 'block';
            }
        }
        
        function saveSettings() {
            const settings = {
                serviceUrl: document.getElementById('serviceUrl').value,
                apiUser: document.getElementById('apiUser').value,
                apiPassword: document.getElementById('apiPassword').value,
                apiType: document.getElementById('apiType').value
            };
            localStorage.setItem('esmmSettings', JSON.stringify(settings));
            alert('Ayarlar başarıyla kaydedildi!');
        }

        function loadSettings() {
            const savedSettings = localStorage.getItem('esmmSettings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                if(document.getElementById('serviceUrl')) document.getElementById('serviceUrl').value = settings.serviceUrl || '';
                if(document.getElementById('apiUser')) document.getElementById('apiUser').value = settings.apiUser || '';
                if(document.getElementById('apiPassword')) document.getElementById('apiPassword').value = settings.apiPassword || '';
                if(document.getElementById('apiType')) document.getElementById('apiType').value = settings.apiType || 'isNet';
            }
        }
        
        function filterData() {
            alert('Filtreleme işlemi başlatıldı. Örnek uygulama!');
        }
        function updateRowsPerPage() {}
    </script>
</body>
</html>
`;

newHtml = newHtml.replace(/<title>Satış Yap<\/title>/g, '<title>E-Smm Listesi</title>');
// Side menu active replace
newHtml = newHtml.replace(/<a href="satis_yap\.html" class="active">/, '<a href="satis_yap.html">');
newHtml = newHtml.replace(/<a href="e_smm\.html">/, '<a href="e_smm.html" class="active">');

fs.writeFileSync(path.join(__dirname, 'e_smm.html'), newHtml, 'utf8');
console.log('Successfully fixed e_smm.html');
