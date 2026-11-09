import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { fillFocusedField } from './fillFocusedField';

/** A React-controlled input, the kind every form in the application uses. */
const ControlledField = ({ onValue }: { onValue: (value: string) => void }) => {
    const [value, setValue] = React.useState('');
    return (
        <input
            aria-label="engraved number"
            value={value}
            onChange={(event) => { setValue(event.target.value); onValue(event.target.value); }}
        />
    );
};

describe('fillFocusedField', () => {
    it('fills a focused React-controlled field so the form sees the value', () => {
        const seen = jest.fn();
        render(<ControlledField onValue={seen} />);
        const field = screen.getByLabelText('engraved number') as HTMLInputElement;
        field.focus();

        let filled = false;
        act(() => { filled = fillFocusedField('PBL-2026-LPT07'); });

        expect(filled).toBe(true);
        expect(field.value).toBe('PBL-2026-LPT07');
        expect(seen).toHaveBeenCalledWith('PBL-2026-LPT07');
    });

    it('does nothing when no field has focus, so the caller searches instead', () => {
        render(<button type="button">a button</button>);
        screen.getByText('a button').focus();
        expect(fillFocusedField('PBL-2026-LPT07')).toBe(false);
    });

    it('leaves the excluded field (the search box) to the caller', () => {
        render(<input aria-label="search" />);
        const search = screen.getByLabelText('search') as HTMLInputElement;
        search.focus();
        expect(fillFocusedField('PBL-2026-LPT07', search)).toBe(false);
        expect(search.value).toBe('');
    });

    it('skips fields a scan cannot go into', () => {
        render(
            <>
                <input aria-label="tick" type="checkbox" />
                <input aria-label="locked" readOnly />
            </>,
        );
        (screen.getByLabelText('tick') as HTMLInputElement).focus();
        expect(fillFocusedField('PBL-1')).toBe(false);
        (screen.getByLabelText('locked') as HTMLInputElement).focus();
        expect(fillFocusedField('PBL-1')).toBe(false);
    });
});
