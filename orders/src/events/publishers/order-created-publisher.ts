import { Publisher, OrderCreatedEvent, Subjects } from "@frtickets/common"; 

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
};