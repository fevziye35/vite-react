$utf8 = New-Object System.Text.UTF8Encoding $false
$files = Get-ChildItem -Recurse -Include *.html,*.css,*.js

foreach ($f in $files) {
    try {
        $text = [System.IO.File]::ReadAllText($f.FullName, [System.Text.Encoding]::UTF8)
        $orig = $text
        
        # Triple pass for various combinations
        for ($i=0; $i -lt 3; $i++) {
            # Standard single mojibake
            $text = $text.Replace("ÅŸ", "ş").Replace("Ä±", "ı").Replace("Ä°", "İ").Replace("Åž", "Ş")
            $text = $text.Replace("Ãœ", "Ü").Replace("Ã¼", "ü").Replace("Ã–", "Ö").Replace("Ã¶", "ö")
            $text = $text.Replace("Ã‡", "Ç").Replace("Ã§", "ç").Replace("ÄŸ", "ğ").Replace("Äž", "Ğ")
            $text = $text.Replace("â‚º", "₺").Replace("Ã¢", "â").Replace("Ã®", "î")
            
            # Additional double/triple patterns found
            $text = $text.Replace("Ã…Âž", "Ş").Replace("Ã…Å¸", "ş").Replace("ÃƒÅ“", "Ü").Replace("ÃƒÂ¼", "ü")
            $text = $text.Replace("Ã„Â°", "İ").Replace("Ã„Â±", "ı").Replace("Ãƒâ€“", "Ö").Replace("ÃƒÂ¶", "ö")
            $text = $text.Replace("Ã„Å¸", "ğ").Replace("Ã„Å½", "Ğ").Replace("Ãƒâ€‡", "Ç").Replace("ÃƒÂ§", "ç")
            $text = $text.Replace("Ã¢â‚¬Âº", "₺").Replace("ÃƒÂ¢", "â").Replace("ÃƒÂ®", "î")
            $text = $text.Replace("Ãƒâ€°", "É").Replace("Ãƒâ€œ", "Ó")
        }
        
        if ($text -ne $orig) {
            [System.IO.File]::WriteAllText($f.FullName, $text, $utf8)
            Write-Host "Re-Fixed: $($f.FullName)"
        }
    } catch {
        Write-Warning "Failed on $($f.FullName): $($_.Exception.Message)"
    }
}
