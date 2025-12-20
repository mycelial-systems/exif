import { type ExifValue } from './index.js'

/**
 * Binary utilities for working with Uint8Array
 */

/**
 * Pack numbers into a Uint8Array according to format string.
 *
 * Format: '<' or '>' for endianness, followed by format chars
 *   B=byte, H=short, L=long, l=signed long)
 * Example: pack('>H', [257]) => Uint8Array of 2 bytes
 */
export function pack (format:string, values:number[]):Uint8Array {
    if (!Array.isArray(values)) {
        throw new Error("'pack' error. Got invalid type argument.")
    }
    if ((format.length - 1) !== values.length) {
        throw new Error(`'pack' error. ${format.length - 1} marks,` +
            ` ${values.length} elements.`)
    }

    const littleEndian = format[0] === '<'
    if (format[0] !== '<' && format[0] !== '>') {
        throw new Error("'pack' error. Invalid endianness marker")
    }

    // Calculate total size
    let totalSize = 0
    for (let i = 1; i < format.length; i++) {
        const char = format[i].toLowerCase()
        if (char === 'b') totalSize += 1
        else if (char === 'h') totalSize += 2
        else if (char === 'l') totalSize += 4
        else throw new Error(`'pack' error. Invalid format char: ${char}`)
    }

    const buffer = new ArrayBuffer(totalSize)
    const view = new DataView(buffer)
    let offset = 0
    let valueIndex = 0

    for (let i = 1; i < format.length; i++) {
        const char = format[i]
        let value = values[valueIndex++]

        if (char.toLowerCase() === 'b') {
            if (char === 'b' && value < 0) {
                value += 0x100
            }
            if (value > 0xff || value < 0) {
                throw new Error("'pack' error. Byte value out of range")
            }
            view.setUint8(offset, value)
            offset += 1
        } else if (char === 'H') {
            if (value > 0xffff || value < 0) {
                throw new Error("'pack' error. Short value out of range")
            }
            view.setUint16(offset, value, littleEndian)
            offset += 2
        } else if (char.toLowerCase() === 'l') {
            if (char === 'l' && value < 0) {
                value += 0x100000000
            }
            if (value > 0xffffffff || value < 0) {
                throw new Error("'pack' error. Long value out of range")
            }
            view.setUint32(offset, value, littleEndian)
            offset += 4
        }
    }

    return new Uint8Array(buffer)
}

/**
 * Unpack a Uint8Array into numbers according to format string
 * Format: '<' or '>' for endianness, followed by format chars
 * (B=byte, H=short, L=long, l=signed long, b=signed byte)
 */
export function unpack (format:string, data:Uint8Array):ExifValue[] {
    // Calculate expected length
    let expectedLength = 0
    for (let i = 1; i < format.length; i++) {
        const char = format[i].toLowerCase()
        if (char === 'b') expectedLength += 1
        else if (char === 'h') expectedLength += 2
        else if (char === 'l') expectedLength += 4
        else throw new Error(`'unpack' error. Got invalid mark: ${char}`)
    }

    if (expectedLength !== data.length) {
        throw new Error("'unpack' error. Mismatch between symbol and data " +
            `length. ${expectedLength}:${data.length}`)
    }

    const littleEndian = format[0] === '<'
    if (format[0] !== '<' && format[0] !== '>') {
        throw new Error("'unpack' error. Invalid endianness marker")
    }

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength)
    const result: number[] = []
    let offset = 0

    for (let i = 1; i < format.length; i++) {
        const char = format[i]

        if (char.toLowerCase() === 'b') {
            let value = view.getUint8(offset)
            if (char === 'b' && value >= 0x80) {
                value -= 0x100
            }
            result.push(value)
            offset += 1
        } else if (char === 'H') {
            const value = view.getUint16(offset, littleEndian)
            result.push(value)
            offset += 2
        } else if (char.toLowerCase() === 'l') {
            let value = view.getUint32(offset, littleEndian)
            if (char === 'l' && value >= 0x80000000) {
                value -= 0x100000000
            }
            result.push(value)
            offset += 4
        }
    }

    return result
}

/**
 * Create a Uint8Array filled with a repeating byte pattern
 */
export function repeat (byte:number, count:number):Uint8Array {
    const result = new Uint8Array(count)
    result.fill(byte)
    return result
}

/**
 * Concatenate multiple Uint8Arrays
 */
export function concat (...arrays:Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0
    for (const arr of arrays) {
        result.set(
            new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength),
            offset
        )
        offset += arr.length
    }
    return result
}

/**
 * Compare two Uint8Arrays for equality at a specific position
 */
export function equals (
    a:Uint8Array,
    b:Uint8Array,
    aOffset = 0,
    bOffset = 0,
    length?:number
):boolean {
    const len = length ?? Math.min(a.length - aOffset, b.length - bOffset)
    for (let i = 0; i < len; i++) {
        if (a[aOffset + i] !== b[bOffset + i]) return false
    }
    return true
}

/**
 * Convert a string to Uint8Array (for ASCII/EXIF strings)
 */
export function stringToBytes (str:string):Uint8Array {
    const bytes = new Uint8Array(str.length)
    for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i) & 0xff
    }
    return bytes
}

/**
 * Convert Uint8Array to string (for ASCII/EXIF strings)
 */
export function bytesToString (bytes:Uint8Array):string {
    let str = ''
    for (let i = 0; i < bytes.length; i++) {
        str += String.fromCharCode(bytes[i])
    }
    return str
}

/**
 * Create format string with repeated character
 */
export function formatString (char:string, count:number):string {
    return char.repeat(count)
}
