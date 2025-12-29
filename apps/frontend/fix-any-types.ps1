$ErrorActionPreference = "SilentlyContinue"

$filePaths = @(
    "src\app\requisitions\[id]\page.tsx",
    "src\app\requisitions\[id]\edit\page.tsx",
    "src\app\payments\[id]\page.tsx",
    "src\app\payments\vouchers\[id]\page.tsx",
    "src\app\vouchers\[id]\page.tsx",
    "src\app\checks\[id]\page.tsx"
)

foreach ($filePath in $filePaths) {
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Encoding UTF8
        $updated = $content -replace '\(err: any\)', '(err: unknown)' -replace '\(error: any\)', '(error: unknown)'
        $updated | Set-Content $filePath -Encoding UTF8
        Write-Host "Updated: $filePath"
    } else {
        Write-Host "Not found: $filePath"
    }
}

Write-Host "Done!"
