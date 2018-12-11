import path from 'path';
import { ipcRenderer } from "electron";
import { spawn, exec, execSync } from "child_process";
import { Util } from './Util'
import { console } from "./logger";

class ExecUtilClass {
    constructor() {
        this.appInfo = ipcRenderer.sendSync('getAppInfo')
        this.toolsPath = process.env.NODE_ENV === 'development' ? path.resolve(this.appInfo.path.cwd, "./tools") : path.resolve(this.appInfo.path.appPath, "../tools")      //所有的工具目录
        console.log("toolsPath : " + this.toolsPath)
    }
    useSystemAdb(value) {
        this.systemAdb = value
    }
    parseArg(arg) {
        if (arg.indexOf(" ") < 0) {
            return arg;
        }
        if (Util.IsWindows) {
            arg = "\"" + arg + "\"";
        } else if (Util.IsLinux) {
            arg = "\"" + arg + "\"";
        } else {
            arg = arg.replace(/ /g, "\\ ");
        }
        return arg;
    }
    chmod(command, cwd) {
        if (!Util.IsWindows) { 
            let bat = command.substring(0, command.indexOf(" "))
            this.executeSync(`chmod +x ${bat}`, cwd);
        }
    }
    executeSync(command, cwd) {
        console.log(`执行命令行 目录 [${cwd}] 命令 : ${command}`);
        return execSync(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, maxBuffer : 1024 * 1024 * 8} );
    }
    executeAsync(command, cwd) {
        return new Promise((resolve, reject) => {
            console.log(`异步执行命令行 目录 [${cwd}] 命令 : ${command}`);
            exec(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, maxBuffer : 1024 * 1024 * 8}, (err, stdout, stderr) => {
                if (err) {
                    reject(stderr)
                } else {
                    resolve(stdout)
                }
            });
        });
    }
    executeCommand(command, cwd, args) {
        return new Promise((resolve, reject) => {
            this.chmod(command, cwd)
            var strArgs = ""
            for (var arg of args) { strArgs += " " + arg; }
            console.log(`异步执行命令行 目录 [${cwd}] 命令 : ${command + strArgs}`);
            var sp = spawn(command, args, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, maxBuffer : 1024 * 1024 * 8 });
            sp.stdout.on('data', (data) => { console.log(data.toString()) });
            sp.stderr.on('error', (data) => { console.log("exec is error : " + data.toString()); });
            sp.on("close", () => {
                resolve()
            });
        });
    }

    executeJarSync(command, cwd) {
        return this.executeSync(`java -jar ${command}`, cwd)
    }
    async executeJarAsync(command, cwd) {
        return await this.executeAsync(`java -jar ${command}`, cwd)
    }
    executeExeSync(command, cwd) {
        this.chmod(command, cwd)
        return this.executeSync(command, cwd)
    }
    async executeExeAsync(command, cwd) {
        this.chmod(command, cwd)
        return await this.executeAsync(command, cwd)
    }
    getJavaInfo() {
        try {
            let version = this.executeSync("java -jar JavaInfo.jar java.version", "JavaInfo");
            let home = this.executeSync("java -jar JavaInfo.jar java.home", "JavaInfo");
            return {"version" : version, "home" : home}
        } catch (e) { }
        return undefined
    }
    getAapt() {
        if (Util.IsLinux) {
            return "./aapt_linux"
        } else if (Util.IsWindows) {
            return "aapt.exe"
        } else {
            return "./aapt"
        }
    }
    getAdb() {
        if (Util.IsLinux) {
            return "./adb_linux"
        } else if (Util.IsWindows) {
            return "adb.exe"
        } else {
            return "./adb"
        }
    }
    async executeAdbAsync(command) {
        if (this.systemAdb) {
            return await this.executeExeAsync(`adb ${command}`, undefined)
        } else {
            let bat = this.getAdb()
            return await this.executeExeAsync(`${bat} ${command}`, "adb")
        }
    }
    async executeDeviceAdb(id, command) {
        return await this.executeAdbAsync(`-s ${id} ${command}`)
    }
    async executeDeviceShell(id, command) {
        return await this.executeAdbAsync(`-s ${id} shell "${command}"`)
    }
    async getAndroidProperty(id, key) {
        return await this.executeDeviceShell(id, `getprop ${key}`)
    }



    async executeAaptDump(file) {
        let bat = this.getAapt()
        let argFile = this.parseArg(file)
        return await this.executeAsync(`${bat} dump badging ${argFile}`, "aapt")
    }
    async executeApkDecompress(source, target) {
        let bat = Util.IsWindows ? "apktool.bat" : "./apktool.sh"
        let argSource = this.parseArg(source)
        let argTarget = this.parseArg(target)
        await this.executeCommand(bat, "apktool", ["d", "-f", argSource, "-o", argTarget])
    }
    async executeDex2jar(source, target) {
        let bat = Util.IsWindows ? "d2j-dex2jar.bat" : "./d2j-dex2jar.sh";
        let argSource = this.parseArg(source)
        let argTarget = this.parseArg(target)
        await this.executeCommand(bat, "dex-tools", ["-f", argSource, "-o", argTarget])
    }
}
let ret = new ExecUtilClass()
export { ret as ExecUtil }