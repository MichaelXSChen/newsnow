import process from "node:process"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { existsSync } from "node:fs"
import { spawn } from "node:child_process"
import { BrowserWindow, app, ipcMain, shell } from "electron"

let mainWindow: BrowserWindow | null = null
let serverProcess: ReturnType<typeof spawn> | null = null
let isQuitting = false

const __dirname = fileURLToPath(new URL(".", import.meta.url))

const isDev = process.env.NODE_ENV === "development"

function startServer() {
  // Start the Nitro server
  const serverPath = join(__dirname, "../dist/output/server/index.mjs")

  console.log("Starting server at:", serverPath)

  // Check if server file exists
  if (!existsSync(serverPath)) {
    console.error("Server file not found:", serverPath)
    console.error("Please run 'npm run build' or 'npm run dev' first to build the server")
    app.quit()
    return
  }

  // Set working directory based on environment
  // - Development: Use project root (for easy access to source files)
  // - Production: Use userData directory (for persistent data storage)
  // __dirname in dev: /path/to/newsnow/dist
  // __dirname in prod: /path/to/NewsNow.app/Contents/Resources/dist
  const cwd = isDev
    ? join(__dirname, "..") // /path/to/newsnow
    : app.getPath("userData") // ~/Library/Application Support/NewsNow (macOS)

  console.log("Working directory:", cwd)

  serverProcess = spawn("node", [serverPath], {
    cwd,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || "production",
    },
  })

  serverProcess.on("error", (err) => {
    console.error("Failed to start server:", err)
  })

  serverProcess.on("exit", (code, signal) => {
    console.log("Server exited with code:", code, "signal:", signal)

    // If server exits unexpectedly (not during app quit), show error and quit
    if (code !== 0 && !isQuitting) {
      console.error("Server crashed unexpectedly")
      if (mainWindow) {
        mainWindow.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
          <!DOCTYPE html>
          <html>
          <head><title>Server Error</title></head>
          <body style="font-family: sans-serif; text-align: center; padding: 50px;">
            <h1>Server Error</h1>
            <p>The backend server exited unexpectedly with code ${code}</p>
            <p>Please check the console for details and try again.</p>
          </body>
          </html>
        `)}`)
      }
      setTimeout(() => app.quit(), 5000)
    }
  })

  // Wait for server to be ready before creating window
  // Use a health check to verify the server is actually responding
  let checkCount = 0
  const maxChecks = 20 // 10 seconds total (20 * 500ms)

  const checkInterval = setInterval(async () => {
    checkCount++

    if (serverProcess && serverProcess.pid && !serverProcess.killed) {
      try {
        // Try to connect to the server to verify it's ready
        const response = await fetch("http://localhost:3000").catch(() => null)
        if (response && response.ok) {
          clearInterval(checkInterval)
          console.log("Server is ready and responding, creating window...")
          createWindow()
          return
        }
      } catch {
        // Server not ready yet, will retry
      }

      if (checkCount >= maxChecks) {
        clearInterval(checkInterval)
        console.error("Server health check failed after", maxChecks * 500, "ms")
        console.log("Creating window anyway, but it may not work properly...")
        createWindow()
      }
    } else {
      clearInterval(checkInterval)
      console.error("Server process died before starting")
      app.quit()
    }
  }, 500)
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

  // Handle navigation errors (e.g., if server isn't ready)
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription, validatedURL) => {
    console.error("Failed to load:", errorCode, errorDescription, validatedURL)
    if (!isQuitting) {
      mainWindow!.webContents.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html>
        <head><title>Connection Error</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h1>Connection Error</h1>
          <p>Cannot connect to the backend server at ${validatedURL}</p>
          <p>Error: ${errorDescription} (${errorCode})</p>
          <p>The server might still be starting. Please wait a moment and try again.</p>
        </body>
        </html>
      `)}`)
    }
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  // Close app when window is closed (instead of just hiding on macOS)
  mainWindow.on("close", () => {
    if (!isQuitting) {
      isQuitting = true
      if (serverProcess) {
        serverProcess.kill()
      }
      app.quit()
    }
  })
}

// Handle open-external requests from renderer
ipcMain.on("open-external", (_event, url: string) => {
  shell.openExternal(url).catch((err) => {
    console.error("Failed to open external URL:", err)
  })
})

app.on("ready", () => {
  startServer()
})

app.on("window-all-closed", () => {
  // On macOS, the app and its menu bar stay active unless the user quits explicitly
  // But for NewsNow, we quit when all windows are closed
  isQuitting = true
  if (serverProcess) {
    serverProcess.kill()
  }
  app.quit()
})

app.on("before-quit", () => {
  // Cleanup server before quit
  isQuitting = true
  if (serverProcess) {
    serverProcess.kill()
  }
})

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
