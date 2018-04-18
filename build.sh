version=1.0.0
rm -rf ./nodejs/apk
electron-packager ./nodejs ScorpioAndroidTool --platform=darwin --overwrite --out ./bin --arch=all --version=$version