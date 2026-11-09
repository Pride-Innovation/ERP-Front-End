/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

/** Input types a scanned code can sensibly go into. A checkbox or a date picker cannot take one. */
const TEXT_INPUT_TYPES = new Set(['', 'text', 'search', 'tel', 'url', 'email', 'number']);

/** The focused field a scan could go into, if any - never `except` (the search box itself). */
export const focusedTextField = (except?: Element | null): HTMLInputElement | HTMLTextAreaElement | null => {
    const active = document.activeElement;
    if (!active || active === except) return null;
    if (active instanceof HTMLTextAreaElement) {
        return active.readOnly || active.disabled ? null : active;
    }
    if (active instanceof HTMLInputElement) {
        if (!TEXT_INPUT_TYPES.has((active.getAttribute('type') || '').toLowerCase())) return null;
        return active.readOnly || active.disabled ? null : active;
    }
    return null;
};

/**
 * Puts a relayed scan into the field the user has selected, as though it had been typed there.
 *
 * <h2>Why not just `field.value = code`</h2>
 * The application's inputs are React-controlled: React tracks the last value it set and ignores a
 * DOM write that bypasses it, so the field would show the code and the form would not know - the
 * value would vanish on the next render or be missing on submit. Writing through the prototype's
 * own setter and then firing an `input` event is the route React itself listens to.
 *
 * @returns true when a field took the code; false when nothing suitable had focus, in which case
 *          the caller searches with it instead.
 */
export const fillFocusedField = (code: string, except?: Element | null): boolean => {
    const field = focusedTextField(except);
    if (!field) return false;

    const prototype = field instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
    if (setter) {
        setter.call(field, code);
    } else {
        field.value = code;
    }
    field.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
};
