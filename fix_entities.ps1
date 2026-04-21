$mappings = @{
    'Ü' = '&Uuml;';
    'ü' = '&uuml;';
    'Ş' = '&#350;';
    'ş' = '&#351;';
    'İ' = '&#304;';
    'ı' = '&#305;';
    'Ö' = '&Ouml;';
    'ö' = '&ouml;';
    'Ç' = '&Ccedil;';
    'ç' = '&ccedil;';
    'Ğ' = '&#286;';
    'ğ' = '&#287;';
    '₺' = '&#8378;'
}

$files = Get-ChildItem -Filter *.html -Recurse

foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)..."
    $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    foreach ($key in $mappings.Keys) {
        $content = $content.Replace($key, $mappings[$key])
    }
    [System.IO.File]::WriteAllText($file.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
}
