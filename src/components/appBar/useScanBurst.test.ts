import React from 'react';
import { renderHook } from '@testing-library/react';
import { useScanBurst } from './useScanBurst';

/** Dispatches each key, then Enter, on `target` - back to back, as a scanner's keyboard output does. */
const scan = (target: EventTarget, text: string): KeyboardEvent => {
    for (const ch of text) {
        target.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true, cancelable: true }));
    }
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    target.dispatchEvent(enter);
    return enter;
};

describe('useScanBurst', () => {
    let search: HTMLInputElement;
    let other: HTMLInputElement;

    beforeEach(() => {
        search = document.createElement('input');
        other = document.createElement('input');
        document.body.append(search, other);
    });

    afterEach(() => {
        search.remove();
        other.remove();
    });

    const mount = () => {
        const onScan = jest.fn();
        const ref = { current: search } as React.RefObject<HTMLInputElement>;
        const { unmount } = renderHook(() => useScanBurst(onScan, ref));
        return { onScan, unmount };
    };

    it('takes a scan made with nothing editable focused, and swallows its Enter', () => {
        const { onScan } = mount();
        const enter = scan(document.body, 'PBL-2026-LPT07');
        expect(onScan).toHaveBeenCalledWith('PBL-2026-LPT07');
        expect(enter.defaultPrevented).toBe(true);
    });

    it('takes a scan into the search box itself', () => {
        const { onScan } = mount();
        scan(search, 'PBL-2026-LPT07');
        expect(onScan).toHaveBeenCalledWith('PBL-2026-LPT07');
    });

    it('leaves a scan into any other field to that field', () => {
        const { onScan } = mount();
        const enter = scan(other, 'PBL-2026-LPT07');
        expect(onScan).not.toHaveBeenCalled();
        expect(enter.defaultPrevented).toBe(false);
    });

    it('stops listening when unmounted', () => {
        const { onScan, unmount } = mount();
        unmount();
        scan(document.body, 'PBL-2026-LPT07');
        expect(onScan).not.toHaveBeenCalled();
    });
});
