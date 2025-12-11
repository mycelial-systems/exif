# exif

Read and modify EXIF data. A robust library to parse and edit EXIF metadata in JavaScript, working seamlessly in both **Browser** and **Node.js** environments.

<details><summary><h2>Contents</h2></summary>

<!-- toc -->

- [Install](#install)
- [Browser Usage](#browser-usage)
  * [Reading from a File Input](#reading-from-a-file-input)
  * [Reading from a URL](#reading-from-a-url)
- [Node.js Usage](#nodejs-usage)
  * [Reading and Writing Files](#reading-and-writing-files)
  * [Working with Buffers](#working-with-buffers)
- [API](#api)
  * [Core Functions](#core-functions)
  * [Helpers](#helpers)

<!-- tocstop -->

</details>

## Install

```sh
npm i -S @substrate-system/exif
```

## Browser Usage

Import from the browser-specific entry point for helpful utilities like
`loadFromBlob` and `loadFromUrl`.

```ts
import * as exif from '@substrate-system/exif/browser'
```

### Reading from a File Input

```html
<input type="file" id="file-input" />
```

```js
import * as exif from '@substrate-system/exif/browser'

const input = document.getElementById('file-input')
input.addEventListener('change', async (e) => {
  const file = e.target.files[0]
  
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

## Node.js Usage

Import from the node-specific entry point for filesystem and Buffer helpers.

```ts
import * as exif from '@substrate-system/exif/node'
```

### Reading and Writing Files

The `modifyFile` helper makes it easy to read, update, and save in one go.

```ts
import * as exif from '@substrate-system/exif/node'

const inputPath = './photo.jpg'
const outputPath = './parsed-photo.jpg'

// Read, modify, and save
exif.modifyFile(inputPath, outputPath, (exifData) => {
  // Add a UserComment
  exifData.Exif[exif.ExifIFD.UserComment] = "Edited with @substrate-system/exif"
  
  // Update GPS Altitude (Rational type: [numerator, denominator])
  exifData.GPS[exif.GPSIFD.GPSAltitude] = [100, 1] 
  
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

The library is built around `Uint8Array` for cross-platform compatibility.

### Core Functions

Available in both `browser` and `node` imports.

- **`load(data: Uint8Array): IExif`**  
  Parse EXIF data from a JPEG binary array.

- **`dump(exifData: IExif): Uint8Array`**  
  Convert an EXIF object into a binary array ready for insertion.

- **`insert(exifBinary: Uint8Array, jpegData: Uint8Array): Uint8Array`**  
  Insert an EXIF binary block into a JPEG binary array.

- **`remove(jpegData: Uint8Array): Uint8Array`**  
  Remove EXIF data from a JPEG binary array.

### Helpers

**Browser (`@substrate-system/exif/browser`)**
- `loadFromBlob(blob: Blob): Promise<IExif>`
- `loadFromUrl(url: string): Promise<IExif>`
- `insertIntoBlob(exifBlob: Blob, jpegBlob: Blob): Promise<Blob>`

**Node.js (`@substrate-system/exif/node`)**
- `loadFromFile(path: string): IExif`
- `loadFromBuffer(buffer: Buffer): IExif`
- `modifyFile(input: string, output: string, callback: (data: IExif) => IExif): void`
