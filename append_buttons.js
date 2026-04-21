const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'styles.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

const appendCss = `

/* --- GLOBALLY FORCED PREMIUM BUTTONS MATCHING USER SCREENSHOT --- */
.btn-toolbar, .btn-action-sm, .btn-primary, .btn-teal, .btn-gray, .btn-orange, .btn-secondary, .btn-dark {
    padding: 10px 20px !important;
    color: white !important;
    border-radius: 12px !important;
    font-size: 14.5px !important;
    font-weight: 500 !important;
    border: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 8px !important;
    text-decoration: none !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    background: linear-gradient(to right, #4481eb 0%, #04befe 100%) !important;
    box-shadow: 0 4px 12px -2px rgba(68, 129, 235, 0.35) !important;
}

.btn-toolbar:hover, .btn-action-sm:hover, .btn-primary:hover, .btn-teal:hover, .btn-gray:hover, .btn-orange:hover, .btn-secondary:hover, .btn-dark:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 18px -4px rgba(68, 129, 235, 0.45) !important;
    filter: brightness(1.05) !important;
    color: white !important;
}

/* Specific Semantic Exceptions - but matching the same style */
.btn-toolbar.btn-green, .btn-green, .btn-success {
    background: linear-gradient(to right, #10b981 0%, #34d399 100%) !important;
    box-shadow: 0 4px 12px -2px rgba(16, 185, 129, 0.35) !important;
}
.btn-toolbar.btn-green:hover, .btn-green:hover, .btn-success:hover {
    box-shadow: 0 8px 18px -4px rgba(16, 185, 129, 0.45) !important;
}

.btn-toolbar.btn-danger, .btn-toolbar.delete, .btn-danger, .btn-red {
    background: linear-gradient(to right, #ef4444 0%, #f87171 100%) !important;
    box-shadow: 0 4px 12px -2px rgba(239, 68, 68, 0.35) !important;
}
.btn-toolbar.btn-danger:hover, .btn-toolbar.delete:hover, .btn-danger:hover, .btn-red:hover {
    box-shadow: 0 8px 18px -4px rgba(239, 68, 68, 0.45) !important;
}
`;

// Prevent duplicate appending
if (!cssContent.includes('GLOBALLY FORCED PREMIUM BUTTONS MATCHING USER SCREENSHOT')) {
    fs.writeFileSync(cssPath, cssContent + appendCss, 'utf8');
    console.log('Appended global button overrides to styles.css');
} else {
    console.log('Overrides already exist.');
}
