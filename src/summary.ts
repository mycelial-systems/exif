import {
    ImageIFD,
    ExifIFD,
    type Exif,
    ExposurePrograms,
    MeteringModes,
    FlashModes,
    ColorSpaces,
    WhiteBalanceModes,
    GPSHelper,
    GPSIFD,
    ZEROTH
} from './index.js'

export type SummaryKeys =
    | 'make'
    | 'model'
    | 'software'
    | 'artist'
    | 'copyright'
    | 'lens'
    | 'dateTime'
    | 'dimensions'
    | 'resolution'
    | 'iso'
    | 'fNumber'
    | 'apertureValue'
    | 'exposure'
    | 'focalLength'
    | 'focalLength35mm'
    | 'flash'
    | 'colorSpace'
    | 'exposureProgram'
    | 'meteringMode'
    | 'whiteBalance'
    | 'location'
    | 'altitude';

export type ExifSummary = Record<SummaryKeys, string|null|undefined>;

export function getSummary (exif:Exif):ExifSummary {
    const zeroth = exif[ZEROTH] || {}
    const exifData = exif.Exif || {}
    const gps = exif.GPS || {}

    // Camera info
    const make = zeroth[ImageIFD.Make] as string | undefined
    const model = zeroth[ImageIFD.Model] as string | undefined
    const software = zeroth[ImageIFD.Software] as string | undefined
    const artist = zeroth[ImageIFD.Artist] as string | undefined
    const copyright = zeroth[ImageIFD.Copyright] as string | undefined

    // Lens info
    const lensMake = exifData[ExifIFD.LensMake] as string | undefined
    const lensModel = exifData[ExifIFD.LensModel] as string | undefined
    const lens = [lensMake, lensModel].filter(Boolean).join(' ') || null

    // Date
    const dateTime = (exifData[ExifIFD.DateTimeOriginal] ||
        zeroth[ImageIFD.DateTime]) as string | undefined

    // Dimensions
    const width = zeroth[ImageIFD.ImageWidth] as number | undefined
    const height = zeroth[ImageIFD.ImageLength] as number | undefined
    const dimensions = width && height ? `${width} x ${height}` : null
    const resolution = formatResolutionDpi(exif)

    // Exposure settings
    const iso = exifData[ExifIFD.ISOSpeedRatings] as number | undefined
    const fNumber = formatFNumber(
        exifData[ExifIFD.FNumber] as [number, number] | undefined
    )
    const apertureValue = formatRational(
        exifData[ExifIFD.ApertureValue] as [number, number] | undefined
    )
    const exposure = formatExposure(
        exifData[ExifIFD.ExposureTime] as [number, number] | undefined
    )
    const focalLength = formatFocalLength(
        exifData[ExifIFD.FocalLength] as [number, number] | undefined
    )
    const focalLength35mm = exifData[ExifIFD.FocalLengthIn35mmFilm] as
        number|undefined

    // Camera settings
    const flash = exifData[ExifIFD.Flash] as number | undefined
    const colorSpace = exifData[ExifIFD.ColorSpace] as number | undefined
    const exposureProgram = exifData[ExifIFD.ExposureProgram] as
        number|undefined
    const meteringMode = exifData[ExifIFD.MeteringMode] as number | undefined
    const whiteBalance = exifData[ExifIFD.WhiteBalance] as number | undefined

    // GPS
    const location = formatGPS(exif)
    const altitude = gps[GPSIFD.GPSAltitude] as [number, number] | undefined
    const altitudeStr = altitude ?
        `${(altitude[0] / altitude[1]).toFixed(1)}m` :
        null

    return {
        make,
        model,
        software,
        artist,
        copyright,
        lens,
        dateTime,
        dimensions,
        resolution,
        iso: iso ? ('' + iso) : null,
        fNumber,
        apertureValue: apertureValue ? apertureValue.toFixed(2) : null,
        exposure,
        focalLength,
        focalLength35mm: focalLength35mm ? `${focalLength35mm}mm` : null,
        flash: flash !== undefined ?
            (FlashModes[flash] || `Unknown (${flash})`) :
            null,
        colorSpace: colorSpace !== undefined ?
            (ColorSpaces[colorSpace] || `Unknown (${colorSpace})`) :
            null,
        exposureProgram: exposureProgram !== undefined ?
            (ExposurePrograms[exposureProgram] || `Unknown (${exposureProgram})`) :
            null,
        meteringMode: meteringMode !== undefined ?
            (MeteringModes[meteringMode] || `Unknown (${meteringMode})`) :
            null,
        whiteBalance: whiteBalance !== undefined ?
            (WhiteBalanceModes[whiteBalance] || `Unknown (${whiteBalance})`) :
            null,
        location,
        altitude: altitudeStr,
    }
}

function formatRational (val: [number, number] | undefined): number | null {
    if (!val) return null
    return val[0] / val[1]
}

function formatResolutionDpi (exif: Exif): string | null {
    const zeroth = exif['0th'] || {}
    const xRes = zeroth[ImageIFD.XResolution] as [number, number] | undefined
    const yRes = zeroth[ImageIFD.YResolution] as [number, number] | undefined
    if (!xRes || !yRes) return null
    const x = Math.round(xRes[0] / xRes[1])
    const y = Math.round(yRes[0] / yRes[1])
    return `${x} x ${y}`
}

function formatExposure (val: [number, number] | undefined): string | null {
    if (!val) return null
    const [num, den] = val
    if (num >= den) return `${num / den}s`
    return `1/${Math.round(den / num)}s`
}

function formatFNumber (val: [number, number] | undefined): string | null {
    if (!val) return null
    return `f/${val[0] / val[1]}`
}

function formatFocalLength (val: [number, number] | undefined): string | null {
    if (!val) return null
    return `${val[0] / val[1]}mm`
}

function formatGPS (exif: Exif): string | null {
    const gps = exif.GPS
    if (!gps) return null

    const lat = gps[GPSIFD.GPSLatitude] as [number, number][] | undefined
    const latRef = gps[GPSIFD.GPSLatitudeRef] as string | undefined
    const lon = gps[GPSIFD.GPSLongitude] as [number, number][] | undefined
    const lonRef = gps[GPSIFD.GPSLongitudeRef] as string | undefined

    if (!lat || !latRef || !lon || !lonRef) return null

    const latDeg = GPSHelper.dmsRationalToDeg(
        lat as unknown as [number[], number[], number[]],
        latRef
    )
    const lonDeg = GPSHelper.dmsRationalToDeg(
        lon as unknown as [number[], number[], number[]],
        lonRef
    )

    return `${latDeg.toFixed(6)}, ${lonDeg.toFixed(6)}`
}
