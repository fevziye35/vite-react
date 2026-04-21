const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'satis_yap.html');
let html = fs.readFileSync(filePath, 'utf8');

// The blurry patcher completely duplicated the footer and script block at the end.
// Let's strip EVERYTHING after the first </html> and clean up the file cleanly.

const endIdx = html.indexOf('</html>');
if (endIdx !== -1) {
    html = html.substring(0, endIdx + 7);
}

// Make absolutely sure it has the cache bust tags
if (html.includes('<script src="translations.js"></script>')) {
    html = html.replace('<script src="translations.js"></script>', '<script src="translations.js?v=4"></script>');
}
if (html.includes('<script src="script.js"></script>')) {
    html = html.replace('<script src="script.js"></script>', '<script src="script.js?v=4"></script>');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('Cleaned up replace_file_content duplication error in satis_yap.html.');
