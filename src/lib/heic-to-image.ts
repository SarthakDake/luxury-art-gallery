import convert from "heic-convert";

export async function convertHeicToPng(input: Buffer): Promise<Buffer> {
  const output = await convert({
    buffer: input,
    format: "PNG",
  });

  return Buffer.from(output);
}
