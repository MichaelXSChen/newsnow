/* eslint-disable ts/no-require-imports */
/* eslint-disable node/prefer-global/process */

const { contextBridge } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Add any APIs you want to expose here
  platform: process.platform,
})
