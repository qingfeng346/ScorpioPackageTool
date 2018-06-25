<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-header style="min-width: 600px; height: 100px; margin: 0px;">
            <el-tabs type="card">
            <el-tab-pane label="常用">
                <el-button type="primary" icon="el-icon-document" v-on:click="OnClickOpenFile()">打开文件</el-button>
                <el-button type="primary" icon="el-icon-document" v-on:click="OnClickWorkPath()">工作目录</el-button>
            </el-tab-pane>
            <el-tab-pane label="系统日志">
                <el-input v-model="logTag" placeholder="日志TAG" style="width: 120px;"></el-input>
                <el-button type="primary" icon="el-icon-tickets" v-on:click="OnClickOpenLog()">Android日志</el-button>
            </el-tab-pane>
            </el-tabs>
        </el-header>
        <el-tabs v-model='activeName' style="margin: 10px 10px;" @tab-click="handleTabClick">
            <el-tab-pane label="应用列表" name="list"></el-tab-pane>
            <el-tab-pane v-if="showApp" label="应用信息" name="app"></el-tab-pane>
        </el-tabs>
        <el-container style="height: 100%">
            
            <el-main style="height: 100%">
                <ListPart v-show="activeName == 'list'"></ListPart>
                <PackagePart v-show="activeName == 'app'"></PackagePart>
            </el-main>
            <el-footer>Footer</el-footer>
        </el-container>
    </el-container>
</template>
<script>
    import ListPart from "./ListPart"
    import PackagePart from "./PackagePart"
    import { Util } from "../common/Util"
    import { parseAndroid } from "../common/parseAndroid";
    import { console, logger } from '../common/logger';
    import { Loading } from 'element-ui';
    import { shell } from 'electron';
    export default {
        name:"main-page",
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
            }
        }
    }
</script>
<style>
    html, body {
      height: 100%;
      margin: 0;
    }
</style>


