# image-viewer

A simple web app to display a remote image file in a lightbox-style interface. Supported formats include JPEG, PNG, GIF, SVG, WebP, TIFF, AVIF, and BMP. Maximum allowed file size is 200 MB.

Uses [OpenSeadragon](https://openseadragon.github.io) to display images, with TIFF support provided by way of the [GeoTIFFTileSource](https://github.com/pearcetm/GeoTIFFTileSource) plugin.

## How to use

When the app is running, submit a valid remote image URL via query parameter `url`. For example:

```
/?url=https://upload.wikimedia.org/wikipedia/commons/d/db/Tree_of_Life_-_Shaker_-_painted_by_Hannah_Cohoon.JPG
```

Once the image loads, use the built-in controls to zoom, rotate the image, or enter full screen mode.

## Development setup

```sh
# Install dependencies
npm install

# Run development server
npm run dev

# Build production website
npm run build
```
