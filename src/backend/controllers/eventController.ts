
import { eventModel } from '../models/eventModel';
import { CreateEventInput, Event } from '../models/types';

export const eventController = {
  async fetchEventsByCase(caseId: string): Promise<Event[]> {
    return await eventModel.getEventsByCase(caseId);
  },
  
  async createNewEvent(eventData: CreateEventInput): Promise<Event | null> {
    return await eventModel.createEvent(eventData);
  },
  
  async removeEvent(eventId: string): Promise<boolean> {
    return await eventModel.deleteEvent(eventId);
  }
};
