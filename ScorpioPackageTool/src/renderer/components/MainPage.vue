<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-aside width="150px">
            <el-menu default-active="file"  @select="OnSelectMenu">
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
            <FilePage v-show="activeMenu == 'file'"></FilePage>
            <el-footer style="height: 30px" v-html="logOutput"></el-footer>
        </el-container>
    </el-container>
</template>
<script>
    import FilePage from './FilePart/MainPage';
    import { console, logger } from '../common/logger';
    export default {
        name:"main-page",
        components : { FilePage },
        mounted() {
            logger.event.on("log", (level, str) => {
                this.logOutput = str
            })
        },
        data() {
            return {
                logOutput : "",
                activeMenu : "file",
            }
        },
        methods: {
            OnSelectMenu: function(index) {
                console.log("打开界面 : " + index)
                this.activeMenu = index
            }
        }
    }
</script>


