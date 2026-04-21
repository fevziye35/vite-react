$utf8 = New-Object System.Text.UTF8Encoding $false
$enc1254 = [System.Text.Encoding]::GetEncoding(1254)

# Signatures of double encoding
$signatures = @("ÅŸ", "Ä±", "Ä°", "Åž", "Ãœ", "Ã¼", "Ã–", "Ã¶", "Ã‡", "Ã§", "ÄŸ", "Äž")

Get-ChildItem -Path . -Include *.html, *.css, *.js -Recurse | ForEach-Object {
    $file = $_.FullName
    try {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        
        $isMangled = $false
        foreach ($sig in $signatures) {
            if ($content.Contains($sig)) {
                $isMangled = $true
                break
            }
        }
        
        if ($isMangled) {
            $bytes = $enc1254.GetBytes($content)
            $fixed = [System.Text.Encoding]::UTF8.GetString($bytes)
            [System.IO.File]::WriteAllText($file, $fixed, $utf8)
            Write-Host "Fixed mangled file: $($_.Name)"
        }
    } catch {
        Write-Warning "Could not process: $($_.Name)"
    }
}
