<script>
const iconv = require('iconv-lite')
const fs = require('fs')
const os = require('os')
const ipc = require('electron').ipcRenderer
const { spawn, exec } = require('child_process')
const console = require('./logger.js').logger
const { Notification } = require('element-ui')

const AndroidList = {
  '1': 'Android 1.0',
  '2': 'Android 1.1',
  '3': 'Android 1.5',
  '4': 'Android 1.6',
  '5': 'Android 2.0',
  '6': 'Android 2.0.1',
  '7': 'Android 2.1',
  '8': 'Android 2.2',
  '9': 'Android 2.3.1',
  '10': 'Android 2.3.3',
  '11': 'Android 3.0',
  '12': 'Android 3.1',
  '13': 'Android 3.2',
  '14': 'Android 4.0',
  '15': 'Android 4.0.3',
  '16': 'Android 4.1',
  '17': 'Android 4.2',
  '18': 'Android 4.3',
  '19': 'Android 4.4',
  '20': 'Android 4.4W',
  '21': 'Android 5.0',
  '22': 'Android 5.1',
  '23': 'Android 6.0',
  '24': 'Android 7.0',
  '25': 'Android 8.0'
}

String.prototype.startWith = function (str) {
  if (str == null || str == '' || this.length == 0 || str.length > this.length) {
    return false
  }
  return this.substr(0, str.length) == str
}
String.prototype.endWith = function (str) {
  if (str == null || str == '' || this.length == 0 || str.length > this.length) {
    return false
  }
  return this.substring(this.length - str.length) == str
}

IsWindows = (os.platform() === 'win32') // 是否是windows平台
IsMac = (os.platform() === 'darwin') // 是否是mac平台
IsLinux = (os.platform() === 'linux') // 是否是linux平台

var Util = (function () {
  function Util () {
  }
  Util.init = function () {
    this.file = apkPath + 'files.json'
  }
  Util.loadFileList = function () {
    if (!fs.existsSync(this.file)) { return [] }
    return JSON.parse(fs.readFileSync(this.file, 'utf8'))
  }
  Util.saveFileList = function (info) {
    console.log('file : ' + this.file)
    fs.writeFileSync(this.file, JSON.stringify(info))
  }
  Util.getAndroidVersion = function (version) {
    var str = AndroidList[version]
    if (str == undefined) {
      return version
    }
    return str
  }
  Util.copyFile = function (source, target) {
    fs.copyFileSync(source, target)
  }
  Util.mkdir = function (dir) {
    if (!fs.existsSync(dir)) { fs.mkdirSync(dir) }
  }
  Util.readFile = function (file) {
    return new Promise((resolve, reject) => {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }
  Util.execute = function (command, cwd, callback) {
    console.log('执行命令行 : ' + command)
    return exec(command, { cwd: toolsPath + cwd}, callback)
  }
  Util.execCommand = function (command, cwd, args, sh) {
    console.log('command : ' + command)
    if (!IsWindows) {
      this.array_insert(args, 0, command)
      command = 'sh'
    }
    var sp = spawn(command, args, { cwd: toolsPath + cwd })
    sp.stdout.on('data', (data) => {
      console.log(iconv.decode(new Buffer(data), 'GBK'))
    })
    sp.stderr.on('error', (data) => {
      console.log('exec is error : ' + iconv.decode(new Buffer(data), 'GBK'))
    })
    return sp
  }
  Util.parseArg = function (arg) {
    if (arg.indexOf(' ') < 0) {
      return arg
    }
    if (IsWindows) {
      arg = '"' + arg + '"'
    } else {
      arg = arg.replace(/ /g, '\\ ')
    }
    return arg
  }
  Util.array_insert = function (arr, index, item) {
    arr.splice(index, 0, item)
  }
  Util.array_removeat = function (arr, index) {
    arr.splice(index, 1)
  }
  Util.readdir = function (path) {
    return new Promise((resolve, reject) => {
      fs.readdir(path, (err, files) => {
        if (err) {
          reject(err)
        } else {
          resolve(files)
        }
      })
    })
  }
  Util.showMessage = function (title, message) {
    Notification.info({
      title: title,
      message: message
    })
  }
  return Util
}())
exports.Util = Util
var appInfo = ipc.sendSync('get-app-info')
toolsPath = appInfo.path.appPath + '/tools/' // 工具目录
apkPath = appInfo.path.userData + '/apks/'
Util.init()
Util.mkdir(apkPath)
console.log('appInfo = ' + JSON.stringify(appInfo))
</script>