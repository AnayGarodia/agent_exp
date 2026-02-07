# Gmail OAuth Testing Guide

## ✅ Fixes Applied

### 1. **Fixed Shared OAuth2 Client Race Condition** (CRITICAL)
**Problem**: The `oauth2Client` in `gmail-config.js` was a shared global instance. When multiple requests came in, they would overwrite each other's credentials, causing "missing authentication credential" errors.

**Solution**: Changed to a factory pattern that creates a new OAuth2 client instance for each request:
```javascript
function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
}
```

**Files modified**:
- `dorian/server/src/config/gmail-config.js`
- `dorian/server/src/routes/auth.js`

### 2. **Fixed Session Cookie Domain**
**Problem**: Setting `domain: "localhost"` in session config prevented cookies from being shared between `localhost:3000` and `localhost:3001`.

**Solution**: Removed the explicit domain setting to allow cookies to work across ports:
```javascript
cookie: {
  secure: false,
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: "lax",
  path: "/",
  // domain removed - allows cross-port cookie sharing
}
```

**Files modified**:
- `dorian/server/src/server.js`

### 3. **Enhanced Error Handling & Logging**
**Problem**: Generic error messages made it impossible to diagnose OAuth issues.

**Solution**: Added comprehensive error handling with:
- Detailed console logging at each step
- User-friendly error messages for common failures (401, 403, invalid_grant, redirect_uri_mismatch)
- Token validation before API calls
- OAuth error page with actionable guidance

**Files modified**:
- `dorian/server/src/services/gmailService.js` (all methods)
- `dorian/server/src/config/gmail-config.js` (refreshTokenIfNeeded)
- `dorian/server/src/routes/auth.js` (callback error page)

### 4. **Added userinfo.email Scope**
**Problem**: Missing scope to get user's email address.

**Solution**: Added `https://www.googleapis.com/auth/userinfo.email` to scopes list.

---

## 🧪 How to Test Gmail OAuth Flow

### Step 1: Verify Google Cloud Console Configuration

1. Go to https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. **Verify Authorized Redirect URIs** includes:
   ```
   http://localhost:3001/api/auth/google/callback
   ```
4. Go to **OAuth consent screen**:
   - If using personal Gmail, set to **External**
   - Add your Gmail address to **Test users**
5. Go to **APIs & Services** → **Library**:
   - Ensure **Gmail API** is enabled
6. Go to **OAuth consent screen** → **Scopes**:
   - Verify these scopes are added:
     - `.../auth/gmail.readonly`
     - `.../auth/gmail.send`
     - `.../auth/gmail.modify`
     - `.../auth/userinfo.email`

### Step 2: Start Both Servers

**Terminal 1 (Backend)**:
```bash
cd dorian/server
npm install
npm run dev
```

Expected output:
```
🚀 Dorian server running on http://localhost:3001
📧 Gmail OAuth callback: http://localhost:3001/api/auth/google/callback
🔐 Session secret configured: ✅
```

**Terminal 2 (Frontend)**:
```bash
cd dorian/dorian-ui
npm install
npm run dev
```

Expected output:
```
➜  Local:   http://localhost:3000/
```

### Step 3: Test OAuth Flow

1. **Open the app**: Navigate to http://localhost:3000
2. **Go to Builder**: Click "Open Builder" or go to http://localhost:3000/builder
3. **Click "Connect Gmail"**: A popup should open
4. **Select Google Account**: Choose your test account
5. **Grant Permissions**: Click "Allow" for all requested scopes
6. **Watch for Success**: The popup should show "✅ Gmail Connected!" and close automatically

### Step 4: Monitor Server Logs

Watch your backend terminal for this flow:

```
📋 [GET] /api/auth/google/url
🔐 [auth] Generating Google OAuth URL
🔐 [auth] Redirecting to: https://accounts.google.com/o/oauth2/v2/auth?...

📋 [GET] /api/auth/google/callback
✅ [auth/callback] Received OAuth code
✅ [auth/callback] Received tokens
🔑 [auth/callback] Has refresh token: true
🔑 [auth/callback] Token expiry: 2026-02-07T...
💾 [auth/callback] Storing in session: { sessionId: '...', email: '...', ... }
✅ [auth/callback] Session saved successfully
```

### Step 5: Test Gmail Blocks

1. **Add Gmail blocks** to your workflow:
   - Drag "Fetch Unread Emails" block
   - Connect it to your workflow
2. **Click "Run"**
3. **Watch server logs** for Gmail API calls:

```
📋 [POST] /api/workflows/execute
🍪 Session ID: ...
🔑 Has tokens: true
📝 Executing workflow...
📧 Listing messages: maxResults=10, query="is:unread"
✅ Found 5 messages
```

### Step 6: Verify Token Refresh

After tokens expire (1 hour), you should see:

```
📋 [POST] /api/workflows/execute
🔑 Has tokens: true
🔄 Refreshing expired access token...
✅ Token refreshed successfully
🔑 New expiry: 2026-02-07T...
```

---

## 🐛 Troubleshooting

### Error: "Request is missing required authentication credential"

