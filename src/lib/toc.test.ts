import { describe, expect, it } from "vitest";
import { buildTocFromElement } from "./toc";

function makeRoot(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
}

describe("buildTocFromElement", () => {
  it("collects headings with ids and text", () => {
    const root = makeRoot(`<h1 id="a">Alpha</h1><h2 id="b">Beta</h2>`);
    const toc = buildTocFromElement(root);
    expect(toc).toHaveLength(2);
    expect(toc[0]).toMatchObject({ id: "a", text: "Alpha" });
    expect(toc[1].id).toBe("b");
  });

  it("skips headings without an id or text", () => {
    const root = makeRoot(`<h1>no id</h1><h2 id="x"></h2><h3 id="ok">Fine</h3>`);
    const toc = buildTocFromElement(root);
    expect(toc).toHaveLength(1);
    expect(toc[0].id).toBe("ok");
  });

  it("normalizes levels into adjacent tiers", () => {
    const root = makeRoot(`<h1 id="a">A</h1><h4 id="b">B</h4>`);
    const toc = buildTocFromElement(root);
    expect(toc[0].level).toBe(1);
    expect(toc[1].level).toBe(2);
  });

  it("excludes the appended permalink anchor from heading text", () => {
    const root = makeRoot(
      `<h1 id="a">Title<span class="heading-anchor">#</span></h1>`,
    );
    const toc = buildTocFromElement(root);
    expect(toc[0].text).toBe("Title");
  });

  it("returns an empty array for null", () => {
    expect(buildTocFromElement(null)).toEqual([]);
  });
});
