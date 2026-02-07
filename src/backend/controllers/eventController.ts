import { eventModel } from '../models/eventModel';
import { CreateEventInput, Event } from '../models/types';
import { getDatabaseService, getAuthService } from '../services';
import { requireAuth } from '../auth/authorization';
import { logSuccess } from '../audit';

export const eventController = {
  async fetchEventsByCase(caseId: string): Promise<Event[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await eventModel.getEventsByCase(caseId);
  },

  async fetchAllEvents(): Promise<Event[]> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await eventModel.getAllEvents();
  },

  async createNewEvent(eventData: CreateEventInput): Promise<Event | null> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const result = await eventModel.createEvent(eventData);
    if (result) {
      await logSuccess(user.id, "data_create", {
        resource_type: "event",
        resource_id: result.id,
      });
    }
    return result;
  },

  async removeEvent(eventId: string): Promise<boolean> {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    const success = await eventModel.deleteEvent(eventId);
    if (success) {
      await logSuccess(user.id, "data_deletion", {
        resource_type: "event",
        resource_id: eventId,
      });
    }
    return success;
  },

  async updateEvent(eventData: Partial<Event>) {
    const authService = getAuthService();
    const { user } = await authService.getUser();
    requireAuth(user);
    return await eventModel.updateEvent(eventData);
  },

  async assignContactToEvent(eventId: string, contactId: string | null) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      return await eventModel.assignContactToEvent(eventId, contactId);
    } catch (error) {
      console.error("Error in assignContactToEvent:", error);
      return false;
    }
  },

  async assignCategoryToEvent(eventId: string, categoryId: string | null) {
    try {
      const authService = getAuthService();
      const { user } = await authService.getUser();
      requireAuth(user);
      return await eventModel.assignCategoryToEvent(eventId, categoryId);
    } catch (error) {
      console.error("Error in assignCategoryToEvent:", error);
      return false;
    }
  },
};
