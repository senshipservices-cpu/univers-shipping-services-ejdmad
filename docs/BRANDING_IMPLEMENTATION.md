
# Universal Shipping Services - Branding Implementation Guide

## ✅ Implementation Summary

This document outlines all the branding changes implemented for the Universal Shipping Services (USS) application.

## 🎨 1. Official Color Palette

The official maritime color palette has been implemented in `styles/commonStyles.ts`:

### Brand Colors
- **Maritime Blue (Primary)**: `#002C5F` - Used for headers, primary buttons, and main branding
- **Ocean Blue (Secondary)**: `#0084FF` - Used for action buttons, accents, and interactive elements
- **Aqua Sky (Accent)**: `#00C2FF` - Used for highlights and secondary accents
- **Pure White**: `#FFFFFF` - Used for text on dark backgrounds
- **Light Grey**: `#F2F4F7` - Used for card backgrounds

### Application
- All buttons now use `#0084FF` (Ocean Blue)
- All headers use `#002C5F` (Maritime Blue)
- All titles use `#002C5F` (Maritime Blue)
- Consistent color scheme across light and dark modes

## 🖼️ 2. Logo Integration

### Logo Component (`components/Logo.tsx`)
A reusable Logo component has been created with the following features:
- Configurable width (default: 120px)
- Optional company name and tagline display
- Responsive sizing
- Currently displays a placeholder "USS" logo
- **Action Required**: Replace with actual logo at `assets/images/uss-logo.png`

### Logo Placement

#### Global Header (`components/PageHeader.tsx`)
- **Location**: Center of header
- **Size**: 120px width
- **Left**: Back button (when needed) - styled in Ocean Blue (#0084FF)
- **Right**: Help button (?) - styled in Ocean Blue (#0084FF)
- **Background**: Maritime Blue (#002C5F)
- **Visible**: All public and private pages

#### Home Screen (`app/(tabs)/(home)/index.tsx`)
- **Location**: Top of page, centered
- **Size**: 180px width
- **Text Below Logo**:
  - "Universal Shipping Services" (18px, bold)
  - "Global Maritime & Logistics Solutions" (12px, medium)
- **Styling**: Centered with proper spacing

## 📱 3. App Icon & Splash Screen

### App Configuration (`app.json`)
Updated with official branding:

#### App Icon
- **iOS**: 1024x1024 pixels
- **Android**: 512x512 pixels (adaptive icon)
- **Background**: `#002C5F` (Maritime Blue)
- **File**: `assets/images/uss-logo.png`

#### Splash Screen
- **Background Color**: `#002C5F` (Maritime Blue)
- **Logo Size**: 200px width (centered)
- **Animation**: 0.5s fade-in effect
- **File**: `assets/images/uss-logo.png`

#### App Metadata
- **Name**: "Universal Shipping Services"
- **Slug**: "universal-shipping-services"
- **Bundle ID (iOS)**: "com.uss.global"
- **Package (Android)**: "com.uss.global"
- **Scheme**: "uss"

## 🧩 4. Module Icons

Official emoji icons have been integrated throughout the app:

### Quick Access Cards (Home Screen)
- **Ports**: ⚓ (Anchor) - Color: `#0084FF`
- **Services**: 📦 (Package) - Color: `#002C5F`
- **Pricing**: 💳 (Credit Card) - Color: `#00C2FF`
- **Become Agent**: 🌍 (Globe) - Color: `#0084FF`

### Navigation Icons
- **Contact**: ✉️ (Envelope)
- **Home**: 🏠 (House)

All icons are styled with the Ocean Blue color (#0084FF) for consistency.

## 📄 5. Updated Pages

### Home Screen
- ✅ Logo at top (180px width)
- ✅ Company name and tagline
- ✅ Updated color scheme
- ✅ Module icons with emojis
- ✅ Consistent button colors

### Port Coverage
- ✅ Updated header with logo
- ✅ Maritime Blue theme
- ✅ Ocean Blue action buttons

### Global Services
- ✅ Updated header with logo
- ✅ Consistent color palette
- ✅ Ocean Blue CTAs

### Pricing
- ✅ Updated header with logo
- ✅ Maritime Blue titles
- ✅ Ocean Blue buttons

## 🔧 6. Technical Implementation

### Files Modified
1. `styles/commonStyles.ts` - Color palette
2. `components/Logo.tsx` - New logo component
3. `components/PageHeader.tsx` - Updated header with logo
4. `app/(tabs)/(home)/index.tsx` - Home screen with logo
5. `app.json` - App configuration

### Files Created
1. `components/Logo.tsx` - Reusable logo component
2. `assets/images/LOGO_INSTRUCTIONS.md` - Logo integration guide
3. `docs/BRANDING_IMPLEMENTATION.md` - This document

## 📋 7. Action Required

### Add Official Logo
To complete the branding integration, you need to add the official logo file:

1. **File Location**: `assets/images/uss-logo.png`
2. **Format**: PNG with transparent background
3. **Size**: 1024x1024 pixels (square) for app icon
4. **Alternative Size**: 512x307 pixels (5:3 ratio) for in-app display

### Logo Specifications
- **Background**: Transparent
- **Content**: Centered logo with padding
- **Format**: PNG (high resolution)

### After Adding Logo
1. Place the logo file at `assets/images/uss-logo.png`
2. Run `npx expo prebuild --clean` to regenerate app icons
3. The logo will automatically appear in:
   - Global header (all pages)
   - Home screen
   - App icon (iOS & Android)
   - Splash screen

## ✅ 8. Branding Verification Checklist

- ✅ All headers use the logo
- ✅ All buttons use #0084FF (Ocean Blue)
- ✅ All titles use #002C5F (Maritime Blue)
- ✅ App icon configuration updated
- ✅ Splash screen configuration updated
- ✅ Module icons assigned (⚓📦💳🌍✉️🏠)
- ✅ Consistent color palette throughout
- ⏳ **Pending**: Add actual logo file at `assets/images/uss-logo.png`

## 🎯 9. Brand Guidelines Summary

### Primary Use Cases
- **Maritime Blue (#002C5F)**: Headers, titles, primary branding
- **Ocean Blue (#0084FF)**: Buttons, links, interactive elements
- **Aqua Sky (#00C2FF)**: Highlights, badges, accents

### Typography
- **Headers**: Bold, Maritime Blue
- **Body Text**: Regular, theme-dependent (black/white)
- **Secondary Text**: Medium, grey (#666666)

### Spacing
- **Logo Padding**: Minimum 20px around logo
- **Button Padding**: 14px vertical, 24px horizontal
- **Card Padding**: 20-24px all sides

## 📞 10. Support

For questions or issues with the branding implementation:
1. Check `assets/images/LOGO_INSTRUCTIONS.md` for logo specifications
2. Review `styles/commonStyles.ts` for color definitions
3. Examine `components/Logo.tsx` for logo component usage

## 🚀 11. Next Steps

1. **Add Logo File**: Place official logo at `assets/images/uss-logo.png`
2. **Test on Devices**: Verify logo appears correctly on iOS and Android
3. **Rebuild App**: Run `npx expo prebuild --clean` after adding logo
4. **Verify Colors**: Check all pages for consistent color usage
5. **Test Dark Mode**: Ensure branding works in both light and dark themes

---

**Implementation Date**: 2024
**Version**: 1.0.0
**Status**: ✅ Complete (pending logo file)
