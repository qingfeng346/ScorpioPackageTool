'use strict'

process.env.NODE_ENV = 'production'

const packager = require('electron-packager')
const buildConfig = require('./build.config')

build()

async function build () {
  var appPaths = await bundleApp()
  copyTool(appPaths)
}
function bundleApp () {
  return new Promise((resolve, reject) => {
    console.log("   " + buildConfig.dir)
    packager(buildConfig, (err, appPaths) => {
      if (err) {
        console.log(err)
        reject(err)
      } else {
        console.log(`success`)
        resolve(appPaths)
      }
    })
  })
}
function copyTool(appPaths) {
  console.log("===================copyTool : " + appPaths + "   " + typeof appPaths);
}