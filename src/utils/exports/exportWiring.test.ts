/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import fs from 'fs';
import path from 'path';

import { EXPORT_TABLES } from './exportTables';

/**
 * Every export has to be told which table it is.
 *
 * <h2>The bug this exists to stop happening twice</h2>
 * Column narrowing runs inside `TableUtills`, and it can only run when the caller passes a
 * `tableKey`. Miss it and nothing fails, nothing warns — the export simply keeps its old behaviour
 * and prints **every key the row happens to carry**. On the requests page that was twenty columns,
 * including eight objects that render as "[object Object]" and three internal routing flags.
 *
 * <p>It went unnoticed because the *same page* had a second, correctly-keyed export path
 * (`useRequestExport`), so the feature demonstrably worked — just not from the tab people used. A
 * silent fallback plus a partial wiring is exactly the combination no amount of clicking around
 * reliably finds.
 *
 * <p>Pinned on the source because that is where the mistake is made. A behavioural test would need
 * to render every page and drive a download, which pins the fixture far more than the rule.
 */
describe('export wiring', () => {

    const SRC = path.join(__dirname, '..', '..');

    /** Every .ts/.tsx under src, so a page added later is covered without being listed. */
    const sourceFiles = (dir: string): string[] =>
        fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) return sourceFiles(full);
            return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
        });

    it('gives every TableUtills export caller a tableKey', () => {
        const offenders: string[] = [];

        sourceFiles(SRC).forEach((file) => {
            const source = fs.readFileSync(file, 'utf8');

            // Only the callers that actually export. TableUtills is also used for row-menu filtering
            // and status chips, and those have no business naming a table.
            const usesExport = /generatePDFFromRows|generateExcelFromRows/.test(source);
            if (!usesExport) return;

            const calls = source.match(/TableUtills\(\{[^}]*\}\)/g) ?? [];
            calls.forEach((call) => {
                if (!call.includes('tableKey')) {
                    offenders.push(`${path.relative(SRC, file)}  →  ${call}`);
                }
            });
        });

        expect(offenders).toEqual([]);
    });

    /**
     * And every key named in a page is one the registry knows.
     *
     * <p>A typo resolves to "unregistered", which falls back to exporting everything — the same
     * silent wrong answer as forgetting the key entirely, and harder to spot because the call looks
     * right.
     */
    it('only names tables the registry declares', () => {
        const known = new Set(EXPORT_TABLES.map((table) => table.key));
        const unknown: string[] = [];

        sourceFiles(SRC).forEach((file) => {
            const source = fs.readFileSync(file, 'utf8');
            // `tableKey="assets"` on a component, or `tableKey: 'assets'` in a hook call.
            const matches = source.match(/tableKey[=:]\s*["']([^"']+)["']/g) ?? [];
            matches.forEach((match) => {
                const key = match.replace(/.*["']([^"']+)["']/, '$1');
                if (!known.has(key)) unknown.push(`${path.relative(SRC, file)}  →  ${key}`);
            });
        });

        expect(unknown).toEqual([]);
    });

    /** Guards against the walker matching nothing and both assertions passing vacuously. */
    it('actually finds the export callers', () => {
        const withExports = sourceFiles(SRC).filter((file) =>
            /generatePDFFromRows|generateExcelFromRows/.test(fs.readFileSync(file, 'utf8')));

        expect(withExports.length).toBeGreaterThan(2);
    });
});
