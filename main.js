'use strict';

const { app, BrowserWindow, ipcMain, IpcMessageEvent, ipcRenderer, globalShortcut } = require('electron');

const path = require('path');

var open = require("open");

// normalize shortcuts for each os
const normalize = require("electron-shortcut-normalizer")

normalize('Ctrl+A')
// => 'CommandOrControl+A'

normalize('CommandOrControl+Z', process.platform)
// => 'Command+Z' on Mac OS X
// => 'Control+Z' on Windows and Linux

normalize('CmdOrCtrl+a', 'darwin')
// => 'Command+A'

normalize('CmdOrCtrl+a', 'win32')
// => 'Control+A'

// `Option` is unique to Mac OS X, so it's normalized to `Alt`:
normalize('Option+Up')
// => 'Alt+Up'

// const fs = require('fs');

// let Router = require('electron-router');
// // var server = require('./express');
// let router = Router('MAIN');

let win;

// var remote = require('remote'); // Load remote compnent that contains the dialog dependency
// var dialog = remote.require('dialog'); // Load the dialogs component of the OS

function createWindow() {
  // Create the browser window.

  win = new BrowserWindow({
    frame: false,
    // width: 600,
    // height: 600,
    backgroundColor: '#ffffff',
    icon: `file://${__dirname}/dist/assets/logo.png`
  })

  win.loadURL(`file://${__dirname}/dist/index.html`)

  //// uncomment below to open the DevTools.
  win.webContents.openDevTools()

  // Event when the window is closed.
  win.on('closed', function () {
    win = null
  })
}

