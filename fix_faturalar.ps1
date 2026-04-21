$lines = Get-Content -Path "faturalar.html" -Encoding UTF8
$fixedLines = $lines[100..($lines.Length - 1)]
Set-Content -Path "faturalar.html" -Value $fixedLines -Encoding UTF8
