export interface IFetchRowsService {
    pageNumber?: number;
    pageSize?: number;
    endPoint: string;
}

export interface IFetchDataRequest {
    pageable: {
        pageNumber: number
        pageSize: number
        sort: {
            empty: boolean,
            sorted: boolean,
            unsorted: boolean
        },
        offset: number,
        paged: boolean,
        unpaged: boolean
    },
    last: boolean,
    totalPages: number,
    totalElements: number,
    size: number,
    number: number,
    sort: {
        empty: boolean,
        sorted: boolean,
        unsorted: boolean
    },
    first: boolean,
    numberOfElements: number,
    empty: boolean
}

export interface IAxiosResponse {
    status: number,
    statusText: string,
    headers: {
        "cache-control": string,
        "content-type": string,
        expires: string,
    },
    config: {
        transitional: {
            silentJSONParsing: boolean,
            forcedJSONParsing: boolean,
            clarifyTimeoutError: boolean
        },

        timeout: number,
        xsrfCookieName: string,
        // xsrfCookieName: "XSRF-TOKEN",
        xsrfHeaderName: string,
        // "xsrfHeaderName": "X-XSRF-TOKEN",
        maxContentLength: number,
        maxBodyLength: number,
        headers: {
            Accept: string,
            "Content-Type": string
        },
        baseURL: string,
        method: string,
        url: string,
    },
}