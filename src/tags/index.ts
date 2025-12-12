export type TagType = 'Ascii'|'Byte'|'Short'|'Long'|'Rational'|'SRational'|
    'Undefined'|'Float'

export type TagKey = 'Image'|'Exif'|'GPS'|'Interop'|'0th'|'1st'

export type IfdName = '0th'|'1st'|'Exif'|'GPS'|'Interop'

export type ImageTagNumber = 11|254|255|256|257|258|259|262|263|264|265|266|
    269|270|271|272|273|274|277|278|279|282|283|284|290|291|292|293|296|301|
    305|306|315|316|317|318|319|320|321|322|323|324|325|330|332|333|334|336|
    337|338|339|340|341|342|343|344|345|346|347|351|512|513|514|515|517|518|
    519|520|521|529|530|531|532|700|18246|18249|32781|33421|33422|33423|
    33432|33434|34377|34665|34675|34853|34857|34858|34859|37387|37388|37389|
    37390|37391|37392|37393|37394|37395|37397|37398|37399|40091|40092|40093|
    40094|40095|50341|50706|50707|50708|50709|50710|50711|50712|50713|50714|
    50715|50716|50717|50718|50719|50720|50721|50722|50723|50724|50725|50726|
    50727|50728|50729|50730|50731|50732|50733|50734|50735|50736|50737|50738|
    50739|50740|50741|50778|50779|50780|50781|50827|50828|50829|50830|50831|
    50832|50833|50834|50879|50931|50932|50934|50935|50936|50937|50938|50939|
    50940|50941|50942|50964|50965|50966|50967|50968|50969|50970|50971|50972|
    50973|50974|50975|50981|50982|51008|51009|51022

export type ImageTagName = 'ProcessingSoftware'|'NewSubfileType'|'SubfileType'|
    'ImageWidth'|'ImageLength'|'BitsPerSample'|'Compression'|
    'PhotometricInterpretation'|'Threshholding'|'CellWidth'|'CellLength'|
    'FillOrder'|'DocumentName'|'ImageDescription'|'Make'|'Model'|'StripOffsets'|
    'Orientation'|'SamplesPerPixel'|'RowsPerStrip'|'StripByteCounts'|
    'XResolution'|'YResolution'|'PlanarConfiguration'|'GrayResponseUnit'|
    'GrayResponseCurve'|'T4Options'|'T6Options'|'ResolutionUnit'|
    'TransferFunction'|'Software'|'DateTime'|'Artist'|'HostComputer'|
    'Predictor'|'WhitePoint'|'PrimaryChromaticities'|'ColorMap'|'HalftoneHints'|
    'TileWidth'|'TileLength'|'TileOffsets'|'TileByteCounts'|'SubIFDs'|'InkSet'|
    'InkNames'|'NumberOfInks'|'DotRange'|'TargetPrinter'|'ExtraSamples'|
    'SampleFormat'|'SMinSampleValue'|'SMaxSampleValue'|'TransferRange'|
    'ClipPath'|'XClipPathUnits'|'YClipPathUnits'|'Indexed'|'JPEGTables'|
    'OPIProxy'|'JPEGProc'|'JPEGInterchangeFormat'|'JPEGInterchangeFormatLength'|
    'JPEGRestartInterval'|'JPEGLosslessPredictors'|'JPEGPointTransforms'|
    'JPEGQTables'|'JPEGDCTables'|'JPEGACTables'|'YCbCrCoefficients'|
    'YCbCrSubSampling'|'YCbCrPositioning'|'ReferenceBlackWhite'|'XMLPacket'|
    'Rating'|'RatingPercent'|'ImageID'|'CFARepeatPatternDim'|'CFAPattern'|
    'BatteryLevel'|'Copyright'|'ExposureTime'|'ImageResources'|'ExifTag'|
    'InterColorProfile'|'GPSTag'|'Interlace'|'TimeZoneOffset'|'SelfTimerMode'|
    'FlashEnergy'|'SpatialFrequencyResponse'|'Noise'|'FocalPlaneXResolution'|
    'FocalPlaneYResolution'|'FocalPlaneResolutionUnit'|'ImageNumber'|
    'SecurityClassification'|'ImageHistory'|'ExposureIndex'|'TIFFEPStandardID'|
    'SensingMethod'|'XPTitle'|'XPComment'|'XPAuthor'|'XPKeywords'|'XPSubject'|
    'PrintImageMatching'|'DNGVersion'|'DNGBackwardVersion'|'UniqueCameraModel'|
    'LocalizedCameraModel'|'CFAPlaneColor'|'CFALayout'|'LinearizationTable'|
    'BlackLevelRepeatDim'|'BlackLevel'|'BlackLevelDeltaH'|'BlackLevelDeltaV'|
    'WhiteLevel'|'DefaultScale'|'DefaultCropOrigin'|'DefaultCropSize'|
    'ColorMatrix1'|'ColorMatrix2'|'CameraCalibration1'|'CameraCalibration2'|
    'ReductionMatrix1'|'ReductionMatrix2'|'AnalogBalance'|'AsShotNeutral'|
    'AsShotWhiteXY'|'BaselineExposure'|'BaselineNoise'|'BaselineSharpness'|
    'BayerGreenSplit'|'LinearResponseLimit'|'CameraSerialNumber'|'LensInfo'|
    'ChromaBlurRadius'|'AntiAliasStrength'|'ShadowScale'|'DNGPrivateData'|
    'MakerNoteSafety'|'CalibrationIlluminant1'|'CalibrationIlluminant2'|
    'BestQualityScale'|'RawDataUniqueID'|'OriginalRawFileName'|
    'OriginalRawFileData'|'ActiveArea'|'MaskedAreas'|'AsShotICCProfile'|
    'AsShotPreProfileMatrix'|'CurrentICCProfile'|'CurrentPreProfileMatrix'|
    'ColorimetricReference'|'CameraCalibrationSignature'|
    'ProfileCalibrationSignature'|'AsShotProfileName'|'NoiseReductionApplied'|
    'ProfileName'|'ProfileHueSatMapDims'|'ProfileHueSatMapData1'|
    'ProfileHueSatMapData2'|'ProfileToneCurve'|'ProfileEmbedPolicy'|
    'ProfileCopyright'|'ForwardMatrix1'|'ForwardMatrix2'|
    'PreviewApplicationName'|'PreviewApplicationVersion'|'PreviewSettingsName'|
    'PreviewSettingsDigest'|'PreviewColorSpace'|'PreviewDateTime'|
    'RawImageDigest'|'OriginalRawFileDigest'|'SubTileBlockSize'|
    'RowInterleaveFactor'|'ProfileLookTableDims'|'ProfileLookTableData'|
    'OpcodeList1'|'OpcodeList2'|'OpcodeList3'

