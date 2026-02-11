# Changelog

All notable changes to the Dorian AI Agent Builder project.

## [Unreleased] - 2026-02-09

### 🔧 Hotfix - Model Accuracy & Decommissioned Model Handling

#### Fixed
- **Decommissioned Model Error**: Removed deprecated `mixtral-8x7b-32768` from fallback models
- **Default Model Updated**: Changed default from `llama-3.1-70b-versatile` to `llama-3.3-70b-versatile` (latest)
- **Auto-Cache Refresh**: Model cache is automatically cleared when decommissioned model errors are detected
- **Better Error Detection**: Added detection for `model_decommissioned` and `invalid_request_error` codes

#### Updated Fallback Models
Current supported models (as of Feb 2026):
- `llama-3.3-70b-versatile` (default) ⭐
- `llama-3.1-70b-versatile`
- `llama-3.1-8b-instant`
- `llama3-70b-8192`
- `llama3-8b-8192`
- `gemma2-9b-it`

#### Improved Model Filtering
- Backend now filters out decommissioned models from API response
- Models sorted with newest versions first (llama-3.3 → llama-3.1 → others)
- Only shows LLaMA and Gemma models (excluded deprecated Mixtral variants)
- Better error messages for unsupported/decommissioned models

---

## [Version 1.0.0] - 2026-02-09

### 🧹 Cleanup - dorian-ui

#### Removed
- **Dependencies**
  - Removed unused dependency: `react-blockly@8.0.0`
  - Removed unused devDependency: `@types/react-dom@18.2.17`

#### Added
- **devDependencies**
  - Added `eslint-plugin-react@7.33.2`
  - Added `eslint-plugin-react-hooks@4.6.0`
  - Added `eslint-plugin-react-refresh@0.4.5`

#### Deleted Files
- `src/components/builder/BlockPalette.jsx` and `.css` (unused component)
- `src/components/builder/WorkflowBlock.jsx` and `.css` (unused component)
- `src/components/onboarding/index.js` (unused barrel export)

### 🧹 Cleanup - Server

#### Removed
- **Dependencies**
  - Removed unused dependency: `uuid@13.0.0`

#### Exports
- Removed unused export `SCOPES` from `src/config/gmail-config.js`

### 🔄 K2 Think → Groq Migration

#### Removed
- Completely removed all K2 Think AI provider code and references
- Removed `K2_THINK_API` environment variable from `.env`
- Deleted `callK2ThinkAPI()` function from `workflowEngine.js`

#### Added
- **Groq SDK Integration**
  - Installed `groq-sdk@0.37.0` (already present in package.json, now actively used)
  - Created `callGroqAPI()` function with proper error handling
  - Added support for dynamic model selection
  - Default model: `llama-3.1-70b-versatile`

#### Modified
- `src/services/workflowEngine.js`
  - Replaced K2 Think API calls with Groq SDK
  - Added `selectedModel` parameter to workflow execution
  - Enhanced error messages to show selected model in logs
  - Added quota/capacity error detection and user-friendly messages
  - Added input validation for messages, temperature, and maxTokens

- `src/routes/workflows.js`
  - Added `selectedModel` parameter to `/execute` endpoint
  - Added input validation for workflow execution requests
  - Created new `/models` GET endpoint to fetch available Groq models
  - Added fallback model list for offline/error scenarios

### ✨ New Feature - Groq Model Selection

#### Added Components
- **`ModelSelector.jsx`** - Dropdown component for model selection
  - Fetches available models from Groq API
  - Caches model list for 1 hour (localStorage)
  - Displays current selected model in toolbar
  - Matches existing UI/UX design (maroon theme, rounded corners, shadows)
  - Supports keyboard navigation and accessibility

- **`ModelSelector.css`** - Styling matching existing design system
  - Uses CSS variables from `global.css`
  - Supports light/dark themes
  - Responsive design for mobile/tablet
  - Smooth animations with framer-motion

#### Modified Files
- `BuilderPage.jsx`
  - Added `ModelSelector` component to toolbar (before Load button)
  - Imported and integrated into builder interface

