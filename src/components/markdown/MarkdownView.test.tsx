import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MarkdownView } from "./MarkdownView";

describe("MarkdownView", () => {
  it("renders headings with slug ids", () => {
    const { container } = render(<MarkdownView content="# Hello World" />);
    const h1 = container.querySelector("h1");
    expect(h1).not.toBeNull();
    expect(h1?.id).toBe("hello-world");
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders GFM tables wrapped in a scroll container", () => {
    const md = "| A | B |\n| - | - |\n| 1 | 2 |";
    const { container } = render(<MarkdownView content={md} />);
    expect(container.querySelector(".table-scroll table")).not.toBeNull();
    expect(container.querySelectorAll("tbody td")).toHaveLength(2);
  });

  it("renders a fenced code block with a language label", () => {
    const md = "```js\nconst a = 1;\n```";
    const { container } = render(<MarkdownView content={md} />);
    expect(container.querySelector("pre code")).not.toBeNull();
    expect(screen.getByText("js")).toBeInTheDocument();
  });

  it("strips dangerous HTML (script tags and inline handlers)", () => {
    const md = `# Safe\n\n<script>window.__pwned = true;</script>\n\n<img src="x" onerror="window.__pwned = true;">`;
    const { container } = render(<MarkdownView content={md} />);
    expect(container.querySelector("script")).toBeNull();
    const img = container.querySelector("img");
    if (img) expect(img.getAttribute("onerror")).toBeNull();
  });

  it("renders task list checkboxes", () => {
    const md = "- [x] done\n- [ ] todo";
    const { container } = render(<MarkdownView content={md} />);
    const boxes = container.querySelectorAll('input[type="checkbox"]');
    expect(boxes).toHaveLength(2);
    expect((boxes[0] as HTMLInputElement).checked).toBe(true);
  });
});
