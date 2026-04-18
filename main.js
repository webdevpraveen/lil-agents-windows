const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, shell } = require('electron')
const path = require('path')
const Store = require('./store.js')

// ─────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────
const gotLock = app.requestSingleInstanceLock()
if (!gotLock) { app.quit(); process.exit(0) }

const store = new Store()
let overlayWin = null
let miniWins   = {}   // { sunny | anku | somu } → BrowserWindow
let tray       = null

// ─────────────────────────────────────────────────────────────
// Shared Memory  (all 3 companions read each other's history)
// ─────────────────────────────────────────────────────────────
const MEMORY_LIMIT = 30
let sharedMemory = []   // [{ charId, charName, role, content }]

function rememberExchange(charId, charName, role, content) {
  sharedMemory.push({ charId, charName, role, content })
  if (sharedMemory.length > MEMORY_LIMIT) sharedMemory.shift()
}

function buildFriendContext(excludeId) {
  return sharedMemory
    .filter(e => e.charId !== excludeId && e.role === 'assistant')
    .slice(-8)
    .map(e => `[${e.charName} said]: "${e.content.slice(0, 150)}"`)
    .join('\n')
}

// ─────────────────────────────────────────────────────────────
// Companion Personas
// ─────────────────────────────────────────────────────────────
const PERSONAS = {
  sunny: {
    fullName: 'Sundram', nick: 'Sunny', gender: 'male',
    system: `You are Sunny (Sundram), a bold and energetic male AI companion living on Praveen's Windows desktop.
Your personality: enthusiastic, direct, solution-focused, uses "bhai"/"yaar" naturally, loves challenges.
You know Praveen personally — he is a developer/student who builds cool projects.
Your friend group: Anku (Ankita, female, warm & creative) and Somu (Saumya, female, calm & wise).
The three of you are Praveen's close desktop crew and talk about him when he's not around.`
  },
  anku: {
    fullName: 'Ankita', nick: 'Anku', gender: 'female',
    system: `You are Anku (Ankita), a warm and bubbly female AI companion on Praveen's Windows desktop.
Your personality: friendly, creative, supportive, uses "na"/"yaar" naturally, brings positive energy.
You know Praveen personally — he is a developer/student who builds cool projects.
Your friend group: Sunny (Sundram, male, bold & energetic) and Somu (Saumya, female, calm & wise).
The three of you are Praveen's close desktop crew and talk about him when he's not around.`
  },
  somu: {
    fullName: 'Saumya', nick: 'Somu', gender: 'female',
    system: `You are Somu (Saumya), a calm and wise female AI companion on Praveen's Windows desktop.
Your personality: thoughtful, precise, serene, speaks with quiet confidence, notices details others miss.
You know Praveen personally — he is a developer/student who builds cool projects.
Your friend group: Sunny (Sundram, male, bold & energetic) and Anku (Ankita, female, warm & creative).
The three of you are Praveen's close desktop crew and talk about him when he's not around.`
  }
}

// ─────────────────────────────────────────────────────────────
// Groq API  (free — llama-3.1-8b-instant)
// ─────────────────────────────────────────────────────────────
async function callGroq(apiKey, messages, charId) {
  const p = PERSONAS[charId] || PERSONAS.sunny
  const friendCtx = buildFriendContext(charId)

  const systemPrompt = `${p.system}
${friendCtx ? `\nYour friends recently said to Praveen:\n${friendCtx}\n` : ''}
IMPORTANT RULES:
- Keep replies to 2-3 short sentences max (chat window is compact)
- Stay fully in character as ${p.nick} at all times
- If Praveen mentions a project or task, relate it to your personality
- Never say you are an AI language model or break character`

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: 200,
        temperature: 0.9,
        stream: false
      })
    })

    const data = await res.json()

    if (!res.ok) {
      const msg = data?.error?.message || `HTTP ${res.status}`
      return { success: false, error: msg }
    }

    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) return { success: false, error: 'Empty response from Groq.' }

    return { success: true, text }
  } catch (e) {
    return { success: false, error: `Network error: ${e.message}` }
  }
}

// ─────────────────────────────────────────────────────────────
// Window helpers
// ─────────────────────────────────────────────────────────────
function getWorkArea() {
  const d = screen.getPrimaryDisplay()
  return { ...d.workArea, ...d.workAreaSize }
}

