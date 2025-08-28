import { pgTable, text, serial, integer, boolean, timestamp, jsonb, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table with additional admin-related fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"), // Made nullable for OAuth users
  roles: text("roles").array().notNull().default(["owner", "client"]),
  // OAuth fields
  googleId: text("google_id").unique(),
  facebookId: text("facebook_id").unique(),
  appleId: text("apple_id").unique(),
  authProvider: text("auth_provider", { enum: ["local", "google", "facebook", "apple"] }).notNull().default("local"),
  // User status field for admin banning functionality
  status: text("status", { enum: ["active", "banned", "suspended"] }).notNull().default("active"),
  // Reason for ban/suspension
  statusReason: text("status_reason"),
  // When the status was last updated
  statusUpdatedAt: timestamp("status_updated_at"),
  // Which admin made the last status change
  statusUpdatedBy: integer("status_updated_by"),
  // Secret Corners access fields
  secretCornersAccess: text("secret_corners_access", { 
    enum: ["not_applied", "pending", "approved", "rejected"] 
  }).notNull().default("not_applied"),
  secretCornersApplication: text("secret_corners_application"), // Why they want access
  secretCornersAppliedAt: timestamp("secret_corners_applied_at"),
  secretCornersApprovedAt: timestamp("secret_corners_approved_at"),
  secretCornersApprovedBy: integer("secret_corners_approved_by"),
  secretCornersRejectionReason: text("secret_corners_rejection_reason"),
  // Add new profile fields
  profileImage: text("profile_image"),
  bio: text("bio"),
  location: text("location"),
  phoneNumber: text("phone_number"),
  email: text("email"),
  phone: text("phone"), // Alternate field name for client-side consistency
  termsAccepted: boolean("terms_accepted").default(false),
  // Track when user joined
  createdAt: timestamp("created_at").notNull().defaultNow(),
  // Secret Corners subscription fields
  secretCornersSubscriptionTier: text("secret_corners_subscription_tier", {
    enum: ["none", "wanderer", "explorer", "architect"]
  }).notNull().default("none"),
  secretCornersSubscriptionStatus: text("secret_corners_subscription_status", {
    enum: ["inactive", "active", "cancelled", "past_due"]
  }).notNull().default("inactive"),
  secretCornersSubscriptionStartedAt: timestamp("secret_corners_subscription_started_at"),
  secretCornersSubscriptionEndsAt: timestamp("secret_corners_subscription_ends_at"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripeConnectAccountId: text("stripe_connect_account_id"),
  w9FormUrl: text("w9_form_url"),
  w9UploadedAt: timestamp("w9_uploaded_at"),
  // Notification preferences
  notificationPreferences: jsonb("notification_preferences").default({
    email: {
      bookingRequests: true,
      messages: true,
      marketing: false
    },
    text: {
      bookingRequests: true,
      messages: true,
      marketing: false
    }
  }),
  // Response time tracking fields
  totalResponseTime: integer("total_response_time").default(0), // Total response time in minutes
  responseCount: integer("response_count").default(0), // Number of responses tracked
  averageResponseTime: integer("average_response_time"), // Average response time in minutes
  lastCalculatedAt: timestamp("last_calculated_at"), // When metrics were last calculated
  // IP tracking fields
  lastLoginIp: text("last_login_ip"),
  lastLoginAt: timestamp("last_login_at"),
  // Identity verification fields (Stripe Identity)
  identityVerificationStatus: text("identity_verification_status", {
    enum: ["not_started", "pending", "verified", "failed", "expired"]
  }).notNull().default("not_started"),
  identityVerificationSessionId: text("identity_verification_session_id"),
  identityVerifiedAt: timestamp("identity_verified_at"),
  identityVerificationMethod: text("identity_verification_method"), // document, selfie, etc.
  identityVerificationFailureReason: text("identity_verification_failure_reason"),
  // Editor permissions - controls which admin tabs they can access
  editorPermissions: jsonb("editor_permissions").default({
    users: false,
    locations: false,
    bookings: false,
    spotlight: false,
    secretCorners: false,
    blog: false,
    conversations: false,
    concierge: false,
    logs: false,
    analytics: false,
    reports: false
  }),
});

