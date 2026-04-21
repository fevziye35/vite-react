const fs = require('fs');
const path = require('path');

let js = fs.readFileSync(path.join(__dirname, 'translations.js'), 'utf8');

const tAdditions = {
    'en': `        'mega.babs_raporu': 'BA/BS Report',
        'report.rapor_filtresi': 'Report Filter',
        'report.yil_seciniz': 'Select Year',
        'report.ay_seciniz': 'Select Month',
        'report.tur_seciniz': 'Select type to list',
        'report.ba_form': 'BA Notification Reconciliation Form',
        'report.bs_form': 'BS Notification Reconciliation Form',
        'report.babs_both': 'BA and BS Notification Form',
        'month.1': 'January', 'month.2': 'February', 'month.3': 'March', 'month.4': 'April',
        'month.5': 'May', 'month.6': 'June', 'month.7': 'July', 'month.8': 'August',
        'month.9': 'September', 'month.10': 'October', 'month.11': 'November', 'month.12': 'December',`,
        
    'de': `        'mega.babs_raporu': 'BA/BS Bericht',
        'report.rapor_filtresi': 'Berichtsfilter',
        'report.yil_seciniz': 'Jahr auswählen',
        'report.ay_seciniz': 'Monat auswählen',
        'report.tur_seciniz': 'Listenart auswählen',
        'report.ba_form': 'BA Benachrichtigungsabstimmungsformular',
        'report.bs_form': 'BS Benachrichtigungsabstimmungsformular',
        'report.babs_both': 'BA und BS Benachrichtigungsformular',
        'month.1': 'Januar', 'month.2': 'Februar', 'month.3': 'März', 'month.4': 'April',
        'month.5': 'Mai', 'month.6': 'Juni', 'month.7': 'Juli', 'month.8': 'August',
        'month.9': 'September', 'month.10': 'Oktober', 'month.11': 'November', 'month.12': 'Dezember',`,
        
    'ru': `        'mega.babs_raporu': 'Отчет BA/BS',
        'report.rapor_filtresi': 'Фильтр отчета',
        'report.yil_seciniz': 'Выберите год',
        'report.ay_seciniz': 'Выберите месяц',
        'report.tur_seciniz': 'Выберите тип списка',
        'report.ba_form': 'Форма согласования у BA',
        'report.bs_form': 'Форма согласования формы BS',
        'report.babs_both': 'Форма уведомлений BA и BS',
        'month.1': 'январь', 'month.2': 'февраль', 'month.3': 'март', 'month.4': 'апрель',
        'month.5': 'май', 'month.6': 'июнь', 'month.7': 'июль', 'month.8': 'август',
        'month.9': 'сентябрь', 'month.10': 'октябрь', 'month.11': 'ноябрь', 'month.12': 'декабрь',`,
        
    'zh': `        'mega.babs_raporu': 'BA/BS 报告',
        'report.rapor_filtresi': '报告过滤',
        'report.yil_seciniz': '选择年份',
        'report.ay_seciniz': '选择月份',
        'report.tur_seciniz': '选择要列出的类型',
        'report.ba_form': 'BA 通知核对表',
        'report.bs_form': 'BS 通知核对表',
        'report.babs_both': 'BA 和 BS 通知表',
        'month.1': '一月', 'month.2': '二月', 'month.3': '三月', 'month.4': '四月',
        'month.5': '五月', 'month.6': '六月', 'month.7': '七月', 'month.8': '八月',
        'month.9': '九月', 'month.10': '十月', 'month.11': '十一月', 'month.12': '十二月',`
};

for (const [lang, extra] of Object.entries(tAdditions)) {
    // Only add if missing to avoid duplicate mass inserts
    if (!js.includes(extra.substring(0, 50))) { // Just check English start inside that block implicitly or just force it via safe replace
        const rx = new RegExp("('" + lang + "'\\s*:\\s*\\{)");
        js = js.replace(rx, "$1\n" + extra);
    }
}

// Ensure TR has mega.babs_raporu
if (!js.includes("'mega.babs_raporu': 'BA/BS Raporu'")) {
    js = js.replace(/('tr'\s*:\s*\{)/, "$1\n        'mega.babs_raporu': 'BA/BS Raporu',");
}

fs.writeFileSync(path.join(__dirname, 'translations.js'), js, 'utf8');

// Also update HTML version
let html = fs.readFileSync(path.join(__dirname, 'babs_raporu.html'), 'utf8');
html = html.replace(/translations\.js\?v=\d+/g, 'translations.js?v=49');
fs.writeFileSync(path.join(__dirname, 'babs_raporu.html'), html, 'utf8');

console.log("Fixed broken mass translation loop for babs_raporu");
