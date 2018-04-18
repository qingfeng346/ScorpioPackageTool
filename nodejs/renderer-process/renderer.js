const fs = require('fs');
const os = require('os');
const ipc = require('electron').ipcRenderer;
const shell = require('electron').shell;
const console = require('./logger.js').logger;
const Util = require('./common.js').Util;
const parseAndroid = require('./parseAndroid').parseAndroid;
const { Loading } = require('element-ui');

// let myNotification = new Notification('Jartto', {
//     body: 'Hello Everybody!'
//     })
//     myNotification.onclick = () => {
//     console.log('Click!')
//     }

mainVue = new Vue({
    el: '#app',
    data: {
        autoRoll : true,            //日志是否自动滚动
        activeName : "list",        //当前选中的tab页
        fileName : "",              //当前打开的apk
        mainEditor : "",            //屏幕中间显示内容
        logTag : "",                //log tag
        iconUrl : "",               //当前打开app 的 icon
        imageUrl : "",              //屏幕中间显示Image
        fileInfo : {                //当前打开apk的详细信息
            name : "name",
            label : "label",
            bundle : "bundle",
            versionName : "versionName",
            versionCode : "versionCode",
            sdkVersion : "sdkVersion",
            icon : "icon"
        },              
        fileList : Util.loadFileList(),
        defaultProps: {
            children: 'children',
            label: 'label'
        },
        treeData: []
    },
    methods : {
        handleTabClick : function(tab, event) {
            //console.log(" " + tab.name + "   " + event);
        },
        OnClickOpenFile : function() {
            // Util.showMessage("tttt", "wwwwwwwwwwwwwwwww")
            ipc.send('open-file-dialog', [ {name: 'apk & ipa', extensions: ['apk', 'ipa'] }], "type")
        },
        OnClickOpenLog : function() {
            var bat = IsWindows ? "adb.exe" : "./adb";
            if (!IsWindows) { Util.execute(`chmod +x ${bat}`, "adb"); }
            var tag = this.logTag != "" ? ` -s ${this.logTag}` : ""
            Util.execute(`start ${bat} logcat ${tag}`, "adb");
        },
        getFileInfo : function(name) {
            for (var info of this.fileList) {
                if (info["name"] == name) {
                    return info;
                }
            }
            return undefined
        },
        handleOpenFile : function(data) {
            var info = this.getFileInfo(data.name);
            if (info == undefined) {
                return;
            }
            this.fileName = data.name;
            this.activeName = "app";
            this.insertFileInfo(info)
            this.iconUrl = this.getAppIcon();
            this.refreshFolder();
        },
        handleDeleteFile : function(data) {
            window.console.log("handleDeleteFile data : " + data.name);
        },
        OnClickOpenSource : function() {
            Util.execute("java -jar jd-gui.jar " + apkPath + mainVue.fileName + "/source.jar", "jd-gui");
        },
        OnClickOpenFolder : function() {
            shell.showItemInFolder(apkPath + mainVue.fileName);
        },
        OnClickClearLog : function() {
            document.getElementById("logoutput").innerHTML = "";
        },
        OnClickTree : async function(data) {
            if (data.file) {
                if (data.path.endWith(".png") || data.path.endWith(".jpg") || data.path.endWith(".ico")) {
                    this.imageUrl = apkPath + this.fileName + "/source/" + data.relativePath
                    this.mainEditor = ""
                } else {
                    this.imageUrl = ""
                    this.mainEditor = await Util.readFile(data.path)
                }
            }
        },
        formatSdkVersion : function(row, column) {
            var str = AndroidList[row.sdkVersion];
            if (str == undefined) {
                return row.sdkVersion;
            }
            return str;
        },


        getAppIcon : function() {
            return apkPath + "/" + this.fileName + "/source/" + this.fileInfo.icon;
        },
        insertFileInfo : function(info) {
            this.fileInfo = info;
            for (var i in this.fileList) {
                if (this.fileList[i]["name"] == info["name"]) {
                    Util.array_removeat(this.fileList, i);
                    break;
                }
            }
            Util.array_insert(this.fileList, 0, info);
            Util.saveFileList(this.fileList);
        },
        refreshFolder : async function() {
            var path = apkPath + this.fileName + "/source";
            var data = []
            await this.refreshFolder_impl(path, "", data);
            this.treeData = data
        },
        refreshFolder_impl : async function(path, relativePath, arr) {
            var files = await Util.readdir(path);
            for (var file of files) {
                var fullFile = path + "/" + file;
                var relativeFile = relativePath + "/" + file;
                var info = fs.statSync(fullFile);
                if (info.isDirectory()) {
                    var children = []
                    await this.refreshFolder_impl(fullFile, relativeFile, children);
                    arr.push({
                        "label" : file,
                        "file" : false,
                        "children" : children
                    })
                } else {
                    arr.push({
                        "label" : file,
                        "file" : true,
                        "relativePath" : relativeFile,
                        "path" : fullFile
                    })
                }
            }
        }
    }
})
ipc.on('selected-directory', async (event, path, args) => {
    parse = new parseAndroid();
    var loading = Loading.service( { background: "rgba(20,20,20,0.7)", text: "正在解析apk"});
    await parse.init(path[0]);
    mainVue.fileName = parse.fileName;
    mainVue.activeName = "app";
    var info = await parse.parseInfo();
    mainVue.insertFileInfo(info);
    await parse.decompress();
    mainVue.iconUrl = mainVue.getAppIcon();
    mainVue.refreshFolder();
    await parse.dex2jar()
    loading.close();
})