# Dorian Onboarding Flow

A sophisticated, Anthropic-style onboarding experience for the Dorian AI agent builder platform.

## Design Philosophy

This onboarding follows these principles:

- **Thoughtful & Sophisticated**: Inspired by Anthropic's Claude onboarding
- **One Question Per Screen**: Progressive disclosure, Wix-style
- **Pristine Animations**: Linear-inspired smooth transitions
- **Premium Feel**: Warm, human, and respectful of user intelligence

## Flow Structure

The onboarding consists of 7 steps + 1 loading screen:

1. **Welcome** - Email capture with real-time validation
2. **Personal** - Name collection (first + optional last)
3. **Organization** - Company name (skippable)
4. **Business Category** - Industry selection (12 options)
5. **Team Size** - Scale selection (6 options)
6. **Primary Intent** - Goal selection (multi-select, 6 options)
7. **Toolkit** - Tool selection with search (multi-select)
8. **Loading** - Preparing workspace with progress animation

## Features

### State Management
- Auto-save to localStorage after each step
- Resume from last step on page refresh
- Data persists until completion
- Clean up on successful completion

### Navigation
- Back button on all steps (except first)
- Keyboard shortcuts:
  - `Enter` - Continue (when valid)
  - `Escape` - Go back
- Progress indicator at bottom

### Animations
- Screen transitions: 400ms slide + fade
- Card/pill selection: Spring physics
- Input validation: Smooth shake on error
- Checkmarks: Scale + fade entrance
- Loading: Linear progress with rotating messages

### Validation
- Email: Real-time regex validation
- Name: Required, minimum 1 character
- Cards/Pills: Auto-advance on selection (400ms delay)
- Multi-select: Show continue button when ≥1 selected

### Accessibility
- Semantic HTML
- Keyboard navigation
- Focus management
- Auto-focus on inputs
- Respects `prefers-reduced-motion`
- Touch-friendly (48px minimum targets on mobile)

## Usage

### Basic Implementation

```jsx
import { OnboardingFlow } from './components/onboarding';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/onboarding" element={<OnboardingFlow />} />
      </Routes>
    </Router>
  );
}
```

### Utility Functions

```jsx
import {
  isOnboardingComplete,
  getOnboardingData,
  resetOnboarding
} from './components/onboarding';

// Check if user has completed onboarding
if (!isOnboardingComplete()) {
  navigate('/onboarding');
}

// Get saved onboarding data
const data = getOnboardingData();
console.log(data.email, data.firstName, data.businessCategory);

// Reset onboarding (for testing or "replay onboarding" feature)
resetOnboarding();
navigate('/onboarding');
```

### Data Structure

```typescript
interface OnboardingData {
  email: string;
  firstName: string;
  lastName?: string;
  organizationName?: string;
  businessCategory: string;
  teamSize: string;
  primaryGoals: string[];
  tools: string[];
  completedAt: number;
}
```

## Copy Principles (Anthropic-Style)

### Tone
- Sophisticated but approachable
- Thoughtful and intentional
- Human, not robotic
- Confident without being pushy

### Word Choices
✅ **Use**: Understanding, experience, context, workflow, intelligent, personalize
❌ **Avoid**: Knowing, setup, info, stuff, smart, customize

### Examples
- ❌ "Great choice!" → ✅ "This will help us serve you better"
- ❌ "You're almost done!" → ✅ "Just a few more questions"
- ❌ "Let's go!" → ✅ "Continue"
- ❌ "Yay!" → ✅ "All set"

## Styling

### Colors
- Primary: `#6a041d` (Maroon)
- Background: `#faf7f2` (Warm neutral)
- Surface: `#fbf9f6` (Secondary bg)

### Typography
- Headings: Fraunces (light 300 weight, large sizes)
- Body: DM Sans (400-600 weights)
- UI: DM Sans (500-600 weights)

### Spacing
- Generous white space throughout
- Max content width: 640px (900px for toolkit step)
- Consistent vertical rhythm

### Animations
- Standard timing: 400ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`
- Spring physics for interactive elements

## Testing

### Manual Testing Checklist

- [ ] Email validation works (invalid shows error, valid shows checkmark)
- [ ] Press Enter to continue on valid inputs
- [ ] Back button works on all steps (except first)
- [ ] ESC key navigates back
- [ ] Auto-advance on card/pill selection
- [ ] Multi-select shows Continue button
- [ ] Search filters tools correctly
- [ ] Progress indicator updates correctly
- [ ] Loading screen shows all messages
- [ ] Completion redirects to builder
- [ ] Data persists on refresh
- [ ] Onboarding doesn't show after completion

### Reset Onboarding for Testing

Open browser console:
```javascript
localStorage.removeItem('dorian_onboarding_complete');
localStorage.removeItem('dorian_onboarding_data');
location.href = '/onboarding';
```

Or use the utility:
```javascript
import { resetOnboarding } from './components/onboarding';
resetOnboarding();
```

## File Structure

```
onboarding/
├── OnboardingFlow.jsx          # Main orchestrator
├── OnboardingFlow.css          # Global styles
├── README.md                   # This file
├── index.js                    # Exports + utilities
├── components/
│   ├── ProgressIndicator.jsx
│   ├── ProgressIndicator.css
│   ├── StepContainer.jsx
│   ├── StepContainer.css
│   ├── AnimatedInput.jsx
│   └── AnimatedInput.css
└── steps/
    ├── WelcomeStep.jsx         # Step 1: Email
    ├── PersonalStep.jsx        # Step 2: Name
    ├── OrganizationStep.jsx    # Step 3: Company
    ├── BusinessCategoryStep.jsx # Step 4: Industry
    ├── TeamSizeStep.jsx        # Step 5: Team size
    ├── PrimaryIntentStep.jsx   # Step 6: Goals
    ├── ToolkitStep.jsx         # Step 7: Tools
    └── LoadingStep.jsx         # Step 8: Loading
```

## Future Enhancements

- [ ] Add analytics tracking for each step
- [ ] A/B test different copy variations
- [ ] Add "Why we ask" tooltips
- [ ] Template recommendations based on selections
- [ ] Integration setup flows
- [ ] Team invitation after onboarding
- [ ] Progress save to backend (vs localStorage)
- [ ] Multi-language support

## Notes

- No emojis (keep it sophisticated)
- Minimal icons (only when necessary)
- Every animation has purpose
- Every word is intentional
- Respects user's time and intelligence
