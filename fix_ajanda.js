const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'ajanda.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Fix the multiline SyntaxError that broke the entire Javascript page
html = html.replace(/alert\("Etkinlik Takvime Eklendi!(\s+)Sistem arka planda '" \+ email \+ "' adresine zamanı geldiğinde mail atmak üzere zamanlayıcıyı kurdu\."\);/, 
`alert("Etkinlik Takvime Eklendi!\\n\\nSistem arka planda '" + email + "' adresine zamanı geldiğinde mail atmak üzere zamanlayıcıyı kurdu.");`);

// 2. Rewrite the UI Layout
const newStyle = `
        <style>
            /* FullCalendar Customizations for Premium Theme */
            .fc-theme-standard th { background: #f8fafc; padding: 15px 0; color: #475569; font-weight: 600; font-family: 'Inter', sans-serif; text-transform: uppercase; font-size: 0.85rem; border-color: #e2e8f0;}
            .fc-daygrid-day-number { color: #1e293b; font-weight: 600; font-family: 'Inter', sans-serif; padding: 8px; }
            .fc .fc-button-primary { background-color: #1f3a60; border-color: #1f3a60; text-transform: capitalize; border-radius: 8px; padding: 8px 16px; font-weight: 500;}
            .fc .fc-button-primary:hover { background-color: #112240; border-color: #112240; }
            .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #112240; }
            .fc-event { border-radius: 6px; border: none; padding: 4px 8px; font-size: 0.85rem; cursor: pointer; font-weight: 500;}
            .event-type-toplanti { background-color: #3b82f6; color: white; }
            .event-type-odeme { background-color: #22c55e; color: white; }
            .event-type-genel { background-color: #f97316; color: white; }
            .fc-theme-standard td, .fc-theme-standard th { border-color: #e2e8f0; }
        </style>
`;

const newUI = `
        <h2 class="page-title">Ajanda ve Planlama</h2>

        <div class="mb-20" style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button onclick="openEventModal()" class="btn btn-dark-blue p-20 mb-10" style="background: linear-gradient(135deg, #1f3a60 0%, #112240 100%); font-size: 15px; border: none; cursor: pointer;">
                <i class="fa-solid fa-plus"></i> Yeni Etkinlik Ekle
            </button>
        </div>

        <div class="selection-section" style="background: white; border-radius: 12px; border: 1px solid #e2e8f0; padding: 25px;">
            <div id='calendar'></div>
        </div>
`;

// Replace the old style block 
html = html.replace(/<style>[\s\S]*?<\/style>/, newStyle);

// Replace the old ajanda-dashboard div
html = html.replace(/<div class="ajanda-dashboard">[\s\S]*?<\/div>\s+<\/div>/, `<div class="ajanda-dashboard" style="margin: 0;">\n            ${newUI}\n        </div>`);

fs.writeFileSync(filePath, html, 'utf8');
console.log('Successfully modernized ajanda.html and fixed JS SyntaxError');
