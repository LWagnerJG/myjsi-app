# JSI Design System

Complete design system implementing the JSI Digital Style Guide 1.0.

## Design Philosophy

- **Modern & Accessible**: Clean, earth-toned palette avoiding pure black
- **Typography**: Neue Haas Grotesk Display Pro
- **Shapes**: Pill-shaped buttons (border-radius: 9999px), 24px radius cards
- **Shadows**: Soft, refined shadows using JSI charcoal (#353535)
- **Interactions**: Smooth transitions with scale-based feedback

## Core Tokens

### Colors (`JSI_COLORS`)

```javascript
import { JSI_COLORS } from '../design-system';

JSI_COLORS.charcoal  // #353535 - Primary text & buttons
JSI_COLORS.white     // #FFFFFF - High contrast
JSI_COLORS.stone     // #E3E0D8 - Warm neutral
JSI_COLORS.warmBeige // #F0EDE8 - Soft backgrounds
```

### Typography (`JSI_TYPOGRAPHY`)

Based on the style guide hierarchy (H1-H8, Grotesk scale):
- **H1**: 4.5rem (72px) - Hero headings
- **H2**: 3.25rem (52px) - Section headings
- **Body**: 1rem (16px) - Default text
- **Small**: 0.875rem (14px) - Supporting text

### Spacing & Layout

```javascript
DESIGN_TOKENS.spacing.md    // 16px
DESIGN_TOKENS.spacing.lg    // 24px
DESIGN_TOKENS.borderRadius.pill  // 9999px (buttons)
DESIGN_TOKENS.borderRadius.xl    // 24px (cards)
```

### Shadows

```javascript
DESIGN_TOKENS.shadows.card        // Card elevation
DESIGN_TOKENS.shadows.button      // Button depth
DESIGN_TOKENS.shadows.cardHover   // Hover state
```

## Components

### Buttons

All buttons use pill shapes per JSI guidelines:

```jsx
import { Button, IconButton } from '../components/common/Button';

// Primary button (filled)
<Button theme={theme} variant="primary" size="md">
  Click Me
</Button>

// Secondary button (outlined)
<Button theme={theme} variant="secondary">
  Cancel
</Button>

// Icon button (circular)
<IconButton theme={theme} size="md">
  <Plus size={20} />
</IconButton>
```

### Cards

24px border radius with refined shadows:

```jsx
import { GlassCard, ProductCard } from '../components/common/GlassCard';

// Standard card
<GlassCard theme={theme} variant="elevated">
  <p>Content</p>
</GlassCard>

// Interactive card with hover
<GlassCard theme={theme} variant="interactive">
  <p>Clickable content</p>
</GlassCard>

// Product card with overlay
<ProductCard
  theme={theme}
  image="/path/to/image.jpg"
  familyName="Seating"
  subCategoryTitle="Office Chairs"
  onLearnClick={() => {}}
  onProductsClick={() => {}}
/>
```

## Helper Functions

```javascript
import {
  spacing,
  radius,
  shadow,
  isDarkTheme,
  getPrimaryButtonStyles,
} from '../design-system';

// Get spacing value
const padding = spacing('md'); // '1rem'

// Get border radius
const corners = radius('pill'); // '9999px'

// Check theme
if (isDarkTheme(theme)) {
  // Use dark shadows
}

// Get button styles
const buttonStyles = getPrimaryButtonStyles(theme);
```

## Usage Guidelines

1. **Buttons**: Always use pill shape (`borderRadius: '9999px'`)
2. **Cards**: Use 24px radius (`borderRadius: '24px'`)
3. **Colors**: Use JSI_COLORS.charcoal instead of pure black
4. **Shadows**: Use design tokens for consistent depth
5. **Typography**: Apply Neue Haas Grotesk Display Pro
6. **Interactions**: Include scale transform on active state (scale-95)

## Dark Mode Support

The design system automatically adapts shadows and colors for dark themes:

```javascript
const isDark = isDarkTheme(theme);
const shadows = isDark ? DESIGN_TOKENS.shadowsDark : DESIGN_TOKENS.shadows;
```

## Migration from Old System

1. Replace custom button styles with `<Button>` component
2. Update card border-radius from 16px to 24px
3. Replace pure black (#000) with charcoal (#353535)
4. Add pill shapes to all buttons
5. Update shadows to use DESIGN_TOKENS

## Resources

- JSI Digital Style Guide 1.0
- Typography: Neue Haas Grotesk Display Pro
- Color palette: Earth-toned, warm neutrals
