# Favicon Generation and Maintenance Guide

This document outlines how favicons are generated for the Bridging Trust AI website from the company logo, and how to update them if needed.

## Overview

The Bridging Trust AI website uses a comprehensive favicon setup that includes:

- Standard favicons in various sizes (16x16 to 512x512)
- Apple Touch Icons for iOS devices
- Android Chrome icons for Android devices
- Microsoft Tile icons for Windows devices
- Manifest and configuration files for modern browsers

All icons are generated from the SVG logo file at `public/images/logo/BTAI_Logo_Original.svg`.

## Favicon Files and Locations

The favicons are organized in the following structure:

```
public/
├── favicon.ico                           # Main favicon (32x32 PNG)
├── site.webmanifest                      # Web app manifest for PWAs
├── browserconfig.xml                     # Microsoft browser configuration
└── icons/
    ├── favicon-16.png                    # Standard favicons
    ├── favicon-32.png
    ├── favicon-48.png
    ├── favicon-96.png
    ├── favicon-128.png
    ├── favicon-196.png
    ├── favicon-256.png
    ├── favicon-512.png
    ├── apple-touch-icon/                 # iOS icons
    │   ├── apple-touch-icon-57.png
    │   ├── apple-touch-icon-60.png
    │   ├── apple-touch-icon-72.png
    │   ├── apple-touch-icon-76.png
    │   ├── apple-touch-icon-114.png
    │   ├── apple-touch-icon-120.png
    │   ├── apple-touch-icon-144.png
    │   ├── apple-touch-icon-152.png
    │   └── apple-touch-icon-180.png
    ├── android-chrome/                   # Android icons
    │   ├── android-chrome-36.png
    │   ├── android-chrome-48.png
    │   ├── android-chrome-72.png
    │   ├── android-chrome-96.png
    │   ├── android-chrome-144.png
    │   ├── android-chrome-192.png
    │   └── android-chrome-512.png
    └── mstile/                           # Microsoft Windows icons
        ├── mstile-70.png
        ├── mstile-144.png
        ├── mstile-150.png
        └── mstile-310.png
```

## How Favicons Are Configured

The favicon declarations are integrated into the Next.js app through the `metadata` and `viewport` objects in `app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";

// Theme color for browser UI (Next.js 15+ requires this in viewport export)
export const viewport: Viewport = {
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  // Other metadata
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      // Other icon declarations
    ],
    apple: [
      // Apple Touch Icon declarations
    ],
    other: [
      // Other icon type declarations
    ],
  },
  other: {
    'msapplication-TileColor': '#ffffff',
    'msapplication-TileImage': '/icons/mstile/mstile-144.png',
  },
};
```

Next.js uses these declarations to automatically generate the appropriate `<link>` and `<meta>` tags in the HTML head.

## How to Regenerate Favicons

If you need to update the favicons (e.g., if the logo changes), follow these steps:

1. Ensure the updated logo is saved as an SVG at `public/images/logo/BTAI_Logo_Original.svg`

2. Install the required dependency if not already installed:
   ```bash
   npm install --save-dev sharp
   ```

3. Run the favicon generation script:
   ```bash
   node scripts/generate-favicon.js
   ```

This will regenerate all favicon files based on the current version of the SVG logo.

## The Generation Script

The favicon generation script (`scripts/generate-favicon.js`) uses the `sharp` library to:

1. Resize the SVG logo to various dimensions needed for different platforms
2. Save the resized images in appropriate formats (PNG for most, ICO for the main favicon)
3. Create the necessary configuration files (`site.webmanifest` and `browserconfig.xml`)

The script generates icons with transparent backgrounds, preserving the logo's aspect ratio.

## Testing Favicons

To test if the favicons appear correctly:

1. Start the development server with `npm run dev`
2. Open the site in various browsers (Chrome, Safari, Firefox, Edge)
3. Check if the favicon appears in the browser tab
4. Test on mobile devices to ensure proper icons appear when adding to home screen
5. Test in incognito/private browsing mode to ensure that the browser doesn't use cached favicons

## Troubleshooting

If favicons aren't displaying correctly:

1. Check browser caching - hard refresh with Ctrl+Shift+R or Cmd+Shift+R
2. Verify that the metadata and viewport exports in `app/layout.tsx` are correctly formatted
3. Ensure all path references are correct and the files exist
4. Check browser developer tools for any 404 errors related to favicon requests
5. Some browsers may take time to update favicons due to aggressive caching

## Additional Resources

- [Next.js Metadata API documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Viewport API documentation](https://nextjs.org/docs/app/api-reference/functions/generate-viewport)
- [PWA Web App Manifest specification](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Microsoft's Tile Icons documentation](https://docs.microsoft.com/en-us/previous-versions/windows/internet-explorer/ie-developer/platform-apis/dn320426(v=vs.85)) 