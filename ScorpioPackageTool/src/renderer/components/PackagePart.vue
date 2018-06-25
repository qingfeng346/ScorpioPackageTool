<template>
    <el-container style="height: 100%">
        <el-aside width="220px" style="background-color: rgb(238, 241, 246)">
            <el-tree :data="treeData" :props="defaultProps" empty-text="正在加载文件列表..." @node-click="OnClickTree"></el-tree>
        </el-aside>
        <el-container style="height: 100%">
            <el-header style="font-size: 14px;">
                <el-button-group>
                    <el-button type="primary" v-on:click="OnClickOpenSource()">打开源码</el-button>
                    <el-button type="primary" v-on:click="OnClickOpenFolder()">打开目录</el-button>
                </el-button-group>
                <br>
                <br>
                <img v-bind:src="iconUrl" style="float: left; margin-right: 5px;"/>
                <div style="float: left;">
                    <span>应用名称 : {{ fileInfo.label }}</span>&nbsp;&nbsp;
                    <span>应用标识 : {{ fileInfo.bundle }}</span>
                    <br/>
                    <span>版本名称 : {{ fileInfo.versionName }}</span>&nbsp;&nbsp;
                    <span>版本号 : {{ fileInfo.versionCode }}</span>&nbsp;&nbsp;
                    <br/>
                    <span>最小支持版本 : {{ getAndroidVersion(fileInfo.sdkVersion) }}</span>
                </div>

            </el-header>
            <el-main>
                <img style="background-color: white" v-bind:src="imageUrl"/>
                <pre><code style="color: black; font-size: 14px;">{{ mainEditor }}</code></pre>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
    import { Util } from "../common/Util"
    import fs from 'fs';
    import { shell } from 'electron';
    export default {
        mounted() {
            Util.event.on("updateInfo", (info) => {
                this.fileInfo = info
                this.iconUrl = Util.getAppIcon(info)
                this.refreshTreeList()
            })
        },
        data() {
            return {
                fileInfo : {},              //当前打开apk的详细信息
                iconUrl : "",               //当前打开app 的 icon
                imageUrl : "",              //屏幕中间显示Image
                mainEditor : "",            //屏幕中间显示内容
                defaultProps: {
                    children: 'children',
                    label: 'label'
                },
                treeData: [],
                fileList: []
            }
        },
        methods: {
            getAndroidVersion : function(version) {
                return Util.getAndroidVersion(version)
            },
            refreshTreeList : async function() {
                var path = Util.apkPath + "/" + this.fileInfo.name + "/source";
                var data = []
                await this.refreshTreeList_impl(path, "", data);
                this.treeData = data
            },
            refreshTreeList_impl : async function(path, relativePath, arr) {
                var files = await Util.readdir(path);
                for (var file of files) {
                    var fullFile = path + "/" + file;
                    var relativeFile = relativePath + "/" + file;
                    var info = fs.statSync(fullFile);
                    if (info.isDirectory()) {
                        var children = []
                        await this.refreshTreeList_impl(fullFile, relativeFile, children);
                        arr.push({
                            "label" : file,
                            "file" : false,
                            "children" : children
                        })
                    } else {
                        arr.push({
                            "label" : file,
                            "file" : true,
                            "relativePath" : relativeFile,
                            "path" : fullFile
                        })
                    }
                }
            },
            OnClickTree: async function(data) {
                if (data.file) {
                    if (data.path.endWith(".png") || data.path.endWith(".jpg") || data.path.endWith(".ico")) {
                        this.imageUrl = Util.apkPath + "/" + this.fileInfo.name + "/source/" + data.relativePath
                        this.mainEditor = ""
                    } else {
                        this.imageUrl = ""
                        this.mainEditor = await Util.readFile(data.path)
                    }
                }
            },
            OnClickOpenSource : function() {
                Util.execute("java -jar jd-gui.jar " + Util.apkPath + "/" + this.fileInfo.name + "/source.jar", "jd-gui");
            },
            OnClickOpenFolder : function() {
                shell.showItemInFolder(Util.apkPath + "/" + this.fileInfo.name + "/source");
            }
        }
    }
</script>
<style>

</style>
