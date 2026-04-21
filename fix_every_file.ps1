$utf8 = New-Object System.Text.UTF8Encoding $false
# List of files to check
$files = Get-ChildItem -Path . -Include *.html, *.css, *.js -Recurse

foreach ($fileItem in $files) {
    $file = $fileItem.FullName
    try {
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)
        $original = $content
        
        # Comprehensive replacement list
        $content = $content.Replace('ÅŸ', 'ş')
        $content = $content.Replace('Ä±', 'ı')
        $content = $content.Replace('Ä°', 'İ')
        $content = $content.Replace('Åž', 'Ş')
        $content = $content.Replace('Ãœ', 'Ü')
        $content = $content.Replace('Ã¼', 'ü')
        $content = $content.Replace('Ã–', 'Ö')
        $content = $content.Replace('Ã¶', 'ö')
        $content = $content.Replace('Ã‡', 'Ç')
        $content = $content.Replace('Ã§', 'ç')
        $content = $content.Replace('ÄŸ', 'ğ')
        $content = $content.Replace('Äž', 'Ğ')
        $content = $content.Replace('â‚º', '₺')
        $content = $content.Replace('Ã¢', 'â')
        $content = $content.Replace('Ã®', 'î')
        $content = $content.Replace('Ã‹', 'Ë')
        $content = $content.Replace('Ã‰', 'É')
        $content = $content.Replace('Ã¨', 'è')
        $content = $content.Replace('ï¿½', '') # Keep this as is for now or use preferred fix
        
        if ($content -ne $original) {
            [System.IO.File]::WriteAllText($file, $content, $utf8)
            Write-Output "Fixed: $($fileItem.Name)"
        }
    } catch {
        Write-Error "Failed to process: $($fileItem.Name)"
    }
}
