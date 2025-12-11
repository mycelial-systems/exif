import { TAGS, ExifIFD, ImageIFD } from './tags'

export interface IExifElement {
    [key:number]:any;

    // Allow string keys for internal properties like first_ifd_pointer
    [key:string]:any;
}

export interface IExif {
    '0th'?:IExifElement;
    '1st'?:IExifElement;
    Exif?:IExifElement;
    GPS?:IExifElement;
    Interop?:IExifElement;
    thumbnail?:string|null;
}

export function remove (jpeg:string):string {
    let b64 = false
    if (jpeg.slice(0, 2) == '\xff\xd8') {
    } else if (jpeg.slice(0, 23) == 'data:image/jpeg;base64,' || jpeg.slice(0, 22) == 'data:image/jpg;base64,') {
        jpeg = atob(jpeg.split(',')[1])
        b64 = true
    } else {
        throw new Error('Given data is not jpeg.')
    }

    const segments = splitIntoSegments(jpeg)
    const newSegments = segments.filter(function (seg) {
        return !(seg.slice(0, 2) == '\xff\xe1' &&
            seg.slice(4, 10) == 'Exif\x00\x00')
    })

    let new_data = newSegments.join('')
    if (b64) {
        new_data = 'data:image/jpeg;base64,' + btoa(new_data)
    }

    return new_data
}

export function insert (exif:string, jpeg:string):string {
    let b64 = false
    if (exif.slice(0, 6) != '\x45\x78\x69\x66\x00\x00') {
        throw new Error('Given data is not exif.')
    }
    if (jpeg.slice(0, 2) == '\xff\xd8') {
    } else if (jpeg.slice(0, 23) == 'data:image/jpeg;base64,' || jpeg.slice(0, 22) == 'data:image/jpg;base64,') {
        jpeg = atob(jpeg.split(',')[1])
        b64 = true
    } else {
        throw new Error('Given data is not jpeg.')
    }

    const exifStr = '\xff\xe1' + pack('>H', [exif.length + 2]) + exif
    const segments = splitIntoSegments(jpeg)
    let new_data = mergeSegments(segments, exifStr)
    if (b64) {
        new_data = 'data:image/jpeg;base64,' + btoa(new_data)
    }

    return new_data
}

export function load (data:string):IExif {
    let input_data
    if (typeof (data) === 'string') {
        if (data.slice(0, 2) == '\xff\xd8') {
            input_data = data
        } else if (data.slice(0, 23) == 'data:image/jpeg;base64,' || data.slice(0, 22) == 'data:image/jpg;base64,') {
            input_data = atob(data.split(',')[1])
        } else if (data.slice(0, 4) == 'Exif') {
            input_data = data.slice(6)
        } else {
            throw new Error("'load' gots invalid file data.")
        }
    } else {
        throw new Error("'load' gots invalid type argument.")
    }

    const exif_dict:IExif = {
        '0th': {},
        Exif: {},
        GPS: {},
        Interop: {},
        '1st': {},
        thumbnail: null
    }
    const exifReader = new ExifReader(input_data)
    if (exifReader.tiftag === null) {
        return exif_dict
    }

    if (exifReader.tiftag.slice(0, 2) == '\x49\x49') {
        exifReader.endian_mark = '<'
    } else {
        exifReader.endian_mark = '>'
    }

    let pointer = unpack(exifReader.endian_mark + 'L',
        exifReader.tiftag.slice(4, 8))[0]
    exif_dict['0th'] = exifReader.get_ifd(pointer, '0th')

    const first_ifd_pointer = exif_dict['0th'].first_ifd_pointer
    delete exif_dict['0th'].first_ifd_pointer

    if (34665 in exif_dict['0th']) {
        pointer = exif_dict['0th'][34665]
        exif_dict.Exif = exifReader.get_ifd(pointer, 'Exif')
    }
    if (34853 in exif_dict['0th']) {
        pointer = exif_dict['0th'][34853]
        exif_dict.GPS = exifReader.get_ifd(pointer, 'GPS')
    }
    if (40965 in exif_dict.Exif!) {
        pointer = exif_dict.Exif![40965]
        exif_dict.Interop = exifReader.get_ifd(pointer, 'Interop')
    }
    if (first_ifd_pointer != '\x00\x00\x00\x00') {
        pointer = unpack(exifReader.endian_mark + 'L',
            first_ifd_pointer)[0]
        exif_dict['1st'] = exifReader.get_ifd(pointer, '1st')
        if ((513 in exif_dict['1st']) && (514 in exif_dict['1st'])) {
            const end = exif_dict['1st'][513] + exif_dict['1st'][514]
            const thumb = exifReader.tiftag.slice(exif_dict['1st'][513], end)
            exif_dict.thumbnail = thumb
        }
    }

    return exif_dict
}

