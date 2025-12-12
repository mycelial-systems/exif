// Type declarations for esbuild binary loader
declare module '*.jpg' {
    const content:Uint8Array
    export default content
}
