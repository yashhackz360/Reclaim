const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('reclaim', {
  getStore:       ()    => ipcRenderer.invoke('get-store'),
  toggleRule:     (key) => ipcRenderer.invoke('toggle-rule', key),
  getHostsStatus: ()    => ipcRenderer.invoke('get-hosts-status'),
});
