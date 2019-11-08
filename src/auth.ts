import { User } from "./entity/User";
import { sign } from 'jsonwebtoken';


export const createAccessToken = (user: User) => {
    return sign({ userId: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET!, {expiresIn: "15m"})
};

//TYPESCRIPT GETS MAD AT process.env.WHATEVER BECAUSE IT COULD POSSIBLY BE 'UNDEFINED.' ADD '!' TO TELL TYPESCRIPT YOU KNOW THAT IT IS DEFINED.

export const createRefreshToken = (user: User) => {
    return sign({ userId: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET!, {expiresIn: "7d"})
};