export type ExifTagNumber = 33434|33437|34850|34852|34855|34856|34864|34865|
    34866|34867|34868|34869|36864|36867|36868|37121|37122|37377|37378|37379|
    37380|37381|37382|37383|37384|37385|37386|37396|37500|37510|37520|37521|
    37522|40960|40961|40962|40963|40964|40965|41483|41484|41486|41487|41488|
    41492|41493|41495|41728|41729|41730|41985|41986|41987|41988|41989|41990|
    41991|41992|41993|41994|41995|41996|42016|42032|42033|42034|42035|42036|
    42037|42240

export type ExifTagName = 'ExposureTime'|'FNumber'|'ExposureProgram'|
    'SpectralSensitivity'|'ISOSpeedRatings'|'OECF'|'SensitivityType'|
    'StandardOutputSensitivity'|'RecommendedExposureIndex'|'ISOSpeed'|
    'ISOSpeedLatitudeyyy'|'ISOSpeedLatitudezzz'|'ExifVersion'|
    'DateTimeOriginal'|'DateTimeDigitized'|'ComponentsConfiguration'|
    'CompressedBitsPerPixel'|'ShutterSpeedValue'|'ApertureValue'|
    'BrightnessValue'|'ExposureBiasValue'|'MaxApertureValue'|'SubjectDistance'|
    'MeteringMode'|'LightSource'|'Flash'|'FocalLength'|'SubjectArea'|
    'MakerNote'|'UserComment'|'SubSecTime'|'SubSecTimeOriginal'|
    'SubSecTimeDigitized'|'FlashpixVersion'|'ColorSpace'|'PixelXDimension'|
    'PixelYDimension'|'RelatedSoundFile'|'InteroperabilityTag'|'FlashEnergy'|
    'SpatialFrequencyResponse'|'FocalPlaneXResolution'|'FocalPlaneYResolution'|
    'FocalPlaneResolutionUnit'|'SubjectLocation'|'ExposureIndex'|
    'SensingMethod'|'FileSource'|'SceneType'|'CFAPattern'|'CustomRendered'|
    'ExposureMode'|'WhiteBalance'|'DigitalZoomRatio'|'FocalLengthIn35mmFilm'|
    'SceneCaptureType'|'GainControl'|'Contrast'|'Saturation'|'Sharpness'|
    'DeviceSettingDescription'|'SubjectDistanceRange'|'ImageUniqueID'|
    'CameraOwnerName'|'BodySerialNumber'|'LensSpecification'|'LensMake'|
    'LensModel'|'LensSerialNumber'|'Gamma'

