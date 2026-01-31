# lnkiq Extension API Documentation

This document describes all API endpoints used by the lnkiq browser extension to communicate with the backend server.

## Base URL

```
https://lnkiq.net/api/v1/extension
```

## Authentication

All endpoints (except device creation) require a device token passed in the request header:

```
X-Device-Token: <device_token>
```

---

## Device Endpoints

### Create Device

Creates a new anonymous device token. This is called on first extension install.

- **Endpoint:** `POST /device`
- **Authentication:** None required
- **Description:** Registers a new anonymous device and returns a token valid for 90 days.

#### Request

```http
POST /api/v1/extension/device
Content-Type: application/json
```

No request body required.

#### Response

```json
{
  "token": "dev_abc123xyz789...",
  "expiresAt": "2026-05-01T12:00:00.000Z",
  "createdAt": "2026-01-31T12:00:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `token` | string | The device token to use for future requests |
| `expiresAt` | string (ISO 8601) | When the token expires (90 days from creation) |
| `createdAt` | string (ISO 8601) | When the device was created |

---

### Get Device Status

Retrieves the current device status including authentication state and expiry information.

- **Endpoint:** `GET /device/status`
- **Authentication:** Required
- **Description:** Returns whether the device is linked to an account and how many days remain before expiry.

#### Request

```http
GET /api/v1/extension/device/status
X-Device-Token: <device_token>
```

#### Response

```json
{
  "isAuthenticated": false,
  "expiresAt": "2026-05-01T12:00:00.000Z",
  "daysRemaining": 73,
  "userId": null,
  "userName": null,
  "userAvatar": null
}
```

| Field | Type | Description |
|-------|------|-------------|
| `isAuthenticated` | boolean | Whether device is linked to a user account |
| `expiresAt` | string (ISO 8601) | When the device token expires |
| `daysRemaining` | number | Days until token expiration |
| `userId` | string \| null | User ID if authenticated |
| `userName` | string \| null | User's display name if authenticated |
| `userAvatar` | string \| null | URL to user's avatar if authenticated |

---

### Link Device

Links the current device to the authenticated user's account. The user must be logged in on the website (session cookie required).

- **Endpoint:** `POST /device/link`
- **Authentication:** Required (device token + session cookie)
- **Description:** Merges anonymous device data with the user's account. Bookmarks and visit history are transferred.

#### Request

```http
POST /api/v1/extension/device/link
X-Device-Token: <device_token>
Cookie: <session_cookie>
Content-Type: application/json
```

No request body required.

#### Response

```json
{
  "success": true,
  "mergedBookmarks": 15,
  "mergedVisits": 42
}
```

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether linking was successful |
| `mergedBookmarks` | number | Number of bookmarks transferred to account |
| `mergedVisits` | number | Number of visit records transferred |

---

## User Endpoints

### Get User Profile

Retrieves the authenticated user's profile information.

- **Endpoint:** `GET /me`
- **Authentication:** Required (device must be linked to account)
- **Description:** Returns user profile data including name, email, and avatar.

#### Request

```http
GET /api/v1/extension/me
X-Device-Token: <device_token>
```

#### Response

```json
{
  "id": "user_abc123",
  "name": "John Doe",
  "email": "john@example.com",
  "image": "https://lnkiq.net/avatars/user_abc123.jpg"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | User's unique ID |
| `name` | string | User's display name |
| `email` | string | User's email address |
| `image` | string \| null | URL to user's avatar image |

---

## Bookmark Endpoints

### Create Bookmark

Saves a new bookmark.

- **Endpoint:** `POST /bookmarks`
- **Authentication:** Required
- **Description:** Creates a new bookmark associated with the device/user.

#### Request

```http
POST /api/v1/extension/bookmarks
X-Device-Token: <device_token>
Content-Type: application/json

{
  "url": "https://example.com/article",
  "title": "Example Article Title",
  "description": "A brief description of the page",
  "favicon": "https://example.com/favicon.ico",
  "tags": ["tech", "javascript", "tutorial"]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | The URL to bookmark |
| `title` | string | Yes | Page title |
| `description` | string | No | Optional description |
| `favicon` | string | No | URL to page favicon |
| `tags` | string[] | No | Array of tag labels |

#### Response

```json
{
  "id": "bm_xyz789",
  "url": "https://example.com/article",
  "title": "Example Article Title",
  "description": "A brief description of the page",
  "favicon": "https://example.com/favicon.ico",
  "tags": ["tech", "javascript", "tutorial"],
  "createdAt": "2026-01-31T12:00:00.000Z",
  "updatedAt": "2026-01-31T12:00:00.000Z"
}
```

---

### Get Bookmarks

Retrieves a paginated list of bookmarks.

- **Endpoint:** `GET /bookmarks`
- **Authentication:** Required
- **Description:** Returns bookmarks for the device/user with pagination support.

#### Request

```http
GET /api/v1/extension/bookmarks?page=1&pageSize=20
X-Device-Token: <device_token>
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `pageSize` | number | 20 | Number of bookmarks per page |

#### Response

```json
{
  "bookmarks": [
    {
      "id": "bm_xyz789",
      "url": "https://example.com/article",
      "title": "Example Article Title",
      "description": "A brief description",
      "favicon": "https://example.com/favicon.ico",
      "tags": ["tech", "javascript"],
      "createdAt": "2026-01-31T12:00:00.000Z",
      "updatedAt": "2026-01-31T12:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `bookmarks` | Bookmark[] | Array of bookmark objects |
| `total` | number | Total number of bookmarks |
| `page` | number | Current page number |
| `pageSize` | number | Items per page |
| `hasMore` | boolean | Whether more pages exist |

---

### Delete Bookmark

Deletes a bookmark by ID.

- **Endpoint:** `DELETE /bookmarks/:id`
- **Authentication:** Required
- **Description:** Permanently removes a bookmark.

#### Request

```http
DELETE /api/v1/extension/bookmarks/bm_xyz789
X-Device-Token: <device_token>
```

#### Response

```http
HTTP/1.1 204 No Content
```

---

## Tracking Endpoints

### Log Visit

Records a new page visit for activity tracking.

- **Endpoint:** `POST /tracking/visit`
- **Authentication:** Required
- **Description:** Logs a page visit when activity tracking is enabled. Called when user navigates to a new page.

#### Request

```http
POST /api/v1/extension/tracking/visit
X-Device-Token: <device_token>
Content-Type: application/json

{
  "url": "https://example.com/page",
  "title": "Page Title",
  "favicon": "https://example.com/favicon.ico"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | Yes | The visited URL (normalized, tracking params removed) |
| `title` | string | Yes | Page title |
| `favicon` | string | No | URL to page favicon |

#### Response

```json
{
  "id": "visit_abc123",
  "url": "https://example.com/page",
  "title": "Page Title",
  "startedAt": "2026-01-31T12:00:00.000Z",
  "duration": 0,
  "favicon": "https://example.com/favicon.ico"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique visit ID (used for duration updates) |
| `url` | string | The visited URL |
| `title` | string | Page title |
| `startedAt` | string (ISO 8601) | When the visit started |
| `duration` | number | Time spent on page in milliseconds (initially 0) |
| `favicon` | string | Page favicon URL |

---

### Update Visit Duration

Updates the duration of an active visit.

- **Endpoint:** `PATCH /tracking/visit/:visitId`
- **Authentication:** Required
- **Description:** Updates how long the user spent on a page. Called when tab is hidden, page is closed, or periodically during long visits.

#### Request

```http
PATCH /api/v1/extension/tracking/visit/visit_abc123
X-Device-Token: <device_token>
Content-Type: application/json

{
  "duration": 45000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `duration` | number | Yes | Total time spent on page in milliseconds |

#### Response

```json
{
  "id": "visit_abc123",
  "url": "https://example.com/page",
  "title": "Page Title",
  "startedAt": "2026-01-31T12:00:00.000Z",
  "duration": 45000,
  "favicon": "https://example.com/favicon.ico"
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "status": 400
}
```

### Common Error Codes

| Status | Code | Description |
|--------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid request body or parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid device token |
| 403 | `FORBIDDEN` | Device not authorized for this action |
| 404 | `NOT_FOUND` | Resource not found |
| 410 | `EXPIRED` | Device token has expired |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

---

## Offline Support

The extension queues requests when offline and syncs when connectivity is restored:

- **Bookmarks:** Queued in IndexedDB, synced on reconnection
- **Visit logs:** Queued in IndexedDB, synced on reconnection
- **Duration updates:** Use `fetch` with `keepalive: true` for reliable delivery on page close

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `POST /device` | 10 per hour per IP |
| `POST /bookmarks` | 100 per hour |
| `GET /bookmarks` | 300 per hour |
| `POST /tracking/visit` | 1000 per hour |
| `PATCH /tracking/visit/:id` | 2000 per hour |
