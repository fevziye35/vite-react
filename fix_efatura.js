const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'efatura.html');
let html = fs.readFileSync(filePath, 'utf8');

// We want to delete the inline script that forces the redirect
html = html.replace(/<script>\s*\/\/\s*Luca e-invoice system blocks[^<]*<\/script>/, '');

// We want to replace the efatura-container entirely with a modern dashboard
const newContent = `
    <main class="main-content">
        <h2 class="page-title">E-Fatura Merkezi</h2>

        <div class="selection-section">
            <div class="section-header bg-gray-header">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                E-Fatura Sistemi Bağlantısı
            </div>
            <div class="content-box" style="text-align: center; padding: 60px 20px;">
                <h3 style="color: #1f3a60; margin-bottom: 20px; font-size: 24px;">Luca E-Fatura Sistemine Geçiş Yapın</h3>
                <p style="color: #555; margin-bottom: 40px; font-size: 16px; max-width: 600px; margin-left: auto; margin-right: auto;">
                    E-Fatura portalına güvenli bir şekilde bağlanmak için aşağıdaki butona tıklayınız. Sistem sizi doğrudan resmi Luca E-Fatura platformuna yönlendirecektir.
                </p>
                <a href="https://turmobefatura.luca.com.tr/" target="_blank" class="btn btn-dark-blue p-20" style="display: inline-flex; font-size: 18px; padding: 15px 40px; border-radius: 12px; align-items: center; gap: 10px; background: linear-gradient(135deg, #1f3a60 0%, #112240 100%);">
                    <i class="fa-solid fa-arrow-right-to-bracket"></i> Luca E-Fatura'ya Bağlan
                </a>
            </div>
        </div>
    </main>
`;

html = html.replace(/<!-- E-Fatura Container -->[\s\S]*<!-- E-Fatura Container End if any -->/, ''); // just in case
// Usually it ends with </div> right before <script src="translations.js">
html = html.replace(/<!-- E-Fatura Container -->[\s\S]*?(?=<script src="translations\.js">)/, newContent);

// Strip out the custom styles used for the old iframe
html = html.replace(/<style>[\s\S]*?<\/style>/, '');

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully updated efatura.html to be a launchpad instead of a direct redirect.');
