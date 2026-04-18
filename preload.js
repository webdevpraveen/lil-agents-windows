const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  setIgnoreMouse:  (ignore)         => ipcRenderer.send('set-ignore-mouse', ignore),
  openMiniChat:    (charId, charX)  => ipcRenderer.send('open-mini-chat', { charId, charX }),
  openExternal:    (url)            => ipcRenderer.send('open-external', url),
  onChatClosed:    (cb) => ipcRenderer.on('chat-closed',    (_, charId) => cb(charId)),
  onScreenResize:  (cb) => ipcRenderer.on('screen-resize',  (_, w)      => cb(w)),
})
