<template>
    <el-table :data="fileList" style="width: 100%;" height="100%" border >
        <el-table-column prop="name" label="名称" width="180"></el-table-column>
        <el-table-column prop="label" label="应用名" width="150"></el-table-column>
        <el-table-column prop="bundle" label="Bundle Identifier" width="180"></el-table-column>
        <el-table-column prop="versionName" label="版本" width="80"></el-table-column>
        <el-table-column prop="versionCode" label="版本" width="60"></el-table-column>
        <el-table-column prop="sdkVersion" :formatter="formatSdkVersion" label="最低支持版本" width="110"></el-table-column>
        <el-table-column label="操作" width="180">
            <template slot-scope="data">
                <el-button size="mini" @click="OnClickOpenFile(data.row)">打开</el-button>
                <el-button size="mini" type="danger" @click="OnClickDeleteFile(data.row)">删除</el-button>
            </template>
        </el-table-column>
    </el-table>
</template>

<script>
    import { Util } from "../common/Util"
    import { console } from '../common/logger';

    export default {
        mounted() {
            Util.event.on("updateInfos", () => {
                this.fileList = Util.getFileInfos()
            })
        },
        data() {
            return {
                fileList : Util.getFileInfos()
            }
        },
        methods: {
            OnClickOpenFile: function(info) {
                Util.insertFileInfo(info)
                Util.event.emit("showApp")
                Util.event.emit("updateInfo", info)
            },
            OnClickDeleteFile: function(info) {

            },
            formatSdkVersion: function(info) {
                return Util.getAndroidVersion(info.sdkVersion)
            }
        }
    }
</script>
<style>

</style>
