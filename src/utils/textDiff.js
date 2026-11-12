/**
 * Lightweight diff between two strings at the grapheme-cluster level.
 *
 * Returns an array of ops: { type: 'keep'|'remove'|'insert'|'change', text?, from?, to? }
 *
 * Uses a simple patience-style LCS chunked by newline so long documents stay
 * fast without a full O(nm) table.
 */

let _seg = null;
function graphemeSplit(text) {
  if (!_seg && typeof Intl !== 'undefined' && Intl.Segmenter) {
    _seg = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
  }
  if (_seg) return [..._seg.segment(text)].map((s) => s.segment);
  return [...text];
}

/**
 * Shortest-edit LCS diff on two grapheme arrays.
 * Returns flat ops: { type: 'keep'|'remove'|'insert', text: string }
 */
function lcs(a, b) {
  const n = a.length;
  const m = b.length;

  // Build LCS table
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to build ops
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      ops.push({ type: 'keep', text: a[i] });
      i++; j++;
    } else if (j < m && (i >= n || dp[i][j + 1] >= dp[i + 1][j])) {
      ops.push({ type: 'insert', text: b[j] });
      j++;
    } else {
      ops.push({ type: 'remove', text: a[i] });
      i++;
    }
  }
  return ops;
}

function coalesce(ops) {
  const out = [];
  for (const op of ops) {
    const last = out[out.length - 1];
    if (last && last.type === op.type) {
      last.text += op.text;
    } else {
      out.push({ type: op.type, text: op.text });
    }
  }
  return out;
}

/**
 * Pairs consecutive remove+insert ops into a 'change' op for short swaps
 * like `—` → ` - ` so we can render them as one yellow chip.
 */
function pairChanges(ops) {
  const out = [];
  let i = 0;
  while (i < ops.length) {
    const op = ops[i];
    const next = ops[i + 1];
    if (
      op.type === 'remove' &&
      next?.type === 'insert' &&
      op.text.length <= 8 &&
      next.text.length <= 8
    ) {
      out.push({ type: 'change', from: op.text, to: next.text });
      i += 2;
    } else {
      out.push(op);
      i++;
    }
  }
  return out;
}

/**
 * Diff two text strings by newline-chunked grapheme LCS.
 * Lines longer than 400 graphemes fall back to remove+insert to stay fast.
 *
 * Returns coalesced ops: { type: 'keep'|'remove'|'insert'|'change', text?, from?, to? }
 */
export function diffTexts(before, after) {
  if (before === after) return [{ type: 'keep', text: before }];

  const beforeLines = before.split('\n');
  const afterLines = after.split('\n');
  const maxLines = Math.max(beforeLines.length, afterLines.length);
  const allOps = [];

  for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
    const a = graphemeSplit(beforeLines[lineIndex] ?? '');
    const b = graphemeSplit(afterLines[lineIndex] ?? '');

    if (a.length + b.length > 800) {
      // Too long for LCS — simple fallback
      if (a.join('') !== b.join('')) {
        if (a.length) allOps.push({ type: 'remove', text: a.join('') });
        if (b.length) allOps.push({ type: 'insert', text: b.join('') });
      } else {
        allOps.push({ type: 'keep', text: a.join('') });
      }
    } else {
      allOps.push(...lcs(a, b));
    }

    if (lineIndex < maxLines - 1) {
      allOps.push({ type: 'keep', text: '\n' });
    }
  }

  return pairChanges(coalesce(allOps));
}

/** True if a diff result has any removals, inserts or changes. */
export function hasChanges(ops) {
  return ops.some((op) => op.type !== 'keep');
}