export function dump (exif_dict_original:any):string {
    const TIFF_HEADER_LENGTH = 8

    const exif_dict = copy(exif_dict_original)
    const header = 'Exif\x00\x00\x4d\x4d\x00\x2a\x00\x00\x00\x08'
    let exif_is = false
    let gps_is = false
    let interop_is = false
    let first_is = false

    let zeroth_ifd,
        exif_ifd,
        interop_ifd,
        gps_ifd,
        first_ifd

    if ('0th' in exif_dict) {
        zeroth_ifd = exif_dict['0th']
    } else {
        zeroth_ifd = {}
    }

    if ((('Exif' in exif_dict) && (Object.keys(exif_dict.Exif).length)) ||
        (('Interop' in exif_dict) && (Object.keys(exif_dict.Interop).length))) {
        zeroth_ifd[34665] = 1
        exif_is = true
        exif_ifd = exif_dict.Exif
        if (('Interop' in exif_dict) && Object.keys(exif_dict.Interop).length) {
            exif_ifd[40965] = 1
            interop_is = true
            interop_ifd = exif_dict.Interop
        } else if (Object.keys(exif_ifd).indexOf(ExifIFD.InteroperabilityTag.toString()) > -1) {
            delete exif_ifd[40965]
        }
    } else if (Object.keys(zeroth_ifd).indexOf(ImageIFD.ExifTag.toString()) > -1) {
        delete zeroth_ifd[34665]
    }

    if (('GPS' in exif_dict) && (Object.keys(exif_dict.GPS).length)) {
        zeroth_ifd[ImageIFD.GPSTag] = 1
        gps_is = true
        gps_ifd = exif_dict.GPS
    } else if (Object.keys(zeroth_ifd).indexOf(ImageIFD.GPSTag.toString()) > -1) {
        delete zeroth_ifd[ImageIFD.GPSTag]
    }

    if (('1st' in exif_dict) &&
        ('thumbnail' in exif_dict) &&
        (exif_dict.thumbnail != null)) {
        first_is = true
        exif_dict['1st'][513] = 1
        exif_dict['1st'][514] = 1
        first_ifd = exif_dict['1st']
    }

    const zeroth_set = _dict_to_bytes(zeroth_ifd, '0th', 0)
    const zeroth_length = (zeroth_set[0].length + Number(exif_is) * 12 + Number(gps_is) * 12 + 4 +
        zeroth_set[1].length)

    let exif_set:string[] = []
    let exif_bytes = ''
    let exif_length = 0
    let gps_set:string[] = []
    let gps_bytes = ''
    let gps_length = 0
    let interop_set:string[] = []
    let interop_bytes = ''
    let interop_length = 0
    let first_set:string[] = []
    let first_bytes = ''
    let thumbnail:string = ''
    if (exif_is) {
        exif_set = _dict_to_bytes(exif_ifd, 'Exif', zeroth_length)
        exif_length = exif_set[0].length + Number(interop_is) * 12 + exif_set[1].length
    }
    if (gps_is) {
        gps_set = _dict_to_bytes(gps_ifd, 'GPS', zeroth_length + exif_length)
        gps_bytes = gps_set.join('')
        gps_length = gps_bytes.length
    }
    if (interop_is) {
        var offset = zeroth_length + exif_length + gps_length
        interop_set = _dict_to_bytes(interop_ifd, 'Interop', offset)
        interop_bytes = interop_set.join('')
        interop_length = interop_bytes.length
    }
    if (first_is) {
        var offset = zeroth_length + exif_length + gps_length + interop_length
        first_set = _dict_to_bytes(first_ifd, '1st', offset)
        thumbnail = _get_thumbnail(exif_dict.thumbnail)
        if (thumbnail.length > 64000) {
            throw new Error('Given thumbnail is too large. max 64kB')
        }
    }

    let exif_pointer = ''
    let gps_pointer = ''
    let interop_pointer = ''
    let first_ifd_pointer = '\x00\x00\x00\x00'
    if (exif_is) {
        var pointer_value = TIFF_HEADER_LENGTH + zeroth_length
        var pointer_str = pack('>L', [pointer_value])
        var key = 34665
        var key_str = pack('>H', [key])
        var type_str = pack('>H', [TYPES.Long])
        var length_str = pack('>L', [1])
        exif_pointer = key_str + type_str + length_str + pointer_str
    }
    if (gps_is) {
        var pointer_value = TIFF_HEADER_LENGTH + zeroth_length + exif_length
        var pointer_str = pack('>L', [pointer_value])
        var key = 34853
        var key_str = pack('>H', [key])
        var type_str = pack('>H', [TYPES.Long])
        var length_str = pack('>L', [1])
        gps_pointer = key_str + type_str + length_str + pointer_str
    }
    if (interop_is) {
        var pointer_value = (TIFF_HEADER_LENGTH +
            zeroth_length + exif_length + gps_length)
        var pointer_str = pack('>L', [pointer_value])
        var key = 40965
        var key_str = pack('>H', [key])
        var type_str = pack('>H', [TYPES.Long])
        var length_str = pack('>L', [1])
        interop_pointer = key_str + type_str + length_str + pointer_str
    }
    if (first_is) {
        var pointer_value = (TIFF_HEADER_LENGTH + zeroth_length +
            exif_length + gps_length + interop_length)
        first_ifd_pointer = pack('>L', [pointer_value])
        const thumbnail_pointer = (pointer_value + first_set[0].length + 24 +
            4 + first_set[1].length)
        const thumbnail_p_bytes = ('\x02\x01\x00\x04\x00\x00\x00\x01' +
            pack('>L', [thumbnail_pointer]))
        const thumbnail_length_bytes = ('\x02\x02\x00\x04\x00\x00\x00\x01' +
            pack('>L', [thumbnail.length]))
        first_bytes = (first_set[0] + thumbnail_p_bytes +
            thumbnail_length_bytes + '\x00\x00\x00\x00' +
            first_set[1] + thumbnail)
    }

    const zeroth_bytes = (zeroth_set[0] + exif_pointer + gps_pointer +
        first_ifd_pointer + zeroth_set[1])
    if (exif_is) {
        exif_bytes = exif_set[0] + interop_pointer + exif_set[1]
    }

    return (header + zeroth_bytes + exif_bytes + gps_bytes +
        interop_bytes + first_bytes)
}

