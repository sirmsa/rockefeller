const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App information
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppName: () => ipcRenderer.invoke('get-app-name'),
  
  // Trading bot methods
  getApiKeys: () => ipcRenderer.invoke('get-api-keys'),
  startBot: (config) => ipcRenderer.invoke('start-bot', config),
  stopBot: (botId) => ipcRenderer.invoke('stop-bot', botId),
  
  // Database methods (to be implemented)
  getTrades: () => ipcRenderer.invoke('get-trades'),
  getBalance: () => ipcRenderer.invoke('get-balance'),
  saveApiKey: (apiKey) => ipcRenderer.invoke('save-api-key', apiKey),
  
  // System methods
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close'),
  
  // File system methods (to be implemented)
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),
  
  // Logging methods
  log: (level, message) => ipcRenderer.invoke('log', level, message)
});
