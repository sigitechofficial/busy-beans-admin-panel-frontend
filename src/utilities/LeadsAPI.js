import { PostAPI } from "./PostAPI";
import { PatchAPI } from "./PatchAPI";
import { DeleteAPI } from "./DeleteAPI";

/**
 * Lead Management API Service
 * Uses existing GetAPI, PostAPI, PatchAPI, DeleteAPI utilities
 */

export const leadsAPI = {
  /**
   * Create new lead
   * @param {Object} data - Lead data
   * @returns {Promise}
   */
  createLead: async (data) => {
    return await PostAPI("api/v1/leads", data);
  },

  /**
   * Update lead
   * @param {number} id - Lead ID
   * @param {Object} data - Updated data
   * @returns {Promise}
   */
  updateLead: async (id, data) => {
    return await PatchAPI(`api/v1/leads/${id}`, data);
  },

  /**
   * Delete lead
   * @param {number} id - Lead ID
   * @returns {Promise}
   */
  deleteLead: async (id) => {
    return await DeleteAPI(`api/v1/leads/${id}`);
  },

  /**
   * Schedule follow-up
   * @param {number} id - Lead ID
   * @param {Object} data - { date, notes }
   * @returns {Promise}
   */
  scheduleFollowUp: async (id, data) => {
    return await PostAPI(`api/v1/leads/${id}/follow-up`, data);
  },

  /**
   * Send quotation
   * @param {number} id - Lead ID
   * @param {Object} data - { amount, date }
   * @returns {Promise}
   */
  sendQuotation: async (id, data) => {
    return await PostAPI(`api/v1/leads/${id}/quotation`, data);
  },

  /**
   * Schedule site visit
   * @param {number} id - Lead ID
   * @param {Object} data - { date, notes }
   * @returns {Promise}
   */
  scheduleSiteVisit: async (id, data) => {
    return await PostAPI(`api/v1/leads/${id}/site-visit`, data);
  },

  /**
   * Mark lead as WON
   * @param {number} id - Lead ID
   * @param {Object} [data] - { amount } deal amount (lead revenue in Analytics)
   * @returns {Promise}
   */
  markAsWon: async (id, data = {}) => {
    return await PatchAPI(`api/v1/leads/${id}/won`, data);
  },

  /**
   * Add a note to the lead's activity timeline
   * @param {number} id - Lead ID
   * @param {Object} data - { message }
   * @returns {Promise}
   */
  addComment: async (id, data) => {
    return await PostAPI(`api/v1/leads/${id}/comments`, data);
  },

  /**
   * Mark lead as LOST
   * @param {number} id - Lead ID
   * @param {Object} data - { reason, feedback }
   * @returns {Promise}
   */
  markAsLost: async (id, data) => {
    return await PatchAPI(`api/v1/leads/${id}/lost`, data);
  },

  /**
   * Assign lead to entity
   * @param {number} id - Lead ID
   * @param {Object} data - { employeeId } or { salesRepId }
   * @returns {Promise}
   */
  assignLead: async (id, data) => {
    return await PostAPI(`api/v1/leads/${id}/assign`, data);
  },
};
