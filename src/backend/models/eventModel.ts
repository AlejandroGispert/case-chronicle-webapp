import { getDatabaseService, getAuthService } from '../services';
import { Event, CreateEventInput } from './types';

export const eventModel = {
  async getEventsByCase(caseId: string): Promise<Event[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];
    
    const db = getDatabaseService();
    const { data, error } = await db
      .from<Event>('events')
      .select('*')
      .eq('case_id', caseId)
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(500)
      .execute();
      
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    console.log('Events fetched for case', caseId, ':', data);
    return data || [];
  },

  async getAllEvents(): Promise<Event[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return [];
    
    const db = getDatabaseService();
    const { data, error } = await db
      .from<Event>('events')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(500)
      .execute();
      
    if (error) {
      console.error('Error fetching all events:', error);
      return [];
    }
    
    return data || [];
  },
  
  async createEvent(eventData: CreateEventInput): Promise<Event | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return null;

    // Validate UUID format (optional but helpful)
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!isValidUUID.test(eventData.case_id)) {
      console.error("Invalid case_id UUID:", eventData.case_id);
      return null;
    }

    const eventWithUser = {
      ...eventData,
      user_id: user.id
    };

    const db = getDatabaseService();
    const { data, error } = await db
      .from<Event>('events')
      .insert(eventWithUser)
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error.message);
      throw new Error(error.message);
    }

    return data;
  },

  async updateEvent(eventData: Partial<Event>): Promise<Event | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user || !eventData.id) return null;

    const db = getDatabaseService();
    const payload: Partial<Event> = {};
    if (eventData.title !== undefined) payload.title = eventData.title;
    if (eventData.description !== undefined) payload.description = eventData.description;
    if (eventData.date !== undefined) payload.date = eventData.date;
    if (eventData.time !== undefined) payload.time = eventData.time;

    if (Object.keys(payload).length === 0) return null;

    const { data, error } = await db
      .from<Event>('events')
      .update(payload)
      .eq('id', eventData.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error.message);
      return null;
    }
    return data;
  },

  async deleteEvent(eventId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    if (!user) return false;
    
    const db = getDatabaseService();
    const { error } = await db
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id)
      .execute();
      
    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }
    
    return true;
  },

  async assignContactToEvent(eventId: string, contactId: string | null): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }

      const db = getDatabaseService();
      const { error } = await db
        .from("events")
        .update({ contact_id: contactId })
        .eq("id", eventId)
        .eq("user_id", user.id)
        .execute();

      if (error) {
        console.error("Error assigning contact to event:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in assignContactToEvent:", error);
      return false;
    }
  },

  async assignCategoryToEvent(eventId: string, categoryId: string | null): Promise<boolean> {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }

      const db = getDatabaseService();
      const { error } = await db
        .from("events")
        .update({ category_id: categoryId })
        .eq("id", eventId)
        .eq("user_id", user.id)
        .execute();

      if (error) {
        console.error("Error assigning category to event:", error.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in assignCategoryToEvent:", error);
      return false;
    }
  }
};