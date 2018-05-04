<template>
    <el-container>
        <el-aside width="0px"></el-aside>
        <el-main>
            <el-button type="primary" @click="TestClick()">efwefwaefwaefawef</el-button>
        </el-main>
    </el-container>
</template>
<script>
    import Util from "../common/common"
    export default {
        name:"main-page",
        methods: {
            TestClick : function() {
                Util.showMessage("11111111111111")
                //this.$message("wwwwwwwwwwww")
            }
        }
    }
</script>
<style>

</style>


