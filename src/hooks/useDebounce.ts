/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delay = 500) => {
    const [debounceValue, setDebounceValue] = useState<T>(value);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setDebounceValue(value)
        }, delay);

        return () => clearTimeout(timeout)
    }, [value, delay])

    return debounceValue;
};