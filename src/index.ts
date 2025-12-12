import { type TagKey, TAGS } from './tags/index.js'
import {
    JPEG_MARKER,
    EXIF_HEADER,
    EXIF_MARKER,
    splitIntoSegments,
    TIFF_HEADER_II
} from './util.js'
import { ExifReader } from './exif-reader.js'
import { InteroperabilityTag } from './tags/exif-ifd.js'
import { ExifTag, GPSTag } from './tags/image-ifd.js'
import {
    pack,
    unpack,
    concat,
    repeat,
    stringToBytes,
    bytesToString,
    equals
} from './binary-utils.js'

export type ExifValue = number|number[]|string|[number, number]|[number, number][]

export interface ExifElement {
    [key:number]:ExifValue;
    first_ifd_pointer?:Uint8Array;
}

export const ZEROTH = '0th'
export const FIRST = '1st'

export interface Exif {
    '0th'?:ExifElement;
    '1st'?:ExifElement;
    Exif?:ExifElement;
    GPS?:ExifElement;
    Interop?:ExifElement;
    thumbnail?:Uint8Array|null;
}

export function remove (jpeg:Uint8Array):Uint8Array {
    if (!equals(jpeg, JPEG_MARKER, 0, 0, 2)) {
        throw new Error('Given data is not jpeg.')
    }

    const segments = splitIntoSegments(jpeg)
    const newSegments = segments.filter(function (seg) {
        return !(equals(seg, EXIF_MARKER, 0, 0, 2) &&
            equals(seg, EXIF_HEADER, 4, 0, 6))
    })

    return concat(...newSegments)
}

export function insert (exif:Uint8Array, jpeg:Uint8Array):Uint8Array {
    if (!equals(exif, EXIF_HEADER, 0, 0, 6)) {
        throw new Error('Given data is not exif.')
    }
    if (!equals(jpeg, JPEG_MARKER, 0, 0, 2)) {
        throw new Error('Given data is not jpeg.')
    }

    const length = exif.length + 2
    const exifSegment = concat(
        EXIF_MARKER,
        pack('>H', [length]),
        exif
    )
    const segments = splitIntoSegments(jpeg)
    return mergeSegments(segments, exifSegment)
}

export function load (data:Uint8Array):Exif {
    let inputData:Uint8Array

    if (equals(data, JPEG_MARKER, 0, 0, 2)) {
        inputData = data
    } else if (equals(data, stringToBytes('Exif'), 0, 0, 4)) {
        inputData = data.subarray(6)
    } else {
        throw new Error("'load' gots invalid file data.")
    }

    const exifDict:Exif = {
        '0th': {},
        Exif: {},
        GPS: {},
        Interop: {},
        '1st': {},
        thumbnail: null
    }

    const exifReader = new ExifReader(inputData)
    if (exifReader.tiftag === null) {
        return exifDict
    }

    if (equals(exifReader.tiftag, TIFF_HEADER_II, 0, 0, 2)) {
        exifReader.endianMark = '<'
    } else {
        exifReader.endianMark = '>'
    }

    let pointer:number = unpack(exifReader.endianMark + 'L',
        exifReader.tiftag.subarray(4, 8))[0] as number
    exifDict[ZEROTH] = exifReader.getIfd(pointer, ZEROTH)

    const firstIfdPointer = exifDict[ZEROTH]!.first_ifd_pointer
    delete exifDict[ZEROTH]!.first_ifd_pointer

    if (34665 in exifDict[ZEROTH]!) {
        pointer = exifDict[ZEROTH][34665] as number
        exifDict.Exif = exifReader.getIfd(pointer, 'Exif')
    }
    if (34853 in exifDict[ZEROTH]!) {
        pointer = exifDict[ZEROTH][34853] as number
        exifDict.GPS = exifReader.getIfd(pointer, 'GPS')
    }
    if (40965 in exifDict.Exif!) {
        pointer = exifDict.Exif![40965] as number
        exifDict.Interop = exifReader.getIfd(pointer, 'Interop')
    }
    if (firstIfdPointer && !equals(firstIfdPointer, repeat(0, 4))) {
        pointer = unpack(exifReader.endianMark + 'L',
            firstIfdPointer)[0] as number
        exifDict[FIRST] = exifReader.getIfd(pointer, FIRST)
        if ((513 in exifDict[FIRST]!) && (514 in exifDict[FIRST])) {
            const jpegOffset = exifDict[FIRST][513] as number
            const jpegLength = exifDict[FIRST][514] as number
            const end = jpegOffset + jpegLength
            const thumb = exifReader.tiftag.subarray(jpegOffset, end)
            exifDict.thumbnail = thumb
        }
    }

    return exifDict
}

