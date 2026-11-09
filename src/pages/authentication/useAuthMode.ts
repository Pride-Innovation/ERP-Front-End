/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify,
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import { useEffect, useState } from 'react';
import axiosInstance from '../../core/apis/axiosInstance';

/**
 * Whether passwords are checked by Active Directory (LDAP) or by this application (LOCAL).
 *
 * While AD owns the password there is nothing here to reset or change, so the pages hide those
 * actions; the server refuses them anyway (`PASSWORD_MANAGED_BY_AD`). Until the answer arrives the
 * mode is `undefined` and the actions stay hidden - offering a reset the server then refuses is the
 * worse of the two mistakes.
 */
export type AuthMode = 'LDAP' | 'LOCAL';

let cached: AuthMode | undefined;

export const useAuthMode = (): AuthMode | undefined => {
    const [mode, setMode] = useState<AuthMode | undefined>(cached);

    useEffect(() => {
        if (cached) return;
        let cancelled = false;
        axiosInstance.get<{ mode?: string }>('auth/mode')
            .then(({ data }) => {
                const next: AuthMode = data?.mode === 'LOCAL' ? 'LOCAL' : 'LDAP';
                cached = next;
                if (!cancelled) setMode(next);
            })
            // Unknown reads as LDAP: the password actions stay hidden rather than fail.
            .catch(() => { if (!cancelled) setMode('LDAP'); });
        return () => { cancelled = true; };
    }, []);

    return mode;
};

/** Passwords are this application's to reset or change. */
export const passwordsAreLocal = (mode: AuthMode | undefined): boolean => mode === 'LOCAL';
