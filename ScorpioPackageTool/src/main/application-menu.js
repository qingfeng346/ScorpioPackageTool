const electron = require('electron')
const Menu = electron.Menu
const app = electron.app
const dialog = electron.dialog
const nativeImage = electron.nativeImage
const shell = electron.shell

const template = [
  {
    label: '文件',
    submenu: [
      {
        label: '退出',
        click: function (item, focusedWindow) {
          app.exit(0)
        }
      }
    ]
  },
  {
    label: '开发者',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function (item, focusedWindow) {
          if (focusedWindow) { focusedWindow.reload() }
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function () {
          if (process.platform === 'darwin') { return 'Ctrl+Command+F' } else { return 'F11' }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) { focusedWindow.setFullScreen(!focusedWindow.isFullScreen()) }
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function () {
          if (process.platform === 'darwin') { return 'Alt+Command+I' } else { return 'Ctrl+Shift+I' }
        })(),
        click: function (item, focusedWindow) {
          if (focusedWindow) { focusedWindow.toggleDevTools() }
        }
      }
    ]
  },
  {
    label: '帮助',
    submenu: [{
      label: 'Version : v' + app.getVersion(),
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: '关于',
      click: function (item, focusedWindow) {
        var version = app.getVersion()
        var arch = process.arch
        var chrome = process.versions.chrome
        var node = process.versions.node
        var ele = process.versions.electron
        const options = {
          type: 'info',
          icon: nativeImage.createFromPath('~@/assets/icon.png'),
          title: 'Scorpio Package Tool',
          message: 'Scorpio Package Tool',
          detail:
`版本: v${version} 
内核版本: ${chrome} 
Node: ${node} 
Electron: ${ele} 
架构: ${arch}`,
          buttons: ['Yes', '反馈']
        }
        dialog.showMessageBox(options, function (index) {
          if (index === 1) {
            shell.openExternal("https://github.com/qingfeng346/ScorpioPackageTool/issues/new")
          }
        })
      }
    }]
  }
]
Menu.setApplicationMenu(Menu.buildFromTemplate(template))
