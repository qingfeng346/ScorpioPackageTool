<template>
    <el-container style="height: 100%; width: 100%; border: 1px solid #eee; padding: 10px">
        <el-tabs v-model='activeName' style="margin: 0px 20px; width: 100%">
            <el-tab-pane label="我的设备" name="devices">
                <el-card class="line">
                <div slot="header" class="clearfix">
                    <span>设备列表</span>
                </div>
                <div>
                    <el-select v-model="deviceSel" value-key="id" size="small" style="width: 200px" placeholder="无设备" @change="OnChangeDevice">
                        <el-option v-for="device in deviceList" :key="device.id" :label="formatDeivce(device)" :value="device.id"></el-option>
                    </el-select>
                    <el-button circle icon="el-icon-refresh" size="small" @click="OnClickRefreshDevices"></el-button>
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
            <el-tab-pane label="应用管理" name="application"></el-tab-pane>
            <el-tab-pane label="文件管理" name="file" ></el-tab-pane>
        </el-tabs>
    </el-container>
</template>
<script>
import path from 'path';
import { console } from '../../common/logger';
import { Util } from '../../common/Util';
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
            deviceSel : "",     //当前选择设备
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
        OnDropFiles : async function(files) {
            if (Util.activeMenu != "operate") { return; }
            if (this.deviceSel == "") { return; }
            for (var file of files) {
                if (file.name.endWith(".apk")) {
                    var loading = Loading.service({text: "正在安装文件 : " + file.name})
                    var path = Util.parseArg(file.path)
                    try {
                        await Util.adbAndroid(this.deviceSel, `install -r ${path}`)
                        console.log("安装成功")
                        Notification.success({ message: "安装成功" });
                    } catch (err) {
                        console.error("安装失败 : " + err)
                        Notification.error({ message: "安装失败 : " + err });
                    } finally {
                        loading.close()
                    }
                }
            }
            for (var file of files) {
                if (file.name.endWith(".obb")) {
                    var loading = Loading.service({text: "正在拷贝obb : " + file.name})
                    var bundleId = file.name.substring(file.name.indexOf(".", 5) + 1)
                    bundleId = bundleId.substring(0, bundleId.lastIndexOf("."))
                    var fullPath = file.path
                    try {
                        await Util.shellAndroid(this.deviceSel, `mkdir /sdcard/Android/obb/${bundleId}`)
                    } catch (e) { }
                    try {
                        var p = Util.parseArg(fullPath)
                        await Util.adbAndroid(this.deviceSel, `push ${p} /sdcard/Android/obb/${bundleId}/`)
                        console.log("拷贝成功 : " + fullPath)
                        Notification.success({ message: "拷贝成功" });
                    } catch (err) {
                        console.error("拷贝失败 : " + err)
                        Notification.error({ message: "拷贝失败 : " + err});
                    } finally {
                        loading.close()
                    }
                    
                }
            }
        },
        formatDeivce : function(device) {
            var v = Util.getAndroidVersion(device.androidVersion)
            return `${device.model}(${v})`
        },
        OnClickRefreshDevices : async function() {
            this.deviceSel = ""
            var devices = await Util.getAndroidDevices();
            this.deviceList = devices
            if (this.deviceList.length > 0) {
                this.deviceSel = this.deviceList[0].id
                this.OnChangeDevice()
            }
        },
        OnClickConnectDevice : async function() {
            if (this.otherDevice == "") { return; }
            var bat = Util.getAdb()
            Util.executeExeAsync(`${bat} connect ` + this.otherDevice, "adb").then(() => {
                this.OnClickRefreshDevices()
            }).catch((err) => {
                Notification.error({message : err})
            });
        },
        OnChangeHistory: async function() {
            this.otherDevice = this.history
        },
        OnChangeDevice: async function() {
            // var result = await Util.shellAndroid(this.deviceSel, "pm list packages -e 'com.funplus.townkins.global'") 
            // console.log(result)
            // var result = await Util.shellAndroid(this.deviceSel, "dumpsys -p package 'com.funplus.townkins.global'") 
            // var result = await Util.shellAndroid(this.deviceSel, "dumpsys activity -p 'com.funplus.townkins.global'") 
            // var result = await Util.shellAndroid(this.deviceSel, "pm list packages -f -3"  ) 
            // console.log(result)
        },
    }
}
</script>
<style>
.line {
    padding: 0 0 5px 0;
}
</style>

