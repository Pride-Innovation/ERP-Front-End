/**
 * Reading a label with the handheld scanner.
 *
 * The bank's scanners are Android PDAs with a built-in scan engine. The engine decodes the symbol
 * itself - QR, Code 128, Code 39, DataMatrix, whatever the device is set to read - and hands the
 * browser plain text. So the page never sees a barcode, only characters, and one rule covers every
 * symbology.
 *
 * In the scanner's keyboard (keystroke) output mode those characters arrive as key presses, much
 * faster than anybody types, followed by Enter. That speed is how a scan is told apart from typing,
 * and it is what lets a scan work on any page, whether or not the search box has the cursor.
 */

/** Longest pause between two keys of one scan. Wedge output is ~0-20 ms per key; typing is ~100+. */
export const SCAN_MAX_GAP_MS = 50;

/** Shortest code taken as a scan, so a lucky pair of fast keystrokes plus Enter is never one. */
export const SCAN_MIN_LENGTH = 4;

/**
 * The engraved number inside what the scanner sent, or null when nothing usable is left.
 *
 * - **AIM symbology identifier** (`]Q1`, `]C0`, ...): some engines are set to prefix the code with
 *   the barcode type. It is not part of the number. Engraved numbers never start with `]`.
 * - **Control characters**: GS1 group separators and stray CR/LF from a suffix setting.
 * - **Surrounding spaces.**
 *
 * Nothing else is rewritten. The labels encode the engraved number alone, and the search is
 * case-insensitive on the server, so the text is sent as read.
 */
export const parseScannedTag = (raw: string | null | undefined): string | null => {
    if (!raw) return null;
    // eslint-disable-next-line no-control-regex
    const cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '').replace(/^\][A-Za-z][0-9A-Za-z]/, '').trim();
    return cleaned.length > 0 ? cleaned : null;
};

/** Keys a scanner presses on its own while typing - holding Shift for capitals - that must not break a scan. */
const PASS_THROUGH_KEYS = new Set(['Shift', 'CapsLock']);

export type ScanResult = { kind: 'scan'; code: string } | { kind: 'none' };

/**
 * Watches key presses and says when a run of them was a scan.
 *
 * A scan is at least {@link SCAN_MIN_LENGTH} printable keys, each within {@link SCAN_MAX_GAP_MS} of
 * the one before, ending in Enter or Tab (the two suffixes scanners send) just as quickly. A slow key
 * starts a new run, so somebody typing never accumulates one, and any other key - Backspace, an
 * arrow - abandons it.
 *
 * Kept free of the DOM so it can be tested with plain timestamps.
 */
export class ScanBurstDetector {
    private buffer = '';
    private last = -Infinity;

    constructor(
        private readonly maxGapMs: number = SCAN_MAX_GAP_MS,
        private readonly minLength: number = SCAN_MIN_LENGTH,
    ) {}

    reset(): void {
        this.buffer = '';
        this.last = -Infinity;
    }

    feed(key: string, at: number): ScanResult {
        if (PASS_THROUGH_KEYS.has(key)) {
            return { kind: 'none' };
        }

        if (key === 'Enter' || key === 'Tab') {
            const fast = at - this.last <= this.maxGapMs;
            const candidate = fast && this.buffer.length >= this.minLength ? parseScannedTag(this.buffer) : null;
            this.reset();
            return candidate ? { kind: 'scan', code: candidate } : { kind: 'none' };
        }

        if (key.length !== 1) {
            // Backspace, arrows, "Unidentified" from an on-screen keyboard: not part of a scan.
            this.reset();
            return { kind: 'none' };
        }

        this.buffer = at - this.last <= this.maxGapMs ? this.buffer + key : key;
        this.last = at;
        return { kind: 'none' };
    }
}
