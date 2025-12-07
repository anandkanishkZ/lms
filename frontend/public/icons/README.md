# PWA Icons Setup

## Required Icons

You need to create the following icon files in the `public/icons/` directory:

### Main App Icons (Required)
- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px)
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px) - Main icon
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px) - High res icon

### Shortcut Icons (Optional but recommended)
- `student-icon.png` (96x96px) - For student login shortcut
- `teacher-icon.png` (96x96px) - For teacher login shortcut
- `admin-icon.png` (96x96px) - For admin login shortcut

## Design Guidelines

1. Use the emerald green color (#059669) as primary color
2. Include the graduation cap icon or school logo
3. Ensure icons are clear and recognizable at small sizes
4. Use transparent or white background
5. Keep design simple and professional

## Quick Icon Generation

You can use online tools like:
- https://www.pwabuilder.com/ (PWA Image Generator)
- https://realfavicongenerator.net/
- Canva.com for custom designs

Or use ImageMagick to resize from a single source image:
```bash
# Install ImageMagick first
convert source-icon.png -resize 192x192 icon-192x192.png
convert source-icon.png -resize 512x512 icon-512x512.png
# ... repeat for all sizes
```

## Testing

After adding icons, test the PWA installation:
1. Deploy to HTTPS server (required for PWA)
2. Open in Chrome mobile
3. Look for "Install" or "Add to Home Screen" prompt
4. Install and test offline functionality
