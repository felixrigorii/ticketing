import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// declare global {
//     namespace NodeJS {
//         interface Global {
//             signin(): string[];
//         }
//     }
// }

declare global { 
    var signin: ( id?: string) => string[];
}

jest.mock('../nats-wrapper.ts');

process.env.STRIPE_KEY = 'sk_test_51JWd3TJPhf6yCsLhCVshL5r5oV0BvFBdnEEMZfkWvycl2I9gDdfq7geLbytDo2flOvHpszrtwSbbpXOQxlm31ETI00bWoxAal0';

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
    const collections  = await mongoose.connection.db.collections();

    for( let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll( async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

global.signin = (id?: string) =>  {
    // build a JWT payload. { id, email }
    const payload = {
        id: id || (new mongoose.Types.ObjectId()).toString(),
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