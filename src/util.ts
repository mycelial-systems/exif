import { stringToBytes, equals, unpack } from './binary-utils'
export const JPEG_MARKER = new Uint8Array([0xff, 0xd8])
export const EXIF_MARKER = new Uint8Array([0xff, 0xe1])
export const SOS_MARKER = new Uint8Array([0xff, 0xda])
export const EXIF_HEADER = stringToBytes('Exif\x00\x00')
export const TIFF_HEADER_II = new Uint8Array([0x49, 0x49]) // Little-endian
export const TIFF_HEADER_MM = new Uint8Array([0x4d, 0x4d]) // Big-endian

// file Identification
export const PNG_MARKER = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
export const RIFF_HEADER = new Uint8Array([0x52, 0x49, 0x46, 0x46]) // "RIFF"
export const WEBP_HEADER = new Uint8Array([0x57, 0x45, 0x42, 0x50]) // "WEBP"

export function splitIntoSegments (data:Uint8Array):Uint8Array[] {
    if (!equals(data, JPEG_MARKER, 0, 0, 2)) {
        throw new Error("Given data isn't JPEG.")
    }

    let head = 2
    const segments:Uint8Array[] = [JPEG_MARKER]
    while (true) {
        if (equals(data, SOS_MARKER, head, 0, 2)) {
            segments.push(data.subarray(head))
            break
        } else {
            const length = unpack('>H', data.subarray(head + 2, head + 4))[0] as number
            const endPoint = head + length + 2
            segments.push(data.subarray(head, endPoint))
            head = endPoint
        }

        if (head >= data.length) {
            throw new Error('Wrong JPEG data.')
        }
    }
    return segments
}

export function getExifSeg (segments:Uint8Array[]):Uint8Array|null {
    for (let i = 0; i < segments.length; i++) {
        const seg = segments[i]
        if (equals(seg, EXIF_MARKER, 0, 0, 2) &&
            equals(seg, EXIF_HEADER, 4, 0, 6)) {
            return seg
        }
    }
    return null
}