export function dump (exifDictOriginal:Exif):Uint8Array {
    const TIFF_HEADER_LENGTH = 8

    const exifDict = copy(exifDictOriginal)
    const header = concat(
        stringToBytes('Exif\x00\x00'),
        stringToBytes('\x4d\x4d\x00\x2a\x00\x00\x00\x08')
    )
    let exifIs = false
    let gpsIs = false
    let interopIs = false
    let firstIs = false

    let zerothIfd:ExifElement
    let exifIfd:ExifElement = {}
    let interopIfd:ExifElement = {}
    let gpsIfd:ExifElement = {}
    let firstIfd:ExifElement = {}

    if (ZEROTH in exifDict) {
        zerothIfd = exifDict[ZEROTH]
    } else {
        zerothIfd = {}
    }

    if (
        (('Exif' in exifDict) && (Object.keys(exifDict.Exif).length)) ||
        (('Interop' in exifDict) && (Object.keys(exifDict.Interop).length))
    ) {
        zerothIfd[34665] = 1
        exifIs = true
        exifIfd = exifDict.Exif
        if (('Interop' in exifDict) && Object.keys(exifDict.Interop).length) {
            exifIfd[40965] = 1
            interopIs = true
            interopIfd = exifDict.Interop
        } else if (
            Object.keys(exifIfd).indexOf(InteroperabilityTag.toString()) > -1
        ) {
            delete exifIfd[40965]
        }
    } else if (
        Object.keys(zerothIfd).indexOf(ExifTag.toString()) > -1
    ) {
        delete zerothIfd[34665]
    }

    if (('GPS' in exifDict) && (Object.keys(exifDict.GPS).length)) {
        zerothIfd[GPSTag] = 1
        gpsIs = true
        gpsIfd = exifDict.GPS
    } else if (
        Object.keys(zerothIfd).indexOf(GPSTag.toString()) > -1
    ) {
        delete zerothIfd[GPSTag]
    }

    if ((FIRST in exifDict) &&
        ('thumbnail' in exifDict) &&
        (exifDict.thumbnail != null)) {
        firstIs = true
        exifDict[FIRST][513] = 1
        exifDict[FIRST][514] = 1
        firstIfd = exifDict[FIRST]
    }

    const zerothSet = _dictToBytes(zerothIfd, ZEROTH, 0)
    const zerothLength = (
        zerothSet[0].length + Number(exifIs) * 12 + Number(gpsIs) * 12 + 4 +
        zerothSet[1].length
    )

    let exifSet:Uint8Array[] = []
    let exifBytes:Uint8Array = new Uint8Array(0)
    let exifLength:number = 0
    let gpsSet:Uint8Array[] = []
    let gpsBytes:Uint8Array = new Uint8Array(0)
    let gpsLength:number = 0
    let interopSet:Uint8Array[] = []
    let interopBytes:Uint8Array = new Uint8Array(0)
    let interopLength:number = 0
    let firstSet:Uint8Array[] = []
    let firstBytes:Uint8Array = new Uint8Array(0)
    let thumbnail:Uint8Array = new Uint8Array(0)

    if (exifIs) {
        exifSet = _dictToBytes(exifIfd, 'Exif', zerothLength)
        exifLength = (exifSet[0].length + Number(interopIs) * 12 +
            exifSet[1].length)
    }
    if (gpsIs) {
        gpsSet = _dictToBytes(gpsIfd, 'GPS', zerothLength + exifLength)
        gpsBytes = concat(gpsSet[0], gpsSet[1])
        gpsLength = gpsBytes.length
    }
    if (interopIs) {
        const offset = zerothLength + exifLength + gpsLength
        interopSet = _dictToBytes(interopIfd, 'Interop', offset)
        interopBytes = concat(interopSet[0], interopSet[1])
        interopLength = interopBytes.length
    }
    if (firstIs) {
        const offset = zerothLength + exifLength + gpsLength + interopLength
        firstSet = _dictToBytes(firstIfd, FIRST, offset)
        thumbnail = _getThumbnail(exifDict.thumbnail)
        if (thumbnail.length > 64000) {
            throw new Error('Given thumbnail is too large. max 64kB')
        }
    }

    let exifPointer:Uint8Array = new Uint8Array(0)
    let gpsPointer:Uint8Array = new Uint8Array(0)
    let interopPointer:Uint8Array = new Uint8Array(0)
    let firstIfdPointer = repeat(0, 4)

    if (exifIs) {
        const pointerValue = TIFF_HEADER_LENGTH + zerothLength
        const pointerBytes = pack('>L', [pointerValue])
        const key = 34665
        const keyBytes = pack('>H', [key])
        const typeBytes = pack('>H', [TYPES.Long])
        const lengthBytes = pack('>L', [1])
        exifPointer = concat(keyBytes, typeBytes, lengthBytes, pointerBytes)
    }
    if (gpsIs) {
        const pointerValue = TIFF_HEADER_LENGTH + zerothLength + exifLength
        const pointerBytes = pack('>L', [pointerValue])
        const key = 34853
        const keyBytes = pack('>H', [key])
        const typeBytes = pack('>H', [TYPES.Long])
        const lengthBytes = pack('>L', [1])
        gpsPointer = concat(keyBytes, typeBytes, lengthBytes, pointerBytes)
    }
    if (interopIs) {
        const pointerValue = (TIFF_HEADER_LENGTH +
            zerothLength + exifLength + gpsLength)
        const pointerBytes = pack('>L', [pointerValue])
        const key = 40965
        const keyBytes = pack('>H', [key])
        const typeBytes = pack('>H', [TYPES.Long])
        const lengthBytes = pack('>L', [1])
        interopPointer = concat(keyBytes, typeBytes, lengthBytes, pointerBytes)
    }
    if (firstIs) {
        const pointerValue = (TIFF_HEADER_LENGTH + zerothLength +
            exifLength + gpsLength + interopLength)
        firstIfdPointer = pack('>L', [pointerValue])
        const thumbnailPointer = (pointerValue + firstSet[0].length + 24 +
            4 + firstSet[1].length)
        const thumbnailPBytes = concat(
            stringToBytes('\x02\x01\x00\x04\x00\x00\x00\x01'),
            pack('>L', [thumbnailPointer])
        )
        const thumbnailLengthBytes = concat(
            stringToBytes('\x02\x02\x00\x04\x00\x00\x00\x01'),
            pack('>L', [thumbnail.length])
        )
        firstBytes = concat(
            firstSet[0],
            thumbnailPBytes,
            thumbnailLengthBytes,
            repeat(0, 4),
            firstSet[1],
            thumbnail
        )
    }

    const zerothBytes = concat(
        zerothSet[0],
        exifPointer,
        gpsPointer,
        firstIfdPointer,
        zerothSet[1]
    )
    if (exifIs) {
        exifBytes = concat(exifSet[0], interopPointer, exifSet[1])
    }

    const result = concat(
        header,
        zerothBytes,
        exifBytes,
        gpsBytes,
        interopBytes,
        firstBytes
    )

    return result
}

