'use strict'

import fs from 'fs'
import os from 'os'
import path from 'path'

import { app, protocol, BrowserWindow, ipcMain, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

const Database = require("nedb");
const customerDB = new Database({ filename: "db/customer", autoload: true });
const incomeDB = new Database({ filename: "db/income", autoload: true });
const expenceItemDB = new Database({ filename: "db/expenceItem", autoload: true });
const expenceDB = new Database({ filename: "db/expence", autoload: true });

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 1100,
    minHeight: 700,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      plugins: true,
      preload: path.resolve(__dirname, 'preload.js'),
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS3_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

ipcMain.handle('getCustomerList', async (event, condition, sort) => {
  customerDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    customerDB
      .find(condition)
      .sort(sort)
      .exec(function (err, res) {
        if (err) return reject(err);
        resolve(res);
      });
  });
});

ipcMain.handle('getCustomerDataById', async (event, customerId) => {
  customerDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    customerDB.loadDatabase();
    customerDB.findOne({ customerId: customerId }, async function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
});

ipcMain.handle('insertCustomer', async (event, content) => {
  customerDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    customerDB.loadDatabase();
    customerDB.insert(content, function (err, num) {
      if (err) return reject(err);
      resolve(num);
    });
  });
});

ipcMain.handle('updateCustomer', async (event, customerId, updateContent) => {
  customerDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    customerDB.loadDatabase();
    customerDB.update(
      { customerId: customerId },
      { $set: updateContent }
    );
  });
});

ipcMain.handle('deleteCustomer', async (event, condition, multi) => {
  customerDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    customerDB.loadDatabase();
    customerDB.remove(condition, { multi: multi }, function (err, numRemoved) {
      if (err) return reject(err);
      resolve(numRemoved);
    });
  });
});

ipcMain.handle('getIncomeList', async (event, condition, sort) => {
  incomeDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    incomeDB.find(condition).sort(sort).exec(function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
});

ipcMain.handle('getIncomeData', async (event, condition) => {
  incomeDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    incomeDB.findOne(condition).exec(function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
});

ipcMain.handle('insertIncome', async (event, content) => {
  incomeDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    incomeDB.insert(content, function (err, num) {
      if (err) return reject(err);
      resolve(num);
    });
  });
});

ipcMain.handle('updateIncome', (event, condition, updateContent) => {
  incomeDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    incomeDB.update(condition, { $set: updateContent }, function (err, num) {
      if (err) return reject(err);
      resolve(num);
    });
  });
});

ipcMain.handle('deleteIncome', async (event, condition, multi) => {
  incomeDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    incomeDB.remove(
      condition,
      { multi: multi },
      function (err, numRemoved) {
        if (err) return reject(err);
        resolve(numRemoved);
      }
    );
  });
});

ipcMain.handle('getExpenceList', async (event, condition, sort) => {
  expenceDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceDB.find(condition).sort(sort).exec(function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
});

ipcMain.handle('getExpenceDataById', async (event, _id) => {
  expenceDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceDB.findOne({ _id: _id }, async function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
});

ipcMain.handle('insertExpence', async (event, content) => {
  expenceDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceDB.loadDatabase();
    expenceDB.insert(content, function (err, num) {
      if (err) return reject(err);
      resolve(num);
    });
  });
});

ipcMain.handle('updateExpence', (event, _id, updateContent) => {
  expenceDB.loadDatabase();
  expenceDB.update(
    { _id: _id },
    { $set: updateContent }
  );
});

ipcMain.handle('deleteExpence', async (event, condition, multi) => {
  expenceDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceDB.remove(condition, { multi: multi }, function (err, numRemoved) {
      if (err) return reject(err);
      resolve(numRemoved);
    });
  });
});

ipcMain.handle('getExpenceItemList', async (event, condition, sort) => {
  expenceItemDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceItemDB.find(condition).sort(sort).exec(function (err, res) {
      if (err) return reject(err);
      res.expenceItemRate = res.expenceItemRate * 100;
      resolve(res);
    });
  });
});

ipcMain.handle('getExpenceItemDataById', async (event, expenceItemId) => {
  expenceItemDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceItemDB.findOne({ expenceItemId: expenceItemId }, function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
});

ipcMain.handle('insertExpenceItem', async (event, content) => {
  expenceItemDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceItemDB.loadDatabase();
    expenceItemDB.insert(content, function (err, num) {
      if (err) return reject(err);
      resolve(num);
    });
  });
});

