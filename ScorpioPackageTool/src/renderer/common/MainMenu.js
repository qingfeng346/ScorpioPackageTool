const electron = require('electron')
const Menu = electron.remote.Menu;
const app = electron.remote.app;
const dialog = electron.remote.dialog;
const shell = electron.remote.shell;
import { Util } from './Util';
import { console } from './logger';
import { BuildInfo } from './BuildInfo';
import Axios from 'axios';

var FileMenu = {
    label : "文件",
    submenu: [ {
            label : "退出",
            click: function (item, focusedWindow) { app.exit(0) }
        }
    ]
}
var DevMenu = {
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
                if (process.platform === 'darwin') { 
                    return 'Ctrl+Command+F' } 
                else { 
                    return 'F11' 
                }
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow) { focusedWindow.setFullScreen(!focusedWindow.isFullScreen()) }
            }
        },
        {
            label: 'Toggle Developer Tools',
            accelerator: (function () {
                if (process.platform === 'darwin') { 
                    return 'Alt+Command+I' 
                } else { 
                    return 'Ctrl+Shift+I' 
                }
            })(),
            click: function (item, focusedWindow) {
                if (focusedWindow) { focusedWindow.toggleDevTools() }
            }
        }
    ]
}

var HelpMenu = {
    label: '帮助',
    submenu: [
        {
            label: "官网",
            click: function() {
                shell.openExternal("https://github.com/qingfeng346/ScorpioPackageTool")
            }
        },
        { type: 'separator' },
        {
            label: '检测更新...',
            click: function() {
                MainMenu.CheckUpdate(true)
            }
        },
        { type: 'separator' },
        {
            label: '关于',
            click: function (item, focusedWindow) {
                MainMenu.ShowAbout()
            }
        }
    ]
}
class MainMenuClass {
    Init() {
        var templateMenu = []
        templateMenu.push(FileMenu);
        templateMenu.push(DevMenu);
        templateMenu.push(HelpMenu)
        Menu.setApplicationMenu(Menu.buildFromTemplate(templateMenu))
        if (!Util.IsDev) {
            this.CheckUpdate(false)
        }
    }
    async CheckUpdate(hint) {
        try {
            var result = await Axios.get("https://api.github.com/repos/qingfeng346/ScorpioPackageTool/releases/latest")
            if (result.status == 200) {
                var data = result.data
                var version = Util.getVersion()
                if (data.name != version && data.name != "v" + version) {
                    const options = {
                        type: 'info',
                        title: "检测到新版本",
                        message : `当前版本 : v${version}
最新版本 : ${data.name}`,
                        detail: data.body,
                        cancelId : 99,
                        buttons: ['Download']
                    }
                    dialog.showMessageBox(options, function (index) {
                        if (index == 0) {
                            shell.openExternal("https://github.com/qingfeng346/ScorpioPackageTool/releases/latest")
                        }
                    })
                }
                return;
            }
        } catch (e) { 
            console.error(e)
        }
        if (hint) {
            const options = {
                type: 'info',
                title: 'Scorpio Package Tool',
                detail: `当前已经是最新版本`,
                buttons: ['Yes']
            }
            dialog.showMessageBox(options, function (index) {})
        }
    }
    ShowAbout() {
        var version = app.getVersion()
        var arch = process.arch
        var chrome = process.versions.chrome
        var node = process.versions.node
        var ele = process.versions.electron
        var time = BuildInfo.date.toLocaleString()
        const options = {
            type: 'info',
            title: 'Scorpio Package Tool',
            message: 'Scorpio Package Tool',
            detail:
`版本: v${version} 
内核版本: ${chrome} 
Node: ${node} 
Electron: ${ele} 
架构: ${arch}
日期: ${time}`,
            buttons: ['Yes', '反馈']
        }
        dialog.showMessageBox(options, function (index) {
            if (index === 1) {
                shell.openExternal("https://github.com/qingfeng346/ScorpioPackageTool/issues/new")
            }
        })
    }
}
var MainMenu = new MainMenuClass()
export { MainMenu };