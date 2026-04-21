$utf8 = New-Object System.Text.UTF8Encoding $false
$repls = @(
    @([char]0x00C5 + [char]0x0178, "ş"),
    @([char]0x00C4 + [char]0x00B1, "ı"),
    @([char]0x00C4 + [char]0x00B0, "İ"),
    @([char]0x00C5 + [char]0x009E, "Ş"),
    @([char]0x00C3 + [char]0x009C, "Ü"),
    @([char]0x00C3 + [char]0x00BC, "ü"),
    @([char]0x00C3 + [char]0x0096, "Ö"),
    @([char]0x00C3 + [char]0x00B6, "ö"),
    @([char]0x00C3 + [char]0x0087, "Ç"),
    @([char]0x00C3 + [char]0x00A7, "ç"),
    @([char]0x00C4 + [char]0x009F, "ğ"), # Just guessing common ones if hex was direct
    @([char]0x00C4 + [char]0x009E, "Ğ"),
    @([char]0x00E2 + [char]0x201A + [char]0x00BA, "₺") # â‚º
)

Get-ChildItem -Path . -Include *.html, *.css, *.js -Recurse | ForEach-Object {
    $file = $_.FullName
    try {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        $original = $content
        
        foreach ($r in $repls) {
            $content = $content.Replace($r[0], $r[1])
        }
        
        # Also direct string replaces for safe ones
        $content = $content.Replace('ÅŸ', 'ş').Replace('Ä±', 'ı').Replace('Ä°', 'İ')
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file, $content, $utf8)
            Write-Host "Fixed: $($_.Name)"
        }
    } catch {
        Write-Warning "Failed: $($_.Name)"
    }
}
