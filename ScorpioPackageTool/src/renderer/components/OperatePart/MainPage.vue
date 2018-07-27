<template>
    <el-container style="height: 100%; border: 1px solid #eee; padding: 10px">
        <el-aside width="280px">
            <el-collapse v-model="activeNames" style="padding: 0px; margin: 0px">
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
            </el-collapse>
        </el-aside>
    </el-container>
</template>
<script>
import { console } from '../../common/logger';
import { Util } from '../../common/Util';
import { Loading } from 'element-ui';
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
            var names = []
            for (var file of files) {
                if (file.name.endWith(".apk")) {
                    var loading = Loading.service({text: "正在安装文件 : " + file.name})
                    var result = await Util.adbAndroid(this.device, "install -r " + file.path)
                    console.log("result = " + result)
                    loading.close()
                } else if (file.names.endWith(".obb")) {
                    
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
.aaa {
    /* padding:  */
    /* //margin:  */
}
</style>

