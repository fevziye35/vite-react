$path = "index.html"
$content = Get-Content -Path $path -Raw -Encoding UTF8

$replacements = @{
    'Teklif Sipari' = 'Teklif Sipariş'
    'Dviz'          = 'Döviz'
    'Ayarlar'       = 'Ayarları'
    'Banka'         = 'Banka'
    'ek Senet'      = 'Çek Senet'
    'Trke'          = 'Türkçe'
    'Geri Dn'       = 'Geri Dön'
}

foreach ($key in $replacements.Keys) {
    if ($content -match $key) {
        $content = $content.Replace($key, $replacements[$key])
        Write-Host "Fixed: $key -> $($replacements[$key])"
    }
}

Set-Content -Path $path -Value $content -Encoding UTF8 -NoNewline
Write-Host "Encoding fixes applied."
