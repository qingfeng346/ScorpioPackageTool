<template>
    <el-table :data="fileList" style="width: 100%" border="" >
        <el-table-column prop="name" label="名称" width="180"></el-table-column>
        <el-table-column prop="label" label="应用名" width="150"></el-table-column>
        <el-table-column prop="bundle" label="Bundle Identifier" width="180"></el-table-column>
        <el-table-column prop="versionName" label="版本" width="80"></el-table-column>
        <el-table-column prop="versionCode" label="版本" width="60"></el-table-column>
        <el-table-column prop="sdkVersion" :formatter="formatSdkVersion" label="最低支持版本" width="110"></el-table-column>
        <el-table-column label="操作" width="180">
            <!-- <template slot-scope="data">
                <el-button size="mini" @click="handleOpenFile(data.row)">打开</el-button>
                <el-button size="mini" type="danger" @click="handleDeleteFile(data.row)">删除</el-button>
            </template> -->
        </el-table-column>
    </el-table>
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
