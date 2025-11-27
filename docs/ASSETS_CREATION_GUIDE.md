
# Universal Shipping Services - Assets Creation Guide

## 🎨 Required Assets for App Store & Play Store

This guide provides detailed specifications for creating all required visual assets for publishing the USS app.

---

## 📱 App Icon

### File: `assets/images/app-icon.png`

**Specifications:**
- **Size**: 1024x1024 pixels
- **Format**: PNG (24-bit)
- **Color Space**: sRGB or Display P3
- **Transparency**: Supported (but not required)
- **Layers**: Flattened (no layers)

**Design Guidelines:**
- Use the USS logo as the primary element
- Center the logo with adequate padding (at least 10% margin)
- Background: Maritime Blue (#002C5F) or transparent
- Ensure logo is clearly visible at small sizes (29x29 to 1024x1024)
- Avoid text (except logo text)
- No rounded corners (iOS adds them automatically)

**iOS Sizes Generated Automatically:**
- 180x180 (iPhone)
- 167x167 (iPad Pro)
- 152x152 (iPad)
- 120x120 (iPhone)
- 87x87 (iPhone)
- 80x80 (iPad)
- 76x76 (iPad)
- 60x60 (iPhone)
- 58x58 (iPhone)
- 40x40 (iPhone/iPad)
- 29x29 (iPhone/iPad)
- 20x20 (iPhone/iPad)

**Android Sizes Generated Automatically:**
- 512x512 (Play Store)
- 192x192 (xxxhdpi)
- 144x144 (xxhdpi)
- 96x96 (xhdpi)
- 72x72 (hdpi)
- 48x48 (mdpi)

---

## 🌊 Splash Screen

### File: `assets/images/splash-screen.png`

**Specifications:**
- **Size**: 2048x2048 pixels (square)
- **Format**: PNG (24-bit)
- **Background**: Maritime Blue (#002C5F)
- **Content**: USS logo centered

**Design Guidelines:**
- Logo should be approximately 40% of the screen width
- Center the logo both horizontally and vertically
- Use solid Maritime Blue background
- No text except logo text
- Keep it simple and clean
- Consider animation potential

**Platform Adaptations:**
- iOS: Will be scaled and cropped to fit various screen sizes
- Android: Will be scaled to fit screen while maintaining aspect ratio
- Web: Will be displayed in a centered container

---

## 🤖 Android Adaptive Icon

### File: `assets/images/adaptive-icon.png`

**Specifications:**
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency
- **Safe Zone**: Center 66% (684x684 pixels)
- **Background**: Set in app.json (#002C5F)

**Design Guidelines:**
- Place logo within the safe zone (center 684x684 pixels)
- Outer 33% may be cropped on some devices
- Use transparent background
- Logo should work with circular, rounded square, and square masks
- Test with different mask shapes

**Android Mask Shapes:**
- Circle (most common)
- Rounded square
- Square
- Squircle (iOS-style)

---

## 🌐 Favicon (Web)

### File: `assets/images/favicon.png`

**Specifications:**
- **Size**: 48x48 pixels (or 32x32)
- **Format**: PNG or ICO
- **Content**: Simplified USS logo

**Design Guidelines:**
- Use a simplified version of the logo
- Ensure visibility at tiny sizes
- High contrast
- Solid background recommended

---

## 📸 App Store Screenshots (iOS)

### Required Sizes

#### 1. iPhone 6.5" Display (iPhone 14 Pro Max, 13 Pro Max, 12 Pro Max, 11 Pro Max, XS Max)
- **Size**: 1284x2778 pixels (portrait) or 2778x1284 (landscape)
- **Minimum**: 3 screenshots
- **Maximum**: 10 screenshots

#### 2. iPhone 5.5" Display (iPhone 8 Plus, 7 Plus, 6s Plus)
- **Size**: 1242x2208 pixels (portrait) or 2208x1242 (landscape)
- **Minimum**: 3 screenshots
- **Maximum**: 10 screenshots

#### 3. iPad Pro 12.9" Display (3rd gen and later)
- **Size**: 2048x2732 pixels (portrait) or 2732x2048 (landscape)
- **Minimum**: 3 screenshots (if supporting iPad)
- **Maximum**: 10 screenshots

### Recommended Screenshots

**Screenshot 1: Home Screen**
- Show the main dashboard with service cards
- Highlight key features
- Include USS branding

**Screenshot 2: Port Coverage Map**
- Display the interactive map with port markers
- Show global coverage
- Demonstrate map functionality

**Screenshot 3: Shipment Tracking**
- Show real-time tracking interface
- Display shipment details
- Highlight tracking features

**Screenshot 4: Quote Request**
- Show the freight quote form
- Demonstrate ease of use
- Include pricing information

**Screenshot 5: Client Dashboard**
- Display user's shipments and quotes
- Show account features
- Highlight subscription benefits

### Design Tips
- Use device frames (optional but recommended)
- Add captions/text overlays to explain features
- Use consistent branding colors
- Show actual app content (not mockups)
- Highlight unique selling points
- Use high-quality, crisp images

---

## 📱 Play Store Screenshots (Android)

### Required Sizes

#### Phone Screenshots
- **Minimum dimension**: 320px
- **Maximum dimension**: 3840px
- **Recommended**: 1080x1920 pixels (portrait) or 1920x1080 (landscape)
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots

#### 7-inch Tablet Screenshots (Optional)
- **Recommended**: 1200x1920 pixels
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots

#### 10-inch Tablet Screenshots (Optional)
- **Recommended**: 1600x2560 pixels
- **Minimum**: 2 screenshots
- **Maximum**: 8 screenshots

### Recommended Screenshots

Use the same content as iOS screenshots, but optimized for Android dimensions:

1. Home Screen with Services
2. Port Coverage Map
3. Shipment Tracking
4. Quote Request Form
5. Client Dashboard
6. Payment Processing
7. Document Management
8. Multi-language Support

---

## 🎨 Feature Graphic (Android)

### File: Required for Play Store

**Specifications:**
- **Size**: 1024x500 pixels
- **Format**: PNG or JPEG
- **File size**: Maximum 1MB

**Design Guidelines:**
- Use Maritime Blue (#002C5F) background
- Include USS logo (left or center)
- Add tagline: "Global Maritime & Logistics Solutions"
- Use white text for contrast
- Keep it clean and professional
- No device frames or screenshots

**Example Layout:**
```
[USS Logo]  |  Universal Shipping Services
            |  Global Maritime & Logistics Solutions
```

---

## 🎬 App Preview Video (Optional but Recommended)

### iOS App Preview

**Specifications:**
- **Duration**: 15-30 seconds
- **Format**: M4V, MP4, or MOV
- **Resolution**: Match screenshot dimensions
- **Orientation**: Portrait or landscape (match screenshots)

**Content Ideas:**
- Quick tour of main features
- Demonstrate key workflows
- Show app in action
- Highlight unique features

### Android Promo Video

**Specifications:**
- **Duration**: 30 seconds to 2 minutes
- **Format**: YouTube video
- **Resolution**: 1080p or higher

**Content Ideas:**
- App overview
- Feature demonstrations
- User testimonials
- Call to action

---

## 🛠️ Tools for Creating Assets

### Design Tools
- **Adobe Photoshop**: Professional image editing
- **Adobe Illustrator**: Vector graphics
- **Figma**: Collaborative design (free tier available)
- **Sketch**: Mac-only design tool
- **Canva**: Easy-to-use online tool (free tier available)

### Screenshot Tools
- **Fastlane Snapshot**: Automated screenshot generation
- **Screely**: Add device frames online
- **Mockuphone**: Device mockup generator
- **AppLaunchpad**: Screenshot generator with captions

### Icon Generators
- **App Icon Generator**: Generate all required sizes
- **MakeAppIcon**: Free icon resizing
- **Icon Slate**: Mac app for icon generation

---

## ✅ Asset Checklist

### Before Building

- [ ] App icon created (1024x1024)
- [ ] Splash screen created (2048x2048)
- [ ] Adaptive icon created (1024x1024)
- [ ] Favicon created (48x48)
- [ ] All files saved in correct format (PNG)
- [ ] All files placed in `assets/images/` directory
- [ ] Files named correctly:
  - `app-icon.png`
  - `splash-screen.png`
  - `adaptive-icon.png`
  - `favicon.png`

### Before App Store Submission

- [ ] iPhone 6.5" screenshots (3-10)
- [ ] iPhone 5.5" screenshots (3-10)
- [ ] iPad Pro screenshots (3-10, if supporting iPad)
- [ ] App preview video (optional)
- [ ] All screenshots show actual app content
- [ ] Screenshots are high quality and crisp

### Before Play Store Submission

- [ ] Phone screenshots (2-8)
- [ ] Tablet screenshots (2-8, optional)
- [ ] Feature graphic (1024x500)
- [ ] Promo video (optional)
- [ ] All screenshots meet dimension requirements
- [ ] Feature graphic is professional and branded

---

## 📐 Quick Reference

### Color Palette
```
Maritime Blue (Primary):    #002C5F
Ocean Blue (Secondary):     #0084FF
Aqua Sky (Accent):          #00C2FF
Pure White:                 #FFFFFF
Light Grey:                 #F2F4F7
Dark Grey:                  #1A1A1A
```

### Typography
- **Primary Font**: System default (San Francisco on iOS, Roboto on Android)
- **Logo Font**: As per USS branding guidelines
- **Heading Weight**: Bold (700)
- **Body Weight**: Regular (400)

### Spacing
- **Minimum margin**: 10% of icon size
- **Safe zone**: Center 66% for adaptive icons
- **Screenshot padding**: 20-40px from edges

---

## 🎯 Best Practices

1. **Consistency**: Use the same design language across all assets
2. **Simplicity**: Keep designs clean and uncluttered
3. **Branding**: Maintain USS brand identity throughout
4. **Quality**: Use high-resolution images (2x or 3x)
5. **Testing**: View assets at various sizes before finalizing
6. **Accessibility**: Ensure sufficient color contrast
7. **Localization**: Consider text in screenshots for multiple languages
8. **Updates**: Keep screenshots current with app features

---

## 📞 Need Help?

If you need assistance creating these assets:

1. **Hire a Designer**: Fiverr, Upwork, or 99designs
2. **Use Templates**: Envato Elements, Creative Market
3. **DIY Tools**: Canva, Figma (free tiers available)
4. **Automated Tools**: Fastlane, App Icon Generator

---

**Document Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained By**: USS Development Team
