export interface IFetchRowsService {
    page?: number;
    size?: number;
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