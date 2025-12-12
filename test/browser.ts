import { test } from '@substrate-system/tapzero'
import { GPSLatitude } from '../src/tags/gps-ifd.js'
import { Make, Model, Software, Artist } from '../src/tags/image-ifd.js'
import { DateTimeOriginal, UserComment } from '../src/tags/exif-ifd.js'
import { GPSHelper } from '../src/index.js'
import {
    loadFromBlob,
    insertIntoBlob,
    dumpToBlob,
    removeFromBlob
} from '../src/browser.js'

// Import test images as binary data using esbuild's binary loader
import noexifData from './files/noexif.jpg'
import canonData from './files/r_canon.jpg'
import casioData from './files/r_casio.jpg'
import olympusData from './files/r_olympus.jpg'
import panaData from './files/r_pana.jpg'
import sonyData from './files/r_sony.jpg'

// Helper to create Blob from binary data
function dataToBlob (data:Uint8Array):Blob {
    return new Blob([data as BlobPart], { type: 'image/jpeg' })
}

test('loadFromBlob - should load EXIF from Blob', async t => {
    const blob = dataToBlob(canonData)
    const exifData = await loadFromBlob(blob)

    t.ok(exifData, 'should return EXIF data')
    t.ok(exifData['0th'], 'should have 0th IFD')
    t.ok(exifData.Exif, 'should have Exif IFD')
})

test('dumpToBlob - should create Blob from EXIF data', async t => {
    const zeroth:Record<number, any> = {}
    const exifIfd:Record<number, any> = {}

    zeroth[Make] = 'Test Camera'
    zeroth[Model] = 'Test Model'
    exifIfd[DateTimeOriginal] = '2024:01:01 12:00:00'

    const exifObj = { '0th': zeroth, Exif: exifIfd }
    const blob = dumpToBlob(exifObj)

    t.ok(blob instanceof Blob, 'should return a Blob')
    t.equal(blob.type, 'application/octet-stream', 'should have correct type')

    // Verify the blob contains valid EXIF data
    const arrayBuffer = await blob.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    t.ok(bytes.length > 0, 'blob should contain data')

    // Check for EXIF header
    const headerBytes = Array.from(bytes.subarray(0, 4))
    const header = String.fromCharCode(...headerBytes)
    t.equal(header, 'Exif', 'should start with Exif header')
})

test('insertIntoBlob - should insert EXIF into JPEG Blob', async t => {
    const noexifBlob = dataToBlob(noexifData)

    const zeroth:Record<number, any> = {}
    zeroth[Make] = 'Browser Test Camera'
    zeroth[Software] = 'Browser Test Software'

    const exifObj = { '0th': zeroth }
    const exifBlob = dumpToBlob(exifObj)

    const resultBlob = await insertIntoBlob(exifBlob, noexifBlob)

    t.ok(resultBlob instanceof Blob, 'should return a Blob')
    t.equal(resultBlob.type, 'image/jpeg', 'should have JPEG mime type')

    // Verify we can read the EXIF back
    const readBack = await loadFromBlob(resultBlob)
    t.equal(
        readBack['0th']?.[Make],
        'Browser Test Camera',
        'should read back the Make tag'
    )
    t.equal(
        readBack['0th']?.[Software],
        'Browser Test Software',
        'should read back the Software tag'
    )
})

test('roundtrip - load, dump, insert with Blobs', async t => {
    const originalBlob = dataToBlob(sonyData)
    const noexifBlob = dataToBlob(noexifData)

    // Load original EXIF
    const exifData1 = await loadFromBlob(originalBlob)

    // Dump to Blob
    const exifBlob = dumpToBlob(exifData1)

    // Insert into new JPEG
    const newJpegBlob = await insertIntoBlob(exifBlob, noexifBlob)

    // Load back
    const exifData2 = await loadFromBlob(newJpegBlob)

    // Compare key fields
    if (exifData1['0th'] && exifData2['0th']) {
        const make1 = exifData1['0th'][Make]
        const make2 = exifData2['0th'][Make]
        if (make1) {
            t.equal(make1, make2, 'Make should survive roundtrip')
        }

        const model1 = exifData1['0th'][Model]
        const model2 = exifData2['0th'][Model]
        if (model1) {
            t.equal(model1, model2, 'Model should survive roundtrip')
        }
    }

    if (exifData1.Exif && exifData2.Exif) {
        const date1 = exifData1.Exif[DateTimeOriginal]
        const date2 = exifData2.Exif[DateTimeOriginal]
        if (date1) {
            t.equal(
                date1,
                date2,
                'DateTimeOriginal should survive roundtrip'
            )
        }
    }
})

