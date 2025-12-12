import { test } from '@substrate-system/tapzero'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {
    Make,
    XResolution,
    YResolution,
    Software
} from '../src/tags/image-ifd.js'
import {
    DateTimeOriginal,
    LensMake,
    Sharpness,
    LensSpecification
} from '../src/tags/exif-ifd.js'
import { GPSVersionID, GPSDateStamp } from '../src/tags/gps-ifd.js'
import * as exif from '../src/node.js'

// When bundled and piped to node, we need to use process.cwd()
const testFilesDir = path.join(process.cwd(), 'test', 'files')

test('basic load, dump, and insert', t => {
    const jpeg = fs.readFileSync(path.join(testFilesDir, 'noexif.jpg'))

    const zeroth: Record<number, any> = {}
    const exifIfd: Record<number, any> = {}
    const gps: Record<number, any> = {}

    zeroth[Make] = 'Make'
    zeroth[XResolution] = [777, 1]
    zeroth[YResolution] = [777, 1]
    zeroth[Software] = 'Piexifjs'
    exifIfd[DateTimeOriginal] = '2010:10:10 10:10:10'
    exifIfd[LensMake] = 'LensMake'
    exifIfd[Sharpness] = 777
    exifIfd[LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]]
    gps[GPSVersionID] = [7, 7, 7, 7]
    gps[GPSDateStamp] = '1999:99:99 99:99:99'

    const exifObj = { '0th': zeroth, Exif: exifIfd, GPS: gps }
    const exifbytes = exif.dumpToBuffer(exifObj)

    const newData = exif.insertIntoBuffer(exifbytes, jpeg)
    const exifObj2 = exif.loadFromBuffer(newData)

    // Remove auto-generated fields
    if (exifObj2['0th']) {
        delete exifObj2['0th'][34665]
        delete exifObj2['0th'][34853]
    }
    delete exifObj2.Interop
    delete exifObj2['1st']
    delete exifObj2.thumbnail

    t.deepEqual(exifObj as any, exifObj2, 'exif data should roundtrip correctly')
})

test('roundtrip test - load, dump, insert', async t => {
    const files = fs.readdirSync(testFilesDir)
        .filter(f => f.endsWith('.jpg'))

    const noexif = fs.readFileSync(
        path.join(testFilesDir, 'noexif.jpg')
    )

    let passed = 0

    for (const file of files) {
        const filepath = path.join(testFilesDir, file)
        const jpeg = fs.readFileSync(filepath)

        const exifObj1 = exif.loadFromBuffer(jpeg)
        const exifBytes = exif.dumpToBuffer(exifObj1)
        const newJpeg = exif.insertIntoBuffer(exifBytes, noexif)
        const exifObj2 = exif.loadFromBuffer(newJpeg)

        for (const ifdKey in exifObj1) {
            const ifd = ifdKey as keyof typeof exifObj1
            if (ifd === 'thumbnail') {
                continue
            }
            const ifdObj = exifObj1[ifd]
            if (!ifdObj) continue

            for (const tag in ifdObj) {
                const tagNum = parseInt(tag)
                if ((ifd === '0th') && ([34665, 34853].indexOf(tagNum) > -1)) {
                    continue
                } else if ((ifd === 'Exif') && (tagNum === 40965)) {
                    continue
                } else if ((ifd === '1st') && ([513, 514].indexOf(tagNum) > -1)) {
                    continue
                }

                t.deepEqual(
                    exifObj1[ifd]![tagNum],
                    exifObj2[ifd]![tagNum],
                    `${file} - ${ifd} tag ${tag} should match`
                )
            }
        }
        passed += 1
    }

    t.ok(passed > 0, `passed ${passed} file(s)`)
})

test('remove test', async t => {
    const files = fs.readdirSync(testFilesDir)
        .filter(f => f.endsWith('.jpg') && f !== 'noexif.jpg')

    let passedFile = 0
    let failedFile = 0

    for (const file of files) {
        const filepath = path.join(testFilesDir, file)
        const jpeg = fs.readFileSync(filepath)

        const removed = exif.removeFromBuffer(jpeg)
        const exifObj = exif.loadFromBuffer(removed)

        let keyNum = 0
        if (exifObj.thumbnail != null) {
            failedFile += 1
            continue
        } else {
            delete exifObj.thumbnail
        }

        for (const ifdKey in exifObj) {
            const ifd = ifdKey as keyof typeof exifObj
            const ifdObj = exifObj[ifd]
            if (ifdObj && typeof ifdObj === 'object') {
                for (const _tag in ifdObj) {
                    keyNum += 1
                }
            }
        }

        if (keyNum) {
            failedFile += 1
        } else {
            passedFile += 1
        }
    }

    t.equal(failedFile, 0, `should have 0 failed files (got ${failedFile})`)
    t.ok(passedFile > 0, `passed ${passedFile} file(s)`)
})