function copy (obj:any):any {
    return JSON.parse(JSON.stringify(obj))
}

function _get_thumbnail (jpeg:string):string {
    let segments = splitIntoSegments(jpeg)
    while ((segments[1].slice(0, 2) >= '\xff\xe0') && (segments[1].slice(0, 2) <= '\xff\xef')) {
        segments = [segments[0]].concat(segments.slice(2))
    }
    return segments.join('')
}

function _pack_byte (array:number[]):string {
    return pack('>' + nStr('B', array.length), array)
}

function _pack_short (array:number[]):string {
    return pack('>' + nStr('H', array.length), array)
}

function _pack_long (array:number[]):string {
    return pack('>' + nStr('L', array.length), array)
}

function _value_to_bytes (
    raw_value:any,
    value_type:string,
    offset:number
):string[] {
    let four_bytes_over = ''
    let value_str = ''
    let length,
        new_value,
        num,
        den

    if (value_type == 'Byte') {
        length = raw_value.length
        if (length <= 4) {
            value_str = (_pack_byte(raw_value) +
                nStr('\x00', 4 - length))
        } else {
            value_str = pack('>L', [offset])
            four_bytes_over = _pack_byte(raw_value)
        }
    } else if (value_type == 'Short') {
        length = raw_value.length
        if (length <= 2) {
            value_str = (_pack_short(raw_value) +
                nStr('\x00\x00', 2 - length))
        } else {
            value_str = pack('>L', [offset])
            four_bytes_over = _pack_short(raw_value)
        }
    } else if (value_type == 'Long') {
        length = raw_value.length
        if (length <= 1) {
            value_str = _pack_long(raw_value)
        } else {
            value_str = pack('>L', [offset])
            four_bytes_over = _pack_long(raw_value)
        }
    } else if (value_type == 'Ascii') {
        new_value = raw_value + '\x00'
        length = new_value.length
        if (length > 4) {
            value_str = pack('>L', [offset])
            four_bytes_over = new_value
        } else {
            value_str = new_value + nStr('\x00', 4 - length)
        }
    } else if (value_type == 'Rational') {
        if (typeof (raw_value[0]) === 'number') {
            length = 1
            num = raw_value[0]
            den = raw_value[1]
            new_value = pack('>L', [num]) + pack('>L', [den])
        } else {
            length = raw_value.length
            new_value = ''
            for (var n = 0; n < length; n++) {
                num = raw_value[n][0]
                den = raw_value[n][1]
                new_value += (pack('>L', [num]) +
                    pack('>L', [den]))
            }
        }
        value_str = pack('>L', [offset])
        four_bytes_over = new_value
    } else if (value_type == 'SRational') {
        if (typeof (raw_value[0]) === 'number') {
            length = 1
            num = raw_value[0]
            den = raw_value[1]
            new_value = pack('>l', [num]) + pack('>l', [den])
        } else {
            length = raw_value.length
            new_value = ''
            for (var n = 0; n < length; n++) {
                num = raw_value[n][0]
                den = raw_value[n][1]
                new_value += (pack('>l', [num]) +
                    pack('>l', [den]))
            }
        }
        value_str = pack('>L', [offset])
        four_bytes_over = new_value
    } else if (value_type == 'Undefined') {
        length = raw_value.length
        if (length > 4) {
            value_str = pack('>L', [offset])
            four_bytes_over = raw_value
        } else {
            value_str = raw_value + nStr('\x00', 4 - length)
        }
    }

    const length_str = pack('>L', [length])

    return [length_str, value_str, four_bytes_over]
}

