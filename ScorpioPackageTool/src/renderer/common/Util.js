const fs = require("fs")
const os = require("os")
const path = require('path')
const iconv = require("iconv-lite")
const events = require('events')
const open = require('open')
import { BuildInfo } from './BuildInfo'
import { ExecUtil } from './ExecUtil'
import { ipcRenderer } from "electron";
import { Notification } from "element-ui";
import { console } from "./logger";
import { MainMenu } from './MainMenu';
import { AndroidList } from './common'


let ShowOpenDialogCallback = null       //打开文件回调
let ShowMessageBoxCallback = null       //MessageBox回调
class UtilClass {
    //是否是windows平台
    get IsWindows() { return (os.platform() == "win32"); }
    //是否是mac平台
    get IsMac() { return (os.platform() == "darwin"); }
    //是否是linux平台
    get IsLinux() { return (os.platform() == "linux"); }
    //是否是开发环境
    get IsDev() { return process.env.NODE_ENV === 'development'; }
    //获得版本号
    getVersion() { return this.appInfo.version }
    //创建一个目录
    mkdir(p) {
        if (!fs.existsSync(p)) {
            this.mkdir(path.dirname(p))
            fs.mkdirSync(p)
        }
    }
    //删除一个文件
    removeFile(file) {
        return new Promise((resolve, reject) => {
            fs.unlink(file, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    //删除一个目录
    rmdir(dir) {
        return new Promise((resolve, reject) => {
            fs.rmdir(dir, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    //递归删除目录
    async rmdirRecursive(dir) {
        if (fs.existsSync(dir)) {
            let files = fs.readdirSync(dir)
            for (let file of files) {
                let curPath = path.resolve(dir, file)
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    await this.rmdirRecursive(curPath)
                } else {
                    await this.removeFile(curPath)
                }
            }
            await this.rmdir(dir)
        }
    }
    //读取文件列表
    readdir(path) {
        return new Promise((resolve, reject) => {
            fs.readdir(path, (err, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(files);
                }
            })
        });
    }
    //读取文件内容
    readFile(file) {
        return new Promise((resolve, reject) => {
            fs.readFile(file, "utf8", (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    //获得文件列表
    getFileInfos() { return this.fileInfos }
    //数组中插入一个值
    array_insert(arr, index, item) { arr.splice(index, 0, item); }
    //数组中删除一个值
    array_removeat(arr, index) { arr.splice(index, 1); }

    //初始化函数
    init() {
        this.appInfo = ipcRenderer.sendSync('getAppInfo')
        this.dataPath = path.resolve(this.appInfo.path.userData, "./datas")     //数据存放目录
        this.apkPath = path.resolve(this.dataPath, "./apks")                    //apk存放目录
        this.filesName = path.resolve(this.dataPath, "files.json")              //解析文件列表
        console.log("appInfo : " + JSON.stringify(this.appInfo, null, 2))
        console.log("dataPath : " + this.dataPath)
        this.mkdir(this.dataPath)
        this.mkdir(this.apkPath)
        this.activeMenu = ""
        this.event = new events()
        ipcRenderer.on('showOpenDialogResult', this.showOpenDialogResult)
        ipcRenderer.on("showMessageBoxResult", this.showMessageBoxResult)
        this.loadFileInfos()
        this.initDragFiles()
        this.checkJavaEnviroment()
        this.checkAdbEnviroment()
        MainMenu.Init()

    }
    loadFileInfos() {
        if (!fs.existsSync(this.filesName)) {
            this.fileInfos = []
        } else {
            this.fileInfos = JSON.parse(fs.readFileSync(this.filesName, "utf8"))
        }
    }
    saveFileInfos() {
        fs.writeFileSync(this.filesName, JSON.stringify(this.fileInfos, null, 4));
    }
    insertFileInfo(info) {
        for (var i in this.fileInfos) {
            if (this.fileInfos[i]["name"] == info["name"]) {
                this.array_removeat(this.fileInfos, i);
                break;
            }
        }
        this.array_insert(this.fileInfos, 0, info);
        this.saveFileInfos();
        this.event.emit("updateInfos")
    }
    async removeFileInfo(info) {
        if (info == null) { return }
        for (var i in this.fileInfos) {
            if (this.fileInfos[i]["name"] == info["name"]) {
                this.array_removeat(this.fileInfos, i);
                break;
            }
        }
        this.saveFileInfos();
        this.event.emit("updateInfos")
        await this.removeFile(path.resolve(this.apkPath, info.name + ".apk"))
        await this.rmdirRecursive(this.apkPath + "/" + info.name)
    }
    initDragFiles() {
        let _this = this;
        document.ondragstart = (e) => { e.preventDefault(); }
        document.ondragenter = (e) => { e.preventDefault(); }
        document.ondragleave = (e) => { e.preventDefault(); }
        document.ondrag = (e) => { e.preventDefault(); }
        document.ondragover = (e) => { e.preventDefault(); }
        document.ondrop = (e) => {
            e.preventDefault();
            var files = e.dataTransfer.files;
            if (files.length == 0) { return; }
            _this.event.emit("dropFiles", files)
        }
    }
    checkJavaEnviroment() {
        var javaInfo = ExecUtil.getJavaInfo()
        if (javaInfo) {
            this.showSuccess("检测到Java版本:" + javaInfo.version)
        } else {
            this.showMessageBox({
                type : "error",
                title : "警告",
                message : "检测不到系统Java环境,是否立刻下载?",
                buttons : ["No", "Yes"],
            }, (index) => {
                if (index == 1) {
                    open("http://www.oracle.com/technetwork/java/javase/downloads/index.html")
                }
            })
        }
    }
    checkAdbEnviroment() {
        try {
            ExecUtil.executeSync(`adb --version`)
            ExecUtil.useSystemAdb(true)
            this.showSuccess(`检测到系统adb, 将使用系统adb`)
        } catch (e) {
            console.error(e)
            ExecUtil.useSystemAdb(false)
            this.showWarn("检测不到adb环境, 将使用内部adb")
        }
    }
    showSuccess(message) {
        console.log("showSuccess : " + message)
        Notification.success({
            message: message,
            dangerouslyUseHTMLString: true,
            position: 'bottom-left'
        })
    }
    showWarn(message) {
        console.warn("showWarn : " + message)
        Notification.warn({
            message: message,
            dangerouslyUseHTMLString: true,
            position: 'top-right'
        })
    }
    showError(message) {
        console.error("showError : " + message)
        Notification.error({
            message: message,
            dangerouslyUseHTMLString: true,
            position: 'bottom-left'
        })
    }
    //打开文件窗口
    showOpenDialog = function(options, args, callback) {
        ShowOpenDialogCallback = callback
        ipcRenderer.send('showOpenDialog', options, args)
    }
    //打开文件窗口回调
    showOpenDialogResult(event, files, args) {
        var callback = ShowOpenDialogCallback
        ShowOpenDialogCallback = undefined
        if (callback) callback(files, args)
    }
    //显示一个弹出窗口
    showMessageBox(options, callback) {
        ShowMessageBoxCallback = callback
        ipcRenderer.send("showMessageBox", options)
    }
    //弹出窗口回调
    showMessageBoxResult(event, index) {
        var callback = ShowMessageBoxCallback
        ShowMessageBoxCallback = undefined
        if (callback) callback(index)
    }
    //根据版本号获得android系统名字
    getAndroidVersion(version) {
        var str = AndroidList[version];
        if (str == undefined) {
            return version;
        }
        return str;
    }
    //获得 android 设备列表
    async getAndroidDevices() {
        let strDevices = await ExecUtil.executeAdbAsync("devices")
        let lines = strDevices.split("\n")
        let devices = []
        for (var i = 1; i < lines.length; ++i) {
            let line = lines[i].trim()
            if (line == "") { continue; }
            let id = line.substring(0, line.indexOf("device")).trim();
            if (id == "") { continue; }
            let model = await ExecUtil.getAndroidProperty(id, "ro.product.model")
            let androidVersion = await ExecUtil.getAndroidProperty(id, "ro.build.version.sdk")
            devices.push({id : id, model: model, androidVersion: androidVersion.trim()})
        }
        // console.log(JSON.stringify(devices))
        return devices;
    }
    getAppIcon(info) {
        return "file://" + this.apkPath + "/" + info.name + "/source/" + info.icon;
    }
}
var Util = new UtilClass()
Util.init()
export { Util }