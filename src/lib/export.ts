"use client";

/** Copy text to the clipboard with a legacy fallback. */
export async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } finally {
      document.body.removeChild(ta);
    }
  }
}

/** Trigger a client-side download of a text file. */
export function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const STANDALONE_CSS = `
:root{--bg:#f2ede3;--surface:#faf6ee;--ink:#211d17;--muted:#5c5446;--faint:#8c8472;--primary:#2a4c7d;--border:#dbd1bd;--border-strong:#c3b79e;--code-bg:#ece5d7;}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:Spectral,Georgia,serif;line-height:1.7;}
main{max-width:68ch;margin:3rem auto;padding:0 1.5rem;font-size:18px;}
h1,h2,h3,h4{font-weight:600;line-height:1.2}
h1{font-size:2.1em;border-bottom:1px solid var(--border-strong);padding-bottom:.25em}
a{color:var(--primary)}
blockquote{border-left:2px solid var(--primary);margin:1.2em 0;padding-left:1.1em;color:var(--muted);font-style:italic}
code{font-family:ui-monospace,Menlo,monospace;background:var(--code-bg);padding:.15em .4em;border-radius:5px;font-size:.85em}
pre{background:var(--code-bg);border:1px solid var(--border);border-radius:6px;padding:1em;overflow:auto}
pre code{background:none;padding:0}
table{border-collapse:collapse;width:100%}
th,td{border:1px solid var(--border);padding:8px 12px;text-align:left}
thead th{background:var(--code-bg)}
img{max-width:100%}
hr{border:0;height:1px;background:var(--border-strong);width:38%;margin:2em auto}
`;

/** Wrap rendered markdown HTML into a self-contained, readable HTML document. */
export function buildStandaloneHtml(title: string, innerHtml: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
<link href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" rel="stylesheet" />
<style>${STANDALONE_CSS}</style>
</head>
<body><main class="folio-prose">${innerHtml}</main></body>
</html>`;
}

/** Open a print-ready window for the rendered document. */
export function printHtml(title: string, innerHtml: string) {
  const win = window.open("", "_blank", "width=820,height=1000");
  if (!win) return;
  win.document.write(buildStandaloneHtml(title, innerHtml));
  win.document.close();
  win.focus();
  // Give fonts/styles a moment, then print.
  win.setTimeout(() => win.print(), 350);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
