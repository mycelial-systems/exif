import { equals, unpack, bytesToString } from './binary-utils'
import { type ExifElement, type ExifValue } from './index.js'
import { type TagKey, type IfdName, TAGS } from './tags/index.js'
import {
    splitIntoSegments,
    JPEG_MARKER,
    TIFF_HEADER_II,
    TIFF_HEADER_MM,
    getExifSeg
} from './util'

export class ExifReader {
    tiftag:Uint8Array | null
    endianMark:string

    constructor (data:Uint8Array) {
        this.endianMark = ''
        let segments:Uint8Array[]
        let app1:Uint8Array | null

        if (equals(data, JPEG_MARKER, 0, 0, 2)) { // JPEG
            segments = splitIntoSegments(data)
            app1 = getExifSeg(segments)
            if (app1) {
                this.tiftag = app1.subarray(10)
            } else {
                this.tiftag = null
            }
        } else if (
            equals(data, TIFF_HEADER_II, 0, 0, 2) ||
            equals(data, TIFF_HEADER_MM, 0, 0, 2)
        ) { // TIFF
            this.tiftag = data
        } else {
            throw new Error('Given file is neither JPEG nor TIFF.')
        }
    }

    getIfd (pointer:number, ifdName:IfdName):ExifElement {
        const ifdDict:ExifElement = {}
        const tagCount = unpack(this.endianMark + 'H',
            this.tiftag!.subarray(pointer, pointer + 2))[0] as number
        const offset = pointer + 2
        let t:TagKey
        if (['0th', '1st'].indexOf(ifdName) > -1) {
            t = 'Image'
        } else {
            t = ifdName
        }

        for (let x = 0; x < tagCount; x++) {
            pointer = offset + 12 * x
            const tag = unpack(this.endianMark + 'H',
                this.tiftag!.subarray(pointer, pointer + 2))[0] as number
            const valueType = unpack(this.endianMark + 'H',
                this.tiftag!.subarray(pointer + 2, pointer + 4))[0] as number
            const valueNum = unpack(this.endianMark + 'L',
                this.tiftag!.subarray(pointer + 4, pointer + 8))[0] as number
            const value = this.tiftag!.subarray(pointer + 8, pointer + 12)

            const vSet = [valueType, valueNum, value]
            if (tag in TAGS[t]) {
                ifdDict[tag] = this.convertValue(vSet, tag, t)
            }
        }

        if (ifdName === '0th') {
            pointer = (offset + 12 * tagCount) as number
            ifdDict.first_ifd_pointer =
                this.tiftag!.subarray(pointer, pointer + 4)
        }

        return ifdDict
    }

    convertValue (val:any, tag:number, ifdType:string):ExifValue {
        let data:any = null
        const t = val[0]
        const length = val[1]
        const value:Uint8Array = val[2]
        let pointer:number

        if (t === 1) { // BYTE
            if (length > 4) {
                pointer = unpack(this.endianMark + 'L', value)[0] as number
                data = unpack(this.endianMark + 'B'.repeat(length),
                    this.tiftag!.subarray(pointer, pointer + length))
            } else {
                data = unpack(
                    this.endianMark + 'B'.repeat(length),
                    value.subarray(0, length)
                )
            }
        } else if (t === 2) { // ASCII
            if (length > 4) {
                pointer = unpack(this.endianMark + 'L', value)[0] as number
                data = bytesToString(
                    this.tiftag!.subarray(pointer, pointer + length - 1)
                )
            } else {
                data = bytesToString(value.subarray(0, length - 1))
            }
        } else if (t === 3) { // SHORT
            if (length > 2) {
                pointer = unpack(this.endianMark + 'L', value)[0] as number
                data = unpack(this.endianMark + 'H'.repeat(length),
                    this.tiftag!.subarray(pointer, pointer + length * 2))
            } else {
                data = unpack(this.endianMark + 'H'.repeat(length),
                    value.subarray(0, length * 2))
            }
        } else if (t === 4) { // LONG
            if (length > 1) {
                pointer = unpack(this.endianMark + 'L', value)[0] as number
                data = unpack(this.endianMark + 'L'.repeat(length),
                    this.tiftag!.subarray(pointer, pointer + length * 4))
            } else {
                data = unpack(this.endianMark + 'L'.repeat(length), value)
            }
        } else if (t === 5) { // RATIONAL
            pointer = unpack(this.endianMark + 'L', value)[0] as number
            if (length > 1) {
                data = []
                for (let x = 0; x < length; x++) {
                    data.push([unpack(this.endianMark + 'L',
                        this.tiftag!.subarray(
                            pointer + x * 8,
                            pointer + 4 + x * 8
                        ))[0],
                    unpack(this.endianMark + 'L',
                        this.tiftag!.subarray(
                            pointer + 4 + x * 8,
                            pointer + 8 + x * 8
                        ))[0]
                    ])
                }
            } else {
                data = [unpack(this.endianMark + 'L',
                    this.tiftag!.subarray(pointer, pointer + 4))[0],
                unpack(this.endianMark + 'L',
                    this.tiftag!.subarray(pointer + 4, pointer + 8))[0]
                ]
            }
        } else if (t === 7) { // UNDEFINED BYTES
            // Special handling for UserComment if it's Undefined
            // but should be Ascii
            if (tag === 37510 && ifdType === 'Exif') {
                if (length > 4) {
                    pointer = unpack(this.endianMark + 'L', value)[0] as number
                    data = bytesToString(
                        this.tiftag!.subarray(pointer, pointer + length - 1)
                    )
                } else {
                    data = bytesToString(value.subarray(0, length - 1))
                }
            } else {
                if (length > 4) {
                    pointer = unpack(this.endianMark + 'L', value)[0] as number
                    const bytes = this.tiftag!.subarray(
                        pointer,
                        pointer + length
                    )
                    data = Array.from(bytes)  // return array of numbers
                } else {
                    const bytes = value.subarray(0, length)
                    data = Array.from(bytes)  // return array of numbers
                }
            }
        } else if (t === 9) { // SLONG
            if (length > 1) {
                pointer = unpack(this.endianMark + 'L', value)[0] as number
                data = unpack(this.endianMark + 'l'.repeat(length),
                    this.tiftag!.subarray(pointer, pointer + length * 4))
            } else {
                data = unpack(this.endianMark + 'l'.repeat(length), value)
            }
        } else if (t === 10) { // SRATIONAL
            pointer = unpack(this.endianMark + 'L', value)[0] as number
            if (length > 1) {
                data = []
                for (let x = 0; x < length; x++) {
                    data.push([unpack(this.endianMark + 'l',
                        this.tiftag!
                            .subarray(pointer + x * 8, pointer + 4 + x * 8))[0],
                    unpack(this.endianMark + 'l',
                        this.tiftag!.subarray(
                            pointer + 4 + x * 8, pointer + 8 + x * 8
                        ))[0]
                    ])
                }
            } else {
                data = [unpack(this.endianMark + 'l',
                    this.tiftag!.subarray(pointer, pointer + 4))[0],
                unpack(this.endianMark + 'l',
                    this.tiftag!.subarray(pointer + 4, pointer + 8))[0]
                ]
            }
        } else {
            throw new Error('Exif might be wrong. Got incorrect value ' +
                'type to decode. type:' + t)
        }

        if ((data instanceof Array) && (data.length === 1)) {
            return data[0]
        } else {
            return data
        }
    }
}

