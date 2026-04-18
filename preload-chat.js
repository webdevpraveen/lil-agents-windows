const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  closeWindow:        ()                    => ipcRenderer.send('close-window'),
  minimizeWindow:     ()                    => ipcRenderer.send('minimize-window'),
  expandChat:         (charId, messages)    => ipcRenderer.send('expand-chat', { charId, messages }),
  openExternal:       (url)                 => ipcRenderer.send('open-external', url),
  getConfig:          ()                    => ipcRenderer.invoke('get-config'),
  saveConfig:         (cfg)                 => ipcRenderer.invoke('save-config', cfg),
  sendMessage:        (data)                => ipcRenderer.invoke('send-message', data),
  onRestoreMessages:  (cb) => ipcRenderer.on('restore-messages', (_, msgs) => cb(msgs)),
})
