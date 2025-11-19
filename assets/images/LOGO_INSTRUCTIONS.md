
# Logo Integration Instructions

## Required Logo File

To complete the branding integration, you need to add the official Universal Shipping Services logo:

### File Location
Place your logo file at: `assets/images/uss-logo.png`

### Logo Specifications

#### For App Icon & Splash Screen:
- **Format**: PNG with transparent background
- **Size**: 1024x1024 pixels (square)
- **Content**: Centered logo with padding
- **Background**: Transparent (the app will apply #002C5F Maritime Blue)

#### For In-App Display:
- **Format**: PNG with transparent background
- **Recommended Size**: 512x307 pixels (approximately 5:3 ratio)
- **Content**: Full logo with text if desired
- **Background**: Transparent

### Current Implementation

The app currently uses a placeholder logo component that displays "USS" in the brand colors. Once you add the actual logo file at `assets/images/uss-logo.png`, it will automatically be used throughout the app.

### Where the Logo Appears

1. **Global Header** (PageHeader component)
   - Size: 120px width
   - Location: Center of header
   - Accompanies: Back button (left), Help button (right)

2. **Home Screen**
   - Size: 180px width
   - Location: Top of page
   - Includes: Company name and tagline below logo

3. **App Icon**
   - iOS: 1024x1024
   - Android: 512x512
   - Background: #002C5F (Maritime Blue)

4. **Splash Screen**
   - Size: 200px width (centered)
   - Background: #002C5F (Maritime Blue)
   - Animation: 0.5s fade-in

### How to Add Your Logo

1. Save your logo file as `uss-logo.png`
2. Place it in the `assets/images/` directory
3. The app will automatically use it instead of the placeholder
4. For app icon and splash screen, run: `npx expo prebuild --clean`

### Brand Colors Applied

All buttons, headers, and UI elements now use the official color palette:

- **Primary (Maritime Blue)**: #002C5F - Headers, primary buttons
- **Secondary (Ocean Blue)**: #0084FF - Action buttons, accents
- **Accent (Aqua Sky)**: #00C2FF - Highlights, secondary accents
- **Pure White**: #FFFFFF - Text on dark backgrounds
- **Light Grey**: #F2F4F7 - Card backgrounds

### Module Icons

The following emoji icons are used for quick access cards:

- **Ports**: ⚓ (Anchor)
- **Services**: 📦 (Package)
- **Pricing**: 💳 (Credit Card)
- **Become Agent**: 🌍 (Globe)
- **Contact**: ✉️ (Envelope)
- **Home**: 🏠 (House)

All icons are styled with #0084FF (Ocean Blue) color.