test('tag constants are accessible', t => {
    t.equal(typeof Make, 'number', 'ImageIFD.Make should be a number')
    t.equal(typeof DateTimeOriginal, 'number',
        'ExifIFD.DateTimeOriginal should be a number')
    t.equal(typeof GPSLatitude, 'number',
        'GPSIFD.GPSLatitude should be a number')
})

test('GPS helper functions', t => {
    // Test degToDmsRational
    const dms = GPSHelper.degToDmsRational(37.7749)
    t.ok(Array.isArray(dms), 'degToDmsRational should return array')
    t.equal(dms.length, 3, 'should return 3 components')
    t.ok(Array.isArray(dms[0]), 'degrees should be array')
    t.equal(dms[0][0], 37, 'degrees should be 37')

    // Test dmsRationalToDeg
    const deg = GPSHelper.dmsRationalToDeg(
        [[37, 1], [46, 1], [2964, 100]],
        'N'
    )
    t.ok(typeof deg === 'number', 'dmsRationalToDeg should return number')
    t.ok(Math.abs(deg - 37.7749) < 0.01,
        'should convert back to approximately the same value')

    // Test with negative (South)
    const degS = GPSHelper.dmsRationalToDeg(
        [[37, 1], [46, 1], [2964, 100]],
        'S'
    )
    t.ok(degS < 0, 'South should be negative')
    t.ok(Math.abs(degS + 37.7749) < 0.01, 'South should be negative value')
})

test('removeFromBlob - should remove EXIF from JPEG', async t => {
    const jpegWithExif = dataToBlob(canonData)

    // Verify it has EXIF
    const before = await loadFromBlob(jpegWithExif)
    t.ok(before['0th'], 'original should have EXIF')

    // Remove EXIF
    const jpegWithoutExif = await removeFromBlob(jpegWithExif)

    t.ok(jpegWithoutExif instanceof Blob, 'should return a Blob')
    t.equal(jpegWithoutExif.type, 'image/jpeg', 'should maintain JPEG type')

    // Should be smaller (EXIF data removed)
    const originalSize = (await jpegWithExif.arrayBuffer()).byteLength
    const cleanedSize = (await jpegWithoutExif.arrayBuffer()).byteLength
    t.ok(cleanedSize < originalSize,
        'file without EXIF should be smaller')
})

test('work with multiple image formats', async t => {
    const testFiles = [
        { name: 'canon', data: canonData },
        { name: 'casio', data: casioData },
        { name: 'olympus', data: olympusData },
        { name: 'panasonic', data: panaData }
    ]

    for (const file of testFiles) {
        const blob = dataToBlob(file.data)
        const exifData = await loadFromBlob(blob)

        t.ok(exifData, `${file.name}: should load EXIF data`)
        t.ok(exifData['0th'], `${file.name}: should have 0th IFD`)

        // Test that we can dump and re-insert
        const exifBlob = dumpToBlob(exifData)
        const noexifBlob = dataToBlob(noexifData)
        const newBlob = await insertIntoBlob(exifBlob, noexifBlob)
        const reloaded = await loadFromBlob(newBlob)

        t.ok(reloaded['0th'], `${file.name}: roundtrip should preserve 0th IFD`)
    }
})

test('modify EXIF data', async t => {
    const blob = dataToBlob(canonData)
    const exifData = await loadFromBlob(blob)

    // Modify some data
    if (exifData['0th']) {
        exifData['0th'][Software] = 'Modified by Browser Test'
        exifData['0th'][Artist] = 'Test Artist'
    }

    if (exifData.Exif) {
        exifData.Exif[UserComment] = 'Test comment from browser'
    }

    // Save it back
    const exifBlob = dumpToBlob(exifData)
    const noexifBlob = dataToBlob(noexifData)
    const modifiedBlob = await insertIntoBlob(exifBlob, noexifBlob)

    // Read it back
    const readBack = await loadFromBlob(modifiedBlob)

    t.equal(readBack['0th']?.[Software], 'Modified by Browser Test',
        'Software tag should be modified')
    t.equal(readBack['0th']?.[Artist], 'Test Artist',
        'Artist tag should be added')
    t.equal(readBack.Exif?.[UserComment], 'Test comment from browser',
        'UserComment should be modified')
})

test('all done', () => {
    if (typeof window !== 'undefined') {
        // @ts-expect-error - tests
        window.testsFinished = true
    }
})
