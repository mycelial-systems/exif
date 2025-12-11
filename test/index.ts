import { test } from '@substrate-system/tapzero'
import * as fs from 'node:fs'
import * as path from 'node:path'
import piexif from '../src/index.js'

// When bundled and piped to node, we need to use process.cwd()
const testFilesDir = path.join(process.cwd(), 'test', 'files')

test('basic load, dump, and insert', async t => {
    const jpeg = fs.readFileSync(path.join(testFilesDir, 'noexif.jpg'))
    const data = jpeg.toString('binary')

    const zeroth:Record<number, any> = {}
    const exif:Record<number, any> = {}
    const gps:Record<number, any> = {}

    zeroth[piexif.ImageIFD.Make] = 'Make'
    zeroth[piexif.ImageIFD.XResolution] = [777, 1]
    zeroth[piexif.ImageIFD.YResolution] = [777, 1]
    zeroth[piexif.ImageIFD.Software] = 'Piexifjs'
    exif[piexif.ExifIFD.DateTimeOriginal] = '2010:10:10 10:10:10'
    exif[piexif.ExifIFD.LensMake] = 'LensMake'
    exif[piexif.ExifIFD.Sharpness] = 777
    exif[piexif.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]]
    gps[piexif.GPSIFD.GPSVersionID] = [7, 7, 7, 7]
    gps[piexif.GPSIFD.GPSDateStamp] = '1999:99:99 99:99:99'

    const exifObj = { '0th': zeroth, Exif: exif, GPS: gps }
    const exifbytes = piexif.dump(exifObj)

    const newData = piexif.insert(exifbytes, data)
    const exifObj2 = piexif.load(newData)

    // Remove auto-generated fields
    delete exifObj2['0th'][34665]
    delete exifObj2['0th'][34853]
    delete exifObj2.Interop
    delete exifObj2['1st']
    delete exifObj2.thumbnail

    t.deepEqual(exifObj, exifObj2, 'exif data should roundtrip correctly')
})

test('roundtrip test - load, dump, insert', async t => {
    const files = fs.readdirSync(testFilesDir)
        .filter(f => f.endsWith('.jpg'))

    const noexif = fs.readFileSync(
        path.join(testFilesDir, 'noexif.jpg')
    ).toString('binary')

    let passed = 0

    for (const file of files) {
        const filepath = path.join(testFilesDir, file)
        const jpeg = fs.readFileSync(filepath).toString('binary')

        const exifObj1 = piexif.load(jpeg)
        const exifStr = piexif.dump(exifObj1)
        const newJpeg = piexif.insert(exifStr, noexif)
        const exifObj2 = piexif.load(newJpeg)

        for (const ifd in exifObj1) {
            if (ifd === 'thumbnail') {
                continue
            }

            for (const tag in exifObj1[ifd]) {
                const tagNum = parseInt(tag)
                if ((ifd === '0th') && ([34665, 34853].indexOf(tagNum) > -1)) {
                    continue
                } else if ((ifd === 'Exif') && (tagNum === 40965)) {
                    continue
                } else if ((ifd === '1st') && ([513, 514].indexOf(tagNum) > -1)) {
                    continue
                }

                t.deepEqual(
                    exifObj1[ifd][tag],
                    exifObj2[ifd][tag],
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
        const jpeg = fs.readFileSync(filepath).toString('binary')

        const removed = piexif.remove(jpeg)
        const exifObj = piexif.load(removed)

        let keyNum = 0
        if (exifObj.thumbnail != null) {
            failedFile += 1
            continue
        } else {
            delete exifObj.thumbnail
        }

        for (const ifd in exifObj) {
            for (const _tag in exifObj[ifd]) {
                keyNum += 1
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
