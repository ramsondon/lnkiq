# Plan: lnkiq Cross-Browser Extension (Chrome & Firefox)

A privacy-first browser extension for Chrome and Firefox that enables anonymous bookmark saving and activity tracking, with optional account linking. Uses WebExtension APIs (Manifest V3 for Chrome, Manifest V2/V3 compatible for Firefox) with a unified codebase.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                Cross-Browser Extension                          │
├─────────────────────────────────────────────────────────────────┤
│  Popup UI (Preact) │  Background Service  │  Content Script     │
│  - Quick bookmark  │  - API communication │  - Page tracking    │
│  - View bookmarks  │  - Token management  │  - Duration timing  │
│  - Account status  │  - Auth state sync   │  - Auto-extraction  │
│  - Settings        │  - Offline queue     │                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     lnkiq API                                   │
├─────────────────────────────────────────────────────────────────┤
│  POST /api/v1/extension/device          → Create device token   │
│  GET  /api/v1/extension/device/status   → Check expiry/auth     │
│  POST /api/v1/extension/device/link     → Link to account       │
│  GET  /api/v1/extension/me              → Get user profile      │
│  POST /api/v1/extension/bookmarks       → Save bookmark         │
│  GET  /api/v1/extension/bookmarks       → List bookmarks        │
│  DELETE /api/v1/extension/bookmarks/:id → Delete bookmark       │
│  POST /api/v1/extension/tracking/visit  → Log page visit        │
│  PATCH /api/v1/extension/tracking/visit/:id → Update duration   │
└─────────────────────────────────────────────────────────────────┘
```

## Steps

1. **Setup project with Vite + CRXJS** — Configure for dual-target builds (Chrome MV3, Firefox MV2/MV3). Use `webextension-polyfill` for cross-browser API compatibility. Preact for UI (~3KB).

2. **Create manifest files**:
   - `manifest.json` (Chrome MV3) — Service worker, `chrome.storage.local`, host permissions for `https://lnkiq.net/*`
   - `manifest.firefox.json` (Firefox) — Background scripts, `browser.storage.local`, compatible with both MV2 and MV3

3. **Implement storage layer** (`src/lib/storage.ts`) — Browser-agnostic wrapper using `webextension-polyfill`:
   - Device token storage
   - User session state
   - Settings (tracking enabled, theme)
   - Offline queue (IndexedDB for larger data)

4. **Implement API client** (`src/lib/api.ts`) — Typed fetch wrapper:
   - Auto-inject `X-Device-Token` header
   - Retry logic with exponential backoff
   - Offline detection and queue to IndexedDB
   - All endpoint methods typed

5. **Implement background service** (`src/background/index.ts`):
   - On install: Create device token via API, store locally
   - On startup: Check device status, schedule expiry warning alarm
   - Message handler for popup/content script communication
   - Online/offline sync queue processor
   - Auth state detection and device linking

6. **Implement content script** (`src/content/index.ts`):
   - Only inject if tracking enabled (check storage first)
   - Track page load time, send visit on load
   - Update duration on `visibilitychange` (hidden) or `pagehide`
   - Extract metadata: title, meta description, canonical URL, favicon

7. **Create popup UI with Preact** (`src/popup/`):
   - **Header**: Logo, account status indicator
   - **Main view**: Current page card, "Save Bookmark" button, tags input with autocomplete
   - **Bookmarks tab**: Search input, scrollable list, swipe-to-delete
   - **Account section**: Anonymous mode banner with expiry countdown + "Sign Up" CTA, or user avatar + name
   - **Settings tab**: Activity tracking toggle (default OFF), clear data button, privacy policy link
   - **Expiry warning**: Dismissable banner when <14 days remaining

8. **Implement authentication flow**:
   - "Sign Up / Sign In" opens `https://lnkiq.net/{locale}/auth/signin?extension=true` in new tab
   - Web app detects `extension=true`, after OAuth success shows "Return to extension" message
   - Extension polls `/device/status` to detect `isAuthenticated: true`
   - Calls `/device/link` to merge data, shows success toast with counts
   - Calls `/extension/me` to fetch user profile (id, name, email, image) for display in popup

9. **Add offline support with IndexedDB**:
   - Queue failed bookmark/visit API calls
   - Store queue in IndexedDB (survives extension updates)
   - Background service processes queue when online
   - Popup shows "pending sync" indicator

10. **Implement privacy controls**:
    - Activity tracking: OFF by default, explicit opt-in with explanation modal
    - "Delete all my data" button: Clears local storage, calls API to delete device data
    - Data collection explanation in settings
    - Link to `https://lnkiq.net/privacy`

11. **Build and package**:
    - `npm run build:chrome` → Chrome extension zip
    - `npm run build:firefox` → Firefox extension xpi
    - Shared source, platform-specific manifests

