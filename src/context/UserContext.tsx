import React, { createContext, Dispatch, SetStateAction, useState } from "react";
import { IUser } from "../mocks/users/interface";

interface IUserContext {
    user: IUser;
    setUser: Dispatch<SetStateAction<IUser>>
}

export const UserContext = createContext<IUserContext>({} as IUserContext)

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<IUser>({} as IUser);

    return (
        <UserContext.Provider value={{ user, setUser }} >
            {children}
        </UserContext.Provider>
    )
}