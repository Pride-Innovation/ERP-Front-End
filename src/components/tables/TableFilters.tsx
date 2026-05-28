import { GridFilterModel } from "@mui/x-data-grid";
import { ICustomTableFilterOperator, IhandleTablePagination } from "./interface";
import { useDebounce } from "../../hooks/useDebounce";
import { useContext, useEffect, useState } from "react";
import { fetchRowsService } from "../../core/apis/globalService";
import { ErrorMessage } from "../../utils/constants";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { loadAllRequests } from "../../pages/request/assetRequest/slice";
import { loadUsers } from "../../pages/users/slice";
import { loadAllInventory } from "../../pages/inventory/slice";
import { loadAllGeneralAssets } from "../../pages/assets/general/slice";
import { RequestContext } from "../../context/request/RequestContext";
import { AssetContext } from "../../context/asset";

// Define interface for a filter item
interface FilterItem {
    field: string;
    value: any;
}

const CustomTableFilterOperator = ({ endPoint, params }: ICustomTableFilterOperator) => {
    const [localInput, setLocalInput] = useState<string>('');
    const debouncedInput = useDebounce(localInput, 500);
    const dispatch = useDispatch<AppDispatch>();
    const { setCount } = useContext(RequestContext);

    // Store all active filters as an array of filter items
    const [filterParams, setFilterParams] = useState<FilterItem[]>(
        Array.isArray(params) ? params : []
    );

    // Track the most recently changed field
    const [currentFilterField, setCurrentFilterField] = useState<string>('');

    const {
        setItEquipmentCount,
        setFieldName,
        setFieldText
    } = useContext(AssetContext);

    const handleReduxStoreUpdate = (
        url: string,
        content: Array<Record<string, any>>,
        params?: Record<string, any>,
        totalElements?: number
    ) => {
        switch (url) {
            case "requests":
                dispatch(loadAllRequests(content));
                setCount(totalElements as number);
                break;
            case "users":
                dispatch(loadUsers(content))
                break;
            case "stocks":
                dispatch(loadAllInventory(content))
                break;
            case "assets":
                // All asset categories are unified under GeneralAssetStore — the
                // per-category stores have been retired.
                dispatch(loadAllGeneralAssets(content));
                if (typeof totalElements === 'number') {
                    setItEquipmentCount(totalElements);
                }
                break;
            default:
                break
        }
    }

    const handleTableFilter = (model: GridFilterModel) => {
        const { items } = model;

        if (!items || items.length === 0) {
            // Clear filters if no items
            setFilterParams([]);
            return;
        }

        // Update the filter params
        setFilterParams(prev => {
            // Ensure prev is an array
            const prevFilters = Array.isArray(prev) ? prev : [];

            // Process each new filter item
            const updatedFilters = [...prevFilters];

            // Update or add the current filter
            for (const item of items) {
                const existingIndex = updatedFilters.findIndex(
                    filter => filter.field === item.field
                );

                if (existingIndex >= 0) {
                    // Update existing filter
                    if (item.value) {
                        updatedFilters[existingIndex] = {
                            field: item.field,
                            value: item.value
                        };
                    } else {
                        // Remove filter if value is empty
                        updatedFilters.splice(existingIndex, 1);
                    }
                } else if (item.value) {
                    // Add new filter if it has a value
                    updatedFilters.push({
                        field: item.field,
                        value: item.value
                    });
                }
            }

            return updatedFilters;
        });

        // Update the local input with the most recent filter value
        if (items.length > 0) {
            const { field, value } = items[0];
            setLocalInput(value?.toString() || '');
            setFieldName(field);
            setCurrentFilterField(field);
        }
    };

    const fetchFilteredData = async () => {
        // Convert filter array to object for the API call
        const filterObject = filterParams.reduce((obj, filter) => {
            obj[filter.field] = filter.value;
            return obj;
        }, {} as Record<string, any>);

        console.log('Fetching data with filters:', filterObject);
        console.log('Filter params array:', filterParams);

        try {
            const response = await fetchRowsService({
                pageNumber: 0,
                pageSize: 10,
                endPoint,
                params: {
                    ...params, // Base params
                    ...filterObject // All active filters
                }
            }) as IhandleTablePagination;

            const { content } = response.data

            if (content.length > 0) {
                handleReduxStoreUpdate(
                    endPoint,
                    content,
                    { ...params, ...filterObject },
                    response.data.totalElements
                )
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : ErrorMessage;
            console.log(errorMessage)
        }
    }

    // Effect to handle input changes - only trigger when debouncedInput changes
    useEffect(() => {
        if (debouncedInput.length > 0 && currentFilterField) {
            // Update the filter params with the debounced input
            setFilterParams(prev => {
                const prevFilters = Array.isArray(prev) ? prev : [];
                const existingIndex = prevFilters.findIndex(
                    filter => filter.field === currentFilterField
                );

                const updatedFilters = [...prevFilters];

                if (existingIndex >= 0) {
                    updatedFilters[existingIndex] = {
                        field: currentFilterField,
                        value: debouncedInput
                    };
                } else {
                    updatedFilters.push({
                        field: currentFilterField,
                        value: debouncedInput
                    });
                }

                return updatedFilters;
            });

            fetchFilteredData();
            setFieldText(debouncedInput);
        } else if (debouncedInput === '' && currentFilterField) {
            // Remove the filter if input is cleared
            setFilterParams(prev => {
                return prev.filter(filter => filter.field !== currentFilterField);
            });

            // Only fetch if we still have other filters active
            if (filterParams.some(filter => filter.field !== currentFilterField)) {
                fetchFilteredData();
            }
        }
    }, [debouncedInput]);

    // This effect runs when filterParams changes to handle cases like
    // removing filters or updating multiple filters at once
    useEffect(() => {
        if (filterParams.length > 0) {
            fetchFilteredData();
        }
    }, [filterParams.length]); // Only re-run if the number of filters changes

    return {
        handleTableFilter
    };
};

export default CustomTableFilterOperator;