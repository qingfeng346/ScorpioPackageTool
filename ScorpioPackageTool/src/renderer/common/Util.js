const fs = require("fs")
const os = require("os")
const path = require('path')
const iconv = require("iconv-lite")
const events = require('events')
const open = require('open')
import { ipcRenderer } from "electron";
import { spawn, exec, execSync } from "child_process";
import { Message, Notification, MessageBox } from "element-ui";
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
        console.log("toolsPath : " + this.toolsPath)
        console.log("dataPath : " + this.dataPath)
        this.mkdir(this.dataPath)
        this.mkdir(this.apkPath)
        this.event = new events()
        ipcRenderer.on('showOpenDialogResult', this.showOpenDialogResult)
        this.loadFileInfos()
        this.checkJavaEnviroment()
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
        console.log("saveFileInfos : " + this.filesName);
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
    Util.removeFileInfo = function(info) {
        if (info == null) { return }
        for (var i in this.fileInfos) {
            if (this.fileInfos[i]["name"] == info["name"]) {
                Util.array_removeat(this.fileInfos, i);
                break;
            }
        }
        Util.saveFileInfos();
        this.event.emit("updateInfos")
        fs.unlinkSync(this.apkPath + "/" + info.name + ".apk")
        this.rmdirRecursive(this.apkPath + "/" + info.name)
    }
    Util.getAppIcon = function(info) {
        return this.apkPath + "/" + info.name + "/source/" + info.icon;
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
    Util.rmdirRecursive = function(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir)
            for (var file of files) {
                var curPath = dir + "/" + file;
                if (fs.lstatSync(curPath).isDirectory()) { // recurse
                    this.rmdirRecursive(curPath);
                } else {
                    fs.unlinkSync(curPath);
                }
            }
            fs.rmdirSync(dir);
        }
    };
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
        this.execute("java jar " + command, cwd, callback)
    }
    Util.executeExe = function(command, cwd, callback) {
        var bat = command.substring(0, command.indexOf(" "))
        this.execute(`chmod +x ${bat}`, cwd); 
        this.execute(command, cwd, callback)
    }
    Util.execute = function(command, cwd, callback) {
        console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command);
        return exec(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, encoding: "utf8" }, callback);
    }
    Util.executeSync = function(command, cwd) {
        console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command);
        return execSync(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, encoding: "binary" });
    }
    Util.execCommand = function(command, cwd, args, sh) {
        var strArgs = ""
        for (var arg of args) { strArgs += " " + arg; }
        console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command + strArgs);
        // if (!Util.IsWindows()) {
        //     this.array_insert(args, 0, command);
        //     command = "sh";
        // }
        this.execute(`chmod +x ${command}`, cwd); 
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
        return iconv.decode(new Buffer(data, 'binary'), "cp936")
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
    Util.showOpenDialog = function(options, args, callback) {
        ShowOpenDialogCallback = callback
        ipcRenderer.send('showOpenDialog', options, args)
    }
    Util.showOpenDialogResult = function(event, files, args) {
        var callback = ShowOpenDialogCallback
        ShowOpenDialogCallback = undefined
        if (callback) callback(files, args)
    }
    Util.checkJavaEnviroment = function() {
        var javaInfo = this.getJavaInfo()
        if (javaInfo) {
            Message.success({
                message: "Java 版本 : " + javaInfo.version + "<br>" + "Java 目录 : " + javaInfo.home,
                dangerouslyUseHTMLString: true,
                center: true
            })
        } else {
            MessageBox.confirm("检测不到系统Java环境,点击去下载.", "错误", {
                confirmButtonText: '去下载',
                cancelButtonText: '取消',
                type: 'error'
            }).then(() => {
                open("http://www.oracle.com/technetwork/java/javase/downloads/index.html")
            }).catch(() => {
                console.log("点击取消")
            });
        }
    }
    Util.getJavaInfo = function() {
        try {
            var version = this.executeSync("java -jar JavaInfo.jar java.version", "JavaInfo");
            var home = this.executeSync("java -jar JavaInfo.jar java.home", "JavaInfo");
            return {"version" : version, "home" : home}
        } catch (e) {
            console.log("getJavaInfo is error : " + this.getString(e.stderr))
        }
        return undefined
    }
    return Util;
}());
Util.init();
export { Util }