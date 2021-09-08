import { OrderStatus } from '@frtickets/common';
import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

//jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exists', async () => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdfadsfasdf',
            orderId: ( new mongoose.Types.ObjectId() ).toString()
        })
        .expect( 404 );
});

it('return a 401 when purchasing an order that doesnt belong to the user', async () => {
    const order = Order.build({
        id:  ( new mongoose.Types.ObjectId() ).toString(),
        userId:  ( new mongoose.Types.ObjectId() ).toString(),
        version: 0,
        price: 10,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdfadsfasdf',
            orderId: order.id
        })
        .expect( 401 );
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = ( new mongoose.Types.ObjectId() ).toString();

    const order = Order.build({
        id:  ( new mongoose.Types.ObjectId() ).toString(),
        userId,
        version: 0,
        price: 10,
        status: OrderStatus.Cancelled
    });

    await order.save();

    await request( app )
        .post('/api/payments')
        .set('Cookie', global.signin( userId ) )
        .send({
            orderId: order.id,
            token: 'asdfasdfsadf'
        })
        .expect( 400 );

});

it('returns a 204 with valid inputs', async () => {
    const userId = ( new mongoose.Types.ObjectId() ).toString();
    const price = Math.floor(Math.random() * 100000 );
    const order = Order.build({
        id:  ( new mongoose.Types.ObjectId() ).toString(),
        userId,
        version: 0,
        price,
        status: OrderStatus.Created
    });

    await order.save();

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin( userId ) )
        .send({
            orderId: order.id,
            token: 'tok_visa'
        })
        .expect( 201 );

    //const chargeOptions = (stripe.charges.create as jest.Mock ).mock.calls[0][0];

    const stripeCharges = await stripe.charges.list({ limit: 50 });

    const stripeCharge = stripeCharges.data.find( charge => charge.amount === price * 100 );
    // expect( chargeOptions.source).toEqual('tok_visa');
    // expect( chargeOptions.amount).toEqual( 10 * 100 );
    // expect( chargeOptions.currency).toEqual( 'usd' );

    expect( stripeCharge ).toBeDefined();
    expect( stripeCharge!.currency ).toEqual('usd');

    const payment = await Payment.findOne({
        orderId: order.id,
        stripeId: stripeCharge!.id
    });

    expect( payment ).not.toBeNull();
});