ipcMain.handle('updateExpenceItem', (event, expenceItemId, updateContent) => {
  expenceItemDB.loadDatabase();
  expenceItemDB.update(
    { expenceItemId: expenceItemId },
    { $set: updateContent }
  );
});

ipcMain.handle('deleteExpenceItem', async (event, condition, multi) => {
  expenceItemDB.loadDatabase();
  return new Promise(function (resolve, reject) {
    expenceItemDB.remove(condition, { multi: multi }, function (err, numRemoved) {
      if (err) return reject(err);
      resolve(numRemoved);
    });
  });
});

/**
 * PDF作成処理
 */
ipcMain.handle('exportPdf', async (event, copyPath, year, title) => {
  // 作成するPDFの保存パスを指定
  const win = BrowserWindow.fromWebContents(event.sender)
  const data = await win.webContents.printToPDF({ pageSize: 'A4', landscape: false });
  const focusedWindow = BrowserWindow.getFocusedWindow();
  if (!copyPath) {
    const pdfPath = dialog.showSaveDialogSync(focusedWindow, {
      defaultPath: path.join(os.homedir(), "Desktop", today() + "_" + year + "年度" + title + ".pdf"),
      filters: [
        { name: 'PDFファイル', extensions: ['pdf'] },
      ],
      properties: [
        'createDirectory',
      ]
    });
    if (!pdfPath) return null;
    fs.writeFileSync(pdfPath, data);
    console.log(`Wrote PDF successfully to ${pdfPath}`)
    return pdfPath;
  } else {
    const pdfPath = copyPath.replace(".pdf", "(控).pdf");
    fs.writeFileSync(pdfPath, data);
    console.log(`Wrote PDF successfully to ${pdfPath}`)
    return pdfPath;
  }
});

const today = function () {
  const dt = new Date();
  return dt.getFullYear() + ("00" + (dt.getMonth() + 1)).slice(-2) + ("00" + dt.getDate()).slice(-2)
}

/**
 * データ保存処理
 */
ipcMain.handle('saveFile', (event, args) => {
  // 作成するJSONの保存パスを指定
  const focusedWindow = BrowserWindow.getFocusedWindow();
  const jsonPath = dialog.showSaveDialogSync(focusedWindow, {
    defaultPath: path.join(os.homedir(), "Desktop", today() + "_balanceData.json"),
    filters: [
      { name: 'JSONファイル', extensions: ['json'] },
    ],
    properties: [
      'createDirectory',
    ]
  });
  if (!jsonPath) {
    return null;
  }
  fs.writeFileSync(jsonPath, JSON.stringify(args));
  console.log(`Wrote savedata successfully to ${jsonPath}`)
  return jsonPath;
});

/**
 * データ読込処理
 */
ipcMain.on('loadFile', (event) => {
  // 読み込むJSONのパスを指定
  const focusedWindow = BrowserWindow.getFocusedWindow();

  const filePath = dialog.showOpenDialogSync(focusedWindow, {
    properties: ['openFile'], filters: [{
      name: 'JSONファイル',
      extensions: ['json']
    }]
  });

  if (!filePath) {
    event.returnValue = null;
    return;
  }

  const textContent = fs.readFileSync(filePath[0]);
  const content = JSON.parse(textContent.toString());
  incomeDB.loadDatabase();
  incomeDB.insert(content.income);
  customerDB.loadDatabase();
  customerDB.insert(content.customer);
  expenceDB.loadDatabase();
  expenceDB.insert(content.expence);
  expenceItemDB.loadDatabase();
  expenceItemDB.insert(content.expenceItem);

  event.returnValue = "インポートしました。";
  return;
});

const Config = require('electron-config');

/**
 * 設定読み込み
 */
ipcMain.handle('readSettings', (event, names) => {
  const result = {};
  const config = new Config();
  for (let name of names) {
    result[name] = config.get(name);
  }
  return result;
});

/**
 * 設定書き込み
 */
ipcMain.on('saveSettings', (event, vals) => {
  const config = new Config();
  for (let key in vals) {
    config.set(key, vals[key]);
  }
  event.returnValue = true;
  return;
});