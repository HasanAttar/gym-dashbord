const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./database');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers
ipcMain.handle('add-client', async (event, client) => {
  return new Promise((resolve, reject) => {
    db.addClient(client, function (err) {
      if (err) reject(err);
      else resolve({ success: true });
    });
  });
});

ipcMain.handle('get-clients', async () => {
  return new Promise((resolve, reject) => {
    db.getClients((err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});
ipcMain.handle('delete-client', (e, id) => {
    return new Promise((res, rej) => {
      db.deleteClient(id, (err) => (err ? rej(err) : res()));
    });
  });
  
  ipcMain.handle('update-client', (e, client) => {
    return new Promise((res, rej) => {
      db.updateClient(client, (err) => (err ? rej(err) : res()));
    });
  });
  