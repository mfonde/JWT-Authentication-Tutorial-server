import "dotenv/config";
import "reflect-metadata";
// import {createConnection} from "typeorm";
import express from 'express';
// import {User} from "./entity/User";
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from "./UserResolver";
import { createConnection } from "typeorm";
import cookieParser from 'cookie-parser';
import {verify} from 'jsonwebtoken';
import { User } from './entity/User';
import { createAccessToken, createRefreshToken } from "./auth";
import { sendRefreshToken } from "./SendRefreshToken";

(async () => {
    const app = express();
    app.use(cookieParser());
    // app.get('/', (_req, res) => res.send('Say Hello!')); USE `_` OR `_${PARAMETER NAME}` WHEN YOU WANT TO IGNORE THE FIRST PARAMETER OF A METHOD.
    app.get('/', (_, res) => res.send('Say Hello!'));

    app.post('/refresh_token', async (req, res) => {
        console.log(req.cookies)
        const token = req.cookies.jid
        if(!token) {
            return res.send({ok: false, accessToken: ''})
        }

        let payload: any = null;
        try {
            payload = verify(token, process.env.REFRESH_TOKEN_SECRET!)
        } catch (err) {
            console.log(err);
            return res.send({ok: false, accessToken: ''})
        }

        // REFRESH TOKEN IS VALID AND WE CAN SEND BACK AN ACCESS TOKEN

        const user = await User.findOne({where: {id: payload.userId, email: payload.email}})

        if (!user) {
            return res.send({ok: false, accessToken: ''})
        }

        // res.cookie(
        //     'jid', createRefreshToken(user),
        //         {
        //             httpOnly:true
        //         }
        // )

        sendRefreshToken(res, createRefreshToken(user))

        return res.send({ok: true, accessToken: createAccessToken(user)})
    })

    // const apolloServer = new ApolloServer({
    //     typeDefs: `
    //     type Query {
    //         hello: String!
    //     }
    //     `,
    //     resolvers: {
    //         Query: {
    //             hello: () => 'hello world'
    //         }
    //     }
    // })

    await createConnection();

    const apolloServer = new ApolloServer ({
        schema: await buildSchema({
            resolvers: [UserResolver]
        }),
        context: ({ req, res }) => ({ req, res})
    })

    apolloServer.applyMiddleware({app});

    app.listen(4000, () => {
        console.log('express server started')
    })
})()

// createConnection().then(async connection => {

//     console.log("Inserting a new user into the database...");
//     const user = new User();
//     user.firstName = "Timber";
//     user.lastName = "Saw";
//     user.age = 25;
//     await connection.manager.save(user);
//     console.log("Saved a new user with id: " + user.id);

//     console.log("Loading users from the database...");
//     const users = await connection.manager.find(User);
//     console.log("Loaded users: ", users);

//     console.log("Here you can setup and run express/koa/any other framework.");

// }).catch(error => console.log(error));
