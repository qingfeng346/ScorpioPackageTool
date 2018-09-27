const fs = require('fs')
const path = require('path')
class FileUtilClass {
    mkdir(dir) {
        if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }
    }
    rmdir(dir) {
        if (fs.existsSync(dir)) { fs.rmdirSync(dir); }
    }
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
    async rmdirRecursive(dir) {
        if (!fs.existsSync(dir)) { return; }
        var files = fs.readdirSync(dir)
        for (var file of files) {
            var curPath = path.resolve(dir, file)
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                await this.rmdirRecursive(curPath)
            } else {
                await this.removeFile(curPath)
            }
        }
        this.rmdir(dir)
    }
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
}
var FileUtil = new FileUtilClass();
export { FileUtil }