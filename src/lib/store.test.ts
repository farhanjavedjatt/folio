import { beforeEach, describe, expect, it } from "vitest";
import { useWorkspace } from "./store";

const get = () => useWorkspace.getState();

beforeEach(() => {
  useWorkspace.setState({
    docs: {},
    docOrder: [],
    panes: [{ id: "p1", docId: null, mode: "preview" }],
    activePaneId: "p1",
  });
});

describe("document CRUD", () => {
  it("creates a doc, opens it in the active pane, and defaults the name", () => {
    const id = get().createDoc();
    expect(get().docOrder).toContain(id);
    expect(get().docs[id].name).toBe("Untitled.md");
    expect(get().panes[0].docId).toBe(id);
  });

  it("deduplicates names", () => {
    get().createDoc({ name: "Notes.md" });
    const id2 = get().createDoc({ name: "Notes.md" });
    expect(get().docs[id2].name).toBe("Notes 2.md");
  });

  it("appends .md when no extension is given", () => {
    const id = get().createDoc({ name: "Plain" });
    expect(get().docs[id].name).toBe("Plain.md");
  });

  it("renames while keeping names unique", () => {
    get().createDoc({ name: "A.md" });
    const id = get().createDoc({ name: "B.md" });
    get().renameDoc(id, "A.md");
    expect(get().docs[id].name).toBe("A 2.md");
  });

  it("duplicates a doc directly after the original", () => {
    const id = get().createDoc({ name: "Doc.md", content: "hello" });
    const copyId = get().duplicateDoc(id)!;
    expect(get().docs[copyId].content).toBe("hello");
    const order = get().docOrder;
    expect(order.indexOf(copyId)).toBe(order.indexOf(id) + 1);
  });

  it("deletes a doc and clears it from panes", () => {
    const id = get().createDoc({ name: "Gone.md" });
    get().deleteDoc(id);
    expect(get().docs[id]).toBeUndefined();
    expect(get().panes.every((p) => p.docId !== id)).toBe(true);
  });

  it("toggles pin", () => {
    const id = get().createDoc();
    get().togglePin(id);
    expect(get().docs[id].pinned).toBe(true);
  });

  it("imports multiple files", () => {
    get().importFiles([
      { name: "one.md", content: "1" },
      { name: "two.md", content: "2" },
    ]);
    expect(get().docOrder).toHaveLength(2);
  });
});

describe("panes & layout", () => {
  it("grows and shrinks the layout", () => {
    get().createDoc({ name: "A.md" });
    get().createDoc({ name: "B.md" });
    get().setLayout(2);
    expect(get().panes).toHaveLength(2);
    get().setLayout(1);
    expect(get().panes).toHaveLength(1);
  });

  it("caps panes and replaces the active pane on overflow", () => {
    const a = get().createDoc({ name: "A.md" });
    const b = get().createDoc({ name: "B.md" });
    const c = get().createDoc({ name: "C.md" });
    get().openDocInNewPane(a);
    get().openDocInNewPane(b);
    expect(get().panes).toHaveLength(3);
    // Fourth open should not add a 4th pane.
    get().openDocInNewPane(c);
    expect(get().panes).toHaveLength(3);
    expect(get().panes.find((p) => p.id === get().activePaneId)?.docId).toBe(c);
  });

  it("focuses a pane by index", () => {
    get().createDoc({ name: "A.md" });
    get().setLayout(2);
    const second = get().panes[1].id;
    get().focusPaneByIndex(1);
    expect(get().activePaneId).toBe(second);
  });

  it("sets the pane view mode", () => {
    get().createDoc();
    const paneId = get().panes[0].id;
    get().setPaneMode(paneId, "split");
    expect(get().panes[0].mode).toBe("split");
  });
});