function copy (obj:any):any {
    // Deep copy, preserving Uint8Arrays
    if (obj === null || obj === undefined) return obj
    if (obj instanceof Uint8Array) {
        return new Uint8Array(obj)
    }
    if (Array.isArray(obj)) {
        return obj.map(copy)
    }
    if (typeof obj === 'object') {
        const copied:any = {}
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                copied[key] = copy(obj[key])
            }
        }
        return copied
    }
    return obj
}

function _getThumbnail (jpeg:Uint8Array):Uint8Array {
    let segments = splitIntoSegments(jpeg)
    while (segments[1] && segments[1][0] === 0xff &&
        segments[1][1] >= 0xe0 && segments[1][1] <= 0xef) {
        segments = [segments[0]].concat(segments.slice(2))
    }
    return concat(...segments)
}

function _packByte (array:number[]):Uint8Array {
    return pack('>' + 'B'.repeat(array.length), array)
}

function _packShort (array:number[]):Uint8Array {
    return pack('>' + 'H'.repeat(array.length), array)
}

function _packLong (array:number[]):Uint8Array {
    return pack('>' + 'L'.repeat(array.length), array)
}

function _valueToBytes (
    rawValue:any,
    valueType:string,
    offset:number
):Uint8Array[] {
    let fourBytesOver:Uint8Array = new Uint8Array(0)
    let valueBytes:Uint8Array = new Uint8Array(0)
    let length:number
    let newValue:Uint8Array
    let num:number
    let den:number

    if (valueType === 'Byte') {
        length = rawValue.length
        if (length <= 4) {
            valueBytes = concat(
                _packByte(rawValue),
                repeat(0, 4 - length)
            )
        } else {
            valueBytes = pack('>L', [offset])
            fourBytesOver = _packByte(rawValue)
        }
    } else if (valueType === 'Short') {
        length = rawValue.length
        if (length <= 2) {
            valueBytes = concat(
                _packShort(rawValue),
                repeat(0, 2 * (2 - length))
            )
        } else {
            valueBytes = pack('>L', [offset])
            fourBytesOver = _packShort(rawValue)
        }
    } else if (valueType === 'Long') {
        length = rawValue.length
        if (length <= 1) {
            valueBytes = _packLong(rawValue)
        } else {
            valueBytes = pack('>L', [offset])
            fourBytesOver = _packLong(rawValue)
        }
    } else if (valueType === 'Ascii') {
        // Handle both string and array
        // (for fields like UserComment that might be stored as Undefined)
        let strValue:string
        if (Array.isArray(rawValue)) {
            // Convert array to string (null bytes will be preserved)
            strValue = bytesToString(new Uint8Array(rawValue)) + '\x00'
        } else {
            strValue = rawValue + '\x00'
        }
        newValue = stringToBytes(strValue)
        length = newValue.length
        if (length > 4) {
            valueBytes = pack('>L', [offset])
            fourBytesOver = newValue
        } else {
            valueBytes = concat(newValue, repeat(0, 4 - length))
        }
    } else if (valueType === 'Rational') {
        if (typeof (rawValue[0]) === 'number') {
            length = 1
            num = rawValue[0]
            den = rawValue[1]
            newValue = concat(pack('>L', [num]), pack('>L', [den]))
        } else {
            length = rawValue.length
            const parts:Uint8Array[] = []
            for (let n = 0; n < length; n++) {
                num = rawValue[n][0]
                den = rawValue[n][1]
                parts.push(pack('>L', [num]))
                parts.push(pack('>L', [den]))
            }
            newValue = concat(...parts)
        }
        valueBytes = pack('>L', [offset])
        fourBytesOver = newValue
    } else if (valueType === 'SRational') {
        if (typeof (rawValue[0]) === 'number') {
            length = 1
            num = rawValue[0]
            den = rawValue[1]
            newValue = concat(pack('>l', [num]), pack('>l', [den]))
        } else {
            length = rawValue.length
            const parts:Uint8Array[] = []
            for (let n = 0; n < length; n++) {
                num = rawValue[n][0]
                den = rawValue[n][1]
                parts.push(pack('>l', [num]))
                parts.push(pack('>l', [den]))
            }
            newValue = concat(...parts)
        }
        valueBytes = pack('>L', [offset])
        fourBytesOver = newValue
    } else if (valueType === 'Undefined') {
        // Convert array to Uint8Array if needed
        const bytes = Array.isArray(rawValue) ?
            new Uint8Array(rawValue) :
            rawValue

        length = bytes.length

        if (length > 4) {
            valueBytes = pack('>L', [offset])
            fourBytesOver = bytes
        } else {
            valueBytes = concat(bytes, repeat(0, 4 - length))
        }
    } else {
        throw new Error(`Unknown value type: ${valueType}`)
    }

    const lengthBytes = pack('>L', [length])

    return [lengthBytes, valueBytes, fourBytesOver]
}

