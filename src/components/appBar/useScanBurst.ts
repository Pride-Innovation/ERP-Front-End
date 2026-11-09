import React from 'react';
import { ScanBurstDetector } from './scannedTag';

const isEditable = (target: EventTarget | null): boolean => {
    if (!(target instanceof HTMLElement)) return false;
    if (target.isContentEditable) return true;
    const tag = target.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
};

/**
 * Calls `onScan` with the engraved number whenever the handheld scanner reads a label, on any page.
 *
 * Listens on `window` in the **capture** phase, so it sees each key before React does. When a run of
 * keys turns out to be a scan, its closing Enter (or Tab) is swallowed: otherwise it would also
 * submit whatever form or press whatever button had focus, or, in the search box itself, start a
 * second search over the top of this one.
 *
 * **A scan into any other field is left alone.** Scanning into the engraved-number field of the asset
 * form, or the issuance picker, is that field's input and already works. Only the search box
 * (`searchInput`) and places where nothing editable has focus are claimed.
 */
export const useScanBurst = (
    onScan: (code: string) => void,
    searchInput: React.RefObject<HTMLInputElement>,
): void => {
    // The latest callback, without re-registering the listener on every render.
    const latest = React.useRef(onScan);
    latest.current = onScan;

    React.useEffect(() => {
        const detector = new ScanBurstDetector();

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.altKey || event.metaKey || event.isComposing) {
                detector.reset();
                return;
            }
            if (isEditable(event.target) && event.target !== searchInput.current) {
                detector.reset();
                return;
            }
            const result = detector.feed(event.key, event.timeStamp);
            if (result.kind === 'scan') {
                event.preventDefault();
                event.stopPropagation();
                latest.current(result.code);
            }
        };

        window.addEventListener('keydown', onKeyDown, true);
        return () => window.removeEventListener('keydown', onKeyDown, true);
    }, [searchInput]);
};
