<template>
    <el-container style="height: 100%; border: 1px solid #eee; padding: 10px">
        <el-aside width="280px">
            <el-card>
                <div slot="header" class="clearfix">
                    <span>设备列表</span>
                </div>
                <div class="line">
                    <el-select v-model="device" value-key="id" size="small" style="width: 200px" placeholder="无设备" @change="OnChangeDevice">
                        <el-option
                        v-for="device in deviceList"
                        :key="device.id"
                        :label="formatDeivce(device)"
                        :value="device.id">
                        </el-option>
                    </el-select>
                    <el-button circle icon="el-icon-refresh" size="small" @click="OnClickRefreshDevices"></el-button>
                </div>
                <div>
                    <el-input placeholder="请输入内容" size="small" ></el-input>
                </div>
            </el-card>
            <!-- <el-collapse v-model="activeNames" style="padding: 0px; margin: 0px">
                <el-collapse-item title="设备列表" name="device">
                    <el-select v-model="device" value-key="id" size="small" style="width: 200px" placeholder="无设备" @change="OnChangeDevice">
                        <el-option
                            v-for="device in deviceList"
                            :key="device.id"
                            :label="formatDeivce(device)"
                            :value="device.id">
                        </el-option>
                    </el-select>
                    <el-button circle icon="el-icon-refresh" size="small" @click="OnClickRefreshDevices"></el-button>
                </el-collapse-item>
            </el-collapse> -->
        </el-aside>
    </el-container>
</template>
<script>
import path from 'path';
import { console } from '../../common/logger';
import { Util } from '../../common/Util';
import { Loading } from 'element-ui';
import { Notification } from 'element-ui';
export default {
    mounted() {
        this.OnClickRefreshDevices()
        Util.event.on("dropFiles", this.OnDropFiles)
    },
    data() {
        return {
            activeNames: ['device'],
            deviceList: [],
            device : "",
        }
    },
    methods: {
        OnDropFiles : async function(files) {
            if (Util.activeMenu != "operate") { return; }
            if (this.device == "") { return; }
            for (var file of files) {
                if (file.name.endWith(".apk")) {
                    var loading = Loading.service({text: "正在安装文件 : " + file.name})
                    var path = Util.parseArg(file.path)
                    Util.adbAndroid(this.device, `install -r ${path}`).then((result) => {
                        loading.close()
                        console.log("安装成功")
                        Notification.success({
                            message: "安装成功"
                        });
                    }).catch((stderr) => {
                        loading.close()
                        console.error("安装失败 : " + stderr)
                        Notification.error({
                            message: "安装失败 : " + stderr
                        });
                    })
                }
            }
            for (var file of files) {
                if (file.name.endWith(".obb")) {
                    var loading = Loading.service({text: "正在拷贝obb : " + file.name})
                    var bundleId = file.name.substring(file.name.indexOf(".", 5) + 1)
                    bundleId = bundleId.substring(0, bundleId.lastIndexOf("."))
                    var fullPath = file.path
                    try {
                        await Util.shellAndroid(this.device, `mkdir /sdcard/Android/obb/${bundleId}`)
                    } catch (e) {
                    }
                    try {
                        await Util.adbAndroid(this.device, `push ${fullPath} /sdcard/Android/obb/${bundleId}/`)
                    } catch (e) {
                    }
                    loading.close()
                }
            }
        },
        formatDeivce : function(device) {
            var v = Util.getAndroidVersion(device.androidVersion)
            return `${device.model}(${v})`
        },
        OnClickRefreshDevices : async function() {
            this.device = ""
            var devices = await Util.getAndroidDevices();
            this.deviceList = devices
            if (this.deviceList.length > 0) {
                this.device = this.deviceList[0].id
                this.OnChangeDevice()
            }
        },
        OnChangeDevice: function() {
            console.log("value : " + this.device)
        },

    }
}
</script>
<style>
.line {
    padding: 0 0 5px 0;
}
</style>

