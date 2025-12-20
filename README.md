# exif

[![tests](https://img.shields.io/github/actions/workflow/status/substrate-system/exif/nodejs.yml?style=flat-square)](https://github.com/substrate-system/exif/actions/workflows/nodejs.yml)
[![types](https://img.shields.io/npm/types/@substrate-system/exif?style=flat-square)](README.md)
[![module](https://img.shields.io/badge/module-ESM%2FCJS-blue?style=flat-square)](README.md)
[![semantic versioning](https://img.shields.io/badge/semver-2.0.0-blue?logo=semver&style=flat-square)](https://semver.org/)
[![Common Changelog](https://nichoth.github.io/badge/common-changelog.svg)](./CHANGELOG.md)
[![install size](https://flat.badgen.net/packagephobia/install/@substrate-system/exif)](https://packagephobia.com/result?p=@substrate-system/exif)
[![gzip size](https://flat.badgen.net/bundlephobia/minzip/@substrate-system/exif)](https://bundlephobia.com/package/@substrate-system/exif)
[![dependencies](https://img.shields.io/badge/dependencies-zero-brightgreen.svg?style=flat-square)](package.json)
[![license](https://img.shields.io/badge/license-Big_Time-blue?style=flat-square)](LICENSE)

Read and modify EXIF data in Browsers and Node.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Install](#install)
- [Browsers](#browsers)
  * [Reading from a File Input](#reading-from-a-file-input)
  * [Reading from a URL](#reading-from-a-url)
- [Node.js Usage](#nodejs-usage)
  * [Reading and Writing Files](#reading-and-writing-files)
  * [Working with Buffers](#working-with-buffers)
- [API](#api)
  * [Tag Constants](#tag-constants)
  * [Helpers](#helpers)
- [Modues](#modues)

<!-- tocstop -->

</details>

## Install

```sh
npm i -S @substrate-system/exif
```

## Example

### Read EXIF data

```ts
import { load } from '@substrate-system/exif'
import { getSummary } from '@substrate-system/exif/summary'

const exif = await load(data)  // Uint8Array of image data

const info = getSummary(exif)

// => {
//   make,
//   model,
//   software,
//   artist,
//   copyright,
//   ...
// }
```

### Remove EXIF data

Just remove all the exif data from an image.

```ts
import { stripExif } from '@substrate-system/exif/remove'

const stripped = stripExif(jpeg)
```

## Browsers

Import from the browser-specific entry point for utilities like
`loadFromBlob` and `loadFromUrl`.

```ts
import * as exif from '@substrate-system/exif/browser'

// Or use named imports
import {
  loadFromBlob,
  loadFromUrl,
  ImageIFD,
  ExifIFD
} from '@substrate-system/exif/browser'
```

### Reading from a File Input

Read and update EXIF metadata in a browser.

```html
<input type="file" id="file-input" />
```

```js
import * as exif from '@substrate-system/exif/browser'

const input = document.getElementById('file-input')
input.addEventListener('change', async (ev) => {
  const file = ev.target.files[0]
  
  // Load EXIF data directly from the File object
  const exifData = await exif.loadFromBlob(file)
  console.log('Camera Make:', exifData['0th'][exif.ImageIFD.Make])
  
  // Modify EXIF data
  exifData['0th'][exif.ImageIFD.Make] = "My Custom Camera"
  
  // Create a new Blob with modified EXIF
  const newBlob = await exif.insertIntoBlob(exif.dumpToBlob(exifData), file)
  
  // Create a download link
  const url = URL.createObjectURL(newBlob)
  console.log('Modified image URL:', url)
})
```

### Reading from a URL

```ts
import * as exif from '@substrate-system/exif/browser'

async function logExifFromUrl(url) {
  const exifData = await exif.loadFromUrl(url)
  console.log(exifData)
}
```

## Node.js

Import from the node-specific entry point for filesystem and `Buffer` helpers.

```ts
import * as exif from '@substrate-system/exif/node'

// Or use named imports
import {
  modifyFile,
  loadFromFile,
  ExifIFD,
  GPSIFD
} from '@substrate-system/exif/node'
```

### Reading and Writing Files

The `modifyFile` helper makes it easy to read, update, and save in one go.

```ts
import * as exif from '@substrate-system/exif/node'
import * as ExifIFD from '@substrate-system/exif/tags/exif-ifd'
import * as GPSIFD from '@substrate-system/exif/tags/gps-ifd'

const inputPath = './photo.jpg'
const outputPath = './parsed-photo.jpg'

// Read, modify, and save
exif.modifyFile(inputPath, outputPath, (exifData) => {
  // Add a UserComment
  exifData.Exif[ExifIFD.UserComment] = "Edited with @substrate-system/exif"
  
  // Update GPS Altitude (Rational type: [numerator, denominator])
  exifData.GPS[GPSIFD.GPSAltitude] = [100, 1] 
  
  return exifData
})
```

### Working with Buffers

```ts
import * as fs from 'node:fs'
import * as exif from '@substrate-system/exif/node'

const buffer = fs.readFileSync('./photo.jpg')

// Load from Buffer
const exifData = exif.loadFromBuffer(buffer)

// Dump to Buffer
const exifBuffer = exif.dumpToBuffer(exifData)

// Insert into original image buffer
const newImageBuffer = exif.insertIntoBuffer(exifBuffer, buffer)
```

## API

Available as named exports from all entry points.

- `load(data: Uint8Array): Exif`
  Parse EXIF data from a JPEG binary array.
- `dump(exifData: Exif): Uint8Array`
  Convert an EXIF object into a binary array ready for insertion.
- `insert(exifBinary: Uint8Array, jpegData: Uint8Array): Uint8Array`
  Insert an EXIF binary block into a JPEG binary array.

### Tag Constants

EXIF tag constants are available as named exports:

- **`ImageIFD`** - Image (0th IFD) tags
- **`ExifIFD`** - Exif sub-IFD tags
- **`GPSIFD`** - GPS sub-IFD tags
- **`InteropIFD`** - Interoperability tags

Example:

```ts
import {
  load,
  ImageIFD,
  GPSIFD
} from '@substrate-system/exif'
import * as ExifIFD from '@substrate-system/exif/tags/exif-ifd'
import * as ImageIFD from '@substrate-system/exif/tags/image-ifd'

const exifData = load(jpegBytes)
const cameraMake = exifData['0th'][ImageIFD.Make]
const userComment = exifData.Exif[ExifIFD.UserComment]
const altitude = exifData.GPS[GPSIFD.GPSAltitude]
```

### Helpers

#### Browser

`@substrate-system/exif/browser`

- `loadFromBlob(blob: Blob): Promise<Exif>`
- `loadFromUrl(url: string): Promise<Exif>`
- `dumpToBlob(exifData: Exif): Blob`
- `insertIntoBlob(exifBlob: Blob, jpegBlob: Blob): Promise<Blob>`
- `removeFromBlob(blob: Blob): Promise<Blob>` - Strip EXIF from JPEG, PNG, or WebP

#### Node JS

`@substrate-system/exif/node`

- `loadFromFile(path: string): Exif`
- `loadFromBuffer(buffer: Buffer): Exif`
- `dumpToBuffer(exifData: Exif): Buffer`
- `insertIntoBuffer(exifBuffer: Buffer, jpegBuffer: Buffer): Buffer`
- `removeFromBuffer(buffer: Buffer): Buffer` - Strip EXIF from JPEG, PNG, or WebP
- `modifyFile(input: string, output: string, callback: (data: Exif) => Exif): void`

#### GPS Helper

The `GPSHelper` export provides utilities for GPS coordinate conversion:

```ts
import { GPSHelper } from '@substrate-system/exif'

// Convert decimal degrees to DMS rational format for EXIF
const dmsRational = GPSHelper.degToDmsRational(37.7749)
// Returns: [[37, 1], [46, 1], [2964, 100]]

// Convert DMS rational format back to decimal degrees
const decimal = GPSHelper.dmsRationalToDeg([[37, 1], [46, 1], [2964, 100]], 'N')
// Returns: 37.7749
```

## Modues

This library uses named exports. You can import what you need:

```ts
// Named imports
import {
  load,
  dump,
  insert,
  remove,
  ImageIFD,
  ExifIFD,
  GPSIFD
} from '@substrate-system/exif'

// Or import everything as a namespace
import * as exif from '@substrate-system/exif'
```
