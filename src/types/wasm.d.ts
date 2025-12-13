declare module "@takumi-rs/wasm/takumi_wasm_bg.wasm" {
  const wasmModule: WebAssembly.Module;
  export default wasmModule;
}

declare module "*.woff2" {
  const content: ArrayBuffer;
  export default content;
}
