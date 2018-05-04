const path = require('path')

/**
 * `electron-packager` options
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
 */
module.exports = {
  arch: 'all',
  asar: true,
  dir: path.join(__dirname, '../'),
  icon: path.join(__dirname, '../build/icons/icon'),
  ignore: /(^\/(src|test|tools|\.[a-z]+|README|yarn|static|dist\/web))|\.gitkeep/,
  out: path.join(__dirname, '../build'),
  overwrite: true,
  appVersion: "1.0.0",                          //版本号
  executableName: "ScorpioPackageTool",         //可执行文件名称
  /* platform: process.env.BUILD_TARGET || 'all', */
  platform: process.platform === 'darwin' ? "darwin" : "win32",
}
