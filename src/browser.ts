/**
 * Browser-specific helpers for working with Blobs and URLs
 */

import type { IExif } from './index.js'
import { load, dump, insert, remove } from './index.js'

/**
 * Convert Blob to Uint8Array
 */
export async function blobToUint8Array (blob: Blob): Promise<Uint8Array> {
    const arrayBuffer = await blob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
}

/**
 * Convert Uint8Array to Blob
 */
export function uint8ArrayToBlob (arr: Uint8Array, type = 'image/jpeg'): Blob {
    return new Blob([arr as any], { type })
}

/**
 * Load EXIF data from a Blob
 */
export async function loadFromBlob (blob: Blob): Promise<IExif> {
    const arr = await blobToUint8Array(blob)
    return load(arr)
}

/**
 * Load EXIF data from a File (extends Blob)
 */
export async function loadFromFile (file: File): Promise<IExif> {
    return loadFromBlob(file)
}

/**
 * Dump EXIF data and return as Blob
 */
export function dumpToBlob (exifDict: any, type = 'application/octet-stream'): Blob {
    const result = dump(exifDict)
    return uint8ArrayToBlob(result, type)
}

/**
 * Insert EXIF data into JPEG Blob
 */
export async function insertIntoBlob (exif: Blob, jpeg: Blob): Promise<Blob> {
    const exifArr = await blobToUint8Array(exif)
    const jpegArr = await blobToUint8Array(jpeg)
    const result = insert(exifArr, jpegArr)
    return uint8ArrayToBlob(result, jpeg.type || 'image/jpeg')
}

/**
 * Remove EXIF data from JPEG Blob
 */
export async function removeFromBlob (jpeg: Blob): Promise<Blob> {
    const arr = await blobToUint8Array(jpeg)
    const result = remove(arr)
    return uint8ArrayToBlob(result, jpeg.type || 'image/jpeg')
}

/**
 * Create a download URL for a Uint8Array
 */
export function createDownloadUrl (data: Uint8Array, type = 'image/jpeg'): string {
    const blob = uint8ArrayToBlob(data, type)
    return URL.createObjectURL(blob)
}

/**
 * Revoke a download URL created with createDownloadUrl
 */
export function revokeDownloadUrl (url: string): void {
    URL.revokeObjectURL(url)
}

/**
 * Load EXIF from an image URL (must be same-origin or CORS-enabled)
 */
export async function loadFromUrl (url: string): Promise<IExif> {
    const response = await fetch(url)
    const blob = await response.blob()
    return loadFromBlob(blob)
}

/**
 * Load EXIF from a data URL (base64 encoded)
 */
export function loadFromDataUrl (dataUrl: string): IExif {
    // Extract the base64 part
    const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (!matches) {
        throw new Error('Invalid data URL format')
    }

    const base64 = matches[2]
    const binaryString = atob(base64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
    }

    return load(bytes)
}

/**
 * Convert Uint8Array to data URL
 */
export function toDataUrl (data: Uint8Array, mimeType = 'image/jpeg'): string {
    let binary = ''
    for (let i = 0; i < data.length; i++) {
        binary += String.fromCharCode(data[i])
    }
    const base64 = btoa(binary)
    return `data:${mimeType};base64,${base64}`
}

// Re-export core functions
export { load, dump, insert, remove }
export type { IExif, IExifElement } from './index.js'
export { ImageIFD, ExifIFD, GPSIFD, GPSHelper, InteropIFD } from './index.js'
