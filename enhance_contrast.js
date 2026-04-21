const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'styles.css');
let css = fs.readFileSync(filePath, 'utf8');

const contrastFixCSS = `

/* ========================================================= */
/* MEGAPATCH: PERFECT VISIBILITY AND CONTRAST FIXED          */
/* ========================================================= */
/* Make all sidebar text pure white so it stands out against Royal Blue */
.sidebar-menu li a {
    color: #ffffff !important;
    font-weight: 600 !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.sidebar-menu li a i {
    color: #e2e8f0 !important; 
    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3)) !important;
}

/* Submenu text should also be bright */
.sidebar-menu .submenu li a {
    color: #f1f5f9 !important;
    font-weight: 500 !important;
}

/* Logo Enhancement: Make the gold and logo pop against the blue background */
.sidebar-logo a img {
    filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5)) saturate(1.5) contrast(1.15) brightness(1.1) !important;
}

/* Hover effects */
.sidebar-menu li a:hover {
    color: #ffffff !important;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.4) !important;
}

.sidebar-menu li a:hover i {
    color: #ffffff !important;
    filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)) !important;
}
`;

css += contrastFixCSS;
fs.writeFileSync(filePath, css, 'utf8');
console.log('Successfully enhanced text and logo contrast.');
