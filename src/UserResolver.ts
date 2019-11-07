import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { hash } from 'bcryptjs';
import { User } from './entity/User';

@Resolver() 
export class UserResolver {
    @Query(() => String) 
    hello() {
        return 'hi!'
    }

    @Query(() => [User]) 
    users() {
        return User.find();
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