// add button
ipcMain.on('add-data', function (event, argument) {
  //event.sender is of type webContents, more on this later
  //argument is 'myArgument'

  console.log(argument);

  //  path.join('app/libs/oauth', '/../ssl')ss

  const fs = require('fs');

  // var newButton = JSON.stringify(argument);
  // // var oldFile = [];
  // var newFile;

  var filepath = __dirname.slice(0, -4) + '/app/src/assets/storage/buttons.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg
  // var filepath = path.join(__dirname, '/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg

  fs.readFile(filepath, function read(err, data) {

    var oldFile = [];

    oldFile = JSON.parse(data);

    oldFile.push(argument);

    if (err) {
      throw err;
    }

    if (argument.shortcut) {

      globalShortcut.unregister(argument.shortcut);

      var urlList = []
      urlList.push(argument.url);

      for (let j = 0; j < oldFile.length; j++) {
        if (oldFile[j].shortcut === argument.shortcut &&
          oldFile[j].url !== argument.url) {
          urlList.push(oldFile[j].url)
        }
      }

      if (argument.shortcut) {
        globalShortcut.register(argument.shortcut, () => {
          for (let k = 0; k < urlList.length; k++) {
            open(urlList[k], "chrome");
          }
        });
      }
    }

    oldFile = JSON.stringify(oldFile);

    fs.writeFileSync(filepath, oldFile, (err) => {
      if (err) {
        console.log("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      alert("The file has been succesfully saved");
    });
  });
});

// update button
ipcMain.on('update-data', function (event, argument) {
  //event.sender is of type webContents, more on this later
  //argument is 'myArgument'

  console.log(argument);

  //  path.join('app/libs/oauth', '/../ssl')ss

  const fs = require('fs');

  // TODO make this global
  var filepath = __dirname.slice(0, -4) + '/app/src/assets/storage/buttons.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg
  // var filepath = path.join(__dirname, '/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg

  fs.readFile(filepath, function read(err, data) {

    var oldFile = [];

    if (err) {
      throw err;
    }

    oldFile = JSON.parse(data);

    for (let i = 0; i < oldFile.length; i++) {
      if (oldFile[i].id === argument.id) {
        if (argument.shortcut) {
          if (oldFile[i].shortcut !== argument.shortcut) {
            globalShortcut.unregister(oldFile[i].shortcut);
            globalShortcut.register(argument.shortcut, () => {
              open(argument.url, "chrome");
            });
          }
        }
        oldFile[i] = argument;
      }
    }

    oldFile = JSON.stringify(oldFile);

    fs.writeFileSync(filepath, oldFile, (err) => {
      if (err) {
        console.log("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      alert("The file has been succesfully saved");
    });
  });
});

// Delete Button
ipcMain.on('delete-data', function (event, argument) {
  //event.sender is of type webContents, more on this later
  //argument is 'myArgument'

  console.log(argument);

  //  path.join('app/libs/oauth', '/../ssl')ss

  const fs = require('fs');

  // var newButton = JSON.stringify(argument);
  // // var oldFile = [];
  // var newFile;

  var filepath = __dirname.slice(0, -4) + '/app/src/assets/storage/buttons.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg
  // var filepath = path.join(__dirname, '/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg

  fs.readFile(filepath, function read(err, data) {

    var oldFile = [];

    if (err) {
      throw err;
    }

    oldFile = JSON.parse(data);

    oldFile = oldFile.filter(button => {
      return argument.id === button.id ? false : true;
    });

    if (argument.shortcut) {
      // todo create shared method
      var urlList = []
      for (let j = 0; j < oldFile.length; j++) {
        if (oldFile[j].shortcut === argument.shortcut &&
          oldFile[j].url !== argument.url) {
          urlList.push(oldFile[j].url)
        }
      }

      if (argument.shortcut) {
        globalShortcut.register(argument.shortcut, () => {
          for (let k = 0; k < urlList.length; k++) {
            open(urlList[k], "chrome");
          }
        });
      }

    }

    oldFile = JSON.stringify(oldFile);

    fs.writeFileSync(filepath, oldFile, (err) => {
      if (err) {
        console.log("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      alert("The file has been succesfully saved");
    });
  });
});

// Add tab
ipcMain.on('tabs-data', function (event, argument) {

  console.log(argument);

  //  path.join('app/libs/oauth', '/../ssl')ss

  const fs = require('fs');

  // var newButton = JSON.stringify(argument);
  // // var oldFile = [];
  // var newFile;

  var filepath = __dirname.slice(0, -4) + '/app/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg
  // var filepath = path.join(__dirname, '/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg

  fs.readFile(filepath, function read(err, data) {

    var oldFile = [];

    if (err) {
      throw err;
    }

    oldFile = JSON.parse(data);

    oldFile.push(argument);

    oldFile = JSON.stringify(oldFile);

    fs.writeFileSync(filepath, oldFile, (err) => {
      if (err) {
        console.log("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      alert("The file has been succesfully saved");
    });
  });
});

// Delete Tab
ipcMain.on('tabs-delete', function (event, argument) {

  console.log(argument);

  //  path.join('app/libs/oauth', '/../ssl')ss

  const fs = require('fs');

  // var newButton = JSON.stringify(argument);
  // // var oldFile = [];
  // var newFile;

  var filepath = __dirname.slice(0, -4) + '/app/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg
  // var filepath = path.join(__dirname, '/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg

  fs.readFile(filepath, function read(err, data) {

    var oldFile = [];

    if (err) {
      throw err;
    }

    oldFile = JSON.parse(data);

    oldFile = oldFile.filter(tab => {
      return argument.name === tab.name ? false : true;
    });

    oldFile = JSON.stringify(oldFile);

    fs.writeFileSync(filepath, oldFile, (err) => {
      if (err) {
        console.log("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      alert("The file has been succesfully saved");
    });
  });
});

// update settings
ipcMain.on('update-settings', function (event, argument) {
  //event.sender is of type webContents, more on this later
  //argument is 'myArgument'

  console.log(argument);

  //  path.join('app/libs/oauth', '/../ssl')ss

  const fs = require('fs');

  // TODO make this global
  var filepath = __dirname.slice(0, -4) + '/app/src/assets/storage/settings.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg
  // var filepath = path.join(__dirname, '/src/assets/storage/tabs.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg

  fs.readFile(filepath, function read(err, data) {

    var oldFile;

    if (err) {
      throw err;
    }

    oldFile = JSON.parse(data);
    oldFile.theme = argument.theme;
    oldFile.buttonSize = argument.buttonSize;
    oldFile = JSON.stringify(oldFile)

    fs.writeFileSync(filepath, oldFile, (err) => {
      if (err) {
        console.log("An error ocurred updating the file" + err.message);
        console.log(err);
        return;
      }

      alert("The file has been succesfully saved");
    });
  });
});

// Create window on electron intialization
app.on('ready', function () {
  createWindow();

  var filepath = __dirname.slice(0, -4) + '/app/src/assets/storage/buttons.json';// you need to save the filepath when you open the file to update without use the filechooser dialog againg

  const fs = require('fs');
  fs.readFile(filepath, function read(err, data) {

    var oldFile = [];

    if (err) {
      throw err;
    }

    oldFile = JSON.parse(data);

    // TODO add logic to open same diff urls with same command

    for (let i = 0; i < oldFile.length; i++) {
      if (oldFile[i].shortcut) {
        globalShortcut.register(oldFile[i].shortcut, () => {
          open(oldFile[i].url, "chrome");
          for (let j = 0; j < oldFile.length; j++) {
            if (oldFile[j].shortcut === oldFile[i].shortcut &&
              oldFile[j].url !== oldFile[i].url) {
              open(oldFile[j].url, "chrome");
            }
          }
        });
      }
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {

  // On macOS specific close process
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  // macOS specific close process
  if (win === null) {
    createWindow()
  }
});

// WINDOWS WINDOW FUNCTIONS
ipcMain.on('hide', function () {
  win.close();
});

ipcMain.on('minimize', function () {
  win.minimize();
});

ipcMain.on('maximize', function () {
  win.isMaximized() ? win.unmaximize() : win.maximize();
});