/* Text on its way into a column, with one line ending (COS-334).
 *
 * ⚠️ **`multipart/form-data` rewrites every newline in a text field to `CRLF`.** It is in the format,
 * not in the browser: a text field's value is normalised on the way into the body, so a note typed
 * with `\n` reaches `req.body` as `\r\n`. That never showed before this ticket, because the front sent
 * notes through `encodeURIComponent` — a `\n` travelled as the four characters `%0A` and no
 * normalisation could see it. Taking the encoding out uncovered it.
 *
 * Which would have been a small thing to leave, since `whitespace-pre-wrap` draws both the same way,
 * except for what it is: **the 8 multi-line notes in the index all hold `\n`**, so a note saved after
 * this ticket would have been the only row in the column with the other convention. One column, two
 * spellings of a line break, is the shape of the defect this ticket exists to end — reintroduced by
 * the fix for it, one save at a time.
 *
 * So the transport's normalisation is undone here, on both text columns, and `\n` is what a row
 * holds. It is applied to `title` as well as to `notes`: a single-line input cannot produce a
 * newline, and the rule is easier to keep as "text columns hold `\n`" than as a list of which ones.
 */
const storedText = (value) => (typeof value === "string" ? value.replaceAll("\r\n", "\n") : value);

module.exports = { storedText };