function _dict_to_bytes (ifd_dict:IExifElement, ifd:string, ifd_offset:number):string[] {
    const TIFF_HEADER_LENGTH = 8
    const tag_count = Object.keys(ifd_dict).length
    const entry_header = pack('>H', [tag_count])
    let entries_length
    if (['0th', '1st'].indexOf(ifd) > -1) {
        entries_length = 2 + tag_count * 12 + 4
    } else {
        entries_length = 2 + tag_count * 12
    }
    let entries = ''
    let values = ''

    for (var keyStr in ifd_dict) {
        const key = parseInt(keyStr)
        if ((ifd == '0th') && ([34665, 34853].indexOf(key) > -1)) {
            continue
        } else if ((ifd == 'Exif') && (key == 40965)) {
            continue
        } else if ((ifd == '1st') && ([513, 514].indexOf(key) > -1)) {
            continue
        }

        let raw_value = ifd_dict[key]
        const key_str = pack('>H', [key])
        const value_type = TAGS[ifd][key].type
        const type_str = pack('>H', [TYPES[value_type]])

        if (typeof (raw_value) === 'number') {
            raw_value = [raw_value]
        }
        const offset = TIFF_HEADER_LENGTH + entries_length + ifd_offset + values.length
        const b = _value_to_bytes(raw_value, value_type, offset)
        const length_str = b[0]
        const value_str = b[1]
        const four_bytes_over = b[2]

        entries += key_str + type_str + length_str + value_str
        values += four_bytes_over
    }

    return [entry_header + entries, values]
}

class ExifReader {
    tiftag:string|null
    endian_mark:string

    constructor (data:string) {
        this.endian_mark = ''
        let segments,
            app1
        if (data.slice(0, 2) == '\xff\xd8') { // JPEG
            segments = splitIntoSegments(data)
            app1 = getExifSeg(segments)
            if (app1) {
                this.tiftag = app1.slice(10)
            } else {
                this.tiftag = null
            }
        } else if (['\x49\x49', '\x4d\x4d'].indexOf(data.slice(0, 2)) > -1) { // TIFF
            this.tiftag = data
        } else if (data.slice(0, 4) == 'Exif') { // Exif
            this.tiftag = data.slice(6)
        } else {
            throw new Error('Given file is neither JPEG nor TIFF.')
        }
    }

