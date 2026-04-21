const fs = require('fs');
const path = require('path');

const filesToFix = ['cari_raporu.html', 'kasa_raporu.html', 'taksit_rapor.html', 'toplu_stok_raporu.html'];

filesToFix.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (!fs.existsSync(filePath)) return;

    let html = fs.readFileSync(filePath, 'utf8');

    // 1. Remove custom <style>
    html = html.replace(/<style>[\s\S]*?<\/style>/, '');

    // 2. Remove class="report-page" from body
    html = html.replace(/<body class="report-page">/, '<body>');

    // 3. Move <header class="header"> OUT of <main class="main-content">
    // Current: <main class="main-content">\s*<header class="header">...</header>
    // Target: <header class="header">...</header>\s*<main class="main-content">
    const headerMatch = html.match(/(<header class="header">[\s\S]*?<\/header>)/);
    if (headerMatch) {
        // Delete header from inside main
        html = html.replace(headerMatch[0], '');
        // Insert header right before <main class="main-content">
        html = html.replace(/<main class="main-content">/, `${headerMatch[0]}\n    <main class="main-content">`);
    }

    // 4. Update the section-header from the old style (inline flex pill) to the new bg-gray-header wide block
    // Specifically changing <div class="section-header"> to <div class="section-header bg-gray-header">
    html = html.replace(/<div class="section-header"([^>]*)>/g, '<div class="section-header bg-gray-header">');

    // 5. Turn the button at the bottom to have btn-dark-blue
    html = html.replace(/class="btn"/g, 'class="btn btn-dark-blue p-20"');

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Successfully fixed layout syntax of ${file}`);
});
