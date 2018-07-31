<template>
    <el-container style="height: 100%; border: 1px solid #eee">
        <el-aside width="150px">
            <el-menu default-active="file"  @select="OnSelectMenu">
                <el-menu-item index="file">
                    <i class="el-icon-tickets"></i>
                    <span slot="title">文件</span>
                </el-menu-item>
                <!-- <el-menu-item index="operate">
                    <i class="el-icon-menu"></i>
                    <span slot="title">操作</span>
                </el-menu-item> -->
            </el-menu>
        </el-aside>
        <el-container>
            <FilePage v-show="activeMenu == 'file'"></FilePage>
            <OperatePart v-show="activeMenu == 'operate'"></OperatePart>
            <el-footer style="height: 30px" v-html="logOutput"></el-footer>
        </el-container>
    </el-container>
</template>
<script>
    import { Util } from '../common/Util';
    import { console, logger } from '../common/logger';
    import FilePage from './FilePart/MainPage';
    import OperatePart from './OperatePart/MainPage';
    export default {
        components : { FilePage, OperatePart },
        created() {
            logger.event.on("log", (level, str) => { this.logOutput = str })
        },
        mounted() {
            Util.activeMenu = this.activeMenu
        },
        data() {
            return {
                logOutput : "",
                activeMenu : "file",
            }
        },
        methods: {
            OnSelectMenu: function(index) {
                if (this.activeMenu == index) { return; }
                this.activeMenu = index
                Util.activeMenu = index
            }
        }
    }
</script>


