const fs = require('fs');
const path = require('path');

// Fix dashboard_modern.css
const dashFile = path.join(__dirname, 'dashboard_modern.css');
let dashCss = fs.readFileSync(dashFile, 'utf8');

// The dash-container holds the main interface
dashCss = dashCss.replace(
    /\.dash-container\s*\{\s*max-width:\s*1400px;\s*margin:\s*0\s*auto;/g,
    `.dash-container {
    max-width: none;
    width: 100%;
    margin: 0;`
);
fs.writeFileSync(dashFile, dashCss, 'utf8');

// Fix styles.css (for .card-box, .form-card, .filter-section)
const styleFile = path.join(__dirname, 'styles.css');
let styleCss = fs.readFileSync(styleFile, 'utf8');

// Let's replace the strict 1400px constraint that forces awkward centering
styleCss = styleCss.replace(
    /\/\* Card Box - Centered with Max Width \*\/[\s\S]*?max-width:\s*1400px;/g,
    `/* Card Box - Fluid Width */
.card-box,
.form-card,
.filter-section {
    background: white;
    border-radius: 8px;
    padding: 25px;
    margin: 20px 0;
    max-width: 100%;`
);

// We need to write this back
fs.writeFileSync(styleFile, styleCss, 'utf8');

console.log('Successfully expanded main content width completely.');
