const fs = require('fs');
const path = require('path');

let js = fs.readFileSync(path.join(__dirname, 'translations.js'), 'utf8');

js = js.replace("'en': {\\n        'mega.add_stock_card'", "'en': {\\n        'mega.add_stock_card'");
js = js.replace("'de': {\\n        'mega.add_stock_card'", "'de': {\\n        'mega.add_stock_card'");
js = js.replace("'ru': {\\n        'mega.add_stock_card'", "'ru': {\\n        'mega.add_stock_card'");
js = js.replace("'zh': {\\n        'mega.add_stock_card'", "'zh': {\\n        'mega.add_stock_card'");

// Wait, the strings in my powershell output are:
// 'en': {\n        'mega.add_stock_card': 'Add Stock Card',
// This clearly means there is a backslash `\` followed by `n` in the file.
js = js.split("'en': {\\n        'mega.add_stock_card'").join("'en': {\\n        'mega.add_stock_card'");
js = js.split("'de': {\\n        'mega.add_stock_card'").join("'de': {\\n        'mega.add_stock_card'");
js = js.split("'ru': {\\n        'mega.add_stock_card'").join("'ru': {\\n        'mega.add_stock_card'");
js = js.split("'zh': {\\n        'mega.add_stock_card'").join("'zh': {\\n        'mega.add_stock_card'");

// Write back with perfect utf8
fs.writeFileSync(path.join(__dirname, 'translations.js'), js, 'utf8');
console.log("Syntax fixed");
