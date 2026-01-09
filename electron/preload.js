/* eslint-disable ts/no-require-imports */
/* eslint-disable node/prefer-global/process */

const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  openExternal: (url) => {
    ipcRenderer.send("open-external", url)
  },
})
