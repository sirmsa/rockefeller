# 🚀 Rockefeller Trading Bot - Desktop App

A desktop application for the Rockefeller Trading Bot built with Electron.

## 🔹 Features

- **Desktop Application**: Native desktop experience
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Secure**: API keys stored locally with encryption
- **Real-time**: Live trading data and bot monitoring
- **Modern UI**: Clean, professional interface

## 🔹 Project Structure

```
app/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Preload script for security
│   └── index.html       # Main application window
├── assets/              # App icons and resources
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## 🔹 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Development

```bash
# Start in development mode (with DevTools)
npm run dev

# Start in production mode
npm start
```

### 3. Build for Distribution

```bash
# Build for current platform
npm run build

# Build for all platforms
npm run dist
```

## 🔹 Development

### Available Scripts

- `npm start` - Start the app in production mode
- `npm run dev` - Start the app in development mode with DevTools
- `npm run build` - Build the app for distribution
- `npm run dist` - Create distributable packages
- `npm run pack` - Package the app without distribution

### Development Workflow

1. **Start Development Server:**
   ```bash
   npm run dev
   ```

2. **Make Changes:**
   - Edit `src/index.html` for UI changes
   - Edit `src/main.js` for main process logic
   - Edit `src/preload.js` for API exposure

3. **Test Changes:**
   - The app will automatically reload on file changes
   - Use DevTools for debugging (available in dev mode)

## 🔹 Architecture

### Main Process (`src/main.js`)
- Creates and manages application windows
- Handles application lifecycle
- Manages IPC communication
- Handles system-level operations

### Renderer Process (`src/index.html`)
- Displays the user interface
- Handles user interactions
- Communicates with main process via IPC
- Runs in a secure sandbox

### Preload Script (`src/preload.js`)
- Safely exposes Electron APIs to renderer
- Prevents direct access to Node.js APIs
- Maintains security context isolation

## 🔹 API Integration

The app is designed to integrate with your existing Node.js backend:

```javascript
// Example API calls
const apiKeys = await window.electronAPI.getApiKeys();
const result = await window.electronAPI.startBot(config);
const trades = await window.electronAPI.getTrades();
```

## 🔹 Security Features

- **Context Isolation**: Renderer process cannot access Node.js APIs directly
- **Preload Script**: Controlled API exposure
- **Secure IPC**: All communication goes through defined channels
- **Local Storage**: API keys stored locally with encryption

## 🔹 Building for Distribution

### macOS
```bash
npm run build
# Creates .dmg file in dist/ folder
```

### Windows
```bash
npm run build
# Creates .exe installer in dist/ folder
```

### Linux
```bash
npm run build
# Creates .AppImage in dist/ folder
```

## 🔹 Testing

The app includes a test interface to verify functionality:

1. **API Connection Test**: Verifies communication with backend
2. **Bot Start Test**: Tests bot initialization
3. **Logging Test**: Verifies logging functionality

## 🔹 Next Steps

1. **Integrate with Backend**: Connect to your Node.js API
2. **Add Trading Features**: Implement actual trading functionality
3. **Port Design System**: Integrate your existing UI components
4. **Add Charts**: Implement trading charts and analytics
5. **Database Integration**: Add local SQLite database

## 🔹 Troubleshooting

### Common Issues

1. **App won't start:**
   - Check Node.js version (requires 16+)
   - Verify all dependencies are installed
   - Check console for error messages

2. **DevTools not opening:**
   - Ensure you're running in dev mode (`npm run dev`)
   - Check if DevTools are disabled in main.js

3. **Build fails:**
   - Clear node_modules and reinstall
   - Check electron-builder configuration
   - Verify platform-specific requirements

## 🔹 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔹 License

MIT License - see LICENSE file for details.
