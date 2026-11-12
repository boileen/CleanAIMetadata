/**
 * Curated lookalike map.
 *
 * A small, hand-checked subset of the Unicode TR39 confusables table covering
 * Cyrillic and Greek letters that render identically (or near-identically) to
 * Latin ones. The full table is ~600 KB and includes scripts a text cleaner
 * should never rewrite, so this stays limited to the pairs that matter for
 * pasted text.
 *
 * Folding is applied only to words that already contain a Latin letter, which
 * keeps genuine Russian, Ukrainian, and Greek prose untouched.
 */

export const CONFUSABLES = new Map([
  // Cyrillic → Latin (lowercase)
  ['\u0430', 'a'], // а
  ['\u0435', 'e'], // е
  ['\u043e', 'o'], // о
  ['\u0440', 'p'], // р
  ['\u0441', 'c'], // с
  ['\u0443', 'y'], // у
  ['\u0445', 'x'], // х
  ['\u0456', 'i'], // і
  ['\u0458', 'j'], // ј
  ['\u0455', 's'], // ѕ
  ['\u04bb', 'h'], // һ
  ['\u0501', 'd'], // ԁ
  ['\u051b', 'q'], // ԛ
  ['\u051d', 'w'], // ԝ
  ['\u04cf', 'l'], // ӏ
  ['\u043a', 'k'], // к (visually close in some faces)
  ['\u043c', 'm'], // м
  ['\u043d', 'h'], // н (visually close)
  ['\u0442', 't'], // т
  ['\u0432', 'b'], // в (visually close)
  ['\u0433', 'r'], // г (visually close)

  // Cyrillic → Latin (uppercase)
  ['\u0410', 'A'], // А
  ['\u0412', 'B'], // В
  ['\u0415', 'E'], // Е
  ['\u041a', 'K'], // К
  ['\u041c', 'M'], // М
  ['\u041d', 'H'], // Н
  ['\u041e', 'O'], // О
  ['\u0420', 'P'], // Р
  ['\u0421', 'C'], // С
  ['\u0422', 'T'], // Т
  ['\u0423', 'Y'], // У
  ['\u0425', 'X'], // Х
  ['\u0406', 'I'], // І
  ['\u0408', 'J'], // Ј
  ['\u0405', 'S'], // Ѕ
  ['\u04ba', 'H'], // Һ
  ['\u051a', 'Q'], // Ԛ
  ['\u051c', 'W'], // Ԝ

  // Greek → Latin (lowercase)
  ['\u03b1', 'a'], // α
  ['\u03b2', 'b'], // β
  ['\u03b5', 'e'], // ε
  ['\u03b7', 'n'], // η
  ['\u03b9', 'i'], // ι
  ['\u03ba', 'k'], // κ
  ['\u03bd', 'v'], // ν
  ['\u03bf', 'o'], // ο
  ['\u03c1', 'p'], // ρ
  ['\u03c4', 't'], // τ
  ['\u03c5', 'u'], // υ
  ['\u03c7', 'x'], // χ
  ['\u03c9', 'w'], // ω
  ['\u03f2', 'c'], // ϲ

  // Greek → Latin (uppercase)
  ['\u0391', 'A'], // Α
  ['\u0392', 'B'], // Β
  ['\u0395', 'E'], // Ε
  ['\u0396', 'Z'], // Ζ
  ['\u0397', 'H'], // Η
  ['\u0399', 'I'], // Ι
  ['\u039a', 'K'], // Κ
  ['\u039c', 'M'], // Μ
  ['\u039d', 'N'], // Ν
  ['\u039f', 'O'], // Ο
  ['\u03a1', 'P'], // Ρ
  ['\u03a4', 'T'], // Τ
  ['\u03a5', 'Y'], // Υ
  ['\u03a7', 'X'], // Χ
  ['\u03f9', 'C'], // Ϲ
]);
