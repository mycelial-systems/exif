/**
 * Browser-specific helpers for working with Blobs and URLs
 */

import type { Exif } from './index.js'
import { load, dump, insert } from './index.js'
import { stripExif as remove } from './remove.js'

/**
 * Convert Blob to Uint8Array
 */
export async function blobToUint8Array (blob:Blob):Promise<Uint8Array> {
    const arrayBuffer = await blob.arrayBuffer()
    return new Uint8Array(arrayBuffer)
}

/**
 * Convert Uint8Array to Blob
 */
export function uint8ArrayToBlob (arr:Uint8Array, type = 'image/jpeg'):Blob {
    return new Blob([arr as any], { type })
}

/**
 * Load EXIF data from a Blob
 */
export async function loadFromBlob (blob:Blob | File):Promise<Exif> {
    const arr = await blobToUint8Array(blob)
    return load(arr)
}

export const loadFromFile = loadFromBlob

/**
 * Dump EXIF data and return as Blob
 */
export function dumpToBlob (
    exifDict:Exif,
    type = 'application/octet-stream'
):Blob {
    const result = dump(exifDict)
    return uint8ArrayToBlob(result, type)
}

/**
 * Insert EXIF data into JPEG Blob
 */
export async function insertIntoBlob (exif:Blob, jpeg:Blob):Promise<Blob> {
    const exifArr = await blobToUint8Array(exif)
    const jpegArr = await blobToUint8Array(jpeg)
    const result = insert(exifArr, jpegArr)
    return uint8ArrayToBlob(result, jpeg.type || 'image/jpeg')
}

/**
 * Remove EXIF data from JPEG Blob
 */
export async function removeFromBlob (jpeg:Blob):Promise<Blob> {
    const arr = await blobToUint8Array(jpeg)
    const result = remove(arr)
    return uint8ArrayToBlob(result, jpeg.type || 'image/jpeg')
}

/**
 * Create a download URL for a Uint8Array
 */
export function createDownloadUrl (data:Uint8Array, type = 'image/jpeg'):string {
    const blob = uint8ArrayToBlob(data, type)
    return URL.createObjectURL(blob)
}

/**
 * Revoke a download URL created with createDownloadUrl
 */
export function revokeDownloadUrl (url:string):void {
    URL.revokeObjectURL(url)
}

/**
 * Load EXIF from an image URL (must be same-origin or CORS-enabled)
 */
export async function loadFromUrl (url:string):Promise<Exif> {
    const response = await fetch(url)
    const blob = await response.blob()
    return loadFromBlob(blob)
}

/**
 * Load EXIF from a data URL (base64 encoded)
 */
export function loadFromDataUrl (dataUrl:string):Exif {
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

// Re-export core functions
export { load, dump, insert, remove }
export type { Exif, ExifElement } from './index.js'
