/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Every call must go through the shared instance, because the instance is the only thing that makes
 * a request legal.
 *
 * <h2>What the interceptor is now responsible for</h2>
 * The web application firewall in front of the API blocks **PUT and DELETE** at every path. The
 * request interceptor in `axiosInstance.ts` rewrites both into a POST carrying
 * `X-HTTP-Method-Override`, and attaches the `X-CSRF-TOKEN` the firewall also demands on anything
 * that changes state.
 *
 * <p>A call made on raw `axios` gets none of that — and none of the `Authorization` header either.
 * It works perfectly in development, where there is no firewall, and fails in production only.
 * That is the worst shape a bug can have, and it is why this is a test rather than a convention.
 *
 * <h2>This has already happened once</h2>
 * `settings/approvalWorkflows/index.tsx` called `axios.get/post/put/delete` directly against
 * `${BASE_URL}` — three of them writes. It had been shipping with **no auth header at all** on
 * routes that require `READ_SETTING` / `UPDATE_SETTING`, and nobody noticed, because a bypass is
 * invisible from the outside until something downstream starts caring.
 *
 * <p>Same reasoning as `exportWiring.test.ts`: where the safe behaviour lives in a shared choke
 * point, the safety has to come from a test that everything goes through it, not from the runtime
 * noticing that something did not.
 */

const SRC = join(__dirname, '..', '..');

/** The instance itself is allowed to use raw axios — that is where the refresh call deliberately is. */
const ALLOWED = ['core/apis/axiosInstance.ts'];

function sourceFiles(dir: string): string[] {
    return readdirSync(dir).flatMap((entry) => {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) return sourceFiles(full);
        return /\.(ts|tsx)$/.test(entry) && !/\.test\.tsx?$/.test(entry) ? [full] : [];
    });
}

const files = sourceFiles(SRC).map((path) => ({
    path: path.slice(SRC.length + 1).replace(/\\/g, '/'),
    text: readFileSync(path, 'utf8'),
}));

describe('every request goes through the shared axios instance', () => {
    it('finds source files to check at all', () => {
        // Guards against the walker silently returning nothing, which would make every assertion
        // below pass over an empty list — the vacuous green this codebase has been bitten by before.
        expect(files.length).toBeGreaterThan(200);
    });

    it('calls no verb on raw axios outside the instance', () => {
        const offenders = files
            .filter(({ path }) => !ALLOWED.includes(path))
            // `axios.get(`, `axios.put(` and friends, but not `axiosInstance.get(`.
            .filter(({ text }) => /(^|[^A-Za-z0-9_.])axios\.(get|post|put|delete|patch|request)\s*\(/.test(text))
            .map(({ path }) => path);

        expect(offenders).toEqual([]);
    });

    it('creates exactly one axios instance', () => {
        const creators = files
            .filter(({ path }) => !ALLOWED.includes(path))
            .filter(({ text }) => /axios\.create\s*\(/.test(text))
            .map(({ path }) => path);

        // A second instance is the same bypass wearing a different name: it would carry none of the
        // interceptor's headers and would send real PUT and DELETE verbs.
        expect(creators).toEqual([]);
    });
});

describe('the interceptor keeps the firewall satisfied', () => {
    const instance = readFileSync(join(SRC, 'core/apis/axiosInstance.ts'), 'utf8');

    it('rewrites the two blocked verbs rather than sending them', () => {
        expect(instance).toContain("BLOCKED_METHODS = new Set(['put', 'delete'])");
        expect(instance).toContain("config.method = 'post'");
        expect(instance).toContain('METHOD_OVERRIDE_HEADER');
    });

    it('spells the headers exactly as the backend whitelists them', () => {
        // SecurityConfiguration's CORS `allowedHeaders` is a whitelist. A header missing from it is
        // rejected at preflight with an error that names no header, so a typo here surfaces as an
        // unexplained CORS failure on every write.
        expect(instance).toContain("METHOD_OVERRIDE_HEADER = 'X-HTTP-Method-Override'");
        expect(instance).toContain("CSRF_TOKEN_HEADER = 'X-CSRF-TOKEN'");
    });

    it('sends the CSRF token on writes but not on reads', () => {
        expect(instance).toContain("if (method !== 'get' && method !== 'head')");
    });
});
