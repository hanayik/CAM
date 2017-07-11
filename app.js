const electron = require('electron')
const Menu = electron.Menu
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const path = require('path')
const url = require('url')
const dialog = electron.dialog //for OS specific dialog windows
const si = require('systeminformation')
//const ff = require('./camera/ffmpeg')
const appRootDir = require('app-root-dir').get() //get the path of the application bundle
const ffmpeg = appRootDir+'/ffmpeg/ffmpeg'
const exec = require( 'child_process' ).exec
const system = require('system-control')();
const notifier = require('electron-notifications')
const autoUpdater = electron.autoUpdater
const os = require("os");
var ipcMain = require('electron').ipcMain;
var platform = os.platform() + '_' + os.arch();
var version = app.getVersion();
var updateResponse
app.setName("CAM")
//icon credit: http://www.flaticon.com/packs/camp-collection
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 400, height: 600, resizable: false, fullscreenable: false, maximizable: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app.html'),
    protocol: 'file:',
    slashes: true
  }))

  console.log('https://cstar-cam-app.herokuapp.com/'+'update/'+platform+'/'+version)
  autoUpdater.setFeedURL('https://cstar-cam-app.herokuapp.com/'+'update/'+platform+'/'+version);
  autoUpdater.checkForUpdates()

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
  exec('killall ffmpeg')
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('user-requests-update', function() {
  console.log('user requested an update check')
  autoUpdater.checkForUpdates()
})

autoUpdater.on('error', function(err) {
  console.log(err)
})
autoUpdater.on('checking-for-update', function(){
  console.log('checking for update')
})
autoUpdater.on('update-available', function(){
  console.log('update available, downloading now')
  var dialogOptions = {
    type: "question",
    buttons: ["Cancel", "Install"],
    defaultId: 1,
    title: "Install Update",
    message: "Would you like to install the latest version now? If so, the app will download the new version and update itself. It will take a few minutes, depending on your network connection.",
    cancelId: 0
  }
  dialog.showMessageBox(mainWindow, dialogOptions , function (response) {
    updateResponse = response
    if (response == 1) {

    }
  })
})
autoUpdater.on('update-not-available', function(){
  console.log('update not available')
  var dialogOptions = {
    type: "info",
    buttons: ["Ok"],
    defaultId: 0,
    title: "No update available",
    message: "There are no updates available. You have the most recent version!",
    cancelId: 0
  }
  dialog.showMessageBox(mainWindow, dialogOptions , function (response) {
    
  })
})
autoUpdater.on('update-downloaded', function(){
  if (updateResponse == 1) {
    autoUpdater.quitAndInstall()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
