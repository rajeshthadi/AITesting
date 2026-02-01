# 🎨 UI Design SOP

## Purpose
Define the user interface structure and behavior for the Selenium to Playwright converter web application.

## Design Principles
1. **Dark Theme**: Modern, eye-friendly dark interface
2. **Dual Panel Layout**: Side-by-side input/output code editors
3. **Real-time Feedback**: Show conversion progress and results immediately
4. **Responsive Design**: Works on desktop and tablet devices
5. **Accessibility**: Keyboard shortcuts and screen reader support

## Layout Structure

### Header Section
- **Title**: "Selenium → Playwright Converter"
- **Subtitle**: "Convert Java TestNG to JavaScript/TypeScript"
- **Language Toggle**: Switch between JS/TS output
- **Status Indicator**: Show Ollama connection status

### Main Content Area

#### Left Panel - Input
- **Label**: "Selenium Java Code (TestNG)"
- **Code Editor**: Syntax-highlighted textarea
- **Features**:
  - Line numbers
  - Syntax highlighting for Java
  - Auto-indentation
  - Paste support
  - Clear button

#### Right Panel - Output
- **Label**: "Playwright {Language} Code"
- **Code Editor**: Syntax-highlighted textarea
- **Features**:
  - Line numbers
  - Syntax highlighting for JS/TS
  - Read-only (with copy option)
  - Download button
  - Copy to clipboard button

### Action Bar (Between Panels)
- **Convert Button**: Primary action (large, prominent)
- **Clear All Button**: Reset both panels
- **Sample Code Button**: Load example Selenium code

### Footer Section
- **Conversion Report**:
  - Lines converted
  - Warnings/Issues
  - Conversion time
  - Model used (codellama:7b)
- **Keyboard Shortcuts Guide**

## Color Scheme (Dark Theme)

### Primary Colors
- **Background**: `#1a1a2e` (Deep dark blue)
- **Surface**: `#16213e` (Slightly lighter)
- **Primary**: `#0f3460` (Dark blue accent)
- **Accent**: `#e94560` (Vibrant pink/red)
- **Success**: `#00d9ff` (Cyan)

### Text Colors
- **Primary Text**: `#eaeaea` (Light gray)
- **Secondary Text**: `#a0a0a0` (Medium gray)
- **Code Text**: `#f8f8f2` (Off-white)

### Syntax Highlighting
- **Keywords**: `#ff79c6` (Pink)
- **Strings**: `#f1fa8c` (Yellow)
- **Comments**: `#6272a4` (Blue-gray)
- **Functions**: `#50fa7b` (Green)
- **Numbers**: `#bd93f9` (Purple)

## Interactive Elements

### Buttons
- **Primary Button** (Convert):
  - Background: Gradient `#e94560` to `#ff6b9d`
  - Hover: Slight scale + glow effect
  - Active: Pressed state with darker shade
  - Disabled: Gray with reduced opacity

- **Secondary Buttons**:
  - Background: Transparent with border
  - Hover: Filled background
  - Icon + Text combination

### Code Editors
- **Font**: `'Fira Code', 'Consolas', monospace`
- **Font Size**: `14px`
- **Line Height**: `1.6`
- **Padding**: `16px`
- **Border**: Subtle glow on focus
- **Scrollbar**: Custom styled (thin, dark)

## Animations & Transitions

### Micro-interactions
- **Button Hover**: 200ms ease-in-out scale
- **Panel Focus**: Subtle border glow animation
- **Loading State**: Pulsing gradient on convert button
- **Success State**: Green checkmark animation
- **Error State**: Red shake animation

### Loading Indicator
- **Type**: Animated gradient bar
- **Position**: Top of convert button
- **Message**: "Converting with codellama..."

## Responsive Breakpoints

### Desktop (> 1024px)
- Side-by-side dual panels
- Full feature set

### Tablet (768px - 1024px)
- Stacked panels (top/bottom)
- Slightly reduced padding

### Mobile (< 768px)
- Single panel with tabs
- Simplified controls

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Convert code |
| `Ctrl + K` | Clear all |
| `Ctrl + S` | Download output |
| `Ctrl + C` | Copy output (when focused) |
| `Ctrl + L` | Load sample code |
| `Ctrl + /` | Toggle language (JS/TS) |

## Error States

### Connection Error
- **Message**: "⚠️ Cannot connect to Ollama. Please ensure it's running."
- **Action**: "Test Connection" button
- **Style**: Yellow warning banner

### Conversion Error
- **Message**: "❌ Conversion failed: {error message}"
- **Action**: "Try Again" button
- **Style**: Red error banner

### Empty Input
- **Message**: "ℹ️ Please enter Selenium code to convert"
- **Style**: Blue info banner

## Success States

### Conversion Complete
- **Message**: "✅ Conversion successful!"
- **Details**: Show conversion stats
- **Style**: Green success banner with fade-out

## Accessibility

### ARIA Labels
- All buttons have descriptive labels
- Code editors have proper roles
- Status messages announced to screen readers

### Focus Management
- Logical tab order
- Visible focus indicators
- Skip to content link

### Contrast Ratios
- Text: Minimum 4.5:1 ratio
- Interactive elements: Minimum 3:1 ratio

## Performance Considerations
- Lazy load syntax highlighting
- Debounce auto-save (if implemented)
- Optimize re-renders
- Use CSS transforms for animations
- Minimize DOM manipulations
