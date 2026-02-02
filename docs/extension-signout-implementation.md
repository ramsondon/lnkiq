# Extension Sign Out Flow Implementation Guide

## Overview

This document describes the new sign out functionality for the lnkiq browser extension. A new API endpoint has been added to allow users to sign out (unlink their device from their account) directly from the extension.

## New API Endpoint

### `POST /api/v1/extension/device/unlink`

**Purpose:** Unlinks the device from the user's account, effectively signing them out of the extension.

**Authentication:** Requires `X-Device-Token` header (no session cookie needed)

---

## Request

```http
POST /api/v1/extension/device/unlink
X-Device-Token: <device_token>
Content-Type: application/json
```

No request body is required.

---

## Response

### Success (200 OK)

**When device was linked (actual sign out):**
```json
{
  "message": "Device unlinked successfully. You are now signed out.",
  "deviceId": "dev_123abc",
  "wasLinked": true
}
```

**When device was already anonymous:**
```json
{
  "message": "Device is not linked to any account",
  "deviceId": "dev_123abc",
  "wasLinked": false
}
```

### Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | `X-Device-Token header required` | Missing device token in request |
| 404 | `Device not found` | Invalid device token |
| 410 | `Device token expired` | Token has expired (90+ days old) |
| 500 | `Failed to unlink device` | Server error |

---

## What Happens on Sign Out

When `/extension/device/unlink` is called:

1. **Device is disconnected** from the user account in the database
2. **Device token remains valid** - it continues to work for API calls
3. **Device becomes anonymous** - future data is stored with device, not user
4. **User data is preserved** - all previously synced bookmarks/visits stay in user's account
5. **Re-linking is possible** - user can sign back in anytime via `/extension/device/link`

```
Before Sign Out:
┌──────────────┐      ┌──────────────┐
│   Device     │──────│    User      │
│  (dev_xxx)   │linked│  Account     │
└──────────────┘      └──────────────┘

After Sign Out:
┌──────────────┐      ┌──────────────┐
│   Device     │      │    User      │
│  (dev_xxx)   │      │  Account     │
│  [anonymous] │      │ [data kept]  │
└──────────────┘      └──────────────┘
```

---

## Extension Implementation Requirements

### 1. Add Sign Out Button

Add a "Sign Out" button to the extension popup when the user is logged in.

```javascript
// In popup.js or equivalent
const signOutButton = document.getElementById('sign-out-btn');
signOutButton.addEventListener('click', handleSignOut);
```

### 2. Implement Sign Out Function

```javascript
async function handleSignOut() {
  try {
    // Get stored device token
    const { deviceToken } = await chrome.storage.local.get('deviceToken');
    
    if (!deviceToken) {
      console.error('No device token found');
      return;
    }

    // Call the unlink endpoint
    const response = await fetch('https://lnkiq.net/api/v1/extension/device/unlink', {
      method: 'POST',
      headers: {
        'X-Device-Token': deviceToken,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok) {
      // Success - update UI to show anonymous state
      console.log('Signed out:', data.message);
      
      // Option A: Just update UI (keep device token for anonymous usage)
      updateUIToAnonymousState();
      
      // Option B: Full reset (clear everything and create new device)
      // await chrome.storage.local.remove(['deviceToken', 'userProfile']);
      // await initializeNewDevice();
      
      showNotification('You have been signed out successfully');
    } else {
      // Handle errors
      console.error('Sign out failed:', data.error);
      showNotification('Sign out failed: ' + data.error, 'error');
    }
  } catch (error) {
    console.error('Sign out error:', error);
    showNotification('Network error during sign out', 'error');
  }
}
```

### 3. Update UI State Management

After sign out, update the extension UI:

```javascript
function updateUIToAnonymousState() {
  // Hide user profile section
  document.getElementById('user-profile').style.display = 'none';
  
  // Show "Sign In" button instead of "Sign Out"
  document.getElementById('sign-out-btn').style.display = 'none';
  document.getElementById('sign-in-btn').style.display = 'block';
  
  // Update any other UI elements that show logged-in state
  document.getElementById('sync-status').textContent = 'Anonymous Mode';
  
  // Clear cached user data
  chrome.storage.local.remove(['userProfile', 'isLinked']);
}
```

### 4. Update Status Check Flow

Modify the startup status check to handle the signed-out state:

```javascript
async function checkDeviceStatus() {
  const { deviceToken } = await chrome.storage.local.get('deviceToken');
  
  if (!deviceToken) {
    // No token - need to create new device
    await initializeNewDevice();
    return;
  }

  const response = await fetch('https://lnkiq.net/api/v1/extension/device/status', {
    headers: { 'X-Device-Token': deviceToken }
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token invalid/expired - create new device
      await initializeNewDevice();
    }
    return;
  }

  const status = await response.json();

  if (status.isLinked && status.isAuthenticated) {
    // User is signed in
    showSignedInUI(status.user);
  } else {
    // Anonymous mode (or just signed out)
    showAnonymousUI();
    
    // Show prompt if token expiring soon
    if (status.daysRemaining < 14) {
      showLinkAccountPrompt();
    }
  }
}
```

---

## Complete Sign Out Flow Sequence

```
┌─────────────┐                              ┌─────────────┐
│  Extension  │                              │  lnkiq API  │
└──────┬──────┘                              └──────┬──────┘
       │                                            │
       │  User clicks "Sign Out"                    │
       │                                            │
       │  POST /extension/device/unlink             │
       │  X-Device-Token: dev_xxx                   │
       │ ──────────────────────────────────────────▶│
       │                                            │
       │                              Unlink device │
       │                              from user     │
       │                                            │
       │  { message: "...", wasLinked: true }       │
       │ ◀──────────────────────────────────────────│
       │                                            │
       │  Update UI to anonymous state              │
       │  Clear cached user profile                 │
       │  Show "Sign In" button                     │
       │                                            │
       ▼                                            ▼
```

---

## Testing Checklist

- [ ] Sign out button appears when user is logged in
- [ ] Sign out button is hidden when user is anonymous
- [ ] Clicking sign out calls `/extension/device/unlink` with device token
- [ ] Successful sign out updates UI to anonymous state
- [ ] User profile is cleared from local storage after sign out
- [ ] Bookmarks/visits created after sign out are stored with device (not user)
- [ ] User can sign back in after signing out
- [ ] Error states are handled gracefully (network errors, expired token, etc.)
- [ ] Signing out on one device doesn't affect other devices linked to the same account

---

## Optional Enhancements

### Confirmation Dialog

```javascript
async function handleSignOut() {
  const confirmed = await showConfirmDialog({
    title: 'Sign Out',
    message: 'Are you sure you want to sign out? Your data will remain safe in your account.',
    confirmText: 'Sign Out',
    cancelText: 'Cancel'
  });
  
  if (confirmed) {
    await performSignOut();
  }
}
```

### Full Reset Option

Some users may want to completely reset the extension (new device token):

```javascript
async function handleFullReset() {
  // Sign out first
  await performSignOut();
  
  // Clear all local data
  await chrome.storage.local.clear();
  
  // Create new device
  await initializeNewDevice();
  
  showNotification('Extension has been reset');
}
```

---

## API Reference

For complete API documentation, see the OpenAPI spec at `/public/api.json` or the rendered docs at `https://lnkiq.net/docs/api`.

### Related Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/extension/device` | POST | Create new anonymous device |
| `/extension/device/status` | GET | Check device/auth status |
| `/extension/device/link` | POST | Link device to user account (sign in) |
| `/extension/device/unlink` | POST | Unlink device from account (sign out) |
| `/extension/me` | GET | Get user profile (when linked) |
