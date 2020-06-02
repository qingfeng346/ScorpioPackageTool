import { app, dialog, ipcMain } from "electron";

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
ipcMain.on("showOpenDialog", (event, options, args) => {
  dialog.showOpenDialog(options, (files) => {
    if (files) event.sender.send("showOpenDialogResult", files, args);
  });
});
ipcMain.on("showMessageBox", (event, options) => {
  dialog.showMessageBox(options, (index) => {
    event.sender.send("showMessageBoxResult", index)
  })
})
ipcMain.on('getAppInfo', function (event) {
  event.returnValue = {
    path: {
      'appPath': app.getAppPath(),
      'userData': app.getPath('userData'),
      'desktop': app.getPath('desktop'),
      'documents': app.getPath('documents'),
      'downloads': app.getPath('downloads'),
      'music': app.getPath('music'),
      'pictures': app.getPath('pictures'),
      'videos': app.getPath('videos'),
      'temp': app.getPath('temp'),
      'exe': app.getPath('exe'),
      'cwd' : process.cwd()
    },
    env : process.env,
    versions : process.versions,
    name: app.name,
    version: app.getVersion(),
    locale: app.getLocale(),
    argv: process.argv
  }
})