export type GPSTagNumber = 0|1|2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|
    20|21|22|23|24|25|26|27|28|29|30|31

export type GPSTagName = 'GPSVersionID'|'GPSLatitudeRef'|'GPSLatitude'|
    'GPSLongitudeRef'|'GPSLongitude'|'GPSAltitudeRef'|'GPSAltitude'|
    'GPSTimeStamp'|'GPSSatellites'|'GPSStatus'|'GPSMeasureMode'|'GPSDOP'|
    'GPSSpeedRef'|'GPSSpeed'|'GPSTrackRef'|'GPSTrack'|'GPSImgDirectionRef'|
    'GPSImgDirection'|'GPSMapDatum'|'GPSDestLatitudeRef'|'GPSDestLatitude'|
    'GPSDestLongitudeRef'|'GPSDestLongitude'|'GPSDestBearingRef'|
    'GPSDestBearing'|'GPSDestDistanceRef'|'GPSDestDistance'|
    'GPSProcessingMethod'|'GPSAreaInformation'|'GPSDateStamp'|'GPSDifferential'|
    'GPSHPositioningError'

export interface Tag {
    name:string;
    type:TagType;
}

export const IMAGE_TAGS:Record<ImageTagNumber, {
    name:ImageTagName,
    type:TagType
}> = {
    11: {
        name: 'ProcessingSoftware',
        type: 'Ascii'
    },
    254: {
        name: 'NewSubfileType',
        type: 'Long'
    },
    255: {
        name: 'SubfileType',
        type: 'Short'
    },
    256: {
        name: 'ImageWidth',
        type: 'Long'
    },
    257: {
        name: 'ImageLength',
        type: 'Long'
    },
    258: {
        name: 'BitsPerSample',
        type: 'Short'
    },
    259: {
        name: 'Compression',
        type: 'Short'
    },
    262: {
        name: 'PhotometricInterpretation',
        type: 'Short'
    },
    263: {
        name: 'Threshholding',
        type: 'Short'
    },
    264: {
        name: 'CellWidth',
        type: 'Short'
    },
    265: {
        name: 'CellLength',
        type: 'Short'
    },
    266: {
        name: 'FillOrder',
        type: 'Short'
    },
    269: {
        name: 'DocumentName',
        type: 'Ascii'
    },
    270: {
        name: 'ImageDescription',
        type: 'Ascii'
    },
    271: {
        name: 'Make',
        type: 'Ascii'
    },
    272: {
        name: 'Model',
        type: 'Ascii'
    },
    273: {
        name: 'StripOffsets',
        type: 'Long'
    },
    274: {
        name: 'Orientation',
        type: 'Short'
    },
    277: {
        name: 'SamplesPerPixel',
        type: 'Short'
    },
    278: {
        name: 'RowsPerStrip',
        type: 'Long'
    },
    279: {
        name: 'StripByteCounts',
        type: 'Long'
    },
    282: {
        name: 'XResolution',
        type: 'Rational'
    },
    283: {
        name: 'YResolution',
        type: 'Rational'
    },
    284: {
        name: 'PlanarConfiguration',
        type: 'Short'
    },
    290: {
        name: 'GrayResponseUnit',
        type: 'Short'
    },
    291: {
        name: 'GrayResponseCurve',
        type: 'Short'
    },
    292: {
        name: 'T4Options',
        type: 'Long'
    },
    293: {
        name: 'T6Options',
        type: 'Long'
    },
    296: {
        name: 'ResolutionUnit',
        type: 'Short'
    },
    301: {
        name: 'TransferFunction',
        type: 'Short'
    },
    305: {
        name: 'Software',
        type: 'Ascii'
    },
    306: {
        name: 'DateTime',
        type: 'Ascii'
    },
    315: {
        name: 'Artist',
        type: 'Ascii'
    },
    316: {
        name: 'HostComputer',
        type: 'Ascii'
    },
    317: {
        name: 'Predictor',
        type: 'Short'
    },
    318: {
        name: 'WhitePoint',
        type: 'Rational'
    },
    319: {
        name: 'PrimaryChromaticities',
        type: 'Rational'
    },
    320: {
        name: 'ColorMap',
        type: 'Short'
    },
    321: {
        name: 'HalftoneHints',
        type: 'Short'
    },
    322: {
        name: 'TileWidth',
        type: 'Short'
    },
    323: {
        name: 'TileLength',
        type: 'Short'
    },
    324: {
        name: 'TileOffsets',
        type: 'Short'
    },
    325: {
        name: 'TileByteCounts',
        type: 'Short'
    },
    330: {
        name: 'SubIFDs',
        type: 'Long'
    },
    332: {
        name: 'InkSet',
        type: 'Short'
    },
    333: {
        name: 'InkNames',
        type: 'Ascii'
    },
    334: {
        name: 'NumberOfInks',
        type: 'Short'
    },
    336: {
        name: 'DotRange',
        type: 'Byte'
    },
    337: {
        name: 'TargetPrinter',
        type: 'Ascii'
    },
    338: {
        name: 'ExtraSamples',
        type: 'Short'
    },
    339: {
        name: 'SampleFormat',
        type: 'Short'
    },
    340: {
        name: 'SMinSampleValue',
        type: 'Short'
    },
    341: {
        name: 'SMaxSampleValue',
        type: 'Short'
    },
    342: {
        name: 'TransferRange',
        type: 'Short'
    },
    343: {
        name: 'ClipPath',
        type: 'Byte'
    },
    344: {
        name: 'XClipPathUnits',
        type: 'Long'
    },
    345: {
        name: 'YClipPathUnits',
        type: 'Long'
    },
    346: {
        name: 'Indexed',
        type: 'Short'
    },
    347: {
        name: 'JPEGTables',
        type: 'Undefined'
    },
    351: {
        name: 'OPIProxy',
        type: 'Short'
    },
    512: {
        name: 'JPEGProc',
        type: 'Long'
    },
    513: {
        name: 'JPEGInterchangeFormat',
        type: 'Long'
    },
    514: {
        name: 'JPEGInterchangeFormatLength',
        type: 'Long'
    },
    515: {
        name: 'JPEGRestartInterval',
        type: 'Short'
    },
    517: {
        name: 'JPEGLosslessPredictors',
        type: 'Short'
    },
    518: {
        name: 'JPEGPointTransforms',
        type: 'Short'
    },
    519: {
        name: 'JPEGQTables',
        type: 'Long'
    },
    520: {
        name: 'JPEGDCTables',
        type: 'Long'
    },
    521: {
        name: 'JPEGACTables',
        type: 'Long'
    },
    529: {
        name: 'YCbCrCoefficients',
        type: 'Rational'
    },
    530: {
        name: 'YCbCrSubSampling',
        type: 'Short'
    },
    531: {
        name: 'YCbCrPositioning',
        type: 'Short'
    },
    532: {
        name: 'ReferenceBlackWhite',
        type: 'Rational'
    },
    700: {
        name: 'XMLPacket',
        type: 'Byte'
    },
    18246: {
        name: 'Rating',
        type: 'Short'
    },
    18249: {
        name: 'RatingPercent',
        type: 'Short'
    },
    32781: {
        name: 'ImageID',
        type: 'Ascii'
    },
    33421: {
        name: 'CFARepeatPatternDim',
        type: 'Short'
    },
    33422: {
        name: 'CFAPattern',
        type: 'Byte'
    },
    33423: {
        name: 'BatteryLevel',
        type: 'Rational'
    },
    33432: {
        name: 'Copyright',
        type: 'Ascii'
    },
    33434: {
        name: 'ExposureTime',
        type: 'Rational'
    },
    34377: {
        name: 'ImageResources',
        type: 'Byte'
    },
    34665: {
        name: 'ExifTag',
        type: 'Long'
    },
    34675: {
        name: 'InterColorProfile',
        type: 'Undefined'
    },
    34853: {
        name: 'GPSTag',
        type: 'Long'
    },
    34857: {
        name: 'Interlace',
        type: 'Short'
    },
    34858: {
        name: 'TimeZoneOffset',
        type: 'Long'
    },
    34859: {
        name: 'SelfTimerMode',
        type: 'Short'
    },
    37387: {
        name: 'FlashEnergy',
        type: 'Rational'
    },
    37388: {
        name: 'SpatialFrequencyResponse',
        type: 'Undefined'
    },
    37389: {
        name: 'Noise',
        type: 'Undefined'
    },
    37390: {
        name: 'FocalPlaneXResolution',
        type: 'Rational'
    },
    37391: {
        name: 'FocalPlaneYResolution',
        type: 'Rational'
    },
    37392: {
        name: 'FocalPlaneResolutionUnit',
        type: 'Short'
    },
    37393: {
        name: 'ImageNumber',
        type: 'Long'
    },
    37394: {
        name: 'SecurityClassification',
        type: 'Ascii'
    },
    37395: {
        name: 'ImageHistory',
        type: 'Ascii'
    },
    37397: {
        name: 'ExposureIndex',
        type: 'Rational'
    },
    37398: {
        name: 'TIFFEPStandardID',
        type: 'Byte'
    },
    37399: {
        name: 'SensingMethod',
        type: 'Short'
    },
    40091: {
        name: 'XPTitle',
        type: 'Byte'
    },
    40092: {
        name: 'XPComment',
        type: 'Byte'
    },
    40093: {
        name: 'XPAuthor',
        type: 'Byte'
    },
    40094: {
        name: 'XPKeywords',
        type: 'Byte'
    },
    40095: {
        name: 'XPSubject',
        type: 'Byte'
    },
    50341: {
        name: 'PrintImageMatching',
        type: 'Undefined'
    },
    50706: {
        name: 'DNGVersion',
        type: 'Byte'
    },
    50707: {
        name: 'DNGBackwardVersion',
        type: 'Byte'
    },
    50708: {
        name: 'UniqueCameraModel',
        type: 'Ascii'
    },
    50709: {
        name: 'LocalizedCameraModel',
        type: 'Byte'
    },
    50710: {
        name: 'CFAPlaneColor',
        type: 'Byte'
    },
    50711: {
        name: 'CFALayout',
        type: 'Short'
    },
    50712: {
        name: 'LinearizationTable',
        type: 'Short'
    },
    50713: {
        name: 'BlackLevelRepeatDim',
        type: 'Short'
    },
    50714: {
        name: 'BlackLevel',
        type: 'Rational'
    },
    50715: {
        name: 'BlackLevelDeltaH',
        type: 'SRational'
    },
    50716: {
        name: 'BlackLevelDeltaV',
        type: 'SRational'
    },
    50717: {
        name: 'WhiteLevel',
        type: 'Short'
    },
    50718: {
        name: 'DefaultScale',
        type: 'Rational'
    },
    50719: {
        name: 'DefaultCropOrigin',
        type: 'Short'
    },
    50720: {
        name: 'DefaultCropSize',
        type: 'Short'
    },
    50721: {
        name: 'ColorMatrix1',
        type: 'SRational'
    },
    50722: {
        name: 'ColorMatrix2',
        type: 'SRational'
    },
    50723: {
        name: 'CameraCalibration1',
        type: 'SRational'
    },
    50724: {
        name: 'CameraCalibration2',
        type: 'SRational'
    },
    50725: {
        name: 'ReductionMatrix1',
        type: 'SRational'
    },
    50726: {
        name: 'ReductionMatrix2',
        type: 'SRational'
    },
    50727: {
        name: 'AnalogBalance',
        type: 'Rational'
    },
    50728: {
        name: 'AsShotNeutral',
        type: 'Short'
    },
    50729: {
        name: 'AsShotWhiteXY',
        type: 'Rational'
    },
    50730: {
        name: 'BaselineExposure',
        type: 'SRational'
    },
    50731: {
        name: 'BaselineNoise',
        type: 'Rational'
    },
    50732: {
        name: 'BaselineSharpness',
        type: 'Rational'
    },
    50733: {
        name: 'BayerGreenSplit',
        type: 'Long'
    },
    50734: {
        name: 'LinearResponseLimit',
        type: 'Rational'
    },
    50735: {
        name: 'CameraSerialNumber',
        type: 'Ascii'
    },
    50736: {
        name: 'LensInfo',
        type: 'Rational'
    },
    50737: {
        name: 'ChromaBlurRadius',
        type: 'Rational'
    },
    50738: {
        name: 'AntiAliasStrength',
        type: 'Rational'
    },
    50739: {
        name: 'ShadowScale',
        type: 'SRational'
    },
    50740: {
        name: 'DNGPrivateData',
        type: 'Byte'
    },
    50741: {
        name: 'MakerNoteSafety',
        type: 'Short'
    },
    50778: {
        name: 'CalibrationIlluminant1',
        type: 'Short'
    },
    50779: {
        name: 'CalibrationIlluminant2',
        type: 'Short'
    },
    50780: {
        name: 'BestQualityScale',
        type: 'Rational'
    },
    50781: {
        name: 'RawDataUniqueID',
        type: 'Byte'
    },
    50827: {
        name: 'OriginalRawFileName',
        type: 'Byte'
    },
    50828: {
        name: 'OriginalRawFileData',
        type: 'Undefined'
    },
    50829: {
        name: 'ActiveArea',
        type: 'Short'
    },
    50830: {
        name: 'MaskedAreas',
        type: 'Short'
    },
    50831: {
        name: 'AsShotICCProfile',
        type: 'Undefined'
    },
    50832: {
        name: 'AsShotPreProfileMatrix',
        type: 'SRational'
    },
    50833: {
        name: 'CurrentICCProfile',
        type: 'Undefined'
    },
    50834: {
        name: 'CurrentPreProfileMatrix',
        type: 'SRational'
    },
    50879: {
        name: 'ColorimetricReference',
        type: 'Short'
    },
    50931: {
        name: 'CameraCalibrationSignature',
        type: 'Byte'
    },
    50932: {
        name: 'ProfileCalibrationSignature',
        type: 'Byte'
    },
    50934: {
        name: 'AsShotProfileName',
        type: 'Byte'
    },
    50935: {
        name: 'NoiseReductionApplied',
        type: 'Rational'
    },
    50936: {
        name: 'ProfileName',
        type: 'Byte'
    },
    50937: {
        name: 'ProfileHueSatMapDims',
        type: 'Long'
    },
    50938: {
        name: 'ProfileHueSatMapData1',
        type: 'Float'
    },
    50939: {
        name: 'ProfileHueSatMapData2',
        type: 'Float'
    },
    50940: {
        name: 'ProfileToneCurve',
        type: 'Float'
    },
    50941: {
        name: 'ProfileEmbedPolicy',
        type: 'Long'
    },
    50942: {
        name: 'ProfileCopyright',
        type: 'Byte'
    },
    50964: {
        name: 'ForwardMatrix1',
        type: 'SRational'
    },
    50965: {
        name: 'ForwardMatrix2',
        type: 'SRational'
    },
    50966: {
        name: 'PreviewApplicationName',
        type: 'Byte'
    },
    50967: {
        name: 'PreviewApplicationVersion',
        type: 'Byte'
    },
    50968: {
        name: 'PreviewSettingsName',
        type: 'Byte'
    },
    50969: {
        name: 'PreviewSettingsDigest',
        type: 'Byte'
    },
    50970: {
        name: 'PreviewColorSpace',
        type: 'Long'
    },
    50971: {
        name: 'PreviewDateTime',
        type: 'Ascii'
    },
    50972: {
        name: 'RawImageDigest',
        type: 'Undefined'
    },
    50973: {
        name: 'OriginalRawFileDigest',
        type: 'Undefined'
    },
    50974: {
        name: 'SubTileBlockSize',
        type: 'Long'
    },
    50975: {
        name: 'RowInterleaveFactor',
        type: 'Long'
    },
    50981: {
        name: 'ProfileLookTableDims',
        type: 'Long'
    },
    50982: {
        name: 'ProfileLookTableData',
        type: 'Float'
    },
    51008: {
        name: 'OpcodeList1',
        type: 'Undefined'
    },
    51009: {
        name: 'OpcodeList2',
        type: 'Undefined'
    },
    51022: {
        name: 'OpcodeList3',
        type: 'Undefined'
    }
}

