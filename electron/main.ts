import process from "node:process"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { spawn } from "node:child_process"
import { BrowserWindow, app } from "electron"

let mainWindow: BrowserWindow | null = null
let serverProcess: ReturnType<typeof spawn> | null = null

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const isDev = process.env.NODE_ENV === "development"

function startServer() {
  // Start the Nitro server
  const serverPath = join(__dirname, "../dist/output/server/index.mjs")

  console.log("Starting server at:", serverPath)

  serverProcess = spawn("node", [serverPath], {
    cwd: join(__dirname, ".."),
    stdio: "inherit",
  })

  serverProcess.on("error", (err) => {
    console.error("Failed to start server:", err)
  })

  serverProcess.on("exit", (code) => {
    console.log("Server exited with code:", code)
  })

  // Wait a bit for the server to start
  setTimeout(() => {
    createWindow()
  }, 2000)
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, "preload.js"),
    },
    title: "NewsNow",
  })

  // Load from the local Nitro server
  mainWindow.loadURL("http://localhost:3000")

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })
}

app.on("ready", () => {
  startServer()
})

app.on("window-all-closed", () => {
  // Stop server when all windows are closed
  if (serverProcess) {
    serverProcess.kill()
  }
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("before-quit", () => {
  // Cleanup server before quit
  if (serverProcess) {
    serverProcess.kill()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
