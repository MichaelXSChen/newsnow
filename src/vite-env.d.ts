/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />
/// <reference lib="webworker" />

interface ElectronAPI {
  platform: string
  openExternal: (url: string) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
