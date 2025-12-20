import { test } from '@substrate-system/tapzero'
import { stripExif } from '../src/remove.js'
import {
    JPEG_MARKER,
    EXIF_MARKER,
    SOS_MARKER,
    PNG_MARKER,
    RIFF_HEADER,
    WEBP_HEADER
} from '../src/util.js'

test('stripExif - JPEG', (t) => {
    // Construct a mock JPEG: [SOI] [APP1/EXIF] [SOS] [Data]
    // APP1 data must start with "Exif\0\0" header for the code to recognize it
    const exifData = new Uint8Array([0x45, 0x78, 0x69, 0x66, 0x00, 0x00,
        0x01, 0x02])  // "Exif\0\0" + 2 bytes
    const jpeg = new Uint8Array([
        ...JPEG_MARKER,
        // APP1 segment (length=10: 2 for length + 8 data)
        ...EXIF_MARKER, 0x00, 0x0a, ...exifData,
        ...SOS_MARKER, 0x01, 0x02 // Image data
    ])

    const stripped = stripExif(jpeg)

    t.ok(stripped.length < jpeg.length, 'buffer size should decrease')
    t.equal(stripped[0], 0xff, 'should preserve SOI 0')
    t.equal(stripped[1], 0xd8, 'should preserve SOI 1')

    // Ensure EXIF marker is gone but SOS remains
    const hasExif = stripped.some((byte, i) => {
        return byte === 0xff && stripped[i + 1] === 0xe1
    })
    const hasSos = stripped.some((byte, i) => {
        return byte === 0xff && stripped[i + 1] === 0xda
    })

    t.ok(!hasExif, 'should remove EXIF marker')
    t.ok(hasSos, 'should preserve SOS marker')
})

test('stripExif - PNG', (t) => {
    // Construct mock PNG: [Sig(8)] [IHDR] [eXIf] [IEND]
    // PNG signature is 8 bytes, chunks are:
    // length(4) + type(4) + data(length) + CRC(4)
    const pngSignature = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A,
        0x1A, 0x0A])
    const png = new Uint8Array([
        ...pngSignature,
        // IHDR chunk: length=13, type=IHDR, data=13 bytes, CRC=4 bytes
        0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0,
        // eXIf chunk: length=4, type=eXIf, data=4 bytes, CRC=4 bytes
        0x00, 0x00, 0x00, 0x04, 0x65, 0x58, 0x49, 0x66, 0x01, 0x02, 0x03, 0x04,
        0x00, 0x00, 0x00, 0x00,
        // IEND chunk: length=0, type=IEND, CRC=4 bytes
        0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82
    ])

    const stripped = stripExif(png)

    t.ok(stripped.length < png.length, 'PNG size should decrease')
    t.ok(stripped.subarray(0, 4).every((v, i) => v === PNG_MARKER[i]),
        'should preserve PNG signature')

    const typeString = new TextDecoder().decode(stripped)
    t.ok(!typeString.includes('eXIf'), 'should not contain eXIf chunk type')
    t.ok(typeString.includes('IHDR'), 'should preserve IHDR')
    t.ok(typeString.includes('IEND'), 'should preserve IEND')
})

test('stripExif - WebP', (t) => {
    // Construct mock WebP:
    // [RIFF] [Size] [WEBP] [VP8 ] [Size] [...] [EXIF] [Size] [...]
    const webp = new Uint8Array([
        ...RIFF_HEADER,
        // Total size (mock)
        0x20, 0x00, 0x00, 0x00,
        ...WEBP_HEADER,
        // VP8 chunk
        0x56, 0x50, 0x38, 0x20, 0x04, 0x00, 0x00, 0x00, 0xaa, 0xbb, 0xcc, 0xdd,
        // EXIF chunk
        0x45, 0x58, 0x49, 0x46, 0x04, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04
    ])

    const stripped = stripExif(webp)
    const view = new DataView(stripped.buffer)

    t.ok(stripped.length < webp.length, 'WebP size should decrease')
    t.equal(view.getUint32(4, true), stripped.length - 8,
        'should update RIFF size header')

    const typeString = new TextDecoder().decode(stripped)
    t.ok(!typeString.includes('EXIF'), 'should remove EXIF chunk')
    t.ok(typeString.includes('VP8'), 'should preserve image data chunk')
})

test('stripExif - pass through', (t) => {
    const unknown = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05])
    const result = stripExif(unknown)
    t.equal(result.length, 5, 'should return original if format unknown')
    t.deepEqual(result, unknown, 'content should be identical')
})
