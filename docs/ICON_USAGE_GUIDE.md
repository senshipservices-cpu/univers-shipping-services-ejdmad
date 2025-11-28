
# Icon Usage Guide

This guide explains how to use icons in the Universal Shipping Services application.

## Icon Components

The application provides two icon components:

### 1. IconSymbol (Direct Platform-Specific Icons)

Use this when you need precise control over the icon names for each platform:

\`\`\`tsx
import { IconSymbol } from '@/components/IconSymbol';

<IconSymbol
  ios_icon_name="house.fill"
  android_material_icon_name="home"
  size={24}
  color={colors.primary}
/>
\`\`\`

### 2. Icon (Smart Concept-Based Icons)

Use this for automatic platform-specific icon mapping:

\`\`\`tsx
import { Icon } from '@/components/Icon';

<Icon
  name="home"
  size={24}
  color={colors.primary}
/>
\`\`\`

## Available Icon Concepts

The following icon concepts are available and will automatically map to the correct platform-specific icons:

### Navigation
- `home` - Home icon
- `back` - Back/chevron left
- `forward` - Forward/chevron right
- `menu` - Menu/hamburger icon
- `close` - Close/X icon

### Actions
- `add` - Plus/add icon
- `remove` - Minus/remove icon
- `edit` - Edit/pencil icon
- `delete` - Delete/trash icon
- `save` - Save/checkmark icon
- `search` - Search/magnifying glass
- `filter` - Filter list icon
- `refresh` - Refresh/reload icon
- `share` - Share icon
- `download` - Download icon
- `upload` - Upload icon

### User & Account
- `person` - Person icon
- `profile` - Profile/account circle
- `login` - Login icon
- `logout` - Logout icon
- `admin` - Admin/shield icon

### Communication
- `email` - Email/envelope icon
- `phone` - Phone icon
- `message` - Message icon
- `chat` - Chat/conversation icon
- `notification` - Notification/bell icon

### Business & Commerce
- `business` - Business/building icon
- `payment` - Payment/credit card
- `cart` - Shopping cart
- `receipt` - Receipt icon
- `money` - Money/dollar sign

### Shipping & Logistics
- `ship` - Ship/ferry icon
- `anchor` - Anchor icon
- `package` - Package/box icon
- `truck` - Truck/shipping icon
- `location` - Location pin icon
- `map` - Map icon
- `tracking` - Tracking/GPS icon

### Documents & Files
- `document` - Document icon
- `folder` - Folder icon
- `file` - File icon
- `pdf` - PDF icon

### Status & Indicators
- `success` - Success/checkmark circle
- `error` - Error/X circle
- `warning` - Warning/exclamation triangle
- `info` - Info/information circle
- `help` - Help/question mark circle

### Time & Calendar
- `calendar` - Calendar icon
- `clock` - Clock icon
- `time` - Time/access time icon

### Settings & Configuration
- `settings` - Settings/gear icon
- `security` - Security/shield icon
- `lock` - Lock icon
- `unlock` - Unlock icon

### Media & Content
- `image` - Image/photo icon
- `camera` - Camera icon
- `video` - Video camera icon
- `play` - Play button
- `pause` - Pause button

### Social & Interaction
- `like` - Like/heart icon
- `star` - Star icon
- `bookmark` - Bookmark icon

### Miscellaneous
- `globe` - Globe/world icon
- `language` - Language icon
- `dashboard` - Dashboard/grid icon
- `analytics` - Analytics/chart icon
- `verified` - Verified/checkmark seal
- `premium` - Premium/crown icon

## Finding Icon Names

### iOS SF Symbols
Browse available SF Symbols at: https://developer.apple.com/sf-symbols/

Common patterns:
- `.fill` suffix for filled versions
- `.circle` suffix for circular backgrounds
- Multiple words separated by dots

### Android Material Icons
Browse available Material Icons at: https://fonts.google.com/icons

Common patterns:
- Words separated by underscores
- No special suffixes for filled versions (use `_outlined` for outlined)

## Best Practices

1. **Use Icon component for common concepts**: This ensures consistency and reduces errors
2. **Use IconSymbol for custom/specific icons**: When you need precise control
3. **Always provide both iOS and Android names**: Never leave one platform undefined
4. **Test on both platforms**: Icons may look different on iOS vs Android
5. **Use appropriate sizes**: Common sizes are 16, 20, 24, 28, 32, 40, 48
6. **Match icon style to context**: Use filled icons for active states, outlined for inactive

## Troubleshooting

### Question Mark Icons Appearing

If you see question mark (?) icons in your app:

1. **Check icon names are valid**:
   - iOS: Verify the SF Symbol name exists
   - Android: Verify the Material Icon name exists

2. **Check both platforms are defined**:
   - Always provide both `ios_icon_name` and `android_material_icon_name`

3. **Use Icon component**: It provides automatic fallbacks

4. **Check console warnings**: The Icon components log warnings for invalid names

### Icon Not Displaying

1. **Verify color contrast**: Ensure icon color contrasts with background
2. **Check size**: Very small or very large sizes may not render properly
3. **Verify import**: Ensure you're importing from the correct path

## Examples

### Basic Usage
\`\`\`tsx
<Icon name="home" size={24} color={colors.primary} />
\`\`\`

### Custom Override
\`\`\`tsx
<Icon 
  name="ship" 
  iosIconName="sailboat.fill"
  androidIconName="directions_boat"
  size={32} 
  color={colors.secondary} 
/>
\`\`\`

### Direct Platform Control
\`\`\`tsx
<IconSymbol
  ios_icon_name="shippingbox.fill"
  android_material_icon_name="inventory_2"
  size={28}
  color={colors.accent}
/>
\`\`\`

### With Style
\`\`\`tsx
<Icon 
  name="star" 
  size={20} 
  color={colors.warning}
  style={{ marginRight: 8 }}
/>
\`\`\`
