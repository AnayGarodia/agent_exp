# Dorian UI Development Guide

## Getting Started for Developers

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo>
   cd dorian-ui
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```
   Opens at http://localhost:3000 with hot reload

3. **Build and Preview**
   ```bash
   npm run build
   npm run preview
   ```

## Development Workflow

### Making Changes

#### 1. Adding a New Page
```javascript
// 1. Create component in src/components/
// src/components/newpage/NewPage.jsx
import React from 'react';
import Navigation from '../layout/Navigation';
import './NewPage.css';

const NewPage = () => {
  return (
    <div className="new-page">
      <Navigation />
      {/* Your content */}
    </div>
  );
};

export default NewPage;

// 2. Add route in App.jsx
import NewPage from './components/newpage/NewPage';

<Route path="/new" element={<NewPage />} />
```

#### 2. Creating a New Component
```javascript
// Component structure
import React from 'react';
import { motion } from 'framer-motion';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  return (
    <motion.div 
      className="component-name"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Component content */}
    </motion.div>
  );
};

export default ComponentName;
```

#### 3. Adding a New Block Type
```javascript
// In BuilderPage.jsx, add to blockTypes array:
{
  id: 'newcategory',
  category: 'New Category',
  items: [
    {
      type: 'newblock',
      label: 'New Block',
      icon: <YourIcon size={16} />,
      color: '#yourcolor',
      description: 'Block description'
    }
  ]
}

// In PropertiesPanel.jsx, add configuration:
case 'newblock':
  return [
    { key: 'field1', label: 'Field 1', type: 'text' },
    { key: 'field2', label: 'Field 2', type: 'textarea' }
  ];
```

### Styling Guidelines

#### CSS Organization
```css
/* Component base styles */
.component-name {
  /* Layout */
  display: flex;
  
  /* Spacing */
  padding: var(--space-md);
  
  /* Colors */
  background-color: var(--color-surface);
  
  /* Typography */
  font-family: var(--font-mono);
  
  /* Transitions */
  transition: all var(--transition-base);
}

/* Modifiers */
.component-name--variant {
  /* Variant-specific styles */
}

/* States */
.component-name:hover {
  /* Hover styles */
}

/* Child elements */
.component-name__element {
  /* Element styles */
}
```

#### Using CSS Variables
```css
/* Available variables in global.css */
var(--color-accent)           /* Primary brand color */
var(--color-bg)              /* Page background */
var(--color-text)            /* Primary text */
var(--space-md)              /* Standard spacing */
var(--radius-md)             /* Border radius */
var(--transition-base)       /* Standard transition */
var(--font-serif)            /* Content font */
var(--font-mono)             /* Technical font */
```

### Animation Guidelines

#### Framer Motion Patterns
```javascript
// Fade in
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
/>

// Slide up
<motion.div
  initial={{ y: 40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
/>

// Stagger children
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    />
  ))}
</motion.div>

// Hover interaction
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
/>
```

## Code Standards

### React Best Practices

1. **Use Functional Components**
   ```javascript
   //  Good
   const Component = () => { ... }
   
   //  Avoid
   class Component extends React.Component { ... }
   ```

2. **Destructure Props**
   ```javascript
   //  Good
   const Component = ({ prop1, prop2 }) => { ... }
   
   //  Avoid
   const Component = (props) => {
     const prop1 = props.prop1;
     ...
   }
   ```

3. **Use Hooks Properly**
   ```javascript
   //  Good - At top level
   const [state, setState] = useState(initial);
   useEffect(() => { ... }, [deps]);
   
   //  Avoid - Inside conditions
   if (condition) {
     useState(...); // Never do this
   }
   ```

4. **Optimize Re-renders**
   ```javascript
   // Use useCallback for functions passed to children
   const handleClick = useCallback(() => {
     // Handler logic
   }, [dependencies]);
   
   // Use useMemo for expensive computations
   const expensiveValue = useMemo(() => {
     return computeExpensiveValue(a, b);
   }, [a, b]);
   
   // Use React.memo for pure components
   export default React.memo(Component);
   ```

### File Naming Conventions

- Components: `PascalCase.jsx` (e.g., `WorkflowBlock.jsx`)
- Styles: `PascalCase.css` (e.g., `WorkflowBlock.css`)
- Utils: `camelCase.js` (e.g., `formatDate.js`)
- Constants: `UPPER_SNAKE_CASE.js` (e.g., `BLOCK_TYPES.js`)

### Import Order
```javascript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. External libraries
import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

