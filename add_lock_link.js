const fs = require('fs');
const path = require('path');

const directoryPath = __dirname;

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }
    
    files.forEach(function (file) {
        if (path.extname(file) === '.html' && file !== 'kilit_ekrani.html') {
            const filePath = path.join(directoryPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Regex to find the lock icon header item
            const regex = /<div class="header-item[^"]*">\s*<i class="fa-solid fa-lock"><\/i>\s*<\/div>/g;
            const replacement = `<div class="header-item" style="cursor: pointer;" title="Ekranı Kilitle" onclick="window.location.href='kilit_ekrani.html'"><i class="fa-solid fa-lock"></i></div>`;
            
            if (regex.test(content)) {
                content = content.replace(regex, replacement);
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated Lock Icon in: ${file}`);
            }
        }
    });
    console.log("Lock Icon update complete.");
});
