# Dorian UI Architecture

## System Overview

Dorian UI is a single-page application built with React that provides a visual interface for building AI agent workflows. The architecture emphasizes:

1. **Component Modularity**: Each feature is self-contained
2. **State Management**: Local state with hooks, ready for Redux/Zustand
3. **Performance**: Optimized rendering and animations
4. **Extensibility**: Easy to add new block types and features

## Component Hierarchy

```
App
├── Router
    ├── HomePage
    │   ├── Navigation
    │   ├── AnimatedGrid (Canvas-based background)
    │   ├── FeatureCard (Multiple instances)
    │   └── Button (Multiple instances)
    │
    └── BuilderPage
        ├── Navigation
        ├── Toolbar
        ├── BlockPalette (Collapsible sidebar)
        │   └── Block Items (Draggable)
        ├── WorkflowCanvas (Main workspace)
        │   ├── Grid Background
        │   ├── WorkflowBlock (Multiple instances)
        │   │   ├── Connection Ports
        │   │   └── Action Buttons
        │   └── Connection Lines (SVG)
        └── PropertiesPanel (Collapsible sidebar)
            └── Dynamic Form Fields
```

## Data Flow

### Workflow State
```javascript
{
  blocks: [
    {
      id: 'block-123',
      type: 'gmail',
      label: 'Send Email',
      position: { x: 100, y: 100 },
      properties: {
        to: 'user@example.com',
        subject: 'Hello',
        body: 'Message...'
      }
    }
  ],
  connections: [
    {
      id: 'conn-456',
      from: 'block-123',
      to: 'block-789'
    }
  ]
}
```

### State Management Flow
1. **User Action** → Component Event Handler
2. **Event Handler** → State Update Function
3. **State Update** → React Re-render
4. **Re-render** → UI Update with Animation

## Key Technical Decisions

### 1. Canvas-based Grid Background
**Why**: More performant than DOM elements for particle effects
**Implementation**: HTML5 Canvas with requestAnimationFrame
**Benefits**: 60fps animations, low memory footprint

### 2. Framer Motion for Animations
**Why**: Declarative API, great performance, physics-based
**Usage**: Page transitions, hover effects, drag interactions
**Benefits**: Smooth 60fps, automatic optimization

### 3. CSS Variables for Theming
**Why**: Runtime theme switching without rebuild
**Implementation**: CSS custom properties in `:root`
**Benefits**: Instant theme changes, easy customization

### 4. Component Co-location
**Why**: Better organization, easier maintenance
**Pattern**: Each component has its own CSS file
**Benefits**: Clear boundaries, reduced conflicts

## Performance Strategies

### Rendering Optimization
- **React.memo**: Prevent unnecessary re-renders of blocks
- **useCallback**: Stable function references for event handlers
- **useMemo**: Cache expensive computations
- **CSS transforms**: GPU-accelerated animations

### Bundle Optimization
- **Code splitting**: Route-based with React.lazy
- **Tree shaking**: Unused code eliminated
- **Compression**: Gzip/Brotli in production
- **CDN**: Static assets served from edge

## Extensibility Points

### Adding New Block Types

1. **Define block type in BlockPalette**:
```javascript
{
  type: 'custom-block',
  label: 'Custom Block',
  icon: <CustomIcon />,
  color: '#FF6B6B',
  description: 'Does something custom'
}
```

2. **Add property configuration in PropertiesPanel**:
```javascript
case 'custom-block':
  return [
    { key: 'param1', label: 'Parameter 1', type: 'text' },
    { key: 'param2', label: 'Parameter 2', type: 'select' }
  ];
```

3. **Implement backend handler** for execution

### Adding New Features

**Example: Workflow Templates**
1. Create `TemplateGallery.jsx` component
2. Add route in `App.jsx`
3. Create API endpoint for fetching templates
4. Add "Load Template" button to BuilderPage

## Integration Points

### Backend API Endpoints (to implement)

```
POST   /api/workflows/execute     # Run a workflow
POST   /api/workflows/save        # Save workflow
GET    /api/workflows/:id         # Load workflow
GET    /api/workflows             # List workflows
DELETE /api/workflows/:id         # Delete workflow
GET    /api/blocks               # Get available blocks
POST   /api/blocks/validate      # Validate block config
```

### Authentication Flow (to implement)

1. User logs in → Receive JWT token
2. Store token in localStorage/cookie
3. Include token in API request headers
4. Refresh token before expiration
5. Handle auth errors → Redirect to login

### Real-time Collaboration (future)

1. WebSocket connection per workflow
2. Broadcast changes to all connected clients
3. Conflict resolution with operational transforms
4. Presence indicators for other users

## Security Considerations

### Frontend
- Sanitize all user inputs
- Validate workflow structure before save
- Implement rate limiting on actions
- Use HTTPS in production
- CSP headers to prevent XSS

### Backend Integration
- Validate all workflows server-side
- Sandbox workflow execution
- Rate limit API calls
- Implement proper CORS
- Use prepared statements for DB queries

## Testing Strategy

### Unit Tests
- Component rendering
- Event handlers
- Utility functions
- State management

### Integration Tests
- User workflows
- API interactions
- Theme switching
- Responsive behavior

### E2E Tests
- Create workflow
- Connect blocks
- Save workflow
- Execute workflow

## Deployment Architecture

```
┌─────────────┐
│   Vercel    │ ← Static hosting
│   (CDN)     │ ← Edge caching
└──────┬──────┘
       │
       │ API Calls
       ↓
┌─────────────┐
│   Backend   │ ← Workflow execution
│   Server    │ ← Database access
└─────────────┘
```

## Monitoring & Analytics

### To Implement
- **Error tracking**: Sentry integration
- **Performance**: Web Vitals monitoring
- **User analytics**: Usage patterns
- **A/B testing**: Feature experiments

## Future Enhancements

### Phase 2
- [ ] Undo/redo with command pattern
- [ ] Workflow templates library
- [ ] Block marketplace
- [ ] Version control for workflows

### Phase 3
- [ ] Collaborative editing
- [ ] Real-time execution visualization
- [ ] Custom block builder
- [ ] Workflow scheduler

### Phase 4
- [ ] Mobile app version
- [ ] AI-assisted workflow builder
- [ ] Natural language to workflow
- [ ] Advanced debugging tools

## Design System

### Color Palette
- **Primary**: #D4745C (Warm accent)
- **Background**: #FDFCFB (Off-white)
- **Text**: #1A1614 (Near black)
- **Secondary**: #6B6662 (Neutral gray)

### Typography Scale
- **Display**: 3.5rem (Hero titles)
- **H1**: 2.5rem (Page titles)
- **H2**: 2rem (Section titles)
- **H3**: 1.5rem (Card titles)
- **Body**: 1rem (Default text)
- **Small**: 0.875rem (Captions)

### Spacing Scale
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)
- 3xl: 4rem (64px)

### Animation Timing
- Fast: 150ms (Hovers, toggles)
- Base: 250ms (Most transitions)
- Slow: 400ms (Complex animations)

## Accessibility

### Implemented
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for images

### To Implement
- Screen reader testing
- Reduced motion support
- High contrast mode
- Keyboard shortcuts documentation

---

This architecture is designed to be:
- **Scalable**: Easy to add features
- **Maintainable**: Clear organization
- **Performant**: Optimized rendering
- **Professional**: Production-ready code
