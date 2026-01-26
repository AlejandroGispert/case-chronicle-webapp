import { eventModel } from '../models/eventModel';
import { CreateEventInput, Event } from '../models/types';
import { getDatabaseService, getAuthService } from '../services';

export const eventController = {
  async fetchEventsByCase(caseId: string): Promise<Event[]> {
    return await eventModel.getEventsByCase(caseId);
  },

  async fetchAllEvents(): Promise<Event[]> {
    return await eventModel.getAllEvents();
  },
  
  async createNewEvent(eventData: CreateEventInput): Promise<Event | null> {
    return await eventModel.createEvent(eventData);
  },
  
  async removeEvent(eventId: string): Promise<boolean> {
    return await eventModel.deleteEvent(eventId);
  },

  async updateEvent(eventData: Partial<Event>) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) return null;

      const db = getDatabaseService();
      const { data, error } = await db
        .from<Event>('events')
        .update({
          date: eventData.date,
          time: eventData.time,
        })
        .eq('id', eventData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating event:", error);
      return null;
    }
  },
};