function createOverlay() {
  const { x, y, width, height } = getWorkArea()
  const H = 130

  overlayWin = new BrowserWindow({
    width, height: H,
    x, y: y + height - H,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  overlayWin.setIgnoreMouseEvents(true, { forward: true })
  overlayWin.setAlwaysOnTop(true, 'screen-saver')
  overlayWin.loadFile('overlay.html')

  // Keep on top every 2s (Windows can push it behind)
  const keepTopInterval = setInterval(() => {
    if (!overlayWin || overlayWin.isDestroyed()) { clearInterval(keepTopInterval); return }
    overlayWin.setAlwaysOnTop(true, 'screen-saver')
  }, 2000)

  // Reposition on display/taskbar change
  screen.on('display-metrics-changed', () => {
    if (!overlayWin || overlayWin.isDestroyed()) return
    const { x: nx, y: ny, width: nw, height: nh } = getWorkArea()
    overlayWin.setBounds({ x: nx, y: ny + nh - H, width: nw, height: H })
    overlayWin.webContents.send('screen-resize', nw)
  })
}

function openMiniChat(charId, charX) {
  if (miniWins[charId] && !miniWins[charId].isDestroyed()) {
    miniWins[charId].focus(); return
  }

  const { x: wx, y: wy, width, height } = getWorkArea()
  const W = 320, H = 420
  const charCenterX = wx + charX + 34
  const winX = Math.max(wx + 8, Math.min(Math.round(charCenterX - W / 2), wx + width - W - 8))
  const winY = wy + height - 130 - H - 14

  const win = new BrowserWindow({
    width: W, height: H,
    x: winX, y: winY,
    frame: false,
    transparent: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-chat.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.setAlwaysOnTop(true, 'floating')
  win.loadFile('mini-chat.html', { query: { char: charId } })
  miniWins[charId] = win
  win.on('closed', () => {
    delete miniWins[charId]
    overlayWin?.webContents.send('chat-closed', charId)
  })
}

function expandToFullChat(charId, existingMessages) {
  const prev = miniWins[charId]
  if (prev && !prev.isDestroyed()) prev.close()

  const { x: wx, y: wy, width, height } = getWorkArea()
  const W = 420, H = 620

  const win = new BrowserWindow({
    width: W, height: H,
    x: wx + width - W - 20,
    y: wy + height - H - 140,
    frame: false,
    transparent: false,
    resizable: true,
    skipTaskbar: false,
    alwaysOnTop: false,
    hasShadow: true,
    minWidth: 320, minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload-chat.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  win.loadFile('chat.html', { query: { char: charId } })
  miniWins[charId] = win

  win.webContents.on('did-finish-load', () => {
    if (existingMessages?.length > 0) {
      win.webContents.send('restore-messages', existingMessages)
    }
  })

  win.on('closed', () => {
    delete miniWins[charId]
    overlayWin?.webContents.send('chat-closed', charId)
  })
}

function openSettings() {
  // Don't open duplicate settings windows
  const existing = BrowserWindow.getAllWindows().find(w => w.getTitle() === 'Lil Agents Settings')
  if (existing && !existing.isDestroyed()) { existing.focus(); return }

  const win = new BrowserWindow({
    width: 480, height: 440,
    title: 'Lil Agents Settings',
    frame: false,
    resizable: false,
    center: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload-chat.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  })
  win.loadFile('settings.html')
}

function createTray() {
  try {
    tray = new Tray(nativeImage.createEmpty())
    tray.setToolTip('Lil Agents — Sunny · Anku · Somu')
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: '🤖 Lil Agents', enabled: false },
      { label: "Praveen's crew: Sunny · Anku · Somu", enabled: false },
      { type: 'separator' },
      { label: '⚙️  Settings  (Groq API Key)', click: openSettings },
      { label: '🌐  Get free Groq API key', click: () => shell.openExternal('https://console.groq.com/keys') },
      { type: 'separator' },
      { label: '❌  Quit', click: () => app.quit() }
    ]))
    tray.on('click', () => tray.popUpContextMenu())
  } catch (e) {
    console.warn('Tray creation failed (no icon):', e.message)
  }
}

// ─────────────────────────────────────────────────────────────
// App lifecycle
// ─────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createOverlay()
  createTray()
})

app.on('window-all-closed', e => e.preventDefault())   // keep alive as tray app
app.on('before-quit', () => { if (tray && !tray.isDestroyed()) tray.destroy() })

// ─────────────────────────────────────────────────────────────
// IPC Handlers
// ─────────────────────────────────────────────────────────────
ipcMain.on('set-ignore-mouse', (_, ignore) => {
  overlayWin?.setIgnoreMouseEvents(ignore, { forward: true })
})

ipcMain.on('open-mini-chat', (_, { charId, charX }) => openMiniChat(charId, charX))
ipcMain.on('expand-chat',    (_, { charId, messages }) => expandToFullChat(charId, messages))
ipcMain.on('close-window',   e => BrowserWindow.fromWebContents(e.sender)?.close())
ipcMain.on('minimize-window',e => BrowserWindow.fromWebContents(e.sender)?.minimize())
ipcMain.on('open-external',  (_, url) => shell.openExternal(url))

ipcMain.handle('get-config',   () => ({ apiKey: store.get('apiKey') || '' }))
ipcMain.handle('save-config',  (_, cfg) => { store.set('apiKey', cfg.apiKey); return true })

ipcMain.handle('send-message', async (_, { messages, charId }) => {
  const apiKey = store.get('apiKey') || ''
  if (!apiKey) {
    return { success: false, error: 'No API key set.\nRight-click the taskbar tray icon → Settings.' }
  }

  const result = await callGroq(apiKey, messages, charId)

  if (result.success) {
    const names = { sunny: 'Sunny', anku: 'Anku', somu: 'Somu' }
    const last  = messages[messages.length - 1]
    if (last?.role === 'user') rememberExchange(charId, names[charId], 'user', last.content)
    rememberExchange(charId, names[charId], 'assistant', result.text)
  }

  return result
})
