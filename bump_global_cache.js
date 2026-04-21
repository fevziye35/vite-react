const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir);

let updatedCount = 0;

for (const file of files) {
    if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        let changed = false;
        
        // Bump translation cache
        if (/translations\\.js\\?v=\\d+/.test(content) || /translations\\.js/.test(content)) {
            content = content.replace(/translations\\.js(\\?v=\\d+)?/g, 'translations.js?v=300');
            changed = true;
        }

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            updatedCount++;
        }
    }
}

console.log(`Globally bumped translation cache in ${updatedCount} HTML files.`);
