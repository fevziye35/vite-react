function exportTableToExcel(tableID, filename = 'Excel_Rapor') {
    const table = document.getElementById(tableID);
    if (!table) return;

    // Excel XML formatı (2003) - Türkçe karakterler için UTF-8 desteği ile
    let xmlContent = `<?xml version="1.0" encoding="utf-8"?><?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40">
<Worksheet ss:Name="Sheet1">
<Table>`;

    const rows = table.querySelectorAll('tr');
    rows.forEach(row => {
        xmlContent += '<Row>';
        const cells = row.querySelectorAll('th, td');
        cells.forEach(cell => {
            // İkonları, butonları ve gereksiz boşlukları temizle
            let text = cell.innerText.trim();
            // XML için bazı karakterleri temizle (opsiyonel ama güvenli)
            text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            xmlContent += `<Cell><Data ss:Type="String">${text}</Data></Cell>`;
        });
        xmlContent += '</Row>';
    });

    xmlContent += `</Table></Worksheet></Workbook>`;

    // Blob ve İndirme linki - UTF-8 BOM ekliyoruz
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    // Dosya adını belirle ve .xls uzantısını ekle
    const cleanFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', cleanFilename + ".xls");
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 200);
}

// Otomatik buton yakalayıcı
document.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    // Check for ID exportExcelBtn OR any button containing 'excel' in its class/id or translated text containing 'Excel'
    const containsExcelText = btn.innerText.toLowerCase().includes("excel") || btn.textContent.toLowerCase().includes("excel");
    const hasExcelIdOrClass = (btn.id && btn.id.toLowerCase().includes("excel")) || (btn.className && btn.className.toLowerCase().includes("excel"));
    
    if (containsExcelText || hasExcelIdOrClass) {
        // Sayfadaki ilk tabloyu baz al (genelde ana tablo budur)
        const table = document.querySelector('table');
        if (table) {
            if (!table.id) table.id = 'exportTable_' + Math.floor(Math.random() * 1000);
            let title = document.querySelector('h1, h2, h3')?.innerText || 'Rapor';
            exportTableToExcel(table.id, title);
        }
    }
});
