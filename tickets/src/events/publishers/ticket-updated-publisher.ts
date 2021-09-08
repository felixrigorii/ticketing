import { Publisher, Subjects, TicketUpdatedEvent} from '@frtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
};