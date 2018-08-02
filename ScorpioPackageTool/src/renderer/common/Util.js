const fs = require("fs")
const os = require("os")
const path = require('path')
const iconv = require("iconv-lite")
const events = require('events')
const open = require('open')
import { ipcRenderer } from "electron";
import { spawn, exec, execSync } from "child_process";
import { Message, Notification, MessageBox, Loading } from "element-ui";
import { console } from "./logger";

const AndroidList = {
    "1" : "Android 1.0",
    "2" : "Android 1.1",
    "3" : "Android 1.5",
    "4" : "Android 1.6",
    "5" : "Android 2.0",
    "6" : "Android 2.0.1",
    "7" : "Android 2.1",
    "8" : "Android 2.2",
    "9" : "Android 2.3.1",
    "10" : "Android 2.3.3",
    "11" : "Android 3.0",
    "12" : "Android 3.1",
    "13" : "Android 3.2",
    "14" : "Android 4.0",
    "15" : "Android 4.0.3",
    "16" : "Android 4.1",
    "17" : "Android 4.2",
    "18" : "Android 4.3",
    "19" : "Android 4.4",
    "20" : "Android 4.4W",
    "21" : "Android 5.0",
    "22" : "Android 5.1",
    "23" : "Android 6.0",
    "24" : "Android 7.0",
    "25" : "Android 7.1",
    "26" : "Android 8.0",
    "27" : "Android 8.1",
}
String.prototype.startWith = function(str) {
    if(str == null || str == "" || this.length == 0 || str.length > this.length) {
        return false;
    }
    return this.substr(0, str.length) == str;
}
String.prototype.endWith = function(str) {
    if(str == null || str == "" || this.length == 0 || str.length > this.length) {
        return false;
    }
    return this.substring(this.length - str.length) == str;
}