// 3. Internal components
import Navigation from '../layout/Navigation';
import Button from '../shared/Button';

// 4. Styles
import './Component.css';

// 5. Utils and constants
import { formatDate } from '@/utils/date';
```

## Common Tasks

### Adding a New Animation

1. **Define animation variants**
   ```javascript
   const variants = {
     hidden: { opacity: 0, y: 20 },
     visible: { 
       opacity: 1, 
       y: 0,
       transition: {
         duration: 0.5,
         ease: [0.16, 1, 0.3, 1]
       }
     }
   };
   ```

2. **Apply to component**
   ```javascript
   <motion.div
     initial="hidden"
     animate="visible"
     variants={variants}
   >
     Content
   </motion.div>
   ```

### Adding Dark Mode Support

1. **Define dark colors in global.css**
   ```css
   :root {
     --color-dark-bg: #0F0D0C;
     --color-dark-text: #FDFCFB;
   }
   
   [data-theme="dark"] {
     --color-bg: var(--color-dark-bg);
     --color-text: var(--color-dark-text);
   }
   ```

2. **Use semantic color variables**
   ```css
   .component {
     background-color: var(--color-bg);
     color: var(--color-text);
   }
   ```

### Adding Form Validation

```javascript
const [errors, setErrors] = useState({});

const validateForm = (values) => {
  const newErrors = {};
  
  if (!values.email) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    newErrors.email = 'Email is invalid';
  }
  
  if (!values.password || values.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }
  
  return newErrors;
};

const handleSubmit = (e) => {
  e.preventDefault();
  const newErrors = validateForm(formValues);
  
  if (Object.keys(newErrors).length === 0) {
    // Submit form
  } else {
    setErrors(newErrors);
  }
};
```

## Debugging

### React DevTools
```bash
# Install Chrome extension
# Then inspect component tree, props, and state
```

### Console Logging
```javascript
// Add strategic logs
console.log('Component rendered:', { blocks, connections });
console.log('User action:', action);
console.error('Error occurred:', error);
```

### Performance Profiling
```javascript
// In React DevTools Profiler tab
// Record -> Perform action -> Stop
// Analyze render times
```

## Testing

### Component Tests
```javascript
// Install testing library
npm install --save-dev @testing-library/react vitest

// Write tests
import { render, screen } from '@testing-library/react';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

## Performance Tips

### Optimization Checklist
- [ ] Use React.memo for expensive components
- [ ] Implement useCallback for event handlers
- [ ] Use useMemo for computed values
- [ ] Lazy load routes with React.lazy
- [ ] Optimize images (WebP, responsive)
- [ ] Enable code splitting
- [ ] Minimize bundle size
- [ ] Use CSS transforms for animations
- [ ] Debounce expensive operations
- [ ] Virtualize long lists

### Bundle Analysis
```bash
npm run build
npx vite-bundle-visualizer
```

## Troubleshooting

### Common Issues

**Problem**: Component not re-rendering
**Solution**: Check if state update is creating new reference
```javascript
//  Wrong - Mutating state
state.push(item);
setState(state);

//  Correct - New reference
setState([...state, item]);
```

**Problem**: Styles not applying
**Solution**: Check CSS specificity and import order
```javascript
// Ensure CSS is imported after component definition
import './Component.css';
```

**Problem**: Animation not smooth
**Solution**: Use transform instead of position
```css
/*  Less performant */
.element {
  left: 100px;
}

/*  More performant */
.element {
  transform: translateX(100px);
}
```

## Resources

### Documentation
- [React](https://react.dev)
- [Framer Motion](https://www.framer.com/motion/)
- [Vite](https://vitejs.dev)
- [Lucide Icons](https://lucide.dev)

### Learning
- [React Patterns](https://reactpatterns.com)
- [Animation Principles](https://www.framer.com/motion/animation/)
- [CSS Tricks](https://css-tricks.com)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Vite DevTools](https://vitejs.dev/guide/)
- [Color Picker](https://colorhunt.co)

---

Happy coding! 