function _dictToBytes (
    ifdDict:ExifElement,
    ifd:TagKey,
    ifdOffset:number
):Uint8Array[] {
    const TIFF_HEADER_LENGTH = 8
    const tagCount = Object.keys(ifdDict).length
    const entryHeader = pack('>H', [tagCount])
    let entriesLength:number
    if ([ZEROTH, FIRST].indexOf(ifd) > -1) {
        entriesLength = 2 + tagCount * 12 + 4
    } else {
        entriesLength = 2 + tagCount * 12
    }
    const entryParts:Uint8Array[] = []
    const valueParts:Uint8Array[] = []

    for (const keyStr in ifdDict) {
        const key = parseInt(keyStr)
        if ((ifd === ZEROTH) && ([34665, 34853].indexOf(key) > -1)) {
            continue
        } else if ((ifd === 'Exif') && (key === 40965)) {
            continue
        } else if ((ifd === FIRST) && ([513, 514].indexOf(key) > -1)) {
            continue
        }

        let rawValue = ifdDict[key]
        const keyBytes = pack('>H', [key])
        const valueType = TAGS[ifd][key].type
        const typeBytes = pack('>H', [TYPES[valueType]])

        if (typeof (rawValue) === 'number') {
            rawValue = [rawValue]
        }
        const offset = TIFF_HEADER_LENGTH + entriesLength + ifdOffset +
            (valueParts.reduce((sum, p) => sum + p.length, 0))
        const b = _valueToBytes(rawValue, valueType, offset)
        const lengthBytes = b[0]
        const valueBytes = b[1]
        const fourBytesOver = b[2]

        entryParts.push(keyBytes, typeBytes, lengthBytes, valueBytes)
        if (fourBytesOver.length > 0) {
            valueParts.push(fourBytesOver)
        }
    }

    return [concat(entryHeader, ...entryParts), concat(...valueParts)]
}

