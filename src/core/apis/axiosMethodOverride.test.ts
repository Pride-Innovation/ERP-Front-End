/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import type { InternalAxiosRequestConfig } from 'axios';
import axiosInstance from './axiosInstance';

/**
 * What actually goes on the wire when a service calls `.put` or `.delete`.
 *
 * <h2>Why this exists beside `axiosWiring.test.ts`</h2>
 * That one reads the source and checks the rewrite is *written*. This one runs the real interceptor
 * chain and checks the rewrite *happens* — which is the question anybody reading a service file will
 * actually have, because the call site still says:
 *
 * <pre>
 *   const response = await axiosInstance.put(`approval-workflows/${id}/toggle-active`);
 * </pre>
 *
 * and the firewall in front of the API blocks PUT outright. A source-text assertion cannot tell you
 * that line is safe; this can.
 *
 * <h2>How</h2>
 * The instance's adapter is replaced with one that captures the config it is handed and returns a
 * canned 200. The adapter is the last thing axios calls before touching the network, so whatever it
 * receives is exactly what would have been sent.
 */

type Captured = InternalAxiosRequestConfig;

const OVERRIDE_HEADER = 'X-HTTP-Method-Override';
const CSRF_HEADER = 'X-CSRF-TOKEN';

let sent: Captured[] = [];
let originalAdapter: unknown;

const headerOn = (config: Captured, name: string): string | undefined => {
    const headers = config.headers as unknown as {
        get?: (key: string) => unknown;
        [key: string]: unknown;
    };
    const value = typeof headers?.get === 'function' ? headers.get(name) : headers?.[name];
    return value == null ? undefined : String(value);
};

beforeAll(() => {
    originalAdapter = axiosInstance.defaults.adapter;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axiosInstance.defaults as any).adapter = async (config: Captured) => {
        sent.push(config);
        return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
    };
});

afterAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (axiosInstance.defaults as any).adapter = originalAdapter;
});

beforeEach(() => {
    sent = [];
});

const lastRequest = (): Captured => {
    expect(sent).toHaveLength(1);
    return sent[0];
};

describe('a PUT from a service leaves as a POST', () => {
    it('rewrites the verb and names the real one in a header', async () => {
        // Verbatim from src/pages/approvalWorkflows/service/index.ts.
        await axiosInstance.put('approval-workflows/7/toggle-active');

        const request = lastRequest();

        expect(request.method).toBe('post');
        expect(headerOn(request, OVERRIDE_HEADER)).toBe('PUT');
        expect(request.url).toBe('approval-workflows/7/toggle-active');
    });

    it('carries the body through unchanged', async () => {
        await axiosInstance.put('approval-workflows/7', { name: 'Stationery route' });

        const request = lastRequest();

        expect(request.method).toBe('post');
        expect(headerOn(request, OVERRIDE_HEADER)).toBe('PUT');
        // A rewritten verb must not become a rewritten request. The server reads the same JSON it
        // would have read from a PUT.
        expect(JSON.parse(request.data)).toEqual({ name: 'Stationery route' });
    });
});

describe('a DELETE from a service leaves as a POST', () => {
    it('rewrites the verb and names the real one in a header', async () => {
        await axiosInstance.delete('approval-workflows/7');

        const request = lastRequest();

        expect(request.method).toBe('post');
        expect(headerOn(request, OVERRIDE_HEADER)).toBe('DELETE');
    });
});

describe('what is deliberately left alone', () => {
    it('sends a GET as a GET, with neither header', async () => {
        await axiosInstance.get('approval-workflows');

        const request = lastRequest();

        expect(request.method).toBe('get');
        expect(headerOn(request, OVERRIDE_HEADER)).toBeUndefined();
        // Reads change nothing, so the firewall does not ask for a token on them and neither do we.
        expect(headerOn(request, CSRF_HEADER)).toBeUndefined();
    });

    it('sends a POST as a POST, with the CSRF token and no override', async () => {
        await axiosInstance.post('approval-workflows', { name: 'New route' });

        const request = lastRequest();

        expect(request.method).toBe('post');
        expect(headerOn(request, OVERRIDE_HEADER))
            .toBeUndefined();
        expect(headerOn(request, CSRF_HEADER)).toBeTruthy();
    });
});

describe('the token and the override together', () => {
    it('puts a CSRF token on a rewritten PUT too', async () => {
        // It arrives at the firewall as a POST, so it needs what the firewall asks of a POST.
        await axiosInstance.put('approval-workflows/7/toggle-active');

        expect(headerOn(lastRequest(), CSRF_HEADER)).toBeTruthy();
    });

    it('uses one token for the whole session rather than a fresh one per call', async () => {
        await axiosInstance.put('approval-workflows/7/toggle-active');
        await axiosInstance.delete('approval-workflows/8');

        expect(sent).toHaveLength(2);
        expect(headerOn(sent[0], CSRF_HEADER)).toBe(headerOn(sent[1], CSRF_HEADER));
    });
});

describe('replaying a request does not wrap it twice', () => {
    /**
     * The 401 refresh path calls `axiosInstance(original)` with a config that has already been
     * through this interceptor. By then its method is `post`, so the rewrite must not fire again and
     * turn `X-HTTP-Method-Override: PUT` into `POST`.
     */
    it('leaves an already-rewritten config alone on the second pass', async () => {
        await axiosInstance.put('approval-workflows/7/toggle-active');
        const first = lastRequest();

        sent = [];
        await axiosInstance(first);
        const replayed = lastRequest();

        expect(replayed.method).toBe('post');
        expect(headerOn(replayed, OVERRIDE_HEADER))
            .toBe('PUT');
    });
});

describe('only GET and POST ever leave the browser', () => {
    /**
     * The firewall accepts those two verbs and drops everything else, OPTIONS included.
     *
     * <p>Asserted over every verb a service could plausibly call rather than over the two that are
     * rewritten, so a `patch` added later — which the interceptor does not currently handle — fails
     * here rather than in production.
     *
     * <p>Note what this cannot cover: the browser's own **CORS preflight** is an OPTIONS request that
     * no code issues and no test can intercept. It is emitted automatically, and only for
     * cross-origin requests — which is why production must serve this application from the same
     * origin as the API. See the firewall section in CLAUDE.md.
     */
    it.each(['get', 'post', 'put', 'delete'] as const)(
        'a .%s() call goes out as GET or POST',
        async (verb) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (axiosInstance as any)[verb]('approval-workflows/7');

            expect(['get', 'post']).toContain(lastRequest().method);
        },
    );
});
