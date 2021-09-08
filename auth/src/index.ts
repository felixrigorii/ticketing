import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
    console.log('Starting up....');
    
    try {

        if ( !process.env.JWT_KEY ) {
            throw new Error('JWT_KEY must be defined');
        }

        if ( !process.env.MONGO_URI ) {
            throw new Error('MONGO_URI must be defined');
        }

        await mongoose.connect( process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });

    } catch( err ) {
        console.error( err );
    }
    console.log('Connected to MongoDB');
    app.listen(3000, () => {
        console.log( 'Listening at port 3000!');
    });
};

start();