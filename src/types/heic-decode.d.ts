declare module "libheif-js" {
  interface LibheifModule {
    ready: Promise<void>;
    HeifDecoder: new () => {
      decode: (buffer: Uint8Array) => unknown[];
      decoder: { delete: () => void };
    };
  }

  const libheif: LibheifModule;
  export default libheif;
}

declare module "heic-decode/lib.js" {
  interface HeicDecodeModule {
    one: (options: { buffer: Uint8Array }) => Promise<{
      width: number;
      height: number;
      data: Uint8Array | Uint8ClampedArray;
    }>;
    all: (options: { buffer: Uint8Array }) => Promise<unknown[]>;
  }

  function createDecoder(libheif: unknown): HeicDecodeModule;
  export = createDecoder;
}