// Location folders for saved locations
export const locationFolders = pgTable("location_folders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Add new saved_locations table
export const savedLocations = pgTable("saved_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  locationId: integer("location_id").notNull(),
  folderId: integer("folder_id").references(() => locationFolders.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  images: text("images").array().notNull().default([]),
  videos: text("videos").array().notNull().default([]),
  address: text("address").notNull(),
  country: text("country").default("USA").notNull(), // Country field with default USA
  amenities: text("amenities").array().notNull(),
  propertyType: text("property_type").notNull(),
  category: text("category").notNull().default('photo-studio'), // Add default value
  size: integer("size").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  incrementalRate: integer("incremental_rate").notNull(),
  cancellationPolicy: text("cancellation_policy").notNull(),
  latitude: text("latitude"),
  longitude: text("longitude"),
  instantBooking: boolean("instant_booking").notNull().default(false),
  bookingBuffer: integer("booking_buffer").notNull().default(0), // Buffer time in minutes between bookings
  minHours: integer("min_hours").notNull().default(1),
  imageTags: jsonb("image_tags").array().default([]),  // New field to store tags for each image
  metadata: text("metadata"),  // New field to store visual features and AI analysis
  // Admin approval fields
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  statusReason: text("status_reason"),
  statusUpdatedAt: timestamp("status_updated_at"),
  statusUpdatedBy: integer("status_updated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(), // Add explicit created timestamp
  // Location Rules and Questions
  prohibitedItems: text("prohibited_items").array().default([]),
  locationRules: text("location_rules").array().default([]),
  faqs: jsonb("faqs").default([]), // Array of {question: string, answer: string}
  checkInInstructions: text("check_in_instructions"),
  equipmentRentalAvailable: boolean("equipment_rental_available").default(false),
  // DEPRECATED - Group size pricing: {mediumGroup: number, largeGroup: number}
  groupSizePricing: jsonb("group_size_pricing").default({}),
  // Additional fees: Array of {name: string, amount: number, type: 'fixed' | 'percentage', description?: string}
  additionalFees: jsonb("additional_fees").default([]),
  // Availability settings: {blockedDates: string[]}
  availability: jsonb("availability").default({}),
  // Allowed activities for the location
  allowedActivities: text("allowed_activities").array().notNull().default([]),
  // Enabled activities (subset of allowed activities that are currently active)
  enabledActivities: text("enabled_activities").array().notNull().default([]),
  // DEPRECATED - Activity-based pricing (percentage): {photo: number, video: number, event: number, meeting: number}
  activityPricing: jsonb("activity_pricing").default({}),
  // NEW: Simple pricing matrix - flat hourly rates for each activity and group size combination
  // Structure: { "photo_small": 150, "photo_medium": 200, "photo_large": 250, "event_small": 180, ... }
  pricingMatrix: jsonb("pricing_matrix").default({}),
  // Enabled group sizes for this location (small is always required)
  // Possible values: ["small", "medium", "large", "extraLarge"]
  enabledGroupSizes: text("enabled_group_sizes").array().notNull().default(["small"]),
  // House style for residential properties
  houseStyle: text("house_style"),
  // Property features (hierarchical categories and subcategories)
  propertyFeatures: jsonb("property_features").default([]),
  // Accessibility data for parking and access information
  accessibilityData: jsonb("accessibility_data").default({
    parking: {
      onsiteParking: false,
      onsiteSpaces: null,
      adaAccessible: false,
      evCharging: false,
      coveredGarage: false,
      gatedSecured: false,
      heightClearance: null,
      valetService: false,
      twentyFourSeven: false,
      nearbyPaidLot: false,
      loadingZone: false,
      streetParking: false,
      busCoachParking: false,
      basecampCrewArea: false,
      pullThrough: false,
      levelSurface: false,
      overnightAllowed: false,
      shorePower: false,
      waterSewer: false,
      trailerStorage: false
    },
    access: {
      elevator: false,
      stairs: false,
      streetLevel: false,
      wheelchairAccess: false,
      freightElevator: false,
      stepFreeRamp: false,
      loadingDock: false,
      rollUpDoor: false,
      rollUpDoorDimensions: null,
      doubleWideDoors: false,
      doubleWideWidth: null,
      driveInAccess: false,
      corridorMinWidth: false,
      corridorWidth: null,
      freightElevatorCapacity: false,
      elevatorCapacity: null,
      elevatorCabSize: null,
      keylessEntry: false,
      onSiteSecurity: false,
      dolliesAvailable: false
    }
  }),
});

export const addons = pgTable("addons", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  priceUnit: text("price_unit").notNull().default("hour"),
  active: boolean("active").notNull().default(true),
});

// Google Calendar integration for locations
export const locationCalendarIntegrations = pgTable("location_calendar_integrations", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().unique(),
  ownerId: integer("owner_id").notNull(),
  googleCalendarId: text("google_calendar_id"),
  googleRefreshToken: text("google_refresh_token"),
  syncEnabled: boolean("sync_enabled").notNull().default(false),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookingAddons = pgTable("booking_addons", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  addonId: integer("addon_id").notNull(),
});

// Bookings table with modified fields and refund functionality
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  clientId: integer("client_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: integer("total_price").notNull(),
  status: text("status", { 
    enum: ["pending", "confirmed", "completed", "cancelled", "rejected", "payment_pending", "refund_pending", "refunded"] 
  }).notNull(),
  // New fields made nullable for existing records
  activityType: text("activity_type"),
  activity: text("activity"), // Specific activity description
  castAndCrew: text("cast_and_crew"), // Cast and crew size/details
  projectName: text("project_name"),
  renterCompany: text("renter_company"),
  projectDescription: text("project_description"),
  guestCount: integer("guest_count"),
  paymentId: text("payment_id"),
  // Refund related fields
  refundAmount: integer("refund_amount"),
  refundReason: text("refund_reason"),
  refundRequestedBy: integer("refund_requested_by"),
  refundRequestedAt: timestamp("refund_requested_at"),
  refundProcessedBy: integer("refund_processed_by"),
  refundProcessedAt: timestamp("refund_processed_at"),
  // Admin modification tracking
  lastEditedBy: integer("last_edited_by"),
  lastEditedAt: timestamp("last_edited_at"),
});

