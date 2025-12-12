/**
 * Node.js-specific helpers for working with Buffers and files
 */

import * as fs from 'node:fs'
import type { Exif } from './index.js'
import { load, dump, insert, remove } from './index.js'

/**
 * Convert Node.js Buffer to Uint8Array
 */
export function bufferToUint8Array (buffer:Buffer):Uint8Array {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}

/**
 * Convert Uint8Array to Node.js Buffer
 */
export function uint8ArrayToBuffer (arr:Uint8Array):Buffer {
    return Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength)
}

/**
 * Load EXIF data from a Buffer
 */
export function loadFromBuffer (buffer:Buffer):Exif {
    return load(bufferToUint8Array(buffer))
}

/**
 * Load EXIF data from a file path
 */
export function loadFromFile (filePath:string):Exif {
    const buffer = fs.readFileSync(filePath)
    return loadFromBuffer(buffer)
}

/**
 * Dump EXIF data and return as Buffer
 */
export function dumpToBuffer (exifDict:Exif):Buffer {
    const result = dump(exifDict)
    return uint8ArrayToBuffer(result)
}

/**
 * Insert EXIF data into JPEG Buffer
 */
export function insertIntoBuffer (exif:Buffer, jpeg:Buffer):Buffer {
    const result = insert(
        bufferToUint8Array(exif),
        bufferToUint8Array(jpeg)
    )
    return uint8ArrayToBuffer(result)
}

/**
 * Remove EXIF data from JPEG Buffer
 */
export function removeFromBuffer (jpeg:Buffer):Buffer {
    const result = remove(bufferToUint8Array(jpeg))
    return uint8ArrayToBuffer(result)
}

/**
 * Load EXIF from file, modify, and save back
 */
export function modifyFile (
    inputPath:string,
    outputPath:string,
    modifier:(exif:Exif) => Exif
):void {
    const inputBuffer = fs.readFileSync(inputPath)
    const exifData = loadFromBuffer(inputBuffer)
    const modifiedExif = modifier(exifData)
    const exifBytes = dump(modifiedExif)
    const newJpeg = insert(exifBytes, bufferToUint8Array(inputBuffer))
    fs.writeFileSync(outputPath, uint8ArrayToBuffer(newJpeg))
}

// Re-export core functions
export { load, dump, insert, remove }
export type { Exif, ExifElement } from './index.js'
export { GPSHelper, InteropIFD } from './index.js'
