import { Resolver, Query, Mutation, Arg, ObjectType, Field, Ctx, UseMiddleware } from 'type-graphql';
import { hash, compare } from 'bcryptjs';
import { User } from './entity/User';
import { MyContext } from './MyContext';
import { createRefreshToken, createAccessToken } from './auth';
import { isAuth } from './isAuth';
import { sendRefreshToken } from './SendRefreshToken';

@ObjectType()
class LoginResponse {
    @Field()
    accessToken: string
}

@Resolver() 
export class UserResolver {
    @Query(() => String) 
    hello() {
        return 'hi!'
    }

    @Query(() => String) 
    @UseMiddleware(isAuth)
    bye(@Ctx() { payload }: MyContext) {
        console.log(payload);
        return `your user id is: ${payload!.userId}`;
    }

    @Query(() => [User]) 
    users() {
        return User.find();
    }

    @Mutation(() => LoginResponse)
    async login(
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res} : MyContext
        ): Promise<LoginResponse> {
        
        const user = await User.findOne({ where: { email }});
        
        if (!user) {
            throw new Error ('invalid login');
        }

        const valid = await compare(password, user.password) //IF YOU DO NOT AWAIT COMPARE, IT WILL LOG YOU IN WITH ANY PASSWORD.

        if (!valid) {
            throw new Error ('invalid login');
        }

        // LOGIN SUCCESSFUL
        
        sendRefreshToken(res, createRefreshToken(user))

        // res.cookie(
        //     'jid', createRefreshToken(user),
        //         {
        //             httpOnly:true
        //         }
        // )



        return {
            accessToken: createAccessToken(user)
        };
    }


    @Mutation(() => Boolean)
    async register(
        // @Arg('email', () => String) email: string GRAPHQL CAN INFER THAT ARG 'EMAIL' IS OF TYPE STRING, BECAUSE VARIABLE EMAIL IS OF TYPE STRING, BUT SOMETIMES MIGHT WANT TO BE EXPLICIT ANYWAY.
        @Arg('email') email: string,
        @Arg('password') password: string

        ) {
        
        const hashedPassword = await hash(password, 12);   

    try {
        await User.insert({
            email,
            password: hashedPassword
        });
    } catch (err) {
        console.log(err);
        return false;
    }
        return true;
    }
}