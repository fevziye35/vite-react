document.addEventListener('DOMContentLoaded', function () {
    const localeMap = { 'tr': 'tr-TR', 'en': 'en-US', 'de': 'de-DE', 'ru': 'ru-RU', 'zh': 'zh-CN' };
    const getLocale = () => {
        const lang = localStorage.getItem('language') || 'en';
        return localeMap[lang] || 'en-US';
    };

    // Shared Chart Options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1f2937',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 4,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'TRY' }).format(context.raw);
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6', drawBorder: false },
                ticks: { font: { size: 11 }, color: '#9ca3af' }
            },
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { font: { size: 11 }, color: '#9ca3af' }
            }
        }
    };

    // --- DATA FETCHING & AGGREGATION ---
    function getLocalizedMonths() {
        const lang = localStorage.getItem('language') || 'en';
        switch (lang) {
            case 'en': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            case 'de': return ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
            case 'ru': return ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
            case 'zh': return ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
            default: return ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
        }
    }
    const months = getLocalizedMonths();
    const currentYear = new Date().getFullYear();

    // Helper: Parse Turkish Currency String to Number
    function parseAmount(value) {
        if (typeof value === 'number') return value;
        if (!value) return 0;
        let clean = value.replace(/[₺\s]/g, '');
        clean = clean.replace(/\./g, '').replace(',', '.');
        return parseFloat(clean) || 0;
    }

    function getMonthlyData(sourceData, dateKey, amountKey, filterFn = () => true) {
        const monthlyTotals = new Array(12).fill(0);
        sourceData.forEach(item => {
            if (!item[dateKey]) return;
            const date = new Date(item[dateKey]);
            if (date.getFullYear() === currentYear && filterFn(item)) {
                let amount = 0;
                if (typeof amountKey === 'function') {
                    amount = amountKey(item);
                } else {
                    amount = item[amountKey];
                }
                monthlyTotals[date.getMonth()] += parseAmount(amount);
            }
        });
        return monthlyTotals;
    }

    // 1. Sales Data
    const salesInvoices = JSON.parse(localStorage.getItem('salesInvoices')) || [];
    const salesData = getMonthlyData(salesInvoices, 'issueDate', 'total');

    // 2. Purchase Data
    const purchaseInvoices = JSON.parse(localStorage.getItem('purchaseInvoices')) || [];
    const purchaseData = getMonthlyData(purchaseInvoices, 'issueDate', (item) => item.totals ? item.totals.grandTotal : (item.total || 0));

    // 3. Transactions 
    const transactions = JSON.parse(localStorage.getItem('cashRegisterTransactions')) || [];
    const collectionData = getMonthlyData(transactions, 'date', 'amount', t => t.type === 'GİRİŞ');
    const paymentData = getMonthlyData(transactions, 'date', 'amount', t => ['ÇIKIŞ', 'BANKAYA VİRMAN', 'KASADAN KASAYA VİRMAN'].includes(t.type));

    // --- CHART RENDERING ---
    function renderChart(id, label, data, color, type = 'bar', fill = false) {
        const ctx = document.getElementById(id);
        if (!ctx) return;

        new Chart(ctx.getContext('2d'), {
            type: type,
            data: {
                labels: months,
                datasets: [{
                    label: label,
                    data: data,
                    backgroundColor: type === 'line' && fill ? `${color}1A` : color,
                    borderColor: color,
                    borderWidth: type === 'line' ? 2 : 0,
                    borderRadius: 4,
                    barThickness: 15,
                    tension: 0.4,
                    fill: fill,
                    pointRadius: type === 'line' ? 3 : 0,
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: commonOptions
        });
    }

    const localize = (key, fallback) => {
        const lang = localStorage.getItem('language') || 'en';
        try {
            if (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) {
                return translations[lang][key];
            }
        } catch (e) {}
        return fallback;
    };
    window._dashLocalize = localize;

    renderChart('salesChart', localize('report.satis', 'Sales'), salesData, '#3b82f6', 'bar'); 
    renderChart('purchaseChart', localize('dashboard.purchase', 'Purchase'), purchaseData, '#3b82f6', 'bar'); 
    renderChart('collectionChart', localize('word.tahsilat', 'Collection'), collectionData, '#3b82f6', 'line', false); 
    renderChart('paymentChart', localize('word.odeme', 'Payment'), paymentData, '#3b82f6', 'line', false); 

    // --- BANK BALANCES CHART ---
    window.renderBankBalancesChart = function renderBankBalancesChart() {
        const ctx = document.getElementById('bankBalancesChart');
        if (!ctx) return;
        const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts')) || [];
        const labels = [];
        const balances = [];
        const colors = [];

        if (bankAccounts.length === 0) {
            labels.push(localize('word.varsayilan_banka', 'Default Bank'));
            balances.push(0);
            colors.push('#3b82f6');
        } else {
            bankAccounts.forEach(account => {
                const label = account.bankName || localize('word.banka_isim', 'Bank');
                const balance = parseAmount(account.balance || 0);
                labels.push(label);
                balances.push(balance);
                colors.push(balance >= 0 ? '#10b981' : '#ef4444');
            });
        }

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: localize('dashboard.balance', 'Balance'),
                    data: balances,
                    backgroundColor: colors,
                    borderRadius: 4,
                    barThickness: 30
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 10,
                        cornerRadius: 4,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'TRY' }).format(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: '#f3f4f6', drawBorder: false },
                        ticks: {
                            font: { size: 11 },
                            color: '#9ca3af',
                            callback: function (value) {
                                return new Intl.NumberFormat(getLocale(), {
                                    style: 'currency',
                                    currency: 'TRY',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    },
                    y: {
                        grid: { display: false, drawBorder: false },
                        ticks: { font: { size: 11 }, color: '#9ca3af' }
                    }
                }
            }
        });
    }

    // --- CASH BALANCES CHART ---
    window.renderCashBalancesChart = function renderCashBalancesChart() {
        const ctx = document.getElementById('cashBalancesChart');
        if (!ctx) return;
        const cashRegisters = JSON.parse(localStorage.getItem('cashRegisters')) || [];
        const labels = [];
        const balances = [];
        const colors = [];

        if (cashRegisters.length === 0) {
            labels.push(localize('word.merkez_kasa', 'Main Cash Register'));
            balances.push(0);
            colors.push('#3b82f6');
        } else {
            cashRegisters.forEach(register => {
                const label = register.name || localize('word.kasa_isim', 'Register');
                const balance = parseAmount(register.balance || 0);
                labels.push(label);
                balances.push(balance);
                colors.push(balance >= 0 ? '#10b981' : '#ef4444');
            });
        }

        new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: localize('dashboard.balance', 'Balance'),
                    data: balances,
                    backgroundColor: colors,
                    borderRadius: 4,
                    barThickness: 30
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1f2937',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 10,
                        cornerRadius: 4,
                        displayColors: false,
                        callbacks: {
                            label: function (context) {
                                return new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'TRY' }).format(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: { color: '#f3f4f6', drawBorder: false },
                        ticks: {
                            font: { size: 11 },
                            color: '#9ca3af',
                            callback: function (value) {
                                return new Intl.NumberFormat(getLocale(), {
                                    style: 'currency',
                                    currency: 'TRY',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    },
                    y: {
                        grid: { display: false, drawBorder: false },
                        ticks: { font: { size: 11 }, color: '#9ca3af' }
                    }
                }
            }
        });
    }

    // --- POPULATE TABLES ---
    window.populateBankBalancesTable = function populateBankBalancesTable() {
        const tbody = document.getElementById('bankBalancesTableBody');
        if (!tbody) return;
        const bankAccounts = JSON.parse(localStorage.getItem('bankAccounts')) || [];
        tbody.innerHTML = '';
        if (bankAccounts.length === 0) {
            tbody.innerHTML = `<tr><td>${localize('word.varsayilan_banka', 'Default Bank')} - -</td><td>-</td><td class="amount-green">0,00 ₺</td></tr>`;
        } else {
            bankAccounts.forEach(account => {
                const row = document.createElement('tr');
                const balanceFormatted = new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'TRY' }).format(parseAmount(account.balance || 0));
                row.innerHTML = `<td>${account.bankName} - ${account.branch || '-'}</td><td>${account.accountNumber || '-'}</td><td class="${parseAmount(account.balance) >= 0 ? 'amount-green' : 'amount-red'}">${balanceFormatted}</td>`;
                tbody.appendChild(row);
            });
        }
    }

    window.populateCashBalancesTable = function populateCashBalancesTable() {
        const tbody = document.getElementById('cashBalancesTableBody');
        if (!tbody) return;
        const cashRegisters = JSON.parse(localStorage.getItem('cashRegisters')) || [];
        tbody.innerHTML = '';
        if (cashRegisters.length === 0) {
            tbody.innerHTML = `<tr><td>${localize('word.merkez_kasa', 'Main Cash Register')}</td><td class="amount-green">0,00 ₺</td></tr>`;
        } else {
            cashRegisters.forEach(register => {
                const row = document.createElement('tr');
                const balanceFormatted = new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'TRY' }).format(parseAmount(register.balance || 0));
                row.innerHTML = `<td>${register.name || 'Register'}</td><td class="${parseAmount(register.balance) >= 0 ? 'amount-green' : 'amount-red'}">${balanceFormatted}</td>`;
                tbody.appendChild(row);
            });
        }
    }

    // --- DASHBOARD SUMMARY STATS ---
    function calculateDashboardStats() {
        const salesInvoices = JSON.parse(localStorage.getItem('salesInvoices')) || [];
        const purchaseInvoices = JSON.parse(localStorage.getItem('purchaseInvoices')) || [];
        const transactions = JSON.parse(localStorage.getItem('cashRegisterTransactions')) || [];
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        let totalSales30 = 0, totalPurchase30 = 0, totalSalesVat30 = 0, totalCustoms30 = 0, totalLogistics30 = 0;
        const isValidDate = (d) => d instanceof Date && !isNaN(d);

        salesInvoices.forEach(inv => {
            const d = new Date(inv.issueDate);
            if (isValidDate(d) && d >= thirtyDaysAgo) {
                totalSales30 += parseAmount(inv.total);
                if (inv.items) {
                    inv.items.forEach(item => {
                        const taxBase = (parseAmount(item.price) * parseAmount(item.qty)) - ((parseAmount(item.price) * parseAmount(item.qty)) * (parseAmount(item.discRate) / 100));
                        totalSalesVat30 += taxBase * (parseAmount(item.kdv) / 100);
                    });
                }
            }
        });

        purchaseInvoices.forEach(inv => {
            const d = new Date(inv.issueDate);
            if (isValidDate(d) && d >= thirtyDaysAgo) {
                totalPurchase30 += inv.totals ? parseAmount(inv.totals.grandTotal) : parseAmount(inv.total);
            }
        });

        transactions.forEach(t => {
            const d = new Date(t.date);
            if (isValidDate(d) && d >= thirtyDaysAgo && t.type !== 'GİRİŞ') {
                const desc = (t.desc || '').toLowerCase();
                const amount = parseAmount(t.amount);
                if (desc.includes('gümrük') || desc.includes('customs')) totalCustoms30 += amount;
                else if (desc.includes('lojistik') || desc.includes('logistics') || desc.includes('nakliye') || desc.includes('kargo')) totalLogistics30 += amount;
            }
        });

        const profit30 = totalSales30 - (totalPurchase30 + totalCustoms30 + totalLogistics30);
        const formatCurrency = (val) => new Intl.NumberFormat(getLocale(), { style: 'currency', currency: 'TRY' }).format(val);

        const setVal = (sel, val) => { const el = document.querySelector(sel); if (el) el.textContent = formatCurrency(val); };
        setVal('.kdv-amount', totalSalesVat30);
        setVal('.profit-amount', profit30);
        setVal('.total-sales-amount', totalSales30);
        setVal('.total-purchase-amount', totalPurchase30);
    }

    // Initial Renders
    renderBankBalancesChart();
    renderCashBalancesChart();
    populateBankBalancesTable();
    populateCashBalancesTable();
    calculateDashboardStats();

    // Listeners
    window.addEventListener('storage', (e) => { 
        if (['salesInvoices', 'purchaseInvoices', 'cashRegisterTransactions'].includes(e.key)) calculateDashboardStats(); 
    });
    document.addEventListener('visibilitychange', () => { 
        if (document.visibilityState === 'visible') calculateDashboardStats(); 
    });
    window.addEventListener('languageChanged', () => {
        // Update stats and tables on language change instead of reloading
        calculateDashboardStats();
        populateBankBalancesTable();
        populateCashBalancesTable();
    });
});
