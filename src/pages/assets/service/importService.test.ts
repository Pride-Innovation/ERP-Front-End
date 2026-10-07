import axiosInstance from '../../../core/apis/axiosInstance';
import { bulkImportAssetsService } from './importService';

jest.mock('../../../core/apis/axiosInstance', () => ({
    __esModule: true,
    default: { post: jest.fn() },
}));

const post = (axiosInstance as unknown as { post: jest.Mock }).post;

describe('bulkImportAssetsService progress', () => {
    beforeEach(() => {
        post.mockReset();
        post.mockImplementation((_url: string, form: FormData) => {
            const batch = JSON.parse(form.get('assets') as string);
            return Promise.resolve({ data: { success: true, total: batch.length, inserted: batch.length, failed: 0, errors: [] } });
        });
    });

    /**
     * The dialog names the rows in flight before each batch returns. Without this a file of one batch -
     * most of them - read "0 of N" for its whole upload and looked stuck.
     */
    it('announces each batch before sending it, then reports it done', async () => {
        const rows = Array.from({ length: 450 }, (_, i) => ({ assetName: `A${i}` }));
        const events: string[] = [];

        const result = await bulkImportAssetsService(
            rows, 3, 200,
            (done, total) => events.push(`done ${done}/${total}`),
            (from, to, total) => events.push(`send ${from}-${to}/${total}`),
        );

        expect(events).toEqual([
            'send 1-200/450', 'done 200/450',
            'send 201-400/450', 'done 400/450',
            'send 401-450/450', 'done 450/450',
        ]);
        expect(result.inserted).toBe(450);
    });

    it('announces a single-batch file as the whole file', async () => {
        const events: string[] = [];
        await bulkImportAssetsService(
            [{ assetName: 'one' }, { assetName: 'two' }], 3, 200,
            undefined,
            (from, to, total) => events.push(`send ${from}-${to}/${total}`),
        );
        expect(events).toEqual(['send 1-2/2']);
    });
});