// Table to track booking edit history
export const bookingEditHistory = pgTable("booking_edit_history", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  editorId: integer("editor_id").notNull(),
  editedAt: timestamp("edited_at").notNull().defaultNow(),
  previousData: jsonb("previous_data").notNull(),
  newData: jsonb("new_data").notNull(),
  reason: text("reason"),
  notifiedClient: boolean("notified_client").notNull().default(false),
});

// Table to track location edit history
export const locationEditHistory = pgTable("location_edit_history", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  editorId: integer("editor_id").notNull(), // User who made the change
  editedAt: timestamp("edited_at").notNull().defaultNow(),
  changedFields: text("changed_fields").array().notNull(), // Array of field names that were changed
  previousData: jsonb("previous_data").notNull(), // Previous values
  newData: jsonb("new_data").notNull(), // New values
  editType: text("edit_type", { enum: ["update", "status_change", "creation", "update_pending_review", "booking_options_update", "calendar_update", "addon_create", "addon_update", "addon_delete"] }).notNull(),
  reason: text("reason"), // Optional reason for the change
  ipAddress: text("ip_address"), // Track IP for security
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull(),
  userId: integer("user_id").notNull(), // User who left the review
  locationId: integer("location_id").notNull(), // Location being reviewed
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  photos: text("photos").array().default([]), // Optional photos with review
  helpful: integer("helpful").default(0), // Number of users who found this review helpful
  response: text("response"), // Location owner's response to review
  responseDate: timestamp("response_date"), // When the owner responded
  reviewType: text("review_type", { enum: ["guest_to_host", "host_to_guest"] }).notNull(), // Who is reviewing whom
});

// Track review requirements for completed bookings
export const reviewRequirements = pgTable("review_requirements", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().unique(),
  guestReviewCompleted: boolean("guest_review_completed").notNull().default(false),
  hostReviewCompleted: boolean("host_review_completed").notNull().default(false),
  completedAt: timestamp("completed_at").notNull(), // When booking was completed
  remindersSent: integer("reminders_sent").notNull().default(0),
  lastReminderSent: timestamp("last_reminder_sent"),
});

// Add archive field to messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  locationId: integer("location_id").notNull(),
  bookingId: integer("booking_id"),
  read: boolean("read").notNull().default(false),
  archived: boolean("archived").notNull().default(false),
  imageUrl: text("image_url"), // Field to store the URL of an attached image
  metadata: jsonb("metadata"),
  responseTime: integer("response_time"), // Response time in minutes if this is a response
});

// Track message conversations for response time calculation
export const messageConversations = pgTable("message_conversations", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  clientId: integer("client_id").notNull(),
  hostId: integer("host_id").notNull(),
  firstMessageId: integer("first_message_id").notNull(),
  firstMessageTime: timestamp("first_message_time").notNull(),
  firstResponseId: integer("first_response_id"),
  firstResponseTime: timestamp("first_response_time"),
  responseTimeMinutes: integer("response_time_minutes"),
  conversationStatus: text("conversation_status", { enum: ["pending", "responded", "no_response"] }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Content moderation alerts for messages
export const contentModerationAlerts = pgTable("content_moderation_alerts", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull(),
  senderId: integer("sender_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  locationId: integer("location_id").notNull(),
  violationType: text("violation_type", { enum: ["phone", "email", "both"] }).notNull(),
  detectedPatterns: text("detected_patterns").array().notNull(),
  confidence: integer("confidence").notNull(),
  originalContentHash: text("original_content_hash"),
  resolved: boolean("resolved").notNull().default(false),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Type exports for content moderation
export type ContentModerationAlert = typeof contentModerationAlerts.$inferSelect;
export type InsertContentModerationAlert = z.infer<typeof insertContentModerationAlertSchema>;

// Create insert schemas
export const insertContentModerationAlertSchema = createInsertSchema(contentModerationAlerts).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  profileImage: true,
  bio: true,
  location: true,
  phoneNumber: true,
  email: true,
  phone: true,
  termsAccepted: true,
}).extend({
  phoneNumber: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions"
  }),
});