**Cause**: This is the error that was being fixed. It means:
1. ❌ OAuth tokens aren't in the session
2. ❌ Session cookie isn't being sent
3. ❌ Tokens are invalid/expired and refresh failed

**Debug steps**:
1. Check server logs for "🔑 Has tokens: true" - if false, auth didn't work
2. Check browser DevTools → Application → Cookies → Check for `dorian.sid` cookie
3. Look for token refresh logs - refresh might be failing
4. Try disconnecting and reconnecting Gmail

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI in your code doesn't match Google Console.

**Fix**: Ensure `.env` has:
```
GMAIL_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```
And this EXACT URL is in Google Cloud Console authorized redirect URIs (no trailing slash).

### Error: "invalid_client"

**Cause**: Wrong CLIENT_ID or CLIENT_SECRET.

**Fix**: Double-check `.env` credentials match Google Cloud Console.

### Error: "invalid_grant"

**Cause**: Authorization code expired or was already used.

**Fix**: Close the popup and try connecting Gmail again. This error is now caught and shown with helpful message.

### Session Not Persisting

**Symptoms**: Auth succeeds but immediately shows as disconnected.

**Debug**:
1. Check that both servers are running
2. Verify `SESSION_SECRET` is set in `.env`
3. Check browser console for CORS errors
4. Clear all cookies and try again

### Popup Blocked

**Symptoms**: Nothing happens when clicking "Connect Gmail".

**Fix**: Allow popups for `localhost:3000` in browser settings. The code will fall back to same-window redirect if popup is blocked.

---

## 📝 Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] "Connect Gmail" opens popup to Google OAuth
- [ ] Selecting account and granting permissions works
- [ ] Popup closes automatically after success
- [ ] Gmail status shows connected with email address
- [ ] "Fetch Unread Emails" block runs successfully
- [ ] Email count appears in output panel
- [ ] "Send Email" block works
- [ ] Token refresh works after 1 hour (or force expiry for testing)
- [ ] Logout clears session and shows disconnected
- [ ] Reconnecting after logout works

---

## 🔍 Debug Commands

### Check if session has tokens:
```bash
curl -X GET http://localhost:3001/api/auth/test \
  -H "Cookie: dorian.sid=YOUR_SESSION_ID" \
  | jq
```

Expected output:
```json
{
  "sessionID": "...",
  "hasGoogleTokens": true,
  "email": "your-email@gmail.com",
  "authenticated": true
}
```

### Check auth status:
```bash
curl -X GET http://localhost:3001/api/auth/status \
  -H "Cookie: dorian.sid=YOUR_SESSION_ID" \
  | jq
```

Expected output:
```json
{
  "authenticated": true,
  "hasGmailTokens": true,
  "email": "your-email@gmail.com",
  "tokenExpiry": 1234567890123,
  "testMode": false
}
```

---

## 🎯 Expected Behavior Summary

### OAuth Flow:
1. Click "Connect Gmail" → Opens popup
2. Popup redirects to Google OAuth consent screen
3. User grants permissions
4. Google redirects to `/api/auth/google/callback?code=...`
5. Backend exchanges code for tokens (access + refresh)
6. Tokens stored in session under `req.session.googleTokens`
7. User email fetched and stored in `req.session.email`
8. Popup shows success page and sends postMessage to opener
9. Popup closes automatically
10. Frontend polls `/auth/status` and updates UI

### Gmail API Calls:
1. User runs workflow with Gmail blocks
2. Frontend sends generated code to `/workflows/execute`
3. Backend gets tokens from session: `req.session.googleTokens`
4. Workflow engine passes tokens to Gmail methods
5. Gmail service creates new OAuth2 client with tokens
6. Gmail API called with authenticated client
7. Results returned through logs to frontend

### Token Refresh:
1. Before each Gmail API call, check if token expires soon
2. If expiring within 5 minutes, refresh using refresh_token
3. Update session with new access_token
4. Continue with API call

---

## 📚 Key Code Locations

| Function | File | Line |
|----------|------|------|
| OAuth URL generation | `server/src/routes/auth.js` | 15-22 |
| Token exchange | `server/src/routes/auth.js` | 28-119 |
| Token storage | `server/src/routes/auth.js` | 55-67 |
| Token refresh | `server/src/config/gmail-config.js` | 37-77 |
| Gmail API auth | `server/src/services/gmailService.js` | 8-35 |
| Workflow token passing | `server/src/services/workflowEngine.js` | 22, 52-131 |
| Session config | `server/src/server.js` | 40-55 |

---

## ✅ Success Indicators

When everything is working correctly, you'll see:

**Browser**:
- ✅ "Connected as: your-email@gmail.com" in builder toolbar
- ✅ Gmail blocks execute without authentication errors
- ✅ Email data appears in output panel

**Server Logs**:
- ✅ No "❌" error messages
- ✅ "🔑 Has tokens: true" for every workflow execution
- ✅ "✅ Found X messages" when fetching emails
- ✅ "✅ Email sent successfully" when sending

**DevTools**:
- ✅ `dorian.sid` cookie present
- ✅ No 401 errors in Network tab
- ✅ `/auth/status` returns `authenticated: true`
