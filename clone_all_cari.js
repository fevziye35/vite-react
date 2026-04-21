const fs = require('fs');
const path = require('path');

const satisHtml = fs.readFileSync(path.join(__dirname, 'satis_yap.html'), 'utf8');

const pagesToUpdate = [
    {
        file: 'satis_irsaliye.html',
        title: 'Satış İrsaliyesi',
        pageTitle: 'Satış İrsaliyesi',
        sectionHeader: 'İrsaliye Yapılacak Cari Seçimi',
        targetUrl: 'satis_irsaliye_detay.html?cari_id='
    },
    {
        file: 'alis_irsaliye.html',
        title: 'Alış İrsaliyesi',
        pageTitle: 'Alış İrsaliyesi',
        sectionHeader: 'Alış İrsaliyesi İçin Cari Seçimi',
        targetUrl: 'alis_irsaliye_detay.html?cari_id='
    },
    {
        file: 'alis_iade.html',
        title: 'Alış İadesi',
        pageTitle: 'Alış İadesi',
        sectionHeader: 'İade Yapılacak Cari Seçimi',
        targetUrl: 'alis_iade_detay.html?cari_id='
    },
    {
        file: 'e_mustahsil.html',
        title: 'E-Müstahsil',
        pageTitle: 'E-Müstahsil Makbuzu',
        sectionHeader: 'E-Müstahsil İçin Cari Seçimi',
        targetUrl: 'e_mustahsil_yeni.html?cari_id='
    }
];

pagesToUpdate.forEach(page => {
    let newHtml = satisHtml;

    // Replace Title
    newHtml = newHtml.replace(/<title>.*?<\/title>/g, `<title>${page.title}</title>`);
    newHtml = newHtml.replace(/<h2 class="page-title">.*?<\/h2>/g, `<h2 class="page-title">${page.pageTitle}</h2>`);

    // Replace Add New button to generic new_account.html
    newHtml = newHtml.replace(/href="satis_yeni\.html"/g, 'href="new_account.html"');

    // Replace Section Header
    newHtml = newHtml.replace(/Satış Yapılacak Cari Seçimi/g, page.sectionHeader);

    // Provide unique JS function names based on the file to avoid confusion
    const prefix = page.file.replace('.html', '').replace(/_/g, '');
    newHtml = newHtml.replace(/salesSearchInput/g, `${prefix}SearchInput`);
    newHtml = newHtml.replace(/salesCustomerTable/g, `${prefix}CustomerTable`);
    newHtml = newHtml.replace(/loadSalesCustomers/g, `load${prefix}Customers`);
    newHtml = newHtml.replace(/selectCustomerForSale/g, `select${prefix}Customer`);

    // Override the redirection point inside the script
    newHtml = newHtml.replace(/satis_faturasi\.html\?cari_id=/g, page.targetUrl);

    // Turn off active menu selection if any
    newHtml = newHtml.replace(/class="active">(.*?)(Satış\s*Yap)/, '>$1$2');

    fs.writeFileSync(path.join(__dirname, page.file), newHtml, 'utf8');
    console.log(`Successfully updated ${page.file}`);
});
