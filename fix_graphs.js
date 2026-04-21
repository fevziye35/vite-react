const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'styles.css');
let css = fs.readFileSync(filePath, 'utf8');

const fixCSS = `
/* ========================================================= */
/* MEGAPATCH: FORCE CHARTS AND BALANCES TO BE 2-COLUMNS      */
/* ========================================================= */
/* Apply strict symmetry to BOTH the Charts Grid and Balance Grid */
.dash-charts-grid,
.dash-balance-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 20px !important;
    width: 100% !important;
}

/* Ensure canvas components never force a column break */
.dash-chart-card,
.dash-balance-card {
    min-width: 0 !important;
    width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
}

.dash-chart-card canvas,
.dash-balance-card canvas {
    max-width: 100% !important;
    height: auto !important;
}

/* Mobile fallback */
@media (max-width: 992px) {
    .dash-charts-grid,
    .dash-balance-grid {
        grid-template-columns: 1fr !important;
    }
}
`;

css += '\n' + fixCSS;
fs.writeFileSync(filePath, css, 'utf8');
console.log('Successfully applied strict 2-column layout to all analytical grids.');
