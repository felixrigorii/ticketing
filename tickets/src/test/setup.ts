import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

declare global {
    namespace NodeJS {
        interface Global {
            signin(): string[];
        }
    }
}

jest.mock('../nats-wrapper.ts');
jest.setTimeout(30000) ;

let mongo: any;

beforeAll( async () => {
    process.env.JWT_KEY = 'asdf';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect( mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
});

beforeEach( async () => {
    jest.clearAllMocks();
    jest.setTimeout(30000) ;
    const collections  = await mongoose.connection.db.collections();

    for( let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll( async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = () =>  {
    // build a JWT payload. { id, email }
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    };

    // create the jwt!
    const token = jwt.sign( payload, process.env.JWT_KEY!);

    // build session object { jwt: MY_JWT } 
    const session = { jwt: token };

    // turn that session into JSON
    const sessionJSON = JSON.stringify( session );

    // take JSON and encode it as base 64
    const base64 = Buffer.from( sessionJSON ).toString('base64');

    // return a string thats the cookie with then encoded data
    return [`express:sess=${base64}`];
};