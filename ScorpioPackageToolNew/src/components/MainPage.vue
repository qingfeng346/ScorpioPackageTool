<template>
    <el-container style="height: 100%; border: 0px solid #eee">
        <el-aside :width="menuWidth">
            <el-button type="text" style="padding: 20px 20px 15px 22px" @click="OnClickSwitchMenu">
                <i class="el-icon-menu" style="font-size: 20px; margin: 0px 10px 0px 0px"></i>
            </el-button>
            <el-menu default-active="file" @select="OnSelectMenu" :collapse="isMenuCollapse">
                <el-menu-item index="file">
                    <i class="el-icon-tickets"></i>
                    <span slot="title">文件解析</span>
                </el-menu-item>
                <el-menu-item index="operate">
                    <i class="el-icon-setting"></i>
                    <span slot="title">安卓设备管理(测试)</span>
                </el-menu-item>
                <el-menu-item index="resign" disabled="">
                    <i class="el-icon-edit"></i>
                    <span slot="title">ipa重新签名(开发中)</span>
                </el-menu-item>
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
                isMenuCollapse: false,
                menuWidth: "180px",
            }
        },
        methods: {
            OnSelectMenu: function(index) {
                if (index == "more") { return }
                if (this.activeMenu == index) { return; }
                this.activeMenu = index
                Util.activeMenu = index
            },
            OnClickSwitchMenu : function() {
                this.isMenuCollapse = !this.isMenuCollapse
                this.menuWidth = this.isMenuCollapse ? "52px" : "180px"
            }
        }
    }
</script>


