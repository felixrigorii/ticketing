import { Publisher, OrderCancelledEvent, Subjects } from "@frtickets/common"; 

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
};