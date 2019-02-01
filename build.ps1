[int]$os = [System.Environment]::OSVersion.Platform
$isWin = $os -lt 4

Write-Output "if you want change the version, please set the package.json field version"
Remove-Item ./build/* -Force -Recurse
Set-Location ScorpioPackageTool
npm run build:clean
if ($isWin) {
    npm run build:win32
    npm run build:linux
    Compress-Archive ../build/ScorpioPackageTool-win32-ia32 ../build/ScorpioPackageTool-win32-ia32.zip -Force
    Compress-Archive ../build/ScorpioPackageTool-win32-x64 ../build/ScorpioPackageTool-win32-x64.zip -Force
    Compress-Archive ../build/ScorpioPackageTool-linux-ia32 ../build/ScorpioPackageTool-linux-ia32.zip -Force
    Compress-Archive ../build/ScorpioPackageTool-linux-x64 ../build/ScorpioPackageTool-linux-x64.zip -Force
} else {
    npm run build:darwin
    Compress-Archive ../build/ScorpioPackageTool-darwin-x64 ../build/ScorpioPackageTool-darwin-x64.zip -Force
}


Set-Location ..