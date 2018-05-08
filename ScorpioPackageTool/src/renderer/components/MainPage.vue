<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-header style="min-width: 600px; height: 100px; margin: 0px;">
            <el-tabs type="card">
            <el-tab-pane label="常用">
                <el-button type="primary" icon="el-icon-document" v-on:click="OnClickOpenFile()">打开文件</el-button>
            </el-tab-pane>
            <el-tab-pane label="系统日志">
                <el-input v-model="logTag" placeholder="日志TAG" style="width: 120px;"></el-input>
                <el-button type="primary" icon="el-icon-tickets" v-on:click="OnClickOpenLog()">Android日志</el-button>
            </el-tab-pane>
            </el-tabs>
        </el-header>
        <el-tabs v-model='activeName' style="margin: 10px 10px;" @tab-click="handleTabClick">
            <el-tab-pane label="应用列表" name="list"></el-tab-pane>
            <el-tab-pane label="应用信息" name="app"></el-tab-pane>
        </el-tabs>
        <ListPart v-show="activeName == 'list'"></ListPart>
        <PackagePart v-show="activeName == 'app'"></PackagePart>
    </el-container>
</template>
<script>
    import ListPart from "./ListPart"
    import PackagePart from "./PackagePart"
    import { Util } from "../common/Util"
    import { console } from '../common/logger';
    export default {
        name:"main-page",
        components : { ListPart, PackagePart },
        data() {
            return {
                logTag : "",
                activeName : "list",
            }
        },
        methods: {
            handleTabClick: function() {

            },
            TestClick : function() {
                this.$router.push("/test");
                // Util.showOpenDialog({
                //     filters: [ {name: 'apk and ipa', extensions: ['apk', 'ipa'] }],
                //     properties: ['openFile']
                // }, 
                // null,
                // (files, args) => {
                //     console.log("files = " + JSON.stringify(files));
                // });
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


