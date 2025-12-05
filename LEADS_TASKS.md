# Leads Module Documentation & Task List

This document outlines the implemented features for the Leads functionality in the Admin Panel. These items can be added to Jira as completed tasks.

## 1. Lead Management (CRUD)
- [x] **Create Lead**: Implemented `Add Lead` modal with comprehensive form fields.
    - **Fields**: Name, Company, Role, Email, Phone, Address (Line 1/2, Country, State, City, Zip), Business Type, Machine Selection, Requirement Snapshot (Order Type, Use Case, Volume, Timeline, Est. Value), Notes, Preferred Contact Method.
    - **Validation**: Required fields, Email format, Phone length.
    - **Dynamic Data**: Country/State/City dependent dropdowns, Machine list from API.
- [x] **Edit Lead**: Ability to edit all lead details via the same modal.
- [x] **Delete Lead**: Functionality to delete a lead with a confirmation dialog.

## 2. Leads Dashboard (Kanban View)
- [x] **Kanban Board**:
    - Visual representation of leads across different stages.
    - **Stages**: New Enquiry, Contacted, Quoted, Demo/Scheduled, Negotiation, Nurture, Won, Lost.
    - **Drag & Drop**: Ability to move leads between columns to update their stage automatically.
- [x] **Lead Card**:
    - Summary card displaying Company, Role, Machine Name, and Next Follow-up Date.
    - **Visual Indicators**: Highlight follow-up date if due today.
    - **Quick Actions**: Edit and Delete buttons directly on the card.
- [x] **Filtering System**:
    - **Stage Filter**: Filter leads by specific pipeline stage.
    - **Follow-up Date Filter**: Filter by preset ranges (Current Week, Month, Last 90 Days, etc.) or Custom Date Range.
    - **Site Visit Date Filter**: Filter by preset ranges or Custom Date Range.

## 3. Lead Details Page
- [x] **Lead Profile View**: Detailed page for a single lead (`/leads/[id]`).
    - **Hero Section**: Displays Company Name, ID, Created Date, Source, and Current Status.
    - **Lead Tagging**: Editable tag system (Hot Lead, Warm Lead, Cold Lead) with visual badges.
- [x] **Pipeline Visualization**:
    - Stepper component showing the lead's progress through the sales pipeline.
    - Visual distinction between completed, current, and upcoming stages.
- [x] **Information Cards**:
    - **Business Info**: Type, Location, Source, Lead Date.
    - **Contact Info**: Name, Phone, Email, Preferred Method.
    - **Commercial Info**: Estimated Value, Owner/Role.
    - **Requirement Snapshot**: Order Type, Use Case, Volume, Timeline.

## 4. Lead Workflow Actions
- [x] **Schedule Follow-up**:
    - Modal to set Next Follow-up Date and add Notes.
    - Updates the "Follow-up" section on the details page.
- [x] **Schedule Site Visit**:
    - Modal to schedule a visit (Date, Notes).
    - Tracks "Scheduled" and "Completed" status.
- [x] **Send Quotation**:
    - Modal to record a sent quotation (Amount).
    - Updates "Quotation" section with Amount and Date Sent.
- [x] **Update Customer Status**:
    - Dropdown to track interest level (Interested, In Future, Not Interested).
- [x] **Mark as Won**:
    - One-click action to move lead to "WON" stage.
- [x] **Mark as Lost**:
    - Modal to capture "Lost Reason" and "Feedback" before moving to "LOST" stage.

## 5. Backend Integration
- [x] **API Services**: Integration with `api/v1/leads` endpoints.
    - `GET /kanban`: Fetch leads for dashboard.
    - `POST /create`: Create new lead.
    - `PATCH /:id`: Update lead details.
    - `DELETE /:id`: Delete lead.
    - `POST /:id/follow-up`: Schedule follow-up.
    - `POST /:id/site-visit`: Schedule site visit.
    - `POST /:id/quotation`: Record quotation.
    - `PATCH /:id/won`: Mark as Won.
    - `PATCH /:id/lost`: Mark as Lost.
