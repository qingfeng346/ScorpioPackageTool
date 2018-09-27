const path = require('path')
import { spawn, exec, execSync } from "child_process";
import { Util } from './Util'

class ExecUtilClass {
    init(toolsPath) {
        this.toolsPath = toolsPath
    }
    parseArg(arg) {
        if (arg.indexOf(" ") < 0) {
            return arg;
        }
        if (Util.IsWindows()) {
            arg = "\"" + arg + "\"";
        } else if (Util.IsLinux()) {
            arg = "\"" + arg + "\"";
        } else {
            arg = arg.replace(/ /g, "\\ ");
        }
        return arg;
    }
    chmod(command, cwd) {
        if (!Util.IsWindows()) { 
            var bat = command.substring(0, command.indexOf(" "))
            this.executeSync(`chmod +x ${bat}`, cwd);
        }
    }
    executeSync(command, cwd) {
        console.log("执行命令行 目录 [" + cwd + "] 命令 : " + command);
        return execSync(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, maxBuffer : 1024 * 1024 * 8} );
    }
    executeAsync(command, cwd) {
        return new Promise((resolve, reject) => {
            console.log("异步执行命令行 目录 [" + cwd + "] 命令 : " + command);
            exec(command, { cwd: cwd ? path.resolve(this.toolsPath, cwd) : undefined, maxBuffer : 1024 * 1024 * 8}, (err, stdout, stderr) => {
                if (err) {
                    reject(stderr)
                } else {
                    resolve(stdout)
                }
            });
        });
    }
    executeJar(command, cwd, callback) {
        this.executeAsync("java -jar " + command, cwd, callback)
    }
    executeExe(command, cwd, callback) {
        this.chmod(command, cwd)
        this.executeAsync(command, cwd, callback)
    }
    executeJarSync(command, cwd) {
        return this.executeSync("java -jar " + command, cwd)
    }
    executeExeSync(command, cwd) {
        this.chmod(command, cwd)
        return this.executeSync(command, cwd)
    }

}