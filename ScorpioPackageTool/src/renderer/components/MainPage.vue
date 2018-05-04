<template>
    <el-container>
        <el-aside width="200px"></el-aside>
        <el-main>
            <el-button type="primary" @click="TestClick()">efwefwaefwaefawef</el-button>
        </el-main>
    </el-container>
</template>
<script>
    export default {
        name:"main-page",
        methods: {
            TestClick : function() {
                this.$message("wwwwwwwwwwww")
            }
        }
    }
</script>
<style>

</style>


