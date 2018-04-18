const app = require('electron').app
const dialog = require('electron').dialog
const ipcMain = require('electron').ipcMain

ipcMain.on('open-file-dialog', function (event, filters, args) {
    dialog.showOpenDialog({
        filters: filters,
            properties: ['openFile']
        },
        function (files) {
            if (files) event.sender.send('selected-directory', files, args)
        }
    )
})
ipcMain.on('get-app-info', function (event) {
    event.returnValue = {
        path : {
            "appPath" : app.getAppPath(),
            "userData" : app.getPath("userData"),
            "desktop" : app.getPath("desktop"),
            "documents" : app.getPath("documents"),
            "downloads" : app.getPath("downloads"),
            "music" : app.getPath("music"),
            "pictures" : app.getPath("pictures"),
            "videos" : app.getPath("videos"),
            "logs" : app.getPath("logs"),
            "temp" : app.getPath("temp"),
            "exe" : app.getPath("exe")
        },
        name : app.getName(),
        version : app.getVersion(),
        locale : app.getLocale(),
        argv : process.argv
    }
})