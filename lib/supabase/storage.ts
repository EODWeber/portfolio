import { Buffer } from "node:buffer";

export async function readStorageText(blob: Blob | null): Promise<{ text: string | null; error: string | null }> {
  if (!blob) {
    return { text: null, error: "Storage object returned no data" };
  }

  try {
    if (typeof blob.text === "function") {
      const text = await blob.text();
      return { text, error: null };
    }

    if ("arrayBuffer" in blob && typeof blob.arrayBuffer === "function") {
      const buffer = Buffer.from(await blob.arrayBuffer());
      return { text: buffer.toString("utf8"), error: null };
    }
  } catch (err) {
    return { text: null, error: err instanceof Error ? err.message : "Failed to read storage object" };
  }

  return { text: null, error: "Unsupported storage response" };
}