## File Structure

```
lnkiq-extension/
├── src/
│   ├── background/
│   │   └── index.ts           # Service worker / background script
│   ├── content/
│   │   └── index.ts           # Page tracking content script
│   ├── popup/
│   │   ├── index.html
│   │   ├── index.tsx          # Preact entry
│   │   ├── App.tsx            # Main app component
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── BookmarkForm.tsx
│   │   │   ├── BookmarkList.tsx
│   │   │   ├── AccountStatus.tsx
│   │   │   ├── Settings.tsx
│   │   │   └── ExpiryWarning.tsx
│   │   └── styles.css
│   ├── lib/
│   │   ├── api.ts             # API client
│   │   ├── storage.ts         # Browser storage wrapper
│   │   ├── offlineQueue.ts    # IndexedDB queue
│   │   ├── browser.ts         # webextension-polyfill wrapper
│   │   └── types.ts           # Shared types
│   └── utils/
│       ├── url.ts             # URL parsing helpers
│       └── time.ts            # Time formatting
├── public/
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── _locales/
│   ├── en/messages.json
│   └── de/messages.json
├── manifest.json              # Chrome MV3
├── manifest.firefox.json      # Firefox MV2/MV3
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Cross-Browser Compatibility

| Feature | Chrome (MV3) | Firefox (MV2/MV3) |
|---------|--------------|-------------------|
| Background | Service Worker | Background Script / Service Worker |
| Storage | `chrome.storage.local` | `browser.storage.local` |
| Alarms | `chrome.alarms` | `browser.alarms` |
| Tabs | `chrome.tabs` | `browser.tabs` |
| Polyfill | Not needed | `webextension-polyfill` unifies API |

## Privacy-First User Flow

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Install         │────▶│ Anonymous Mode   │────▶│ Optional        │
│ Extension       │     │ (90-day rolling) │     │ Account Link    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Device token    │     │ Bookmarks saved  │     │ Data merged     │
│ created & stored│     │ locally + API    │     │ to user account │
│ in browser      │     │ (tracking opt-in)│     │ Cross-device    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Popup UI Wireframe

```
┌────────────────────────────────┐
│ 🔖 lnkiq          [👤 Sign In] │
├────────────────────────────────┤
│ ⚠️ Anonymous mode - 73 days    │
│    remaining. Sign up to sync  │
├────────────────────────────────┤
│ Current Page:                  │
│ ┌────────────────────────────┐ │
│ │ 🌐 Example Article Title   │ │
│ │    example.com             │ │
│ └────────────────────────────┘ │
│                                │
│ Tags: [dev] [react] [+]        │
│                                │
│ [    ⭐ Save Bookmark    ]     │
├────────────────────────────────┤
│ Recent Bookmarks:              │
│ ┌────────────────────────────┐ │
│ │ 📄 Another Page      [🗑️] │ │
│ │ 📄 Some Article      [🗑️] │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ [Bookmarks] [Activity] [⚙️]    │
└────────────────────────────────┘
```

## Build Commands

```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run build:chrome && npm run build:firefox",
    "build:chrome": "vite build --mode chrome",
    "build:firefox": "vite build --mode firefox",
    "package:chrome": "cd dist/chrome && zip -r ../lnkiq-chrome.zip .",
    "package:firefox": "cd dist/firefox && zip -r ../lnkiq-firefox.xpi ."
  }
}
```

## Dependencies

```json
{
  "dependencies": {
    "preact": "^10.x",
    "webextension-polyfill": "^0.12.x",
    "idb": "^8.x"
  },
  "devDependencies": {
    "@preact/preset-vite": "^2.x",
    "@crxjs/vite-plugin": "^2.x",
    "vite": "^5.x",
    "typescript": "^5.x"
  }
}
```

## API Integration Details

| Action | Endpoint | Headers | Notes |
|--------|----------|---------|-------|
| First launch | `POST /device` | None | Store token in `chrome.storage.local` |
| Check status | `GET /device/status` | `X-Device-Token` | Called on popup open, shows expiry warning |
| Get user profile | `GET /extension/me` | `X-Device-Token` | Returns `{ id, name, email, image }` after device is linked |
| Save bookmark | `POST /bookmarks` | `X-Device-Token` | Include current page URL, title, optional tags |
| List bookmarks | `GET /bookmarks` | `X-Device-Token` | Paginated list for popup display |
| Track visit | `POST /tracking/visit` | `X-Device-Token` | On page load (if tracking enabled) |
| Update duration | `PATCH /tracking/visit/:id` | `X-Device-Token` | On page unload/visibility change |
| Link account | `POST /device/link` | `X-Device-Token` + Cookie | After OAuth login on web |
