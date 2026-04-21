const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'styles.css');
let css = fs.readFileSync(filePath, 'utf8');

const fixCSS = `

/* ========================================================= */
/* MEGAPATCH: FIX INVISIBLE DASHBOARD MODULES                */
/* ========================================================= */
/* Cards were invisible because opacity was set to 0 waiting for a non-existent keyframe! */
.dash-module-card {
    opacity: 1 !important;
    animation: none !important;
}

@keyframes slideUpBackup {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Add the backup animation if they want it later */
.dash-module-card.animate-in {
    animation: slideUpBackup 0.4s ease-out forwards !important;
}
`;

css += '\n' + fixCSS;
fs.writeFileSync(filePath, css, 'utf8');
console.log('Successfully applied patch to fix invisible modules!');
