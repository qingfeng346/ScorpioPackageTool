const fs = require('fs');
const os = require('os');
const path = require('path');
const Util = require('./Util.js').Util;
import { console } from './logger';
import { ExecUtil } from './ExecUtil.js';

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
    async parseInfo() {
        console.log("开始解析文件 " + this.fileName + " -> AndroidManifest.xml");
        let result = await ExecUtil.executeAaptDump(this.targetFile)
        this.parseInfo_impl(result)
        console.log("解析 AndroidManifest.xml 完成");
        return this.apkInfo
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
    async dex2jar() {
        console.log("开始反编译 jar")
        await ExecUtil.executeDex2jar(this.targetFile, this.targetPath + "/source.jar")
        console.log("反编译jar完成")
    }
    async decompress() {
        console.log("开始解压文件 : " + this.fileName);
        await ExecUtil.executeApkDecompress(this.targetFile, this.targetPath + "/source/")
        console.log("解压文件完成");
        await this.createManifest()
    }
    async createManifest() {
        var source = ExecUtil.parseArg(this.targetPath + "/source/original/AndroidManifest.xml");
        var target = ExecUtil.parseArg(this.targetPath + "/AndroidManifest.xml");
        console.log("开始反编译 AndroidManifest.xml")
        await ExecUtil.executeJarAsync(`AXMLPrinter2.jar ${source} > ${target}`, "AXMLPrinter2")
        console.log("反编译完成")
    }
}

export { parseAndroid }