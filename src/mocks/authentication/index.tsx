import { IUser } from '../../pages/users/interface'
import { usersMock } from '../users'

const MockAuthentication = () => {

    const token = `
    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibm
    FtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
    SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
    `

    const authenticateUser = (email: string): { user: IUser; token: string } => {
        const currentUser = usersMock.find(user => user.email === email);

        return ({
            user: currentUser as IUser,
            token: token
        })
    }

    return ({ authenticateUser })
}

export default MockAuthentication