// Schema for Secret Corners application
export const secretCornersApplicationSchema = z.object({
  application: z.string().min(50, "Please provide a detailed explanation of at least 50 characters").max(1000, "Application must not exceed 1000 characters"),
});

export const insertLocationSchema = createInsertSchema(locations);
export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  // Remove status to let server determine it based on instant booking
  status: true,
}).extend({
  addons: z.array(z.number()),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  activityType: z.string().min(1, "Activity type is required"),
  activity: z.string().min(1, "Activity description is required"),
  castAndCrew: z.string().min(1, "Cast & crew information is required"),
  projectName: z.string().min(1, "Project name is required"),
  renterCompany: z.string().min(1, "Renter/Company name is required"),
  projectDescription: z.string().min(1, "Project description is required"),
  guestCount: z.number().optional(),
  paymentId: z.string().optional(),
});
export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  helpful: true,
  response: true,
  responseDate: true,
  userId: true, // userId is set by the server from authenticated session
}).extend({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, "Please provide a more detailed review").max(2000),
  photos: z.array(z.string()).optional(),
  reviewType: z.enum(["guest_to_host", "host_to_guest"]),
});

export const insertReviewRequirementSchema = createInsertSchema(reviewRequirements).omit({
  id: true,
});
export const insertAddonSchema = createInsertSchema(addons).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  read: true,
  archived: true,
  responseTime: true,
}).extend({
  senderId: z.number().optional(), // Make senderId optional as it will be set by the server
  receiverId: z.number(),
  locationId: z.number(),
  content: z.string().default(""), // Allow empty content when image is provided
  bookingId: z.number().optional(),
  imageUrl: z.string().optional(), // Optional image URL for attached images
  metadata: z
    .object({
      type: z.literal('booking_request'),
      details: z.object({
        date: z.string(),
        time: z.string(),
        isFlexible: z.boolean(),
        activity: z.string(),
        attendees: z.string(),
        locationTitle: z.string(),
      }),
    })
    .optional(),
});

// Add BookingEditHistory insert schema
export const insertBookingEditHistorySchema = createInsertSchema(bookingEditHistory).omit({
  id: true,
  editedAt: true,
}).extend({
  previousData: z.record(z.any()),
  newData: z.record(z.any()),
  reason: z.string().min(3, "Reason is required").max(500),
  notifiedClient: z.boolean().default(true),
});

// Add LocationEditHistory insert schema
export const insertLocationEditHistorySchema = createInsertSchema(locationEditHistory).omit({
  id: true,
  editedAt: true,
}).extend({
  changedFields: z.array(z.string()),
  previousData: z.record(z.any()),
  newData: z.record(z.any()),
  editType: z.enum(["update", "status_change", "creation", "update_pending_review", "booking_options_update", "calendar_update", "addon_create", "addon_update", "addon_delete"]),
  reason: z.string().optional(),
  ipAddress: z.string().optional(),
});

// Add insert schema for location folders
export const insertLocationFolderSchema = createInsertSchema(locationFolders).omit({
  id: true,
  createdAt: true,
});

// Add new insert schema for saved locations
export const insertSavedLocationSchema = createInsertSchema(savedLocations).omit({
  id: true,
  createdAt: true,
});

// Add insert schema for message conversations
export const insertMessageConversationSchema = createInsertSchema(messageConversations).omit({
  id: true,
  createdAt: true,
});

// Spotlight/Featured Locations table
export const spotlightLocations = pgTable("spotlight_locations", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  spotlightOrder: integer("spotlight_order").notNull().default(0),
  city: text("city"), // Target city for this spotlight (null = global)
  priority: integer("priority").notNull().default(1), // Higher number = higher priority for same city
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by").notNull(), // Admin who added this location to spotlight
});

// Concierge requests table
export const conciergeRequests = pgTable("concierge_requests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  locationType: text("location_type").notNull(),
  eventType: text("event_type").notNull(),
  budget: integer("budget"),
  dateNeeded: text("date_needed"),
  preferredContactMethod: text("preferred_contact_method", { 
    enum: ["email", "phone"] 
  }).notNull().default("email"),
  description: text("description").notNull(),
  status: text("status", { 
    enum: ["pending", "in_progress", "responded", "closed"] 
  }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  assignedTo: integer("assigned_to"), // Admin user ID
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  respondedAt: timestamp("responded_at"),
});

