<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-header style="min-width: 600px; margin: 20px 0px;">
            <el-button type="primary" icon="el-icon-document" v-on:click="OnClickOpenFile()">打开文件</el-button>
            <el-button type="primary" icon="el-icon-document" v-on:click="OnClickWorkPath()">工作目录</el-button>
        </el-header>
        <el-tabs v-model='activeName' style="margin: 0px 20px;" @tab-click="handleTabClick">
            <el-tab-pane label="应用列表" name="list"></el-tab-pane>
            <el-tab-pane label="应用信息" name="app" v-if="showApp" ></el-tab-pane>
        </el-tabs>
        <el-container style="height: 100%">
            <ListPart v-show="activeName == 'list'"></ListPart>
            <PackagePart v-show="activeName == 'app'"></PackagePart>
        </el-container>
    </el-container>
</template>
<script>
    import ListPart from "./ListPage"
    import PackagePart from "./PackagePage"
    import { Util } from "../../common/Util"
    import { parseAndroid } from "../../common/parseAndroid";
    import { console, logger } from '../../common/logger';
    import { Loading } from 'element-ui';
    import { shell } from 'electron';
    export default {
        components : { ListPart, PackagePart },
        mounted() {
            Util.event.on("showApp", () => {
                this.showApp = true
                this.activeName = "app";
            })
        },
        data() {
            return {
                logTag : "",
                activeName : "list",
                showApp : false,
            }
        },
        methods: {
            handleTabClick: function() {

            },
            OnClickWorkPath : function() {
                shell.showItemInFolder(Util.apkPath);
            },
            OnClickOpenFile : function() {
                Util.showOpenDialog({
                    filters: [ {name: 'apk & ipa', extensions: ['apk', 'ipa'] }],
                    properties: ['openFile']
                }, 
                null,
                async (files, args) => {
                    var file = files[0];
                    console.log("正在解析文件 : " + file);
                    var parse = new parseAndroid();
                    var loading = Loading.service( { background: "rgba(20,20,20,0.7)", text: "正在解析apk"});
                    try {
                        await parse.init(file);
                        var info = await parse.parseInfo();
                        Util.insertFileInfo(info)
                        await parse.decompress();
                        await parse.dex2jar();
                        Util.event.emit("showApp")
                        Util.event.emit("updateInfo", info)
                    } catch (e) {
                        console.error(e);
                    } finally {
                        loading.close();
                    }
                });
            },
            OnClickOpenLog : function() {
                var bat = Util.IsWindows() ? "adb.exe" : "./adb";
                if (!Util.IsWindows()) { Util.execute(`chmod +x ${bat}`, "adb"); }
                var tag = this.logTag != "" ? ` -s ${this.logTag}` : ""
                Util.execute(`start ${bat} logcat ${tag}`, "adb");
            }
        }
    }
</script>
<style>

</style>


