/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import axiosInstance from "../../../core/apis/axiosInstance";

/** One asset carrying the searched engraved number. */
export interface IAssetTagMatch {
    id: number;
    /** Required to build the detail URL: /assets/general/:assetTypeId/view/:id */
    assetTypeId: number | null;
    engravedNumber: string | null;
    assetName: string | null;
    serialNumber: string | null;
    branchName: string | null;
    status: string | null;
}

/**
 * Find assets by the number engraved on them.
 *
 * <h2>This used to swallow its own failures</h2>
 * It ended in `catch (error) { return error }` — trap #6 — so a refusal came back as a *value* rather
 * than a throw, and the caller's `try/catch` could never fire. The component then tested
 * `result && result.id`; an AxiosError has no `id`, so the whole thing fell through and **the search
 * did nothing at all**. No message, no navigation, no error. Typing a tag that did not exist and
 * typing one that did looked identical from the outside.
 *
 * <p>It throws now, and the caller says which of the three things happened.
 *
 * <h2>Encoded, because an engraved number is not a safe query fragment</h2>
 * The tag was interpolated straight into the URL. These are transcribed off physical labels and
 * carry slashes, spaces and the occasional `+` — which a query string reads as a space, silently
 * searching for something the user did not type.
 *
 * @returns the single asset carrying that number, or **null** when there is none — which is also
 *          the answer when the tag belongs to an asset outside the caller's branch. The server
 *          deliberately does not distinguish those two, so that a search cannot confirm a number
 *          exists somewhere the caller may not look.
 */
export const findAssetByTagNameService = async (tagName: string): Promise<IAssetTagMatch | null> => {
    const response = await axiosInstance.get<IAssetTagMatch | IAssetTagMatch[] | ''>(
        `assets/tag-name?tagName=${encodeURIComponent(tagName)}`,
    );

    // 204: the search ran and matched nothing. A success, not a fault — which is why this does not
    // go through a catch, and why the interceptor never gets the chance to toast a generic error
    // over the specific message the search box is about to show.
    if (response.status === 204 || !response.data) return null;

    // Tolerates the array shape this endpoint briefly returned, so a browser held open across a
    // deploy does not break the navigation bar on every page.
    const data = response.data;
    return Array.isArray(data) ? (data[0] ?? null) : data;
};
