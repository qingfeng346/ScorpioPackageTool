<template>
    <el-container style="height: 100%; width: 100%; border: 1px solid #eee; padding: 10px">
        <el-tabs v-model='activeName' style="margin: 0px 20px; width: 100%">
            <el-tab-pane label="我的设备" name="devices">
                <el-card class="line">
                    <div slot="header" class="clearfix">
                        <span>安装应用，上传obb文件</span>
                    </div>
                    <div>
                        <el-button type="primary" size='medium' icon="el-icon-document" v-on:click="OnClickOpenFile()">选择文件</el-button>
                    </div>
                </el-card>
                <el-card class="line">
                    <div slot="header" class="clearfix">
                        <span>设备列表</span>
                        <el-button circle icon="el-icon-refresh" size="small" @click="OnClickRefreshDevices"></el-button>
                    </div>
                    <div>
                        <el-select v-model="activeDevice" value-key="id" size="small" style="width: 100%" placeholder="无设备" @change="OnChangeDevice">
                            <el-option v-for="device in deviceList" :key="device.id" :label="formatDeivce(device)" :value="device.id"></el-option>
                        </el-select>
                    </div>
                </el-card>
                <el-card class="line">
                    <div slot="header" class="clearfix">
                        <span>其他端口设备</span>
                    </div>
                    <el-input size="small" v-model="otherDevice" placeholder="请输入IP端口">
                        <el-select slot="prepend" v-model="history" @change="OnChangeHistory">
                            <el-option v-for="item in historyList" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                        <el-button slot="append" size="small" @click="OnClickConnectDevice">连接</el-button>
                    </el-input>
                </el-card>
            </el-tab-pane>
            <!--
            <el-tab-pane label="应用管理" name="application"></el-tab-pane>
            <el-tab-pane label="文件管理" name="file" ></el-tab-pane>
            -->
        </el-tabs>
    </el-container>
</template>
<script>
import path from 'path';
import { console } from '../../common/logger';
import { Util } from '../../common/Util';
import { ExecUtil } from '../../common/ExecUtil';
import { Loading } from 'element-ui';
import { Notification } from 'element-ui';
export default {
    created() {
        
    },
    mounted() {
        this.OnClickRefreshDevices()
        Util.event.on("dropFiles", this.OnDropFiles)
    },
    data() {
        return {
            deviceList: [],     //设备列表
            activeDevice : "",  //当前选择设备
            otherDevice: "",    //其他端口设备
            history : "",
            activeName : "devices",
            historyList: [{
                label : "MuMu模拟器",
                value : "127.0.0.1:7555",
            },{
                label : "夜神模拟器",
                value : "127.0.0.1:62001",
            }
            ]
        }
    },
    methods: {
        OnDropFiles(files) {
            if (Util.activeMenu != "operate") { return; }
            var names = []
            for (var file of files) {
                if (file.name.endWith(".apk")) {
                    names.push(file.path);
                }
            }
            this.openFiles(names)
        },
        async openFiles(files) {
            if (this.activeDevice == "") {
                Util.showError("请先选择一个设备")
                return; 
            }
            for (let file of files) {
                console.log(file)
                if (!file.endWith(".apk")) { continue }
                await this.openFile(file)
            }
            for (let file of files) {
                if (!file.endWith(".obb")) { continue }
                await this.openFile(file)
            }
        },
        async openFile(file) {
            let fileName = path.basename(file)
            if (file.endWith(".apk")) {
                let loading = Loading.service({text: `正在安装文件 : ${fileName}`})
                try {
                    let argPath = ExecUtil.parseArg(file)
                    await ExecUtil.executeDeviceAdb(this.activeDevice, `install -r ${argPath}`)
                    console.log(`安装成功 : ${file}`)
                    Notification.success({ message: "安装成功" });
                } catch (err) {
                    console.error("安装失败 : " + err)
                    Notification.error({ message: "安装失败 : " + err });
                } finally {
                    loading.close()
                }
            } else if (file.endWith(".obb")) {
                let loading = Loading.service({text: `正在拷贝obb : ${fileName}`})
                try {
                    let bundleId = fileName.substring(fileName.indexOf(".", 5) + 1)     //先过滤 main.{versionCode}.
                    bundleId = bundleId.substring(0, bundleId.lastIndexOf("."))
                    try {
                        await ExecUtil.executeDeviceShell(this.activeDevice, `mkdir /sdcard/Android/obb/${bundleId}`)
                    } catch (e) { }
                    let argPath = ExecUtil.parseArg(file)
                    await ExecUtil.executeDeviceAdb(this.activeDevice, `push ${argPath} /sdcard/Android/obb/${bundleId}/`)
                    console.log(`拷贝成功 : ${file}`)
                    Notification.success({ message: "拷贝成功" });
                } catch (err) {
                    console.error("拷贝失败 : " + err)
                    Notification.error({ message: "拷贝失败 : " + err});
                } finally {
                    loading.close()
                }
            }
        },
        formatDeivce : function(device) {
            return `${device.model}(${Util.getAndroidVersion(device.androidVersion)})`
        },
        async OnClickRefreshDevices() {
            this.activeDevice = ""
            var devices = await Util.getAndroidDevices();
            this.deviceList = devices
            if (this.deviceList.length > 0) {
                this.activeDevice = this.deviceList[0].id
                this.OnChangeDevice()
            }
        },
        async OnClickConnectDevice () {
            if (this.otherDevice == "") { return; }
            ExecUtil.executeAdbAsync(`connect ${this.otherDevice}`).then(() => {
                this.OnClickRefreshDevices()
            }).catch((err) => {
                Notification.error({message : err})
            });
        },
        async OnChangeHistory() {
            this.otherDevice = this.history
        },
        async OnChangeDevice() {
            // var result = await Util.shellAndroid(this.deviceSel, "pm list packages -e 'com.funplus.townkins.global'") 
            // console.log(result)
            // var result = await Util.shellAndroid(this.deviceSel, "dumpsys -p package 'com.funplus.townkins.global'") 
            // var result = await Util.shellAndroid(this.deviceSel, "dumpsys activity -p 'com.funplus.townkins.global'") 
            // var result = await Util.shellAndroid(this.deviceSel, "pm list packages -f -3"  ) 
            // console.log(result)
        },
        OnClickOpenFile() {
            Util.showOpenDialog({
                filters: [ {name: 'apk & obb', extensions: ['apk', 'obb'] }],
                properties: ['openFile', 'multiSelections']
            }, null, (files, args) => {
                this.openFiles(files)
            });
        }
    }
}
</script>
<style>
.line {
    padding: 0 0 5px 0;
}
</style>

