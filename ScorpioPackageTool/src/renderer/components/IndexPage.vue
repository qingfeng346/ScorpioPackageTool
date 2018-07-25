<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">
            <el-menu default-active="1-4-1">
                <el-submenu index="1">
                    <template slot="title">
                    <i class="el-icon-location"></i>
                    <span slot="title">导航一</span>
                    </template>
                    <el-menu-item-group>
                    <span slot="title">分组一</span>
                    <el-menu-item index="1-1">选项1</el-menu-item>
                    <el-menu-item index="1-2">选项2</el-menu-item>
                    </el-menu-item-group>
                    <el-menu-item-group title="分组2">
                    <el-menu-item index="1-3">选项3</el-menu-item>
                    </el-menu-item-group>
                    <el-submenu index="1-4">
                    <span slot="title">选项4</span>
                    <el-menu-item index="1-4-1">选项1</el-menu-item>
                    </el-submenu>
                </el-submenu>
                <el-menu-item index="2">
                    <i class="el-icon-menu"></i>
                    <span slot="title">导航二</span>
                </el-menu-item>
                <el-menu-item index="3" disabled>
                    <i class="el-icon-document"></i>
                    <span slot="title">导航三</span>
                </el-menu-item>
                <el-menu-item index="4">
                    <i class="el-icon-setting"></i>
                    <span slot="title">导航四</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-container>
            <el-main>
                <ListPart v-show="activeName == 'list'"></ListPart>
                <PackagePart v-show="activeName == 'app'"></PackagePart>
            </el-main>
            <el-footer style="height: 30px" v-html="logOutput">feawfaewfaewfaewfaewfaewfaewfaewfaewfaewf</el-footer>
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
            logger.event.on("log", (level, str) => {
                this.logOutput = str
            })
        },
        data() {
            return {
                logTag : "",
                activeName : "list",
                showApp : false,
                logOutput : "",
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


