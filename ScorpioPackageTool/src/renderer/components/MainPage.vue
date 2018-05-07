<template>
    <el-container>
        <el-aside width="0px"></el-aside>
        <el-main>
            <el-button type="primary" @click="TestClick()">efwefwaefwaefawef</el-button>
        </el-main>
    </el-container>
</template>
<script>
    import { Util } from "../common/Util"
    import { console } from '../common/logger';
    export default {
        name:"main-page",
        methods: {
            TestClick : function() {
                Util.showOpenDialog({
                    filters: [ {name: 'apk and ipa', extensions: ['apk', 'ipa'] }],
                    properties: ['openFile']
                }, 
                null,
                (files, args) => {
                    console.log("files = " + JSON.stringify(files));
                });
            }
        }
    }
</script>
<style>

</style>