    get_ifd (pointer:number, ifd_name:string):IExifElement {
        const ifd_dict:IExifElement = {}
        const tag_count = unpack(this.endian_mark + 'H',
            this.tiftag!.slice(pointer, pointer + 2))[0]
        const offset = pointer + 2
        let t
        if (['0th', '1st'].indexOf(ifd_name) > -1) {
            t = 'Image'
        } else {
            t = ifd_name
        }

        for (let x = 0; x < tag_count; x++) {
            pointer = offset + 12 * x
            const tag = unpack(this.endian_mark + 'H',
                this.tiftag!.slice(pointer, pointer + 2))[0]
            const value_type = unpack(this.endian_mark + 'H',
                this.tiftag!.slice(pointer + 2, pointer + 4))[0]
            const value_num = unpack(this.endian_mark + 'L',
                this.tiftag!.slice(pointer + 4, pointer + 8))[0]
            const value = this.tiftag!.slice(pointer + 8, pointer + 12)

            const v_set = [value_type, value_num, value]
            if (tag in TAGS[t]) {
                ifd_dict[tag] = this.convert_value(v_set)
            }
        }

        if (ifd_name == '0th') {
            pointer = offset + 12 * tag_count
            ifd_dict.first_ifd_pointer = this.tiftag!.slice(pointer, pointer + 4)
        }

        return ifd_dict
    }

    convert_value (val:any):any {
        let data = null
        const t = val[0]
        const length = val[1]
        const value = val[2]
        let pointer

        if (t == 1) { // BYTE
            if (length > 4) {
                pointer = unpack(this.endian_mark + 'L', value)[0]
                data = unpack(this.endian_mark + nStr('B', length),
                    this.tiftag!.slice(pointer, pointer + length))
            } else {
                data = unpack(this.endian_mark + nStr('B', length), value.slice(0, length))
            }
        } else if (t == 2) { // ASCII
            if (length > 4) {
                pointer = unpack(this.endian_mark + 'L', value)[0]
                data = this.tiftag!.slice(pointer, pointer + length - 1)
            } else {
                data = value.slice(0, length - 1)
            }
        } else if (t == 3) { // SHORT
            if (length > 2) {
                pointer = unpack(this.endian_mark + 'L', value)[0]
                data = unpack(this.endian_mark + nStr('H', length),
                    this.tiftag!.slice(pointer, pointer + length * 2))
            } else {
                data = unpack(this.endian_mark + nStr('H', length),
                    value.slice(0, length * 2))
            }
        } else if (t == 4) { // LONG
            if (length > 1) {
                pointer = unpack(this.endian_mark + 'L', value)[0]
                data = unpack(this.endian_mark + nStr('L', length),
                    this.tiftag!.slice(pointer, pointer + length * 4))
            } else {
                data = unpack(this.endian_mark + nStr('L', length),
                    value)
            }
        } else if (t == 5) { // RATIONAL
            pointer = unpack(this.endian_mark + 'L', value)[0]
            if (length > 1) {
                data = []
                for (var x = 0; x < length; x++) {
                    data.push([unpack(this.endian_mark + 'L',
                        this.tiftag!.slice(pointer + x * 8, pointer + 4 + x * 8))[0],
                    unpack(this.endian_mark + 'L',
                        this.tiftag!.slice(pointer + 4 + x * 8, pointer + 8 + x * 8))[0]
                    ])
                }
            } else {
                data = [unpack(this.endian_mark + 'L',
                    this.tiftag!.slice(pointer, pointer + 4))[0],
                unpack(this.endian_mark + 'L',
                    this.tiftag!.slice(pointer + 4, pointer + 8))[0]
                ]
            }
        } else if (t == 7) { // UNDEFINED BYTES
            if (length > 4) {
                pointer = unpack(this.endian_mark + 'L', value)[0]
                data = this.tiftag!.slice(pointer, pointer + length)
            } else {
                data = value.slice(0, length)
            }
        } else if (t == 9) { // SLONG
            if (length > 1) {
                pointer = unpack(this.endian_mark + 'L', value)[0]
                data = unpack(this.endian_mark + nStr('l', length),
                    this.tiftag!.slice(pointer, pointer + length * 4))
            } else {
                data = unpack(this.endian_mark + nStr('l', length),
                    value)
            }
        } else if (t == 10) { // SRATIONAL
            pointer = unpack(this.endian_mark + 'L', value)[0]
            if (length > 1) {
                data = []
                for (var x = 0; x < length; x++) {
                    data.push([unpack(this.endian_mark + 'l',
                        this.tiftag!.slice(pointer + x * 8, pointer + 4 + x * 8))[0],
                    unpack(this.endian_mark + 'l',
                        this.tiftag!.slice(pointer + 4 + x * 8, pointer + 8 + x * 8))[0]
                    ])
                }
            } else {
                data = [unpack(this.endian_mark + 'l',
                    this.tiftag!.slice(pointer, pointer + 4))[0],
                unpack(this.endian_mark + 'l',
                    this.tiftag!.slice(pointer + 4, pointer + 8))[0]
                ]
            }
        } else {
            throw new Error('Exif might be wrong. Got incorrect value ' +
                'type to decode. type:' + t)
        }

        if ((data instanceof Array) && (data.length == 1)) {
            return data[0]
        } else {
            return data
        }
    }
}

