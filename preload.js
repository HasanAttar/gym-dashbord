const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    addClient: (client) => ipcRenderer.invoke('add-client', client),
    getClients: () => ipcRenderer.invoke('get-clients'),
    deleteClient: (id) => ipcRenderer.invoke('delete-client', id),
    updateClient: (client) => ipcRenderer.invoke('update-client', client)
  });
  