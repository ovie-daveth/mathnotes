import type { Snippet } from "@/lib/snippets"

/** True when `pos` sits inside an open $...$ or $$...$$ region. */
export function isInsideMath(text: string, pos: number): boolean {
  let i = 0
  let inline = false
  let block = false
  while (i < pos) {
    const c = text[i]
    if (c === "\\") {
      i += 2
      continue
    }
    if (c === "$") {
      if (text[i + 1] === "$") {
        block = !block
        i += 2
        continue
      }
      if (!block) inline = !inline
    }
    i++
  }
  return inline || block
}

export interface InsertResult {
  value: string
  selectionStart: number
  selectionEnd: number
}

/** Insert a snippet at the current selection and compute the new caret. */
export function applySnippet(
  value: string,
  start: number,
  end: number,
  snippet: Snippet,
): InsertResult {
  const before = value.slice(0, start)
  const after = value.slice(end)
  const selected = value.slice(start, end)

  const kind = snippet.kind ?? "inline"
  const inside = isInsideMath(value, start)
  const wrap = kind !== "raw" && (snippet.force || !inside)

  let open = ""
  let close = ""
  let prefix = ""
  if (wrap && kind === "inline") {
    open = "$"
    close = "$"
  } else if (wrap && kind === "block") {
    open = "$$\n"
    close = "\n$$\n"
    if (before && !before.endsWith("\n")) prefix = "\n"
  }

  let inner = snippet.latex
  const marker = inner.indexOf("§")
  let caret: number

  if (marker === -1) {
    caret = (prefix + open + inner + close).length
  } else if (selected) {
    inner = inner.replace("§", selected)
    caret = (prefix + open + inner + close).length
  } else {
    caret = (prefix + open).length + marker
    inner = inner.replace("§", "")
  }

  const insert = prefix + open + inner + close
  return {
    value: before + insert + after,
    selectionStart: start + caret,
    selectionEnd: start + caret,
  }
}

/** Wrap the selection with a markdown marker (e.g. ** for bold). */
export function wrapSelection(
  value: string,
  start: number,
  end: number,
  left: string,
  right = left,
): InsertResult {
  const selected = value.slice(start, end)
  const next = value.slice(0, start) + left + selected + right + value.slice(end)
  const caretStart = start + left.length
  return {
    value: next,
    selectionStart: caretStart,
    selectionEnd: caretStart + selected.length,
  }
}

/** Prefix every selected line (headings, lists, quotes). */
export function prefixLines(
  value: string,
  start: number,
  end: number,
  prefix: string,
): InsertResult {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1
  const nextBreak = value.indexOf("\n", end)
  const lineEnd = nextBreak === -1 ? value.length : nextBreak
  const block = value.slice(lineStart, lineEnd)
  const prefixed = block
    .split("\n")
    .map((line) => prefix + line)
    .join("\n")
  return {
    value: value.slice(0, lineStart) + prefixed + value.slice(lineEnd),
    selectionStart: start + prefix.length,
    selectionEnd: end + prefix.length * block.split("\n").length,
  }
}
