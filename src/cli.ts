#!/usr/bin/env node
import yargs, { type Argv, type ArgumentsCamelCase } from 'yargs'
import { hideBin } from 'yargs/helpers'
import * as fs from 'node:fs'
import { stripExif } from './remove.js'
import { load } from './index.js'
import { getSummary } from './summary.js'

interface FileArgs {
    file:string;
}

interface StripArgs extends FileArgs {
    output?:string;
}

yargs(hideBin(process.argv))
    .command<StripArgs>(
        'strip <file>',
        'Strip EXIF metadata from an image file',
        (yargs:Argv) => {
            return yargs
                .positional('file', {
                    describe: 'Path to the image file',
                    type: 'string',
                    demandOption: true
                })
                .option('output', {
                    alias: 'o',
                    describe: 'Output file path (defaults to overwriting input file)',
                    type: 'string'
                })
        },
        (argv:ArgumentsCamelCase<StripArgs>) => {
            const inputPath = argv.file
            const outputPath = argv.output ?? inputPath

            if (!fs.existsSync(inputPath)) {
                console.error(`Error: File not found: ${inputPath}`)
                process.exit(1)
            }

            const inputBuffer = fs.readFileSync(inputPath)
            const inputArray = new Uint8Array(
                inputBuffer.buffer,
                inputBuffer.byteOffset,
                inputBuffer.byteLength
            )
            const stripped = stripExif(inputArray)
            const outputBuffer = Buffer.from(
                stripped.buffer,
                stripped.byteOffset,
                stripped.byteLength
            )

            fs.writeFileSync(outputPath, outputBuffer)
            console.log(`Stripped EXIF data and wrote to: ${outputPath}`)
        }
    )
    .command<FileArgs>(
        'print <file>',
        'Print EXIF metadata as JSON',
        (yargs:Argv) => {
            return yargs
                .positional('file', {
                    describe: 'Path to the image file',
                    type: 'string',
                    demandOption: true
                })
        },
        (argv:ArgumentsCamelCase<FileArgs>) => {
            const inputPath = argv.file

            if (!fs.existsSync(inputPath)) {
                console.error(`Error: File not found: ${inputPath}`)
                process.exit(1)
            }

            const inputBuffer = fs.readFileSync(inputPath)
            const inputArray = new Uint8Array(
                inputBuffer.buffer,
                inputBuffer.byteOffset,
                inputBuffer.byteLength
            )

            const exif = load(inputArray)
            const summary = getSummary(exif)
            console.log(JSON.stringify(summary, null, 2))
        }
    )
    .demandCommand(1, 'You must specify a command')
    .help()
    .parse()
