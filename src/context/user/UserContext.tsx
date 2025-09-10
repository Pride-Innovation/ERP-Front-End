/*
13.9 Pride's Standard Copyright Notice:
Copyright ©20XX. Management of Pride Bank Limited (PBL). All Rights Reserved. Permission to use, copy, modify, 
and distribute this software and its documentation for any purpose is prohibited unless authorized in writing by the
Managing Director
*/

import React, { createContext, Dispatch, SetStateAction, useState } from "react";
import { IUser } from "../../pages/users/interface";

interface IUserContext {
    user: IUser;
    users: Array<IUser>;
    setUser: Dispatch<SetStateAction<IUser>>
    setUsers: Dispatch<SetStateAction<Array<IUser>>>
    setTotalUsers: Dispatch<SetStateAction<number>>
    totalUsers: number
}

export const UserContext = createContext<IUserContext>({} as IUserContext)

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>({} as IUser);
    const [users, setUsers] = useState<Array<IUser>>([] as IUser[]);
    const [totalUsers, setTotalUsers] = useState<number>(0);

    return (
        <UserContext.Provider value={{
            user,
            setUser,
            users,
            setUsers,
            totalUsers,
            setTotalUsers
        }} >
            {children}
        </UserContext.Provider>
    )
}