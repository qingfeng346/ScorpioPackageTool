<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-aside width="150px" style="background-color: rgb(238, 241, 246)">
            <el-menu v-model="activeMenu" default-active="activeMenu"  @select="OnSelectMenu">
                <el-menu-item index="file">
                    <i class="el-icon-tickets"></i>
                    <span slot="title">文件</span>
                </el-menu-item>
                <el-menu-item index="operate">
                    <i class="el-icon-menu"></i>
                    <span slot="title">操作</span>
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
                activeMenu : "file",
                logTag : "",
                activeName : "list",
                showApp : false,
                logOutput : "",
            }
        },
        methods: {
            OnSelectMenu: function(index) {
                console.log("================= " + index)
                console.log("================= " + this.activeMenu)
            },
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