export const EXIF_TAGS:Record<ExifTagNumber, {
    name:ExifTagName,
    type:TagType
}> = {
    33434: {
        name: 'ExposureTime',
        type: 'Rational'
    },
    33437: {
        name: 'FNumber',
        type: 'Rational'
    },
    34850: {
        name: 'ExposureProgram',
        type: 'Short'
    },
    34852: {
        name: 'SpectralSensitivity',
        type: 'Ascii'
    },
    34855: {
        name: 'ISOSpeedRatings',
        type: 'Short'
    },
    34856: {
        name: 'OECF',
        type: 'Undefined'
    },
    34864: {
        name: 'SensitivityType',
        type: 'Short'
    },
    34865: {
        name: 'StandardOutputSensitivity',
        type: 'Long'
    },
    34866: {
        name: 'RecommendedExposureIndex',
        type: 'Long'
    },
    34867: {
        name: 'ISOSpeed',
        type: 'Long'
    },
    34868: {
        name: 'ISOSpeedLatitudeyyy',
        type: 'Long'
    },
    34869: {
        name: 'ISOSpeedLatitudezzz',
        type: 'Long'
    },
    36864: {
        name: 'ExifVersion',
        type: 'Undefined'
    },
    36867: {
        name: 'DateTimeOriginal',
        type: 'Ascii'
    },
    36868: {
        name: 'DateTimeDigitized',
        type: 'Ascii'
    },
    37121: {
        name: 'ComponentsConfiguration',
        type: 'Undefined'
    },
    37122: {
        name: 'CompressedBitsPerPixel',
        type: 'Rational'
    },
    37377: {
        name: 'ShutterSpeedValue',
        type: 'SRational'
    },
    37378: {
        name: 'ApertureValue',
        type: 'Rational'
    },
    37379: {
        name: 'BrightnessValue',
        type: 'SRational'
    },
    37380: {
        name: 'ExposureBiasValue',
        type: 'SRational'
    },
    37381: {
        name: 'MaxApertureValue',
        type: 'Rational'
    },
    37382: {
        name: 'SubjectDistance',
        type: 'Rational'
    },
    37383: {
        name: 'MeteringMode',
        type: 'Short'
    },
    37384: {
        name: 'LightSource',
        type: 'Short'
    },
    37385: {
        name: 'Flash',
        type: 'Short'
    },
    37386: {
        name: 'FocalLength',
        type: 'Rational'
    },
    37396: {
        name: 'SubjectArea',
        type: 'Short'
    },
    37500: {
        name: 'MakerNote',
        type: 'Undefined'
    },
    37510: {
        name: 'UserComment',
        type: 'Ascii'
    },
    37520: {
        name: 'SubSecTime',
        type: 'Ascii'
    },
    37521: {
        name: 'SubSecTimeOriginal',
        type: 'Ascii'
    },
    37522: {
        name: 'SubSecTimeDigitized',
        type: 'Ascii'
    },
    40960: {
        name: 'FlashpixVersion',
        type: 'Undefined'
    },
    40961: {
        name: 'ColorSpace',
        type: 'Short'
    },
    40962: {
        name: 'PixelXDimension',
        type: 'Long'
    },
    40963: {
        name: 'PixelYDimension',
        type: 'Long'
    },
    40964: {
        name: 'RelatedSoundFile',
        type: 'Ascii'
    },
    40965: {
        name: 'InteroperabilityTag',
        type: 'Long'
    },
    41483: {
        name: 'FlashEnergy',
        type: 'Rational'
    },
    41484: {
        name: 'SpatialFrequencyResponse',
        type: 'Undefined'
    },
    41486: {
        name: 'FocalPlaneXResolution',
        type: 'Rational'
    },
    41487: {
        name: 'FocalPlaneYResolution',
        type: 'Rational'
    },
    41488: {
        name: 'FocalPlaneResolutionUnit',
        type: 'Short'
    },
    41492: {
        name: 'SubjectLocation',
        type: 'Short'
    },
    41493: {
        name: 'ExposureIndex',
        type: 'Rational'
    },
    41495: {
        name: 'SensingMethod',
        type: 'Short'
    },
    41728: {
        name: 'FileSource',
        type: 'Undefined'
    },
    41729: {
        name: 'SceneType',
        type: 'Undefined'
    },
    41730: {
        name: 'CFAPattern',
        type: 'Undefined'
    },
    41985: {
        name: 'CustomRendered',
        type: 'Short'
    },
    41986: {
        name: 'ExposureMode',
        type: 'Short'
    },
    41987: {
        name: 'WhiteBalance',
        type: 'Short'
    },
    41988: {
        name: 'DigitalZoomRatio',
        type: 'Rational'
    },
    41989: {
        name: 'FocalLengthIn35mmFilm',
        type: 'Short'
    },
    41990: {
        name: 'SceneCaptureType',
        type: 'Short'
    },
    41991: {
        name: 'GainControl',
        type: 'Short'
    },
    41992: {
        name: 'Contrast',
        type: 'Short'
    },
    41993: {
        name: 'Saturation',
        type: 'Short'
    },
    41994: {
        name: 'Sharpness',
        type: 'Short'
    },
    41995: {
        name: 'DeviceSettingDescription',
        type: 'Undefined'
    },
    41996: {
        name: 'SubjectDistanceRange',
        type: 'Short'
    },
    42016: {
        name: 'ImageUniqueID',
        type: 'Ascii'
    },
    42032: {
        name: 'CameraOwnerName',
        type: 'Ascii'
    },
    42033: {
        name: 'BodySerialNumber',
        type: 'Ascii'
    },
    42034: {
        name: 'LensSpecification',
        type: 'Rational'
    },
    42035: {
        name: 'LensMake',
        type: 'Ascii'
    },
    42036: {
        name: 'LensModel',
        type: 'Ascii'
    },
    42037: {
        name: 'LensSerialNumber',
        type: 'Ascii'
    },
    42240: {
        name: 'Gamma',
        type: 'Rational'
    }
}

