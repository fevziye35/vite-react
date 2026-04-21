$utf8 = New-Object System.Text.UTF8Encoding $false
$replacements = @(
    @('ÅŸ', 'ş'),
    @('Ä±', 'ı'),
    @('Ä°', 'İ'),
    @('Åž', 'Ş'),
    @('Ãœ', 'Ü'),
    @('Ã¼', 'ü'),
    @('Ã–', 'Ö'),
    @('Ã¶', 'ö'),
    @('Ã‡', 'Ç'),
    @('Ã§', 'ç'),
    @('ÄŸ', 'ğ'),
    @('Äž', 'Ğ'),
    @('â‚º', '₺')
)

Get-ChildItem -Path . -Include *.html, *.css, *.js -Recurse | ForEach-Object {
    $file = $_.FullName
    try {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        $original = $content
        
        foreach ($r in $replacements) {
            $content = $content.Replace($r[0], $r[1])
        }
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file, $content, $utf8)
            Write-Host "Fixed: $($_.Name)"
        }
    } catch {
        Write-Warning "Failed: $($_.Name)"
    }
}
