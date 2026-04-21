$utf8 = New-Object System.Text.UTF8Encoding $false
$mappings = @{
    "ÅŸ" = "ş"
    "Ä±" = "ı"
    "Ä°" = "İ"
    "Åž" = "Ş"
    "Ãœ" = "Ü"
    "Ã¼" = "ü"
    "Ã–" = "Ö"
    "Ã¶" = "ö"
    "Ã‡" = "Ç"
    "Ã§" = "ç"
    "ÄŸ" = "ğ"
    "Äž" = "Ğ"
    "â‚º" = "₺"
    "Ã¢" = "â"
    "Ã®" = "î"
    "Ã" = "u00C0" # Wait, some of these might be ambiguous
}

# Instead of a map, let's use the known inverse logic if possible.
# But since we have already mixed fixed/unfixed files, it's safer to target the patterns.

Get-ChildItem -Path . -Include *.html, *.css, *.js -Recurse | ForEach-Object {
    $file = $_.FullName
    try {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        $original = $content
        
        # Apply replacements
        $content = $content.Replace("ÅŸ", "ş")
        $content = $content.Replace("Ä±", "ı")
        $content = $content.Replace("Ä°", "İ")
        $content = $content.Replace("Åž", "Ş")
        $content = $content.Replace("Ãœ", "Ü")
        $content = $content.Replace("Ã¼", "ü")
        $content = $content.Replace("Ã–", "Ö")
        $content = $content.Replace("Ã¶", "ö")
        $content = $content.Replace("Ã‡", "Ç")
        $content = $content.Replace("Ã§", "ç")
        $content = $content.Replace("ÄŸ", "ğ")
        $content = $content.Replace("Äž", "Ğ")
        $content = $content.Replace("â‚º", "₺")
        $content = $content.Replace("Ã¢", "â")
        $content = $content.Replace("Ã®", "î")
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file, $content, $utf8)
            Write-Host "Fixed: $($_.Name)"
        }
    } catch {
        Write-Warning "Failed: $($_.Name)"
    }
}
