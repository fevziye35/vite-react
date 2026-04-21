const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'gelir_gider.html');
let html = fs.readFileSync(filePath, 'utf8');

// Replace everything inside the <div class="main-content"> ... up to <div class="modal-overlay"
// The old block starts with <div class="card-box">
const newContent = `
        <h2 class="page-title">Gelir-Gider</h2>

        <div class="mb-20" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="window.location.href='gelir_gider_ekle.html'" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #1f3a60 0%, #112240 100%); font-size: 15px; border: none; cursor: pointer;">
                <i class="fa-solid fa-plus"></i> Gelir-Gider Ekle
            </button>
            <div class="dropdown">
                <button class="btn btn-dark-blue p-20 mb-10" onclick="toggleReportsDropdown()" style="background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%); border: none; font-size: 15px; cursor: pointer;">
                    <i class="fa-solid fa-copy"></i> Raporlar <i class="fa-solid fa-caret-down"></i>
                </button>
                <div class="dropdown-content" id="reportsDropdown">
                    <a href="#" onclick="generateReport('daily'); return false;"><i class="fa-solid fa-calendar-day"></i> Günlük</a>
                    <a href="#" onclick="generateReport('monthly'); return false;"><i class="fa-solid fa-calendar-alt"></i> Aylık</a>
                    <a href="#" onclick="generateReport('yearly'); return false;"><i class="fa-solid fa-calendar"></i> Yıllık</a>
                </div>
            </div>
        </div>

        <div class="selection-section">
            <div class="section-header bg-gray-header">
                <i class="fa-solid fa-list"></i> Gelir-Gider Listesi
            </div>
            
            <div class="content-box">
                <div class="filter-row" style="display: flex; gap: 20px; align-items: center; background-color: #f7f9fa; padding: 15px; border-radius: 8px; border: 1px solid #ebf0f4; margin-bottom: 20px; flex-wrap: wrap;">
                    
                    <div style="display: flex; align-items: center; gap: 10px;" id="filterButtonsWrapper">
                        <button class="btn btn-dark-blue" onclick="filterByType('all')" id="filterAll" style="padding: 10px 20px; border-radius: 8px; border: none; font-size: 14px; cursor: pointer;">
                            <i class="fa-solid fa-list"></i> Tümünü Göster
                        </button>
                        <button class="btn" onclick="filterByType('income')" id="filterIncome" style="background-color: white; border: 1px solid #dce0e4; color: #555; padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 14px; cursor: pointer;">
                            <i class="fa-solid fa-arrow-trend-up" style="color: #28a745;"></i> Sadece Gelirler
                        </button>
                        <button class="btn" onclick="filterByType('expense')" id="filterExpense" style="background-color: white; border: 1px solid #dce0e4; color: #555; padding: 10px 20px; border-radius: 8px; font-weight: 500; font-size: 14px; cursor: pointer;">
                            <i class="fa-solid fa-arrow-trend-down" style="color: #dc3545;"></i> Sadece Giderler
                        </button>
                    </div>

                    <div style="margin-left: auto; display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <label style="font-size: 13px; font-weight: bold; color: #555;">Sayfada Gösterilecek:</label>
                            <select id="rowsPerPage" onchange="updateRowsPerPage()" class="form-control" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px; height: 40px; min-width: 80px;">
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div style="position: relative;">
                            <input type="text" id="searchInput" placeholder="Ara..." onkeyup="searchTable()" class="form-control" style="border-radius: 8px; border: 1px solid #dce0e4; padding: 8px 12px 8px 35px; height: 40px; width: 220px;">
                            <i class="fa-solid fa-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #888;"></i>
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <table id="gelirGiderTable" class="customer-table w-100">
                        <thead>
                            <tr class="bg-gray-header">
                                <th class="p-15" style="border-radius: 8px 0 0 0;">Tip</th>
                                <th>Ad</th>
                                <th>Kod</th>
                                <th>Açıklama</th>
                                <th>No</th>
                                <th>Tutar</th>
                                <th>Şube</th>
                                <th>Düzenle/Sil</th>
                                <th style="border-radius: 0 8px 0 0;">Detay</th>
                            </tr>
                        </thead>
                        <tbody id="gelirGiderTableBody">
                            <!-- Dynamic content will be loaded here -->
                        </tbody>
                    </table>
                </div>

                <div class="footer-info" id="footerInfoText" style="margin-top: 15px; color: #666; font-size: 13px;">
                    <div>Toplam <span style="color: #1f3a60; font-weight: bold;">0</span> kayıt gösteriliyor.</div>
                </div>
            </div>
`;

// Also, the old JS has a filterByType function that manually changes the old class 'active'
// For the new styled buttons, we can just edit the script so it dynamically applies the style!
let jsFix = `
            // Update active button styling
            const filterAllBtn = document.getElementById('filterAll');
            const filterIncomeBtn = document.getElementById('filterIncome');
            const filterExpenseBtn = document.getElementById('filterExpense');
            
            // Common reset
            [filterAllBtn, filterIncomeBtn, filterExpenseBtn].forEach(btn => {
                if(btn) {
                    btn.className = 'btn';
                    btn.style.backgroundColor = 'white';
                    btn.style.color = '#555';
                    btn.style.border = '1px solid #dce0e4';
                }
            });

            if (type === 'all' && filterAllBtn) {
                filterAllBtn.className = 'btn btn-dark-blue';
                filterAllBtn.style.backgroundColor = '';
                filterAllBtn.style.color = '';
                filterAllBtn.style.border = 'none';
            } else if (type === 'income' && filterIncomeBtn) {
                filterIncomeBtn.className = 'btn btn-dark-blue';
                filterIncomeBtn.style.background = 'linear-gradient(135deg, #155724 0%, #0d3616 100%)';
                filterIncomeBtn.style.color = 'white';
                filterIncomeBtn.style.border = 'none';
            } else if (type === 'expense' && filterExpenseBtn) {
                filterExpenseBtn.className = 'btn btn-dark-blue';
                filterExpenseBtn.style.background = 'linear-gradient(135deg, #721c24 0%, #461116 100%)';
                filterExpenseBtn.style.color = 'white';
                filterExpenseBtn.style.border = 'none';
            }
`;

html = html.replace(/<div class="card-box">[\s\S]*?(?=<\/div>\s*<!-- Modal -->)/, newContent);

// Fix the footCount span styling to use our new #1f3a60 text instead of #e74c3c
html = html.replace(/<span style="color: #e74c3c; font-weight: bold;" > \$\{rowCount\}<\/span >/, '<span style="color: #1f3a60; font-weight: bold;">${rowCount}</span>');
html = html.replace(/< span style = "color: #e74c3c; font-weight: bold;" > \$\{rowCount\}<\/span >/, '<span style="color: #1f3a60; font-weight: bold;">${rowCount}</span>');

// Apply the JS fix
const oldFilterByTypeRegex = /\/\/ Update active button[\s\S]*?(?=\/\/ Filter rows)/;
if (oldFilterByTypeRegex.test(html)) {
    html = html.replace(oldFilterByTypeRegex, jsFix + "\n            // Filter rows\n");
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated gelir_gider.html UI');

