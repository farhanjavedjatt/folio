import { describe, expect, it } from "vitest";
import { computeStats, readingTimeLabel } from "./stats";

describe("computeStats", () => {
  it("counts words, characters, and lines", () => {
    const s = computeStats("Hello world\nSecond line here");
    expect(s.words).toBe(5);
    expect(s.lines).toBe(2);
    expect(s.characters).toBe("Hello world\nSecond line here".length);
    expect(s.charactersNoSpaces).toBe("Helloworld\nSecondlinehere".replace(/\n/g, "").length);
  });

  it("returns zeros for empty input", () => {
    const s = computeStats("");
    expect(s.words).toBe(0);
    expect(s.lines).toBe(0);
    expect(s.readingTimeMinutes).toBe(0);
    expect(readingTimeLabel(s)).toBe("Empty");
  });

  it("excludes fenced and inline code from word count", () => {
    const withCode = "Read this prose.\n\n```js\nconst a = 1; const b = 2;\n```\n\nAnd `inline()` too.";
    const stats = computeStats(withCode);
    // Fenced block and `inline()` are both stripped → "Read this prose And too" = 5 words.
    expect(stats.words).toBe(5);
  });

  it("counts markdown headings", () => {
    const s = computeStats("# A\n\ntext\n\n## B\n\n### C\n\n#notatag");
    expect(s.headings).toBe(3);
  });

  it("rounds reading time up with a 1-minute floor", () => {
    const words = Array.from({ length: 230 }, () => "word").join(" ");
    expect(computeStats(words).readingTimeMinutes).toBe(2);
    expect(computeStats("just a few words").readingTimeMinutes).toBe(1);
    expect(readingTimeLabel(computeStats("hi there"))).toBe("1 min read");
  });
});
