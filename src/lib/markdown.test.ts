import { describe, expect, it } from "vitest";
import { parseFrontMatter, formatMarkdown, deriveTitle } from "./markdown";

describe("parseFrontMatter", () => {
  it("extracts YAML front matter and body", () => {
    const { data, body, raw } = parseFrontMatter("---\ntitle: Hello\ntags: [a, b]\n---\n# Body\n");
    expect(data.title).toBe("Hello");
    expect(data.tags).toEqual(["a", "b"]);
    expect(body).toBe("# Body\n");
    expect(raw.startsWith("---")).toBe(true);
  });

  it("returns empty data when there is no front matter", () => {
    const { data, body } = parseFrontMatter("# Just a heading");
    expect(data).toEqual({});
    expect(body).toBe("# Just a heading");
  });

  it("tolerates malformed YAML without throwing", () => {
    const { data, body } = parseFrontMatter("---\n: : :bad\n---\nrest");
    expect(typeof data).toBe("object");
    expect(body).toBe("rest");
  });

  it("ignores a '---' that is not at the very start", () => {
    const input = "intro\n\n---\n\nmore";
    expect(parseFrontMatter(input).raw).toBe("");
  });
});

describe("deriveTitle", () => {
  it("prefers the front-matter title", () => {
    expect(deriveTitle("---\ntitle: From FM\n---\n# From Heading")).toBe("From FM");
  });
  it("falls back to the first H1", () => {
    expect(deriveTitle("some text\n# The Heading\nmore")).toBe("The Heading");
  });
  it("returns null when there is no title", () => {
    expect(deriveTitle("just paragraphs, no heading")).toBeNull();
  });
});

describe("formatMarkdown", () => {
  it("normalizes bullets and preserves front matter", async () => {
    const input = "---\ntitle: Keep Me\n---\n* one\n* two\n";
    const out = await formatMarkdown(input);
    expect(out).toContain("title: Keep Me");
    expect(out).toContain("- one");
    expect(out).toContain("- two");
  });

  it("is idempotent on already-formatted content", async () => {
    const once = await formatMarkdown("# Title\n\n- a\n- b\n");
    const twice = await formatMarkdown(once);
    expect(twice).toBe(once);
  });

  it("preserves math and emoji shortcodes", async () => {
    const out = await formatMarkdown("Inline $x^2$, block $$y^3$$, and :rocket: :sparkles:");
    expect(out).toContain("$x^2$");
    expect(out).toContain("$$y^3$$");
    expect(out).toContain(":rocket:");
    expect(out).toContain(":sparkles:");
  });
});
