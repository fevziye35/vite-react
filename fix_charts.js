const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'styles.css');
let css = fs.readFileSync(filePath, 'utf8');

const fixChartsCSS = `
/* ========================================================= */
/* MEGAPATCH: FORCE CHARTS TO BE SIDE-BY-SIDE                */
/* ========================================================= */
/* Overrides auto-fit to guarantee 2 charts side-by-side */
.dash-charts-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important; 
    gap: 20px !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

/* Ensure the canvas doesn't overflow and break the 1fr column */
.dash-chart-card {
    min-width: 0 !important;
    width: 100% !important;
    box-sizing: border-box !important;
}

.dash-chart-card canvas {
    max-width: 100% !important;
    height: auto !important;
}

/* On mobile/tablet screens, fall back to stacked */
@media (max-width: 992px) {
    .dash-charts-grid {
        grid-template-columns: 1fr !important;
    }
}
`;

css += '\n' + fixChartsCSS;
fs.writeFileSync(filePath, css, 'utf8');
console.log('Successfully enforced side-by-side chart layout constraints.');
