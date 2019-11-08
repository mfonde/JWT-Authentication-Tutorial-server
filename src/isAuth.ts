import { MiddlewareFn } from "type-graphql"
import { MyContext } from "./MyContext"
import { verify } from 'jsonwebtoken';

// FORMAT FOR AUTHORIZATION: bearer ${token}   -----> SO THE TOKEN IS THE SECOND VALUE OF 'AUTHORIZATION.'

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
        const authorization = context.req.headers['authorization'];

        if (!authorization) {
            throw new Error ('not authenticated');
        }

        // AUTHORIZATION COULD POSSIBLY BE UNDEFINED AT THIS POINT (AS IN, USER DID NOT PASS HEADERS), SO MUST HAVE IF STATEMENT FOR THAT SITUATION.
        // SAME REASON YOU HAVE TO ADD A '!' AT THE END OF 'process.env.ACCESS_TOKEN_SECRET(!). IT NEEDS TO BE REQUIRED.

        try{
            const token = authorization.split(' ')[1];
            const payload = verify(token, process.env.ACCESS_TOKEN_SECRET!)
            context.payload = payload as any;
        } catch (err) {
            console.log(err)
        }
        
        return next()
    
}