export const GPS_TAGS:Record<GPSTagNumber, {
    name:GPSTagName,
    type:TagType
}> = {
    0: {
        name: 'GPSVersionID',
        type: 'Byte'
    },
    1: {
        name: 'GPSLatitudeRef',
        type: 'Ascii'
    },
    2: {
        name: 'GPSLatitude',
        type: 'Rational'
    },
    3: {
        name: 'GPSLongitudeRef',
        type: 'Ascii'
    },
    4: {
        name: 'GPSLongitude',
        type: 'Rational'
    },
    5: {
        name: 'GPSAltitudeRef',
        type: 'Byte'
    },
    6: {
        name: 'GPSAltitude',
        type: 'Rational'
    },
    7: {
        name: 'GPSTimeStamp',
        type: 'Rational'
    },
    8: {
        name: 'GPSSatellites',
        type: 'Ascii'
    },
    9: {
        name: 'GPSStatus',
        type: 'Ascii'
    },
    10: {
        name: 'GPSMeasureMode',
        type: 'Ascii'
    },
    11: {
        name: 'GPSDOP',
        type: 'Rational'
    },
    12: {
        name: 'GPSSpeedRef',
        type: 'Ascii'
    },
    13: {
        name: 'GPSSpeed',
        type: 'Rational'
    },
    14: {
        name: 'GPSTrackRef',
        type: 'Ascii'
    },
    15: {
        name: 'GPSTrack',
        type: 'Rational'
    },
    16: {
        name: 'GPSImgDirectionRef',
        type: 'Ascii'
    },
    17: {
        name: 'GPSImgDirection',
        type: 'Rational'
    },
    18: {
        name: 'GPSMapDatum',
        type: 'Ascii'
    },
    19: {
        name: 'GPSDestLatitudeRef',
        type: 'Ascii'
    },
    20: {
        name: 'GPSDestLatitude',
        type: 'Rational'
    },
    21: {
        name: 'GPSDestLongitudeRef',
        type: 'Ascii'
    },
    22: {
        name: 'GPSDestLongitude',
        type: 'Rational'
    },
    23: {
        name: 'GPSDestBearingRef',
        type: 'Ascii'
    },
    24: {
        name: 'GPSDestBearing',
        type: 'Rational'
    },
    25: {
        name: 'GPSDestDistanceRef',
        type: 'Ascii'
    },
    26: {
        name: 'GPSDestDistance',
        type: 'Rational'
    },
    27: {
        name: 'GPSProcessingMethod',
        type: 'Undefined'
    },
    28: {
        name: 'GPSAreaInformation',
        type: 'Undefined'
    },
    29: {
        name: 'GPSDateStamp',
        type: 'Ascii'
    },
    30: {
        name: 'GPSDifferential',
        type: 'Short'
    },
    31: {
        name: 'GPSHPositioningError',
        type: 'Rational'
    }
}

export const INTEROP_TAGS:Record<number, {
    name:'InteroperabilityIndex',
    type:TagType
}> = {
    1: {
        name: 'InteroperabilityIndex',
        type: 'Ascii'
    }
}

export const TAGS:Record<TagKey, Record<number, {
    name:string,
    type:TagType
}>> = {
    '0th': IMAGE_TAGS,
    '1st': IMAGE_TAGS,
    Image: IMAGE_TAGS,
    Exif: EXIF_TAGS,
    GPS: GPS_TAGS,
    Interop: INTEROP_TAGS,
}
