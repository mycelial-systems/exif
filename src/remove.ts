import {
    JPEG_MARKER,
    SOS_MARKER,
    EXIF_MARKER,
    EXIF_HEADER,
    PNG_MARKER,
    RIFF_HEADER,
    WEBP_HEADER
} from './util.js'

/**
 * Strip EXIF metadata from an image buffer.
 *
 * Automatically detects the image format via magic bytes and removes
 * EXIF data accordingly. Supports JPEG, PNG, and WebP formats.
 *
 * @param buffer - The raw image data as a Uint8Array
 * @returns A new Uint8Array with EXIF data removed. If the format is
 *   unrecognized, the original buffer is returned unchanged.
 *
 * @example
 * ```ts
 * import { stripExif } from '@substrate-system/exif/remove'
 *
 * const imageData = await fetch('photo.jpg').then(r => r.arrayBuffer())
 * const stripped = stripExif(new Uint8Array(imageData))
 * ```
 *
 * @remarks
 * - **JPEG**: Removes APP1 segments containing the "Exif\0\0" header
 * - **PNG**: Removes eXIf chunks
 * - **WebP**: Removes EXIF chunks and updates the RIFF size header
 * - Other APP1 data (like XMP) is preserved in JPEGs
 */
export function stripExif (buffer:Uint8Array):Uint8Array {
    // 1. Detect File Type via Magic Bytes
    if (isMarker(buffer, JPEG_MARKER)) {
        return stripJpegExif(buffer)
    }

    // Check PNG ([0x89, 0x50, 0x4E, 0x47])
    if (isMarker(buffer, PNG_MARKER)) {
        return stripPngExif(buffer)
    }

    // Check WebP (Must have "RIFF" at 0 and "WEBP" at 8)
    if (
        isMarker(buffer, RIFF_HEADER) &&
        isMarker(buffer.subarray(8), WEBP_HEADER)
    ) {
        return stripWebPExif(buffer)
    }

    // If unknown, return as is
    return buffer
}

function stripJpegExif (buffer:Uint8Array):Uint8Array {
    const view = new DataView(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength
    )

    // JPEG_MARKER ([0xff, 0xd8])
    if (!equals(buffer.subarray(0, 2), JPEG_MARKER)) {
        throw new Error('Invalid JPEG')
    }

    const pieces: Uint8Array[] = []
    let offset = 2
    let lastPos = 0

    while (offset < buffer.byteLength) {
        const marker = buffer.subarray(offset, offset + 2)

        // Stop if we hit SOS_MARKER ([0xff, 0xda])
        if (equals(marker, SOS_MARKER)) break

        // Check for EXIF_MARKER ([0xff, 0xe1])
        if (equals(marker, EXIF_MARKER)) {
            const length = view.getUint16(offset + 2)

            // Verification: Check for EXIF_HEADER ('Exif\0\0')
            // This ensures we don't accidentally strip non-Exif APP1 data
            const headerCheck = buffer.subarray(
                offset + 4,
                offset + 4 + EXIF_HEADER.length
            )

            if (equals(headerCheck, EXIF_HEADER)) {
                pieces.push(buffer.subarray(lastPos, offset))
                lastPos = offset + 2 + length
            }
        }

        // Move to next segment: Prefix(2) + LengthField(2) + (Length - 2)
        const segmentLength = view.getUint16(offset + 2)
        offset += 2 + segmentLength
    }

    pieces.push(buffer.subarray(lastPos))
    return combinePieces(pieces)
}

function stripPngExif (buffer:Uint8Array) {
    const pieces = []
    let offset = 8 // Skip PNG signature
    pieces.push(buffer.subarray(0, 8))

    while (offset < buffer.byteLength) {
        const length = new DataView(
            buffer.buffer,
            buffer.byteOffset,
            buffer.byteLength
        ).getUint32(offset)
        const type = String.fromCharCode(
            ...buffer.subarray(offset + 4, offset + 8)
        )

        if (type === 'eXIf') {
            // Skip this chunk: Length (4) + Type (4) + Data (length) + CRC (4)
            offset += 12 + length
            continue
        }

        const chunkEnd = offset + 12 + length
        pieces.push(buffer.subarray(offset, chunkEnd))
        offset = chunkEnd

        if (type === 'IEND') break
    }

    return combinePieces(pieces)
}

function stripWebPExif (buffer:Uint8Array):Uint8Array<ArrayBufferLike> {
    const view = new DataView(
        buffer.buffer,
        buffer.byteOffset,
        buffer.byteLength
    )
    const pieces = []

    // WebP header is 12 bytes
    pieces.push(buffer.subarray(0, 12))
    let offset = 12

    while (offset < buffer.byteLength) {
        const chunkType = String.fromCharCode(
            ...buffer.subarray(offset, offset + 4)
        )

        // WebP uses Little Endian
        const chunkLength = view.getUint32(offset + 4, true)
        // Chunks are padded to even bytes
        const fullChunkSize = 8 + chunkLength + (chunkLength % 2)

        if (chunkType === 'EXIF') {
            offset += fullChunkSize
            continue
        }

        pieces.push(buffer.subarray(offset, offset + fullChunkSize))
        offset += fullChunkSize
    }

    const result = combinePieces(pieces)
    // Update the main RIFF header size (Total - 8 bytes)
    new DataView(result.buffer).setUint32(4, result.byteLength - 8, true)

    return result
}

function combinePieces (pieces:Uint8Array[]):Uint8Array {
    const totalLength = pieces.reduce((acc, p) => acc + p.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const piece of pieces) {
        result.set(piece, offset)
        offset += piece.length
    }

    return result
}

const equals = (a:Uint8Array, b:Uint8Array) => {
    return (a.length === b.length && a.every((v, i) => v === b[i]))
}

function isMarker (buffer:Uint8Array, marker:Uint8Array):boolean {
    if (buffer.length < marker.length) return false
    for (let i = 0; i < marker.length; i++) {
        if (buffer[i] !== marker[i]) return false
    }

    return true
}
