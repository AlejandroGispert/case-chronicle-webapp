import { eventModel } from '../models/eventModel';
import { CreateEventInput, Event } from '../models/types';
import { supabase } from '../../integrations/supabase/client';

export const eventController = {
  async fetchEventsByCase(caseId: string): Promise<Event[]> {
    return await eventModel.getEventsByCase(caseId);
  },
  
  async createNewEvent(eventData: CreateEventInput): Promise<Event | null> {
    return await eventModel.createEvent(eventData);
  },
  
  async removeEvent(eventId: string): Promise<boolean> {
    return await eventModel.deleteEvent(eventId);
  },

  async updateEvent(eventData: Partial<Event>) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;

      const { data, error } = await supabase
        .from('events')
        .update({
          date: eventData.date,
          time: eventData.time,
        })
        .eq('id', eventData.id)
        .eq('user_id', user.user.id)
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
