const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'styles.css');
let css = fs.readFileSync(filePath, 'utf8');

const gridFixCSS = `

/* ========================================================= */
/* MEGAPATCH: PERFECT DASHBOARD GRID (4 COLUMNS)             */
/* ========================================================= */
/* Force 4 equal columns on desktop. Prevents the ugly 3+1 wrapping. */
.dash-stats-row {
    display: grid !important;
    grid-template-columns: repeat(4, 1fr) !important;
    gap: 20px !important;
    width: 100% !important;
}

/* On medium screens, fall back to a perfect symmetrical 2x2 grid */
@media (max-width: 1400px) {
    .dash-stats-row {
        grid-template-columns: repeat(2, 1fr) !important;
    }
}

/* On mobile, standard stack */
@media (max-width: 768px) {
    .dash-stats-row {
        grid-template-columns: 1fr !important;
    }
}

/* Ensure the wrapper completely extends */
.content-box {
    width: 100% !important;
    box-sizing: border-box !important;
}
.selection-section {
    width: 100% !important;
    box-sizing: border-box !important;
}
`;

css += '\n' + gridFixCSS;
fs.writeFileSync(filePath, css, 'utf8');
console.log('Successfully applied grid structural constraints to dash-stats-row.');
