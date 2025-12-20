import { type FunctionComponent, render } from 'preact'
import { html } from 'htm/preact'
import { useSignal } from '@preact/signals'
import { loadFromBlob, loadFromUrl } from '../src/browser.js'
import { getSummary as getExifSummary } from '../src/summary.js'
import { type Exif } from '../src/browser.js'
import '@substrate-system/css-normalize'

function App () {
    const exif = useSignal<Exif | null>(null)
    const preview = useSignal<string | null>(null)
    const error = useSignal<string | null>(null)
    const urlInput = useSignal('http://localhost:8888/20190814_102301.jpg')

    const handleFile = async (ev: Event) => {
        const target = ev.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return

        try {
            error.value = null
            preview.value = URL.createObjectURL(file)
            exif.value = await loadFromBlob(file)
        } catch (err: any) {
            console.error(err)
            error.value = err.message
            exif.value = null
        }
    }

    const handleUrl = async (ev: SubmitEvent) => {
        ev.preventDefault()
        if (!urlInput.value) return

        try {
            error.value = null
            preview.value = urlInput.value
            exif.value = await loadFromUrl(urlInput.value)
        } catch (err: any) {
            console.error(err)
            error.value = err.message
            exif.value = null
        }
    }

    return html`
        <div class="app">
            <h1>Exif Reader Example</h1>

            <p>
                This uses the browser APIs to read exif data.
                No data is sent to a server.
            </p>

            <div class="section">
                <h3>From File</h3>
                <input
                    type="file"
                    onChange=${handleFile}
                    accept="image/jpeg,image/tiff"
                />
            </div>

            <div class="section">
                <h3>From URL</h3>
                <form onSubmit=${handleUrl} class="url-form">
                    <input
                        type="url"
                        value=${urlInput.value}
                        onInput=${(e:any) => {
                            urlInput.value = (e.target as HTMLInputElement).value
                        }}
                        placeholder="https://example.com/image.jpg"
                        class="url-input"
                    />
                    <button type="submit">Load</button>
                </form>
            </div>

            ${error.value && html`
                <div class="error">
                    <strong>Error:</strong> ${error.value}
                </div>
            `}

            <div class="content">
                ${preview.value && html`
                    <div class="preview-container">
                        <h3>Image Preview</h3>
                        <img
                            src=${preview.value}
                            class="preview-image"
                            alt="Preview"
                        />
                    </div>
                `}

                ${exif.value && html`
                    <div class="exif-container">
                        <h3>Image Info</h3>
                        <${ExifSummary} exif=${exif.value} />

                        <details class="raw-data">
                            <summary>Raw EXIF Data</summary>
                            <pre class="exif-data">${JSON.stringify(exif.value, (_, v) => {
                                return typeof v === 'bigint' ?
                                    v.toString() :
                                    v instanceof Uint8Array ?
                                        `Uint8Array(${v.length})` :
                                        v
                            }, 2)}</pre>
                        </details>
                    </div>
                `}
            </div>
        </div>
    `
}

render(html`<${App} />`, document.getElementById('root')!)

const ExifSummary:FunctionComponent<{
    exif:Exif
}> = function ({ exif }:{ exif:Exif }) {
    const summary = getExifSummary(exif)
    const fields = [
        { label: 'Device Make', value: summary.make },
        { label: 'Device Model', value: summary.model },
        { label: 'Lens', value: summary.lens },
        { label: 'Software', value: summary.software },
        { label: 'Artist', value: summary.artist },
        { label: 'Copyright', value: summary.copyright },
        { label: 'Date Taken', value: summary.dateTime },
        { label: 'Dimensions', value: summary.dimensions },
        { label: 'Resolution', value: summary.resolution },
        { label: 'Color Space', value: summary.colorSpace },
        { label: 'ISO Speed', value: summary.iso },
        { label: 'F Number', value: summary.fNumber },
        { label: 'Aperture Value', value: summary.apertureValue },
        { label: 'Exposure Time', value: summary.exposure },
        { label: 'Exposure Program', value: summary.exposureProgram },
        { label: 'Focal Length', value: summary.focalLength },
        { label: 'Focal Length (35mm)', value: summary.focalLength35mm },
        { label: 'Flash', value: summary.flash },
        { label: 'Metering Mode', value: summary.meteringMode },
        { label: 'White Balance', value: summary.whiteBalance },
        { label: 'Location', value: summary.location },
        { label: 'Altitude', value: summary.altitude },
    ].filter(f => f.value)

    if (fields.length === 0) {
        return html`<p class="no-data">No EXIF data found</p>`
    }

    return html`
        <dl class="exif-summary">
            ${fields.map(f => html`
                <div class="exif-field">
                    <dt>${f.label}</dt>
                    <dd>${f.value}</dd>
                </div>
            `)}
        </dl>
    `
}