function pack (mark:string, array:number[]):string {
    if (!(array instanceof Array)) {
        throw new Error("'pack' error. Got invalid type argument.")
    }
    if ((mark.length - 1) != array.length) {
        throw new Error("'pack' error. " + (mark.length - 1) + ' marks, ' + array.length + ' elements.')
    }

    let littleEndian
    if (mark[0] == '<') {
        littleEndian = true
    } else if (mark[0] == '>') {
        littleEndian = false
    } else {
        throw new Error('')
    }
    let packed = ''
    let p = 1
    let val = null
    let c = null
    let valStr = null

    while (c = mark[p]) {
        if (c.toLowerCase() == 'b') {
            val = array[p - 1]
            if ((c == 'b') && (val < 0)) {
                val += 0x100
            }
            if ((val > 0xff) || (val < 0)) {
                throw new Error("'pack' error.")
            } else {
                valStr = String.fromCharCode(val)
            }
        } else if (c == 'H') {
            val = array[p - 1]
            if ((val > 0xffff) || (val < 0)) {
                throw new Error("'pack' error.")
            } else {
                valStr = String.fromCharCode(Math.floor((val % 0x10000) / 0x100)) +
                    String.fromCharCode(val % 0x100)
                if (littleEndian) {
                    valStr = valStr.split('').reverse().join('')
                }
            }
        } else if (c.toLowerCase() == 'l') {
            val = array[p - 1]
            if ((c == 'l') && (val < 0)) {
                val += 0x100000000
            }
            if ((val > 0xffffffff) || (val < 0)) {
                throw new Error("'pack' error.")
            } else {
                valStr = String.fromCharCode(Math.floor(val / 0x1000000)) +
                    String.fromCharCode(Math.floor((val % 0x1000000) / 0x10000)) +
                    String.fromCharCode(Math.floor((val % 0x10000) / 0x100)) +
                    String.fromCharCode(val % 0x100)
                if (littleEndian) {
                    valStr = valStr.split('').reverse().join('')
                }
            }
        } else {
            throw new Error("'pack' error.")
        }

        packed += valStr
        p += 1
    }

    return packed
}

function nStr (ch:string, num:number):string {
    let str = ''
    for (let i = 0; i < num; i++) {
        str += ch
    }
    return str
}

function splitIntoSegments (data:string):string[] {
    if (data.slice(0, 2) != '\xff\xd8') {
        throw new Error("Given data isn't JPEG.")
    }

    let head = 2
    const segments = ['\xff\xd8']
    while (true) {
        if (data.slice(head, head + 2) == '\xff\xda') {
            segments.push(data.slice(head))
            break
        } else {
            const length = unpack('>H', data.slice(head + 2, head + 4))[0]
            const endPoint = head + length + 2
            segments.push(data.slice(head, endPoint))
            head = endPoint
        }

        if (head >= data.length) {
            throw new Error('Wrong JPEG data.')
        }
    }
    return segments
}