- `builderStore.js`
  - Updated `runWorkflow()` to read selected model from localStorage
  - Added error handling for model quota errors
  - Displays helpful message to select different model on capacity errors

- `api.js`
  - Added `get()` helper function for GET requests
  - Exported `get` in API object for use by components

#### Features
- **Model List Caching**: 1-hour TTL to reduce API calls
- **Fallback Models**: Shows common models if API fetch fails
  - `llama-3.1-70b-versatile`
  - `llama-3.1-8b-instant`
  - `mixtral-8x7b-32768`
  - `gemma2-9b-it`
- **Error Handling**: Graceful degradation when API is unavailable
- **Quota Detection**: Detects rate limit/capacity errors and prompts model switch
- **Persistent Selection**: Stores selected model in localStorage (`dorian_selected_model`)
- **Visual Feedback**: Shows loading, error, and fallback states

### 🛡️ Code Quality Improvements

#### Error Handling
- **React Error Boundary**
  - Created `ErrorBoundary.jsx` component
  - Wrapped entire App with ErrorBoundary
  - Shows user-friendly error page on crashes
  - Displays error details in development mode
  - Provides "Reload Page" button for recovery

- **Server-side Validation**
  - Added input validation to `/execute` endpoint
    - Validates `code` is non-empty string
    - Validates `selectedModel` is string (if provided)
    - Returns structured error responses with `success: false`

  - Added input validation to `callGroqAPI()`
    - Validates `messages` is non-empty array
    - Validates `temperature` is between 0 and 2
    - Validates `maxTokens` is positive number
    - Validates API response structure

  - Added null/undefined checks
    - `req.session?.googleTokens` (optional chaining)
    - `error?.message` checks throughout
    - `response?.data` validation in model fetching
    - `completion?.choices?.[0]?.message?.content` validation

#### Improved Error Messages
- Model capacity errors: "Model X is out of capacity. Please select another model."
- Invalid responses: Specific error for malformed API responses
- Input validation: Clear messages for invalid parameters
- Fallback behavior: Gracefully handles missing environment variables

### 📊 Test Results

#### Build Status
- ✅ **dorian-ui**: Build successful
  - Output: `dist/index.html` (0.63 kB)
  - CSS: `102.23 kB` (16.39 kB gzipped)
  - JS: `1,096.35 kB` (304.67 kB gzipped)
  - No errors

- ✅ **server**: Syntax validation passed
  - `server.js`: Valid
  - `routes/workflows.js`: Valid
  - `services/workflowEngine.js`: Valid
  - No syntax errors

#### Dependencies
- ✅ **dorian-ui**: 329 packages audited
  - 2 moderate vulnerabilities (acceptable for dev environment)
  - All new dependencies installed successfully

- ✅ **server**: 188 packages audited
  - 0 vulnerabilities
  - All dependencies installed successfully

### 📝 Notes

#### Design Consistency
All new UI components follow the existing design system:
- **Colors**: Maroon primary (`#6a041d`), warm neutrals
- **Typography**: DM Sans (body), Fraunces (headings)
- **Spacing**: Consistent with `--space-*` variables
- **Shadows**: Subtle shadows matching existing components
- **Borders**: Rounded corners (`--radius-lg`, `--radius-md`)
- **Animations**: Smooth transitions with framer-motion
- **Themes**: Full support for light/dark modes

#### Breaking Changes
None. All changes are backwards compatible. Existing workflows will continue to work with the default Groq model.

#### Migration Notes
- No action required for existing users
- Default model (`llama-3.1-70b-versatile`) is automatically selected
- Users can change model via toolbar dropdown at any time
- Model selection persists across sessions (localStorage)

### 🔮 Future Improvements
- Add model performance metrics in UI
- Add cost estimation per model
- Add user preferences for default model selection
- Add A/B testing for model recommendations
- Add analytics tracking for model usage
- Implement backend database for model selection per user account

---

**Generated**: 2026-02-09
**Contributors**: Claude Sonnet 4.5
