const fs = require('fs');
const os = require('os');
const path = require('path');
const Util = require('./Util.js').Util;
import { console } from './logger';

class parseAndroid {
    init(sourceFile) {
        return new Promise((resolve, reject) => {
            this.file = sourceFile
            this.fileName = path.basename(sourceFile, ".apk");
            this.targetPath = path.resolve(Util.apkPath, this.fileName)                 //目标目录
            this.targetFile = path.resolve(Util.apkPath, this.fileName + ".apk");       //目标文件
            Util.mkdir(this.targetPath);
            fs.copyFile(sourceFile, this.targetFile, () => {
                resolve();
            });
        })
    }
    getIcon() {
        if (this.apkInfo) {
            return apkPath + "/" + this.fileName + "/" + this.apkInfo.icon;
        }
        return "";
    }
    parseInfo() {
        return new Promise((resolve, reject) => {
            var bat = Util.getAapt()
            console.log("开始解析文件 " + this.fileName + " -> AndroidManifest.xml");
            var _this = this;
            var targetFile = Util.parseArg(this.targetFile);
            Util.executeExe(`${bat} dump badging ${targetFile}`, "aapt", (err, stdout, stderr) => {
                if (err) {
                    console.log("解析 AndroidManifest.xml 失败 : " + err.stack);
                    reject(err.stack);
                    return;
                }
                _this.parseInfo_impl(stdout);
                console.log("解析 AndroidManifest.xml 完成");
                resolve(_this.apkInfo);
            })
        })
    }
    parseLineInfo(info) {
        var quot = false;       //当前是否是引号包围
        var key = "";           //key值
        var tmp = "";           //临时字符串
        var ret = {};           //返回值
        for (var i = 0; i < info.length; ++i) {
            var str = info[i];
            if ((str == "=" || str == ":") && quot == false) {
                key = tmp;
                tmp = "";
            } else if (str == "'" && quot == false) {
                tmp = "";
                quot = true;
            } else if (str == "'" && quot == true) {
                ret[key.trim()] = tmp.trim();
                key = "";
                tmp = "";
                quot = false;
            } else {
                tmp += str;
            }
        }
        return ret;
    }
    parseInfo_impl(aatpInfo) {
        var strs = aatpInfo.split('\n');
        var apkInfo = {}
        apkInfo["name"] = this.fileName;
        for (var str of strs) {
            if (str.startWith("package:")) {
                var infos = this.parseLineInfo(str.substring("package:".length).trim());
                apkInfo["bundle"] = infos["name"];
                apkInfo["versionName"] = infos["versionName"];
                apkInfo["versionCode"] = infos["versionCode"];
            } else if (str.startWith("application:")) {
                var infos = this.parseLineInfo(str.substring("application:".length).trim());
                apkInfo["label"] = infos["label"];
                apkInfo["icon"] = infos["icon"];
            } else if (str.startWith("sdkVersion:")) {
                var infos = this.parseLineInfo(str.trim());
                apkInfo["sdkVersion"] = infos["sdkVersion"];
            }
        }
        this.apkInfo = apkInfo;
    }
    createManifest() {
        var source = Util.parseArg(this.targetPath + "/source/original/AndroidManifest.xml");
        var target = Util.parseArg(this.targetPath + "/AndroidManifest.xml");
        Util.executeJar(`AXMLPrinter2.jar ${source} > ${target}`, "AXMLPrinter2", (err, stdout, stderr) => {
            if (err) {
                console.log("createManifest 失败 : " + stderr);
                return;
            }
        }, true);
    }
    dex2jar() {
        return new Promise((resolve, reject) => {
            var bat = Util.IsWindows() ? "d2j-dex2jar.bat" : "./d2j-dex2jar.sh";
            var sp = Util.execCommand(bat, "dex-tools", ["-f", this.targetFile, "-o", this.targetPath + "/source.jar"]);
            console.log("开始反编译jar");
            sp.on("close", () => {
                console.log("反编译jar完成")
                resolve();
            });
        });
    }
    decompress() {
        return new Promise((resolve, reject) => {
            var bat = Util.IsWindows() ? "apktool.bat" : "./apktool.sh";
            var sp = Util.execCommand(bat, "apktool", ["d", "-f", Util.parseArg(this.targetFile), "-o", Util.parseArg(this.targetPath + "/source/")]);
            console.log("开始解压文件 : " + this.fileName);
            sp.on('close', () => {
                console.log("解压文件完成");
                this.createManifest();
                resolve();
            });
        })
    }
}

export { parseAndroid }