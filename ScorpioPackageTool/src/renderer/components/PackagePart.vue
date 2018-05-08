<template>
    <el-container>
        <el-aside width="220px" style="background-color: rgb(238, 241, 246)">
            <el-tree :data="treeData" :props="defaultProps" empty-text="正在加载文件列表..." @node-click="OnClickTree"></el-tree>
        </el-aside>
        <el-container>
            <el-header style="font-size: 14px;min-width: 800px;">
            <img v-bind:src="iconUrl" style="float: left; margin-right: 5px;"/>
            <div style="float: left;">
                <span>应用名称 : {{ fileInfo.label }}</span>&nbsp;&nbsp;
                <span>应用标识 : {{ fileInfo.bundle }}</span>
                <br/>
                <span>版本名称 : {{ fileInfo.versionName }}</span>&nbsp;&nbsp;
                <span>版本号 : {{ fileInfo.versionCode }}</span>&nbsp;&nbsp;
                <br/>
                <span>最小支持版本 : {{ fileInfo.sdkVersion }}</span>
            </div>
            <el-button-group>
                <el-button type="primary" v-on:click="OnClickOpenSource()">打开源码</el-button>
                <el-button type="primary" v-on:click="OnClickOpenFolder()">打开目录</el-button>
            </el-button-group>
            </el-header>
            <el-main>
            <img style="background-color: white" v-bind:src="imageUrl"/>
            <pre><code style="color: black; font-size: 14px;">{{ mainEditor }}</code></pre>
            </el-main>
            <div style="height: 45px; margin: 0px 20px;">
            <el-switch v-model="autoRoll" active-color="#13ce66" inactive-color="#ff4949" inactive-text="" active-text=""></el-switch>
            <el-button icon="el-icon-delete" circle v-on:click="OnClickClearLog()"></el-button>
            </div>
            <el-footer style="height: 30%;overflow: auto;font-size: 14px;"><pre id="logoutput"></pre></el-footer>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            fileList: []
        }
    },
    methods: {
        formatSdkVersion: function() {
            return "1111"
        }

    }
}
</script>
<style>

</style>