// Create insert schema for concierge requests
export const insertConciergeRequestSchema = createInsertSchema(conciergeRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  adminNotes: true,
  assignedTo: true,
  respondedAt: true,
});

// Support emails table
export const supportEmails = pgTable("support_emails", {
  id: serial("id").primaryKey(),
  referenceId: text("reference_id").notNull().unique(), // Unique reference ID like "SUP-2025-00001"
  userId: integer("user_id"), // Optional - for logged in users
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"), // Optional phone number
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  category: text("category", {
    enum: ["general", "technical", "billing", "account", "booking", "other"]
  }).notNull().default("general"),
  status: text("status", {
    enum: ["open", "in_progress", "resolved", "closed"]
  }).notNull().default("open"),
  priority: text("priority", {
    enum: ["low", "medium", "high", "urgent"]
  }).notNull().default("medium"),
  adminNotes: text("admin_notes"),
  assignedTo: integer("assigned_to"), // Admin user ID
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: integer("resolved_by"), // Admin user ID who resolved it
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create insert schema for support emails
export const insertSupportEmailSchema = createInsertSchema(supportEmails).omit({
  id: true,
  referenceId: true, // Auto-generated, so exclude from insert
  createdAt: true,
  updatedAt: true,
  status: true,
  priority: true,
  adminNotes: true,
  assignedTo: true,
  resolvedAt: true,
  resolvedBy: true,
});

// Export types
// Create insert schema for spotlight locations
export const insertSpotlightLocationSchema = createInsertSchema(spotlightLocations).omit({
  id: true,
  createdAt: true,
}).extend({
  locationId: z.number(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  spotlightOrder: z.number().default(0),
  city: z.string().optional(),
  priority: z.number().default(1),
  createdBy: z.number(),
});

export type User = typeof users.$inferSelect;
export type Location = typeof locations.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type ReviewRequirement = typeof reviewRequirements.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type MessageConversation = typeof messageConversations.$inferSelect;
export type Addon = typeof addons.$inferSelect;
export type BookingAddon = typeof bookingAddons.$inferSelect;
export type BookingEditHistory = typeof bookingEditHistory.$inferSelect;
export type LocationEditHistory = typeof locationEditHistory.$inferSelect;
export type SpotlightLocation = typeof spotlightLocations.$inferSelect;
export type ConciergeRequest = typeof conciergeRequests.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type InsertReviewRequirement = z.infer<typeof insertReviewRequirementSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertMessageConversation = z.infer<typeof insertMessageConversationSchema>;
export type InsertAddon = z.infer<typeof insertAddonSchema>;
export type InsertBookingAddon = typeof bookingAddons;
export type InsertBookingEditHistory = z.infer<typeof insertBookingEditHistorySchema>;
export type InsertLocationEditHistory = z.infer<typeof insertLocationEditHistorySchema>;
export type InsertSpotlightLocation = z.infer<typeof insertSpotlightLocationSchema>;
export type InsertConciergeRequest = z.infer<typeof insertConciergeRequestSchema>;


// User reports table
export const userReports = pgTable("user_reports", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull(),
  reportedUserId: integer("reported_user_id").notNull(),
  reason: text("reason", { 
    enum: ["inappropriate_content", "spam", "scam", "harassment", "fake_profile", "other"] 
  }).notNull(),
  details: text("details").notNull(),
  status: text("status", { 
    enum: ["pending", "reviewing", "resolved", "dismissed"] 
  }).notNull().default("pending"),
  adminNotes: text("admin_notes"),
  resolvedBy: integer("resolved_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Site settings table for global settings like maintenance mode
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedBy: integer("updated_by"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Admin action logs table
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(), // 'user', 'location', 'booking', etc.
  targetId: integer("target_id").notNull(),
  details: jsonb("details").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create insert schema for user reports
export const insertUserReportSchema = createInsertSchema(userReports).omit({
  id: true,
  createdAt: true,
  status: true,
  adminNotes: true,
  resolvedBy: true,
  resolvedAt: true,
});

// Create insert schema for admin logs
export const insertAdminLogSchema = createInsertSchema(adminLogs).omit({
  id: true,
  createdAt: true,
});

// Create insert schema for site settings
export const insertSiteSettingSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



// User notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type", { 
    enum: ["location_approved", "location_rejected", "booking_request", "booking_approved", 
           "booking_rejected", "booking_cancelled", "message_received", "admin_message",
           "booking_refunded", "location_spotlighted", "review_received", "review_reminder",
           "review_response", "secret_location_approved", "secret_location_rejected",
           "secret_corners_application_approved", "secret_corners_application_rejected",
           "forum_post_reply", "challenge_winner", "forum_post_liked", "custom_offer_received",
           "custom_offer_accepted", "custom_offer_refused"] 
  }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  relatedId: integer("related_id"), // ID of related item (booking, location, etc.)
  relatedType: text("related_type"), // Type of related item ('booking', 'location', 'spotlight', etc.)
  actionUrl: text("action_url"), // Optional URL for notification action
});

// Create insert schema for notifications
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Forum categories for Secret Corners community discussions
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Forum posts for Secret Corners community
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull().references(() => forumCategories.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  views: integer("views").notNull().default(0),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// Forum comments for post replies
export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => forumPosts.id, { onDelete: 'cascade' }),
  userId: integer("user_id").notNull(),
  parentId: integer("parent_id"), // We'll add the self-reference after the table is defined
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at"),
});

// User likes for forum posts and comments
export const forumLikes = pgTable("forum_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  itemType: text("item_type", { enum: ["post", "comment"] }).notNull(),
  itemId: integer("item_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Weekly challenges for community engagement
export const weeklyChallenge = pgTable("weekly_challenges", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").notNull(),
  winningLocationId: integer("winning_location_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Challenge entries linked to secret locations
export const challengeEntries = pgTable("challenge_entries", {
  id: serial("id").primaryKey(),
  challengeId: integer("challenge_id").notNull().references(() => weeklyChallenge.id, { onDelete: 'cascade' }),
  locationId: integer("location_id").notNull(), // Reference will be added later
  userId: integer("user_id").notNull(),
  description: text("description"),
  isWinner: boolean("is_winner").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Secret Corners applications table
export const secretCornersApplications = pgTable("secret_corners_applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  location: text("location").notNull(), // Where they live
  motivation: text("motivation").notNull(), // Why they want to join
  contribution: text("contribution").notNull(), // What they can bring to community
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  reviewedBy: integer("reviewed_by"), // Admin who reviewed
  reviewedAt: timestamp("reviewed_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Secret location tags
export const secretLocationTags = pgTable("secret_location_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Junction table for location-tag relationship
export const secretLocationTagMap = pgTable("secret_location_tag_map", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull(), // Reference will be added later
  tagId: integer("tag_id").notNull().references(() => secretLocationTags.id, { onDelete: 'cascade' }),
});

// Secret locations table for user-submitted photography locations
export const secretLocations = pgTable("secret_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(), // The address
  category: text("category").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  // Added coords field as JSON to easily store [lat, lng] array for Leaflet compatibility
  coords: jsonb("coords"),
  mainImage: text("main_image").notNull(),
  additionalImages: text("additional_images").array(),
  bestTimeOfDay: text("best_time_of_day"),
  recommendedEquipment: text("recommended_equipment"),
  compositionTip: text("composition_tip"),
  comments: integer("comments").notNull().default(0),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  statusReason: text("status_reason"),
  statusUpdatedAt: timestamp("status_updated_at"),
  statusUpdatedBy: integer("status_updated_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});



// Create insert schema for secret locations with additional coord field
export const insertSecretLocationSchema = createInsertSchema(secretLocations)
  .extend({
    coords: z.array(z.number()).optional(),
  })
  .omit({
    id: true,
    createdAt: true,
    statusUpdatedAt: true,
    statusUpdatedBy: true,
    status: true,
    statusReason: true,
    comments: true,
  });

// Add insert schema for location calendar integrations
export const insertLocationCalendarIntegrationSchema = createInsertSchema(locationCalendarIntegrations).omit({
  id: true,
  lastSyncedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Add new types
export type LocationFolder = typeof locationFolders.$inferSelect & {
  description?: string | null;
  color?: string;
  icon?: string;
  updatedAt?: Date;
};
export type InsertLocationFolder = z.infer<typeof insertLocationFolderSchema>;
export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = z.infer<typeof insertSavedLocationSchema>;
export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type SecretLocation = typeof secretLocations.$inferSelect;
export type InsertSecretLocation = z.infer<typeof insertSecretLocationSchema>;
export type UserReport = typeof userReports.$inferSelect;
export type InsertUserReport = z.infer<typeof insertUserReportSchema>;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = z.infer<typeof insertSiteSettingSchema>;
export type LocationCalendarIntegration = typeof locationCalendarIntegrations.$inferSelect;
export type InsertLocationCalendarIntegration = z.infer<typeof insertLocationCalendarIntegrationSchema>;

// New types for forum and challenges
export type ForumCategory = typeof forumCategories.$inferSelect;
export type ForumPost = typeof forumPosts.$inferSelect;
export type ForumComment = typeof forumComments.$inferSelect;
export type ForumLike = typeof forumLikes.$inferSelect;
export type WeeklyChallenge = typeof weeklyChallenge.$inferSelect;
export type ChallengeEntry = typeof challengeEntries.$inferSelect;
export type SecretLocationTag = typeof secretLocationTags.$inferSelect;

// Create insert schemas for new types
export const insertForumCategorySchema = createInsertSchema(forumCategories).omit({
  id: true,
  createdAt: true,
});
export const insertForumPostSchema = createInsertSchema(forumPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
  views: true,
  isPinned: true,
  isLocked: true,
});
export const insertForumCommentSchema = createInsertSchema(forumComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  likes: true,
});
export const insertForumLikeSchema = createInsertSchema(forumLikes).omit({
  id: true,
  createdAt: true,
});
export const insertWeeklyChallengeSchema = createInsertSchema(weeklyChallenge).omit({
  id: true,
  createdAt: true,
  winningLocationId: true,
});
export const insertChallengeEntrySchema = createInsertSchema(challengeEntries).omit({
  id: true,
  createdAt: true,
  isWinner: true,
});
export const insertSecretLocationTagSchema = createInsertSchema(secretLocationTags).omit({
  id: true,
  createdAt: true,
});
export const insertSecretLocationTagMapSchema = createInsertSchema(secretLocationTagMap).omit({
  id: true,
});
export const insertSecretCornersApplicationSchema = createInsertSchema(secretCornersApplications).omit({
  id: true,
  createdAt: true,
  status: true,
  reviewedBy: true,
  reviewedAt: true,
  rejectionReason: true,
});

// Export insert types for new models
export type InsertForumCategory = z.infer<typeof insertForumCategorySchema>;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;
export type InsertForumLike = z.infer<typeof insertForumLikeSchema>;
export type InsertWeeklyChallenge = z.infer<typeof insertWeeklyChallengeSchema>;
export type InsertChallengeEntry = z.infer<typeof insertChallengeEntrySchema>;
export type InsertSecretLocationTag = z.infer<typeof insertSecretLocationTagSchema>;
export type InsertSecretLocationTagMap = z.infer<typeof insertSecretLocationTagMapSchema>;
export type SecretCornersApplication = typeof secretCornersApplications.$inferSelect;
export type InsertSecretCornersApplication = z.infer<typeof insertSecretCornersApplicationSchema>;
export type SupportEmail = typeof supportEmails.$inferSelect;
export type InsertSupportEmail = z.infer<typeof insertSupportEmailSchema>;

export type MessageWithMetadata = Message & {
  senderName?: string;
  receiverName?: string;
  senderImage?: string;
  receiverImage?: string;
  metadata?: {
    type: 'booking_request';
    details: {
      date: string;
      time: string;
      isFlexible: boolean;
      activity: string;
      attendees: string;
      locationTitle: string;
    };
  };
};

// Email System Tables

// Email Templates with role-specific variations
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  type: text("type", { 
    enum: ["welcome", "password_reset", "booking_confirmation", "booking_approval", "booking_cancellation", "booking_update", "new_message", "booking_request"]
  }).notNull(),
  recipientRole: text("recipient_role", { 
    enum: ["user", "host", "admin"] 
  }).notNull(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  htmlContent: text("html_content"),
  textContent: text("text_content"),
  variables: jsonb("variables").default([]),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email Events for tracking
export const emailEvents = pgTable("email_events", {
  id: serial("id").primaryKey(),
  messageId: text("message_id").notNull().unique(),
  userId: integer("user_id"),
  recipientEmail: text("recipient_email").notNull(),
  templateName: text("template_name"),
  subject: text("subject"),
  status: text("status", { 
    enum: ["queued", "sent", "delivered", "opened", "clicked", "bounced", "complained", "failed"] 
  }).notNull().default("queued"),
  metadata: jsonb("metadata"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  clickedAt: timestamp("clicked_at"),
  bouncedAt: timestamp("bounced_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketing Subscriptions
export const marketingSubscriptions = pgTable("marketing_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  email: text("email").notNull().unique(),
  status: text("status", { 
    enum: ["subscribed", "unsubscribed", "cleaned", "pending"] 
  }).notNull().default("pending"),
  source: text("source"), // signup, import, manual
  tags: text("tags").array().default([]),
  doubleOptInToken: text("double_opt_in_token"),
  doubleOptInAt: timestamp("double_opt_in_at"),
  unsubscribedAt: timestamp("unsubscribed_at"),
  unsubscribeReason: text("unsubscribe_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email Campaigns
export const emailCampaigns = pgTable("email_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  templateId: integer("template_id"),
  segmentCriteria: jsonb("segment_criteria"),
  status: text("status", { 
    enum: ["draft", "scheduled", "sending", "sent", "cancelled"] 
  }).notNull().default("draft"),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  bounceCount: integer("bounce_count").default(0),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Email Preferences
export const userEmailPreferences = pgTable("user_email_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  transactional: jsonb("transactional").default({
    bookingConfirmation: true,
    bookingUpdate: true,
    messageReceived: true,
    passwordReset: true,
    accountUpdate: true,
  }),
  marketing: jsonb("marketing").default({
    newsletter: false,
    promotions: false,
    productUpdates: false,
    tips: false,
  }),
  frequency: text("frequency", { 
    enum: ["immediate", "daily", "weekly", "never"] 
  }).notNull().default("immediate"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email Suppression List
export const emailSuppressionList = pgTable("email_suppression_list", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  reason: text("reason", { 
    enum: ["bounce", "complaint", "unsubscribe", "manual"] 
  }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Password Reset Tokens
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Email Verification Tokens
export const emailVerificationTokens = pgTable("email_verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  email: text("email").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Guide Categories
export const guideCategories = pgTable("guide_categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  image: text("image"),
  orderIndex: integer("order_index").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Guides
export const guides = pgTable("guides", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => guideCategories.id, { onDelete: "cascade" }),
  author: text("author"),
  coverImage: text("cover_image"),
  difficulty: text("difficulty", { enum: ["Beginner", "Intermediate", "Advanced"] }).default("Beginner"),
  timeToRead: integer("time_to_read").default(5),
  featured: boolean("featured").default(false),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create insert schemas for email tables
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailEventSchema = createInsertSchema(emailEvents).omit({
  id: true,
  createdAt: true,
});

export const insertMarketingSubscriptionSchema = createInsertSchema(marketingSubscriptions).omit({
  id: true,
  createdAt: true,
});

export const insertEmailCampaignSchema = createInsertSchema(emailCampaigns).omit({
  id: true,
  createdAt: true,
});

export const insertUserEmailPreferencesSchema = createInsertSchema(userEmailPreferences).omit({
  id: true,
  updatedAt: true,
});

export const insertEmailSuppressionListSchema = createInsertSchema(emailSuppressionList).omit({
  id: true,
  createdAt: true,
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
  id: true,
  createdAt: true,
});

export const insertEmailVerificationTokenSchema = createInsertSchema(emailVerificationTokens).omit({
  id: true,
  createdAt: true,
});

// Create insert schemas for guides
export const insertGuideCategorySchema = createInsertSchema(guideCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

// Export types for guides
export type GuideCategory = typeof guideCategories.$inferSelect;
export type InsertGuideCategory = z.infer<typeof insertGuideCategorySchema>;
export type Guide = typeof guides.$inferSelect;
export type InsertGuide = z.infer<typeof insertGuideSchema>;

// Export types for email system
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailEvent = typeof emailEvents.$inferSelect;
export type InsertEmailEvent = z.infer<typeof insertEmailEventSchema>;
export type MarketingSubscription = typeof marketingSubscriptions.$inferSelect;
export type InsertMarketingSubscription = z.infer<typeof insertMarketingSubscriptionSchema>;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type InsertEmailCampaign = z.infer<typeof insertEmailCampaignSchema>;
export type UserEmailPreferences = typeof userEmailPreferences.$inferSelect;
export type InsertUserEmailPreferences = z.infer<typeof insertUserEmailPreferencesSchema>;
export type EmailSuppressionList = typeof emailSuppressionList.$inferSelect;
export type InsertEmailSuppressionList = z.infer<typeof insertEmailSuppressionListSchema>;
export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = z.infer<typeof insertPasswordResetTokenSchema>;
export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = z.infer<typeof insertEmailVerificationTokenSchema>;

// Add the references that we couldn't add earlier due to circular dependencies
// These function calls need to be after all table definitions
export const addCrossReferences = () => {
  // Add self-reference for forum comments (for threaded replies)
  forumComments.references(() => ({ foreignKey: forumComments.parentId, table: forumComments.id, onDelete: 'set null' }));
  
  // Add references to secretLocations table
  secretLocationTagMap.references(() => ({ foreignKey: secretLocationTagMap.locationId, table: secretLocations.id, onDelete: 'cascade' }));
  challengeEntries.references(() => ({ foreignKey: challengeEntries.locationId, table: secretLocations.id, onDelete: 'cascade' }));
};