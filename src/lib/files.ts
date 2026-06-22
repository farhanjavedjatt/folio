"use client";

export const ACCEPTED_EXT = /\.(md|markdown|mdown|mkd|mkdn|txt|text)$/i;
export const ACCEPT_ATTR = ".md,.markdown,.mdown,.mkd,.txt,text/markdown,text/plain";

/** Read text from a FileList, keeping only markdown/text files. */
export async function readFiles(list: FileList | null): Promise<{ name: string; content: string }[]> {
  if (!list) return [];
  const out: { name: string; content: string }[] = [];
  for (const file of Array.from(list)) {
    if (!ACCEPTED_EXT.test(file.name) && !file.type.startsWith("text")) continue;
    out.push({ name: file.name, content: await file.text() });
  }
  return out;
}

/** Open the OS file picker and resolve with the chosen markdown/text files. */
export function openFileDialog(): Promise<{ name: string; content: string }[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ACCEPT_ATTR;
    input.multiple = true;
    input.onchange = async () => resolve(await readFiles(input.files));
    input.click();
  });
}
