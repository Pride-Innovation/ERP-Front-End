import { parseScannedTag, ScanBurstDetector, SCAN_MAX_GAP_MS } from './scannedTag';

/** Feeds a string one key at a time, `gap` ms apart, then the suffix key; returns the last result. */
const press = (detector: ScanBurstDetector, text: string, gap: number, suffix = 'Enter', start = 1000) => {
    let at = start;
    for (const ch of text) {
        detector.feed(ch, at);
        at += gap;
    }
    return detector.feed(suffix, at);
};

describe('parseScannedTag', () => {
    it('returns the engraved number as read', () => {
        expect(parseScannedTag('PBL-2026-LPT07')).toBe('PBL-2026-LPT07');
    });

    it('strips an AIM symbology prefix, control characters and surrounding spaces', () => {
        expect(parseScannedTag(']Q1PBL-2026-LPT07')).toBe('PBL-2026-LPT07');
        expect(parseScannedTag(']C0PBL-CTHNG-FNT001\r\n')).toBe('PBL-CTHNG-FNT001');
        expect(parseScannedTag('  PBL\u001D-2026-LPT07 ')).toBe('PBL-2026-LPT07');
    });

    it('keeps slashes and plus signs, which engraved numbers carry', () => {
        expect(parseScannedTag('PBL/2026+A1')).toBe('PBL/2026+A1');
    });

    it('returns null when nothing usable is left', () => {
        expect(parseScannedTag('')).toBeNull();
        expect(parseScannedTag('\r\n')).toBeNull();
        expect(parseScannedTag(undefined)).toBeNull();
    });
});

describe('ScanBurstDetector', () => {
    it('recognises a scanner burst ending in Enter', () => {
        expect(press(new ScanBurstDetector(), 'PBL-2026-LPT07', 5)).toEqual({ kind: 'scan', code: 'PBL-2026-LPT07' });
    });

    it('accepts Tab as the suffix too', () => {
        expect(press(new ScanBurstDetector(), 'PBL-2026-LPT07', 5, 'Tab')).toEqual({ kind: 'scan', code: 'PBL-2026-LPT07' });
    });

    it('is not fooled by typing, however long the text', () => {
        expect(press(new ScanBurstDetector(), 'PBL-2026-LPT07', 120)).toEqual({ kind: 'none' });
    });

    it('ignores the Shift a scanner presses for capitals', () => {
        const detector = new ScanBurstDetector();
        let at = 1000;
        for (const ch of 'PBL-01') {
            detector.feed('Shift', at);
            detector.feed(ch, at + 1);
            at += 5;
        }
        expect(detector.feed('Enter', at)).toEqual({ kind: 'scan', code: 'PBL-01' });
    });

    it('keeps only the fast run when a scan follows typing', () => {
        const detector = new ScanBurstDetector();
        press(detector, 'abc', 150, 'x', 0); // typed slowly; 'x' is just another key
        expect(press(detector, 'PBL-2026-LPT07', 5, 'Enter', 5000)).toEqual({ kind: 'scan', code: 'PBL-2026-LPT07' });
    });

    it('needs a few characters, so a fast pair of keys plus Enter is not a scan', () => {
        expect(press(new ScanBurstDetector(), 'ab', 5)).toEqual({ kind: 'none' });
    });

    it('drops the run when Enter comes late', () => {
        const detector = new ScanBurstDetector();
        let at = 1000;
        for (const ch of 'PBL-2026') {
            detector.feed(ch, at);
            at += 5;
        }
        expect(detector.feed('Enter', at + SCAN_MAX_GAP_MS + 100)).toEqual({ kind: 'none' });
    });

    it('abandons the run on any other key, such as Backspace', () => {
        const detector = new ScanBurstDetector();
        let at = 1000;
        for (const ch of 'PBL-2026') {
            detector.feed(ch, at);
            at += 5;
        }
        detector.feed('Backspace', at);
        expect(detector.feed('Enter', at + 5)).toEqual({ kind: 'none' });
    });
});
