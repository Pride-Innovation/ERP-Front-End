import React, { createContext, Dispatch, SetStateAction, useState } from "react";
import { IUser, IUsersTableData } from "../pages/users/interface";

interface IUserContext {
    user: IUser;
    users: Array<IUser>;
    usersTableData: Array<IUsersTableData>;
    setUser: Dispatch<SetStateAction<IUser>>
    setUsers: Dispatch<SetStateAction<Array<IUser>>>
    setUsersTableData: Dispatch<SetStateAction<Array<IUsersTableData>>>
}

export const UserContext = createContext<IUserContext>({} as IUserContext)

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>({} as IUser);
    const [users, setUsers] = useState<Array<IUser>>([] as IUser[]);
    const [usersTableData, setUsersTableData] = useState<Array<IUsersTableData>>([] as IUsersTableData[]);

    return (
        <UserContext.Provider value={{ user, setUser, users, setUsers, usersTableData, setUsersTableData }} >
            {children}
        </UserContext.Provider>
    )
}