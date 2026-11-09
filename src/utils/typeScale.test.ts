/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import fs from 'fs';
import path from 'path';

import { fontSize } from './tokens';

/**
 * Small text comes from four sizes, and nothing is smaller than the first.
 *
 * <h2>What this stops happening again</h2>
 * The theme defined about a dozen sizes and the components hand-set more than twenty-five others —
 * 0.6, 0.62, 0.65, 0.66, 0.68, 0.7, 0.72rem and so on, each tuned by eye on its own page. Nobody
 * can see the difference between 0.66 and 0.68rem; what the spread did produce was pages that felt
 * subtly unlike each other, a global change that only half-landed, and labels rendering at 8px on
 * a 14" laptop.
 *
 * <p>Sizes from 0.95rem up (headings, hero figures) are left free — they are few and deliberate.
 * Below that, a literal must be one of the {@link fontSize} tokens.
 */
describe('type scale', () => {

    const SRC = path.join(__dirname, '..');
    const ALLOWED = new Set(Object.values(fontSize).map((v) => parseFloat(v)));
    const FREE_FROM = 0.95;

    const sourceFiles = (dir: string): string[] =>
        fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) return sourceFiles(full);
            return /\.(tsx?|jsx?)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
        });

    it('uses only the scale for hand-set sizes below 0.95rem', () => {
        const offenders: string[] = [];

        sourceFiles(SRC).forEach((file) => {
            const source = fs.readFileSync(file, 'utf8');
            const literal = /fontSize\s*:\s*(['"])(\d*\.?\d+)rem\1/g;
            let m: RegExpExecArray | null;
            while ((m = literal.exec(source)) !== null) {
                const value = parseFloat(m[2]);
                if (value < FREE_FROM && !ALLOWED.has(value)) {
                    const line = source.slice(0, m.index).split('\n').length;
                    offenders.push(`${path.relative(SRC, file)}:${line}  →  ${m[0]}`);
                }
            }
        });

        expect(offenders).toEqual([]);
    });

    it('keeps the floor at or above 0.8rem', () => {
        expect(Math.min(...Array.from(ALLOWED))).toBeGreaterThanOrEqual(0.8);
    });
});
