type BufferInput =
  | ArrayBuffer
  | SharedArrayBuffer
  | Uint8Array
  | Uint8ClampedArray
  | Buffer;

/** Copy into a plain Node Buffer (avoids SharedArrayBuffer issues on serverless). */
export function toSafeBuffer(value: BufferInput): Buffer {
  if (Buffer.isBuffer(value)) {
    return Buffer.from(value);
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(value.slice());
  }

  if (value instanceof SharedArrayBuffer) {
    return Buffer.from(new Uint8Array(value));
  }

  return Buffer.from(new Uint8Array(value));
}