let ShowOpenDialogCallback = undefined
let ShowMessageBoxCallback = undefined
var Util = (function() {
    function Util() {
    }
    //是否是windows平台
    Util.IsWindows = function() {
        return (os.platform() == "win32");
    }
    //是否是mac平台
    Util.IsMac = function() {
        return (os.platform() == "darwin");
    }
    //是否是linux平台
    Util.IsLinux = function() {
        return (os.platform() == "linux");
    }
    Util.init = function() {
        var appInfo = this.getAppInfo();
        console.log("appInfo = " + JSON.stringify(appInfo, null, 2))
        this.dataPath = path.resolve(appInfo.path.userData, "./datas")     //数据存放目录
        this.apkPath = path.resolve(this.dataPath, "./apks")               //apk存放目录
        this.filesName = path.resolve(this.dataPath, "files.json")         //解析文件列表
        if (process.env.NODE_ENV === 'development') {
            this.toolsPath = path.resolve(appInfo.path.cwd, "./tools")         //工具目录
        } else {
            this.toolsPath = path.resolve(appInfo.path.appPath, "../tools")
        }
        this.buildInfo = this.getBuildInfo()
        console.log("toolsPath : " + this.toolsPath)
        console.log("dataPath : " + this.dataPath)
        console.log("buildInfo : " + JSON.stringify(this.buildInfo))
        this.mkdir(this.dataPath)
        this.mkdir(this.apkPath)
        this.activeMenu = ""
        this.event = new events()
        ipcRenderer.on('showOpenDialogResult', this.showOpenDialogResult)
        ipcRenderer.on("showMessageBoxResult", this.showMessageBoxResult)
        this.loadFileInfos()
        this.initDragFiles()
        this.checkJavaEnviroment()
    }
    Util.initDragFiles = function() {
        document.ondragstart = function(e) {
            e.preventDefault();
            // console.log("ondragstart")
        }
        document.ondragenter = function(e) {
            e.preventDefault();
            // console.log("ondragenter")
            // var loading = Loading.service( { background: "rgba(20,20,20,0.7)", text: "拖拽打开文件"});
        }
        document.ondragleave = function(e) {
            e.preventDefault();
            // window.console.log(e.target)
        }
        document.ondrag = function(e) {
            e.preventDefault();
            // console.log("ondrag")
        }
        document.ondragover = function (e) {
            e.preventDefault();
            // console.log("ondragover")
        };
        document.ondrop = function (e) {
            e.preventDefault();
            var files = e.dataTransfer.files;
            if (files.length == 0) { return; }
            Util.event.emit("dropFiles", files)
        }
    }
    Util.getFileInfos = function() {
        return this.fileInfos
    }
    Util.loadFileInfos = function() {
        if (!fs.existsSync(this.filesName)){ 
            this.fileInfos = []
        } else {
            this.fileInfos = JSON.parse(fs.readFileSync(this.filesName, "utf8"))
        }
    }
    Util.saveFileInfos = function() {
        //console.log("saveFileInfos : " + this.filesName);
        fs.writeFileSync(this.filesName, JSON.stringify(this.fileInfos, null, 4));
    }
    Util.insertFileInfo = function(info) {
        for (var i in this.fileInfos) {
            if (this.fileInfos[i]["name"] == info["name"]) {
                Util.array_removeat(this.fileInfos, i);
                break;
            }
        }
        Util.array_insert(this.fileInfos, 0, info);
        Util.saveFileInfos();
        this.event.emit("updateInfos")
    }
    Util.removeFileInfo = async function(info) {
        if (info == null) { return }
        for (var i in this.fileInfos) {
            if (this.fileInfos[i]["name"] == info["name"]) {
                Util.array_removeat(this.fileInfos, i);
                break;
            }
        }
        Util.saveFileInfos();
        this.event.emit("updateInfos")
        await this.removeFile(path.resolve(this.apkPath, info.name + ".apk"))
        await this.rmdirRecursive(this.apkPath + "/" + info.name)
    }
    Util.getAppIcon = function(info) {
        return "file://" + this.apkPath + "/" + info.name + "/source/" + info.icon;
    }
    Util.getAndroidVersion = function(version) {
        var str = AndroidList[version];
        if (str == undefined) {
            return version;
        }
        return str;
    }
    Util.copyFile = function(source, target) {
        fs.copyFileSync(source, target);
    }
    Util.mkdir = function(dir) {
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
    }
    Util.rmdirRecursive = async function(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir)
            for (var file of files) {
                var curPath = path.resolve(dir, file)
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    await this.rmdirRecursive(curPath)
                } else {
                    await this.removeFile(curPath)
                }
            }
            await this.rmdir(dir)
        }
    }
    Util.removeFile = function(file) {
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
    Util.rmdir = function(dir) {
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
    Util.readFile = function(file) {
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
    Util.executeJar = function(command, cwd, callback) {
        this.execute("java -jar " + command, cwd, callback)
    }
    Util.executeExe = function(command, cwd, callback) {
        if (!this.IsWindows()) { 
            var bat = command.substring(0, command.indexOf(" "))
            this.executeSync(`chmod +x ${bat}`, cwd); 
        }
        this.execute(command, cwd, callback)
    }
    Util.execute = function(command, cwd, callback) {
        console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command);
        return exec(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined}, callback);
    }
    Util.executeSync = function(command, cwd) {
        console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command);
        return execSync(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined});
    }
    Util.executeAsync = function(command, cwd) {
        return new Promise((resolve, reject) => {
            console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command);
            exec(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, maxBuffer : 1024 * 1024 * 8}, (err, stdout, stderr) => {
                if (err) {
                    reject(stderr)
                } else {
                    resolve(stdout)
                }
            });
        });
    }
    Util.executeExeAsync = function(command, cwd) {
        return new Promise((resolve, reject) => {
            if (!this.IsWindows()) { 
                var bat = command.substring(0, command.indexOf(" "))
                this.executeSync(`chmod +x ${bat}`, cwd); 
            }
            console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command);
            exec(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined}, (err, stdout, stderr) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(stdout)
                }
            });
        });
    }
    Util.execCommand = function(command, cwd, args) {
        var strArgs = ""
        for (var arg of args) { strArgs += " " + arg; }
        if (!this.IsWindows()) { this.executeSync(`chmod +x ${command}`, cwd); }
        console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command + strArgs);
        var sp = spawn(command, args, { cwd: path.resolve(this.toolsPath, cwd) });
        sp.stdout.on('data', (data) => {
            console.log(data.toString())
        });
        sp.stderr.on('error', (data) => {
            console.log("exec is error : " + data.toString());
        });
        return sp;
    }
    Util.getString = function(data) {
        return iconv.decode(new Buffer(data), "utf8")
    }
    Util.parseArg = function(arg) {
        if (arg.indexOf(" ") < 0) {
            return arg;
        }
        if (this.IsWindows()) {
            arg = "\"" + arg + "\"";
        } else {
            arg = arg.replace(/ /g, "\\ ");
        }
        return arg;
    }
    Util.array_insert = function(arr, index, item) {
        arr.splice(index, 0, item);
    }
    Util.array_removeat = function(arr, index) {
        arr.splice(index, 1);
    }
    Util.readdir = function(path) {
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
    Util.showMessage = function(title, message) {
        Notification.success({
            title : title,
            message : message
        })
    }
    Util.getAppInfo = function() {
        return ipcRenderer.sendSync('getAppInfo')
    }
    Util.getBuildInfo = function() {
        var file = path.resolve(this.toolsPath, "../info.json")
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file))
        } else {
            return {
                "date" : new Date().getTime()
            }
        }
    }
    Util.showOpenDialog = function(options, args, callback) {
        ShowOpenDialogCallback = callback
        ipcRenderer.send('showOpenDialog', options, args)
    }
    Util.showOpenDialogResult = function(event, files, args) {
        var callback = ShowOpenDialogCallback
        ShowOpenDialogCallback = undefined
        if (callback) callback(files, args)
    }
    Util.showMessageBox = function(options, callback) {
        ShowMessageBoxCallback = callback
        ipcRenderer.send("showMessageBox", options)
    }
    Util.showMessageBoxResult = function(event, index) {
        var callback = ShowMessageBoxCallback
        ShowMessageBoxCallback = undefined
        if (callback) callback(index)
    }
    Util.checkJavaEnviroment = function() {
        var javaInfo = this.getJavaInfo()
        if (javaInfo) {
            Notification.success({
                message: "检测到Java版本:" + javaInfo.version,
                dangerouslyUseHTMLString: true,
                position: 'bottom-left'
            })
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
    Util.getJavaInfo = function() {
        try {
            var version = this.executeSync("java -jar JavaInfo.jar java.version", "JavaInfo");
            var home = this.executeSync("java -jar JavaInfo.jar java.home", "JavaInfo");
            return {"version" : version, "home" : home}
        } catch (e) {
            // console.log("getJavaInfo is error : " + this.getString(e.stderr))
        }
        return undefined
    }
    Util.shellAndroid = async function(id, command) {
        var bat = Util.getAdb()
        return await this.executeAsync(`${bat} -s ${id} shell "${command}"`, "adb")
    }
    Util.adbAndroid = async function(id, command) {
        var bat = Util.getAdb()
        return await this.executeAsync(`${bat} -s ${id} ${command}`, "adb")
    }
    Util.getAndroidProp = async function(id, key) {
        var str = await this.shellAndroid(id, `getprop ${key}`)
        // // console.log(str)
        // var start = str.lastIndexOf("[")
        // var end = str.lastIndexOf("]")
        // return str.substring(start + 1, end)
        return str
    }
    Util.getAndroidDevices = async function() {
        var bat = Util.getAdb()
        var strDevices = await this.executeExeAsync(`${bat} devices`, "adb")
        var lines = strDevices.split("\n")
        var devices = []
        for (var i = 1; i < lines.length; ++i) {
            var line = lines[i].trim()
            if (line == "") { continue; }
            var id = line.substring(0, line.indexOf("device")).trim();
            if (id == "") { continue; }
            var model = await this.getAndroidProp(id, "ro.product.model")
            var androidVersion = await this.getAndroidProp(id, "ro.build.version.sdk")
            devices.push({id : id, model: model, androidVersion: androidVersion.trim()})
        }
        // console.log(JSON.stringify(devices))
        return devices;
    }
    Util.getAapt = function() {
        if (this.IsLinux()) {
            return "./aapt_linux"
        } else if (this.IsWindows()) {
            return "aapt.exe"
        } else {
            return "./aapt"
        }
    }
    Util.getAdb = function() {
        if (this.IsLinux()) {
            return "./adb_linux"
        } else if (this.IsWindows()) {
            return "adb.exe"
        } else {
            return "./adb"
        }
    }
    return Util;
}());
Util.init();
export { Util }