function mergeSegments (segments:Uint8Array[], exif:Uint8Array):Uint8Array {
    let hasExifSegment = false
    const additionalAPP1ExifSegments:number[] = []

    segments.forEach(function (segment, i) {
        // Replace first occurence of APP1:Exif segment
        if (equals(segment, EXIF_MARKER, 0, 0, 2) &&
            equals(segment, EXIF_HEADER, 4, 0, 6)
        ) {
            if (!hasExifSegment) {
                segments[i] = exif
                hasExifSegment = true
            } else {
                additionalAPP1ExifSegments.unshift(i)
            }
        }
    })

    // Remove additional occurences of APP1:Exif segment
    additionalAPP1ExifSegments.forEach(function (segmentIndex) {
        segments.splice(segmentIndex, 1)
    })

    if (!hasExifSegment && exif) {
        segments = [segments[0], exif].concat(segments.slice(1))
    }

    return concat(...segments)
}

const TYPES: { [key:string]:number } = {
    Byte: 1,
    Ascii: 2,
    Short: 3,
    Long: 4,
    Rational: 5,
    Undefined: 7,
    SLong: 9,
    SRational: 10
}

export const InteropIFD = {
    InteroperabilityIndex: 1,
}

export const GPSHelper = {
    degToDmsRational: function (degFloat:number):[number[], number[], number[]] {
        const degAbs = Math.abs(degFloat)
        const minFloat = (degAbs % 1) * 60
        const secFloat = (minFloat % 1) * 60
        const deg = Math.floor(degAbs)
        const min = Math.floor(minFloat)
        const sec = Math.round(secFloat * 100)

        return [[deg, 1], [min, 1], [sec, 100]]
    },

    dmsRationalToDeg: function (
        dmsArray: [number[], number[], number[]],
        ref:string
    ):number {
        const sign = (ref === 'S' || ref === 'W') ? -1.0 : 1.0
        const deg = dmsArray[0][0] / dmsArray[0][1] +
            dmsArray[1][0] / dmsArray[1][1] / 60.0 +
            dmsArray[2][0] / dmsArray[2][1] / 3600.0

        return deg * sign
    }
}

export default {
    remove,
    insert,
    load,
    dump,
    InteropIFD,
    GPSHelper,
}
