set version=1.0.0
rd /s /Q .\nodejs\apk
electron-packager ./nodejs ScorpioAndroidTool --platform=win32 --overwrite --out ./bin --arch=all --version=%version%
PAUSE