function getExifSeg (segments:string[]):string|null {
    let seg
    for (let i = 0; i < segments.length; i++) {
        seg = segments[i]
        if (seg.slice(0, 2) == '\xff\xe1' &&
            seg.slice(4, 10) == 'Exif\x00\x00') {
            return seg
        }
    }
    return null
}

function mergeSegments (segments:string[], exif:string):string {
    let hasExifSegment = false
    const additionalAPP1ExifSegments:number[] = []

    segments.forEach(function (segment, i) {
        // Replace first occurence of APP1:Exif segment
        if (segment.slice(0, 2) == '\xff\xe1' &&
            segment.slice(4, 10) == 'Exif\x00\x00'
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

    return segments.join('')
}

const TYPES:{ [key:string]:number } = {
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
    degToDmsRational: function (
        degFloat:number
    ):[number[], number[], number[]] {
        const degAbs = Math.abs(degFloat)
        const minFloat = (degAbs % 1) * 60
        const secFloat = (minFloat % 1) * 60
        const deg = Math.floor(degAbs)
        const min = Math.floor(minFloat)
        const sec = Math.round(secFloat * 100)

        return [[deg, 1], [min, 1], [sec, 100]]
    },

    dmsRationalToDeg: function (
        dmsArray:[number[], number[], number[]],
        ref:string
    ):number {
        const sign = (ref === 'S' || ref === 'W') ? -1.0 : 1.0
        const deg = dmsArray[0][0] / dmsArray[0][1] +
            dmsArray[1][0] / dmsArray[1][1] / 60.0 +
            dmsArray[2][0] / dmsArray[2][1] / 3600.0

        return deg * sign
    }
}

// Default export for backward compatibility
export default {
    remove,
    insert,
    load,
    dump,
    ImageIFD,
    ExifIFD,
    InteropIFD,
    GPSHelper
}

function unpack (mark:string, str:string):number[] {
    if (typeof (str) !== 'string') {
        throw new Error("'unpack' error. Got invalid type argument.")
    }

    let l = 0
    for (let markPointer = 1; markPointer < mark.length; markPointer++) {
        if (mark[markPointer].toLowerCase() == 'b') {
            l += 1
        } else if (mark[markPointer].toLowerCase() == 'h') {
            l += 2
        } else if (mark[markPointer].toLowerCase() == 'l') {
            l += 4
        } else {
            throw new Error("'unpack' error. Got invalid mark.")
        }
    }

    if (l != str.length) {
        throw new Error("'unpack' error. Mismatch between symbol and string length. " + l + ':' + str.length)
    }

    let littleEndian
    if (mark[0] == '<') {
        littleEndian = true
    } else if (mark[0] == '>') {
        littleEndian = false
    } else {
        throw new Error("'unpack' error.")
    }
    const unpacked:number[] = []
    let strPointer = 0
    let p = 1
    let val:number|null = null
    let c:string|null = null
    let length:number|null = null
    let sliced = ''

    while (c = mark[p]) {
        if (c.toLowerCase() == 'b') {
            length = 1
            sliced = str.slice(strPointer, strPointer + length)
            val = sliced.charCodeAt(0)
            if ((c == 'b') && (val >= 0x80)) {
                val -= 0x100
            }
        } else if (c == 'H') {
            length = 2
            sliced = str.slice(strPointer, strPointer + length)
            if (littleEndian) {
                sliced = sliced.split('').reverse().join('')
            }
            val = sliced.charCodeAt(0) * 0x100 +
                sliced.charCodeAt(1)
        } else if (c.toLowerCase() == 'l') {
            length = 4
            sliced = str.slice(strPointer, strPointer + length)
            if (littleEndian) {
                sliced = sliced.split('').reverse().join('')
            }
            val = sliced.charCodeAt(0) * 0x1000000 +
                sliced.charCodeAt(1) * 0x10000 +
                sliced.charCodeAt(2) * 0x100 +
                sliced.charCodeAt(3)
            if ((c == 'l') && (val >= 0x80000000)) {
                val -= 0x100000000
            }
        } else {
            throw new Error("'unpack' error. " + c)
        }

        unpacked.push(val)
        strPointer += length
        p += 1
    }

    return unpacked
}
