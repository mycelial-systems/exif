import { render } from 'preact'
import { useState, useCallback } from 'preact/hooks'
import { html } from 'htm/preact'
import { loadFromBlob, loadFromUrl } from '../src/browser.js'
import type { IExif } from '../src/index.js'

function App () {
    const [exif, setExif] = useState<IExif | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [urlInput, setUrlInput] = useState<string>('')

    const handleFile = useCallback(async (ev: Event) => {
        const target = ev.target as HTMLInputElement
        const file = target.files?.[0]
        if (!file) return

        try {
            setError(null)
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)

            const exifData = await loadFromBlob(file)
            setExif(exifData)
        } catch (err: any) {
            console.error(err)
            setError(err.message)
            setExif(null)
        }
    }, [])

    const handleUrl = useCallback(async (ev: Event) => {
        ev.preventDefault()
        if (!urlInput) return

        try {
            setError(null)
            setPreview(urlInput)
            const exifData = await loadFromUrl(urlInput)
            setExif(exifData)
        } catch (err: any) {
            console.error(err)
            setError(err.message)
            setExif(null)
        }
    }, [urlInput])

    return html`
        <div style=${{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>Exif Reader Example</h1>
            
            <div style=${{ marginBottom: '20px' }}>
                <h3>From File</h3>
                <input type="file" onChange=${handleFile} accept="image/jpeg,image/tiff" />
            </div>

            <div style=${{ marginBottom: '20px' }}>
                <h3>From URL</h3>
                <form onSubmit=${handleUrl} style=${{ display: 'flex', gap: '10px' }}>
                    <input 
                        type="url" 
                        value=${urlInput}
                        onInput=${(e: any) => setUrlInput((e.target as HTMLInputElement).value)}
                        placeholder="https://example.com/image.jpg"
                        style=${{ width: '300px' }}
                    />
                    <button type="submit">Load</button>
                </form>
            </div>

            ${error && html`
                <div style=${{ color: 'red', marginBottom: '20px' }}>
                    <strong>Error:</strong> ${error}
                </div>
            `}

            <div style=${{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                ${preview && html`
                    <div style=${{ maxWidth: '400px' }}>
                        <h3>Image Preview</h3>
                        <img src=${preview} style=${{ maxWidth: '100%' }} alt="Preview" />
                    </div>
                `}

                ${exif && html`
                    <div style=${{ flex: 1, minWidth: '300px' }}>
                        <h3>EXIF Data</h3>
                        <pre style=${{
                background: '#f4f4f4',
                padding: '10px',
                overflow: 'auto',
                maxHeight: '600px'
            }}>
                            ${JSON.stringify(exif, (_, v) =>
                typeof v === 'bigint' ? v.toString() :
                    v instanceof Uint8Array ? `Uint8Array(${v.length})` : v
                , 2)}
                        </pre>
                    </div>
                `}
            </div>
        </div>
    `
}

render(html`<${App} />`, document.getElementById('root')!)
