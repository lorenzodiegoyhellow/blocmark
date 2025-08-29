import { users, locations, bookings, reviews, messages, messageConversations, contentModerationAlerts, addons, savedLocations, bookingAddons, bookingEditHistory, locationEditHistory, adminLogs, spotlightLocations, notifications, locationFolders, secretLocations, conciergeRequests, secretCornersApplications, userReports, locationCalendarIntegrations, siteSettings, supportEmails, forumCategories, forumPosts, forumComments, forumLikes, weeklyChallenge, challengeEntries, emailTemplates, emailEvents, marketingSubscriptions, emailCampaigns, userEmailPreferences, emailSuppressionList, passwordResetTokens, emailVerificationTokens, guideCategories, guides } from "@shared/schema";
import type { 
  User, Location, Booking, Review, Message, MessageConversation, ContentModerationAlert, Addon, InsertUser, InsertLocation, 
  InsertBooking, InsertReview, InsertMessage, InsertMessageConversation, InsertContentModerationAlert, InsertAddon, SavedLocation, 
  InsertSavedLocation, BookingEditHistory, InsertBookingEditHistory, LocationEditHistory, InsertLocationEditHistory,
  AdminLog, InsertAdminLog, SpotlightLocation, InsertSpotlightLocation,
  Notification, InsertNotification, LocationFolder, InsertLocationFolder,
  SecretLocation, InsertSecretLocation, SecretCornersApplication, InsertSecretCornersApplication,
  ConciergeRequest, InsertConciergeRequest, UserReport, InsertUserReport,
  LocationCalendarIntegration, InsertLocationCalendarIntegration, SiteSetting, InsertSiteSetting,
  SupportEmail, InsertSupportEmail,
  ForumCategory, ForumPost, ForumComment, ForumLike,
  InsertForumCategory, InsertForumPost, InsertForumComment, InsertForumLike,
  EmailTemplate, InsertEmailTemplate, EmailEvent, InsertEmailEvent,
  MarketingSubscription, InsertMarketingSubscription, EmailCampaign, InsertEmailCampaign,
  UserEmailPreferences, InsertUserEmailPreferences, EmailSuppressionList, InsertEmailSuppressionList,
  PasswordResetToken, InsertPasswordResetToken, EmailVerificationToken, InsertEmailVerificationToken,
  GuideCategory, InsertGuideCategory, Guide, InsertGuide,
  WeeklyChallenge, InsertWeeklyChallenge, ChallengeEntry, InsertChallengeEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, inArray, ne, gte, lte, lt, gt, count, asc, isNull, isNotNull, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IStorage {
  // Auth
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByFacebookId(facebookId: string): Promise<User | undefined>;
  getUserByAppleId(appleId: string): Promise<User | undefined>;
  linkOAuthProvider(userId: number, provider: 'google' | 'facebook' | 'apple', providerId: string): Promise<void>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updateData: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>; // Admin function to get all users

  // User Admin
  updateUserStatus(userId: number, status: "active" | "banned" | "suspended", reason: string, adminId: number): Promise<User>;
  getUsersByStatus(status: "active" | "banned" | "suspended"): Promise<User[]>;
  updateUserRoles(userId: number, roles: string[]): Promise<User>;
  updateUserEditorPermissions(userId: number, permissions: any): Promise<User>;
  
  // Secret Corners Access
  applyForSecretCornersAccess(userId: number, application: string): Promise<User>;
  getSecretCornersApplications(status: "pending" | "approved" | "rejected"): Promise<User[]>;
  updateSecretCornersAccessStatus(userId: number, status: "approved" | "rejected", reason: string, adminId: number): Promise<User>;
  hasSecretCornersAccess(userId: number): Promise<boolean>;
  
  // Secret Corners Subscription
  updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
  updateUserSecretCornersSubscription(userId: number, subscriptionData: {
    tier?: string;
    status?: string;
    stripeSubscriptionId?: string;
    startedAt?: Date;
    endsAt?: Date;
  }): Promise<User>;
  
  // Identity Verification (Stripe Identity)
  updateUserIdentityVerification(userId: number, verificationData: {
    status?: "not_started" | "pending" | "verified" | "failed" | "expired";
    sessionId?: string;
    verifiedAt?: Date;
    method?: string;
    failureReason?: string;
  }): Promise<User>;
  getUsersWithVerificationStatus(status: "not_started" | "pending" | "verified" | "failed" | "expired"): Promise<User[]>;
  
  // Secret Corners Applications
  createSecretCornersApplication(application: InsertSecretCornersApplication): Promise<SecretCornersApplication>;
  getSecretCornersApplication(userId: number): Promise<SecretCornersApplication | undefined>;
  getUserSecretCornersApplications(): Promise<SecretCornersApplication[]>;
  getSecretCornersApplicationsByStatus(status: "pending" | "approved" | "rejected"): Promise<SecretCornersApplication[]>;
  updateSecretCornersApplication(id: number, status: "approved" | "rejected" | "pending", reviewedBy: number, rejectionReason?: string): Promise<SecretCornersApplication>;
  deleteSecretCornersApplication(userId: number): Promise<void>;
  
  // Direct SQL execution for debugging
  executeRawQuery(query: string, params?: any[]): Promise<any[]>;

  // Locations
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  createLocation(location: InsertLocation): Promise<Location>;
  getLocationsByOwner(ownerId: number, pagination?: PaginationParams): Promise<PaginatedResult<Location>>;
  deleteLocation(id: number): Promise<void>;
  updateLocation(id: number, updateData: Partial<Location>): Promise<Location>;
  
  // Location Admin
  getLocationsByStatus(status: "pending" | "approved" | "rejected"): Promise<Location[]>;
  updateLocationStatus(locationId: number, status: "pending" | "approved" | "rejected", reason: string, adminId: number): Promise<Location>;
  
  // Location Edit History
  createLocationEditHistory(history: InsertLocationEditHistory): Promise<LocationEditHistory>;
  getLocationEditHistory(locationId: number): Promise<LocationEditHistory[]>;
  trackLocationUpdate(locationId: number, editorId: number, previousData: any, newData: any, changedFields: string[], editType: "update" | "status_change" | "creation", reason?: string, ipAddress?: string): Promise<LocationEditHistory>;

  // Add-ons
  getLocationAddons(locationId: number): Promise<Addon[]>;
  createAddon(addon: InsertAddon): Promise<Addon>;
  updateAddon(id: number, updateData: Partial<Addon>): Promise<Addon>;
  deleteAddon(id: number): Promise<void>;
  getBookingAddons(bookingId: number): Promise<Addon[]>;
  addBookingAddons(bookingId: number, addonIds: number[]): Promise<void>;
  removeBookingAddons(bookingId: number, addonIds: number[]): Promise<void>;
  updateBookingAddons(bookingId: number, addonIds: number[]): Promise<void>;

  // Bookings
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByPaymentId(paymentId: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updateData: Partial<Booking>): Promise<Booking>;
  cancelBooking(id: number, cancelledBy?: number): Promise<void>;
  getUserBookings(userId: number, pagination?: PaginationParams): Promise<PaginatedResult<Booking>>;
  getLocationBookings(locationId: number, pagination?: PaginationParams): Promise<PaginatedResult<Booking>>;
  getPendingBookingsForLocation(locationId: number): Promise<Booking[]>;
  hasConflictingBookings(locationId: number, startDate: Date, endDate: Date, excludeBookingId?: number): Promise<boolean>;
  
  // Booking Admin
  getAllBookings(): Promise<Booking[]>; // Admin function to view all bookings
  processRefund(bookingId: number, amount: number, reason: string, adminId: number): Promise<Booking>;

  // Booking Edit History
  createBookingEditHistory(editHistory: InsertBookingEditHistory): Promise<BookingEditHistory>;
  getBookingEditHistory(bookingId: number): Promise<BookingEditHistory[]>;

  // Reviews
  getReviews(locationId: number): Promise<Review[]>;
  getReviewsByLocation(locationId: number): Promise<Review[]>;
  getReviewsByUser(userId: number): Promise<Review[]>; 
  getReview(reviewId: number): Promise<Review | undefined>;
  getReviewForBooking(bookingId: number): Promise<Review | undefined>;
  getUserReviewForBooking(userId: number, bookingId: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReviewHelpful(reviewId: number): Promise<Review>;
  updateReviewResponse(reviewId: number, response: string): Promise<Review>;
  respondToReview(reviewId: number, response: string): Promise<Review>;
  getPendingReviewsForUser(userId: number): Promise<Booking[]>; // Get bookings that need reviews
  getPendingReviewsForHost(hostUserId: number): Promise<Booking[]>; // Get bookings where host needs to review guest
  getLocationRating(locationId: number): Promise<{ averageRating: number | null; reviewCount: number }>;
  getReviewsByBookingIds(bookingIds: number[]): Promise<Review[]>;
  
  // Review Requirements and Enforcement
  createReviewRequirement(bookingId: number, completedAt: Date): Promise<void>;
  updateReviewRequirement(bookingId: number, reviewType: "guest_to_host" | "host_to_guest"): Promise<void>;
  getUserReviewRequirements(userId: number): Promise<any[]>;
  canUserMakeBooking(userId: number): Promise<boolean>;
  sendReviewReminders(): Promise<number>;

  // Messages
  getMessages(userId: number): Promise<Message[]>;
  getArchivedMessages(userId: number): Promise<Message[]>;
  getMessage(messageId: number): Promise<Message | undefined>;
  getMessagesByLocation(locationId: number): Promise<Message[]>;
  getMessagesByReceiverId(receiverId: number): Promise<Message[]>;
  getConversation(userId1: number, userId2: number, locationId: number): Promise<Message[]>;
  getConversationIncludingArchived(userId1: number, userId2: number, locationId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessage(messageId: number, updateData: Partial<Message>): Promise<Message>;
  markMessageAsRead(messageId: number): Promise<void>;
  markMessagesAsRead(messageIds: number[]): Promise<void>;
  
  // Message Response Tracking
  createMessageConversation(conversation: InsertMessageConversation): Promise<MessageConversation>;
  updateMessageConversation(id: number, updateData: Partial<MessageConversation>): Promise<MessageConversation>;
  getPendingConversationsForHost(hostId: number): Promise<MessageConversation[]>;
  getHostResponseStats(hostId: number): Promise<{ averageResponseTime: number | null, responseCount: number, responseRating: string }>;
  calculateAndUpdateUserResponseTime(userId: number): Promise<void>;
  
  // Message Admin
  getAllUserConversations(): Promise<{ userId1: number, userId2: number, locationId: number, lastMessageDate: Date, userName1?: string, userName2?: string, locationTitle?: string }[]>;
  getAdminFilteredMessages(filter: { userId?: number, locationId?: number, dateFrom?: Date, dateTo?: Date }): Promise<Message[]>;
  
  // Content Moderation
  createContentModerationAlert(alert: InsertContentModerationAlert): Promise<ContentModerationAlert>;
  getContentModerationAlerts(filter?: { resolved?: boolean, violationType?: string }): Promise<ContentModerationAlert[]>;
  getContentModerationAlert(id: number): Promise<ContentModerationAlert | undefined>;
  resolveContentModerationAlert(id: number, resolvedBy: number): Promise<ContentModerationAlert>;
  getContentModerationAlertsByMessage(messageId: number): Promise<ContentModerationAlert[]>;

  // Location Folders
  getLocationFolders(userId: number): Promise<LocationFolder[]>;
  getLocationFolder(id: number): Promise<LocationFolder | undefined>;
  createLocationFolder(folder: InsertLocationFolder): Promise<LocationFolder>;
  updateLocationFolder(id: number, updateData: Partial<LocationFolder>): Promise<LocationFolder>;
  deleteLocationFolder(id: number): Promise<void>;

  // Saved Locations
  getSavedLocations(userId: number, folderId?: number): Promise<Location[]>;
  getSavedLocationDetails(userId: number): Promise<(SavedLocation & { location: Location, folder?: LocationFolder })[]>;
  getSavedLocationIds(userId: number): Promise<number[]>;
  saveLocation(savedLocation: InsertSavedLocation): Promise<SavedLocation>;
  updateSavedLocation(userId: number, locationId: number, folderId: number | null): Promise<SavedLocation>;
  unsaveLocation(userId: number, locationId: number): Promise<void>;
  isLocationSaved(userId: number, locationId: number): Promise<boolean>;
  
  // Admin Logs
  createAdminLog(log: InsertAdminLog): Promise<AdminLog>;
  getAdminLogs(filter?: { adminId?: number, targetType?: string, targetId?: number, dateFrom?: Date, dateTo?: Date }): Promise<AdminLog[]>;
  
  // Spotlight Locations
  getSpotlightLocations(): Promise<(SpotlightLocation & { location: Location })[]>;
  getCurrentSpotlightLocations(city?: string): Promise<(SpotlightLocation & { location: Location })[]>;
  getCurrentSpotlightLocationsByCity(city: string): Promise<(SpotlightLocation & { location: Location })[]>;
  getAvailableCitiesForSpotlight(): Promise<string[]>;
  createSpotlightLocation(spotlight: InsertSpotlightLocation): Promise<SpotlightLocation>;
  updateSpotlightLocation(id: number, updateData: Partial<SpotlightLocation>): Promise<SpotlightLocation>;
  deleteSpotlightLocation(id: number): Promise<void>;
  
  // Notifications
  getUserNotifications(userId: number): Promise<Notification[]>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  deleteNotification(notificationId: number): Promise<void>;
  
  // Secret Locations
  getSecretLocations(): Promise<SecretLocation[]>;
  getSecretLocationsByUser(userId: number): Promise<SecretLocation[]>;
  getSecretLocation(id: number): Promise<SecretLocation | undefined>;
  createSecretLocation(secretLocation: InsertSecretLocation): Promise<SecretLocation>;
  updateSecretLocation(id: number, updateData: Partial<SecretLocation>): Promise<SecretLocation>;
  deleteSecretLocation(id: number): Promise<void>;
  getSecretLocationsByStatus(status: "pending" | "approved" | "rejected"): Promise<SecretLocation[]>;
  updateSecretLocationStatus(secretLocationId: number, status: "pending" | "approved" | "rejected", reason: string, adminId: number): Promise<SecretLocation>;
  
  // Concierge Requests
  createConciergeRequest(request: InsertConciergeRequest): Promise<ConciergeRequest>;
  getConciergeRequests(): Promise<ConciergeRequest[]>;
  getConciergeRequest(id: number): Promise<ConciergeRequest | undefined>;
  updateConciergeRequest(id: number, updateData: Partial<ConciergeRequest>): Promise<ConciergeRequest>;
  getConciergeRequestsByStatus(status: "pending" | "in_progress" | "completed" | "cancelled"): Promise<ConciergeRequest[]>;

  // User Reports
  createUserReport(report: InsertUserReport): Promise<UserReport>;
  getUserReports(): Promise<UserReport[]>;
  getUserReportsByStatus(status: "pending" | "reviewing" | "resolved" | "dismissed"): Promise<UserReport[]>;
  getUserReport(id: number): Promise<UserReport | undefined>;
  updateUserReport(id: number, updateData: Partial<UserReport>): Promise<UserReport>;
  getUserReportsByReporter(reporterId: number): Promise<UserReport[]>;
  getUserReportsAboutUser(reportedUserId: number): Promise<UserReport[]>;

  // Location Calendar Integration
  getLocationCalendarIntegration(locationId: number): Promise<LocationCalendarIntegration | undefined>;
  createLocationCalendarIntegration(integration: InsertLocationCalendarIntegration): Promise<LocationCalendarIntegration>;
  updateLocationCalendarIntegration(locationId: number, updateData: Partial<LocationCalendarIntegration>): Promise<LocationCalendarIntegration>;
  deleteLocationCalendarIntegration(locationId: number): Promise<void>;

  // Site Settings
  getSiteSetting(key: string): Promise<SiteSetting | undefined>;
  setSiteSetting(key: string, value: string, description?: string, updatedBy?: number): Promise<SiteSetting>;
  getAllSiteSettings(): Promise<SiteSetting[]>;

  // Support Emails
  createSupportEmail(supportEmail: InsertSupportEmail): Promise<SupportEmail>;
  getSupportEmail(id: number): Promise<SupportEmail | undefined>;
  getAllSupportEmails(): Promise<SupportEmail[]>;
  getSupportEmailsByStatus(status: "open" | "in_progress" | "resolved" | "closed"): Promise<SupportEmail[]>;
  updateSupportEmail(id: number, updateData: Partial<SupportEmail>): Promise<SupportEmail>;
  deleteSupportEmail(id: number): Promise<void>;
  
  // Forum Categories
  getForumCategories(): Promise<ForumCategory[]>;
  getForumCategory(id: number): Promise<ForumCategory | undefined>;
  createForumCategory(category: InsertForumCategory): Promise<ForumCategory>;
  updateForumCategory(id: number, updateData: Partial<ForumCategory>): Promise<ForumCategory>;
  deleteForumCategory(id: number): Promise<void>;
  
  // Forum Posts
  getForumPosts(categoryId?: number): Promise<ForumPost[]>;
  getForumPost(id: number): Promise<ForumPost | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPost>;
  updateForumPost(id: number, updateData: Partial<ForumPost>): Promise<ForumPost>;
  deleteForumPost(id: number): Promise<void>;
  getForumPostsByUser(userId: number): Promise<ForumPost[]>;
  incrementForumPostViews(postId: number): Promise<void>;
  
  // Forum Comments
  getForumComments(postId: number): Promise<ForumComment[]>;
  getForumComment(id: number): Promise<ForumComment | undefined>;
  createForumComment(comment: InsertForumComment): Promise<ForumComment>;
  updateForumComment(id: number, updateData: Partial<ForumComment>): Promise<ForumComment>;
  deleteForumComment(id: number): Promise<void>;
  getForumCommentsByUser(userId: number): Promise<ForumComment[]>;
  
  // Forum Likes
  createForumLike(like: InsertForumLike): Promise<ForumLike>;
  deleteForumLike(userId: number, targetType: "post" | "comment", targetId: number): Promise<void>;
  getForumLikes(targetType: "post" | "comment", targetId: number): Promise<ForumLike[]>;
  hasUserLikedForumItem(userId: number, targetType: "post" | "comment", targetId: number): Promise<boolean>;
  
  // Weekly Challenges
  getWeeklyChallenges(): Promise<WeeklyChallenge[]>;
  getWeeklyChallenge(id: number): Promise<WeeklyChallenge | undefined>;
  createWeeklyChallenge(challenge: InsertWeeklyChallenge): Promise<WeeklyChallenge>;
  updateWeeklyChallenge(id: number, updateData: Partial<WeeklyChallenge>): Promise<WeeklyChallenge>;
  deleteWeeklyChallenge(id: number): Promise<void>;
  getActiveChallenges(): Promise<WeeklyChallenge[]>;
  
  // Challenge Entries
  getChallengeEntries(challengeId: number): Promise<ChallengeEntry[]>;
  getChallengeEntry(id: number): Promise<ChallengeEntry | undefined>;
  createChallengeEntry(entry: InsertChallengeEntry): Promise<ChallengeEntry>;
  updateChallengeEntry(id: number, updateData: Partial<ChallengeEntry>): Promise<ChallengeEntry>;
  deleteChallengeEntry(id: number): Promise<void>;
  deleteChallengeEntries(challengeId: number): Promise<void>;
  selectChallengeWinner(challengeId: number, entryId: number): Promise<void>;
  
  // Email Templates
  getEmailTemplateByType(type: string, recipientRole: string): Promise<EmailTemplate | undefined>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  updateEmailTemplate(id: number, updateData: Partial<EmailTemplate>): Promise<EmailTemplate>;
  deleteEmailTemplate(id: number): Promise<void>;
  getEmailTemplateById(id: number): Promise<EmailTemplate | undefined>;
  
  // Email Events
  createEmailEvent(event: InsertEmailEvent): Promise<EmailEvent>;
  getEmailEvent(messageId: string): Promise<EmailEvent | undefined>;
  updateEmailEvent(messageId: string, updateData: Partial<EmailEvent>): Promise<EmailEvent>;
  getEmailEventsByUser(userId: number): Promise<EmailEvent[]>;
  getEmailEventsByStatus(status: string): Promise<EmailEvent[]>;
  
  // Marketing Subscriptions
  getMarketingSubscription(email: string): Promise<MarketingSubscription | undefined>;
  createMarketingSubscription(subscription: InsertMarketingSubscription): Promise<MarketingSubscription>;
  updateMarketingSubscription(email: string, updateData: Partial<MarketingSubscription>): Promise<MarketingSubscription>;
  getActiveMarketingSubscriptions(): Promise<MarketingSubscription[]>;
  
  // Email Campaigns
  getEmailCampaign(id: number): Promise<EmailCampaign | undefined>;
  getEmailCampaigns(): Promise<EmailCampaign[]>;
  createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign>;
  updateEmailCampaign(id: number, updateData: Partial<EmailCampaign>): Promise<EmailCampaign>;
  
  // User Email Preferences
  getUserEmailPreferences(userId: number): Promise<UserEmailPreferences | undefined>;
  createUserEmailPreferences(preferences: InsertUserEmailPreferences): Promise<UserEmailPreferences>;
  updateUserEmailPreferences(userId: number, updateData: Partial<UserEmailPreferences>): Promise<UserEmailPreferences>;
  
  // Email Suppression List
  isEmailSuppressed(email: string): Promise<boolean>;
  addToSuppressionList(suppression: InsertEmailSuppressionList): Promise<EmailSuppressionList>;
  removeFromSuppressionList(email: string): Promise<void>;
  getSuppressionList(): Promise<EmailSuppressionList[]>;
  
  // Password Reset Tokens
  createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken>;
  getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;
  deleteExpiredPasswordResetTokens(): Promise<void>;
  
  // Email Verification Tokens
  createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<EmailVerificationToken>;
  getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined>;
  markEmailVerificationTokenUsed(token: string): Promise<void>;
  deleteExpiredEmailVerificationTokens(): Promise<void>;
  
  sessionStore: session.Store;

  // Dashboard API functions
  getBookingsByUserId(userId: number): Promise<Booking[]>;
  getBookingsByHostId(hostId: number): Promise<Booking[]>;
  getMessagesByUserId(userId: number): Promise<Message[]>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getLocationsByOwnerId(ownerId: number): Promise<Location[]>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user;
  }

  async getUserByFacebookId(facebookId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.facebookId, facebookId));
    return user;
  }

  async getUserByAppleId(appleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.appleId, appleId));
    return user;
  }

  async linkOAuthProvider(userId: number, provider: 'google' | 'facebook' | 'apple', providerId: string): Promise<void> {
    const updateData: Partial<User> = {};
    switch (provider) {
      case 'google':
        updateData.googleId = providerId;
        break;
      case 'facebook':
        updateData.facebookId = providerId;
        break;
      case 'apple':
        updateData.appleId = providerId;
        break;
    }
    await db.update(users).set(updateData).where(eq(users.id, userId));
  }

  async createUser(insertUser: InsertUser & { googleId?: string; facebookId?: string; authProvider?: string }): Promise<User> {
    // Create user data with default roles and auth provider
    const userData = {
      ...insertUser,
      roles: insertUser.roles || ["owner", "client"],
      authProvider: insertUser.authProvider || "local"
    };
    
    const [user] = await db.insert(users).values(userData as any).returning();
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    if (location) {
      console.log(`[STORAGE] Retrieved location ${id}: instantBooking = ${location.instantBooking}`);
      console.log(`[STORAGE] Location ${id} videos:`, location.videos);
    }
    return location;
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(insertLocation).returning();
    return location;
  }

  async getLocationsByOwner(ownerId: number, pagination: PaginationParams = {}): Promise<PaginatedResult<Location>> {
    const { page = 1, limit = 10 } = pagination;
    const offset = (page - 1) * limit;
    
    // Get total count
    const [{ count: totalCount }] = await db.select({ count: count() }).from(locations).where(eq(locations.ownerId, ownerId));
    const total = Number(totalCount);
    
    // Get paginated results
    const results = await db.select()
      .from(locations)
      .where(eq(locations.ownerId, ownerId))
      .orderBy(desc(locations.createdAt))
      .limit(limit)
      .offset(offset);
    
    console.log(`[STORAGE] getLocationsByOwner(${ownerId}) found ${results.length} locations (page ${page}, total ${total})`);
    results.forEach(loc => {
      console.log(`[STORAGE] Location ${loc.id} (${loc.title}) has videos:`, loc.videos);
    });
    
    return {
      data: results,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async deleteLocation(id: number): Promise<void> {
    await db.delete(locations).where(eq(locations.id, id));
  }

  async updateLocation(id: number, updateData: Partial<Location>, editorId?: number): Promise<Location> {
    // Get current location data for history tracking
    const currentLocation = editorId ? await this.getLocation(id) : null;
    
    const [updatedLocation] = await db
      .update(locations)
      .set(updateData)
      .where(eq(locations.id, id))
      .returning();

    if (!updatedLocation) {
      throw new Error("Location not found");
    }

    // Track the update in history if editorId is provided
    if (editorId && currentLocation) {
      const changedFields = Object.keys(updateData);
      const previousData: Record<string, any> = {};
      const newData: Record<string, any> = {};
      
      changedFields.forEach(field => {
        previousData[field] = (currentLocation as any)[field];
        newData[field] = (updateData as any)[field];
      });
      
      await this.trackLocationUpdate(
        id,
        editorId,
        previousData,
        newData,
        changedFields,
        'update'
      );
    }

    return updatedLocation;
  }

  // Add-ons
  async getLocationAddons(locationId: number): Promise<Addon[]> {
    return db
      .select()
      .from(addons)
      .where(eq(addons.locationId, locationId));
  }

  async createAddon(insertAddon: InsertAddon): Promise<Addon> {
    const [addon] = await db
      .insert(addons)
      .values(insertAddon)
      .returning();
    return addon;
  }
  
  async updateAddon(id: number, updateData: Partial<Addon>): Promise<Addon> {
    const [updatedAddon] = await db
      .update(addons)
      .set(updateData)
      .where(eq(addons.id, id))
      .returning();
    
    if (!updatedAddon) {
      throw new Error("Addon not found");
    }
    
    return updatedAddon;
  }
  
  async deleteAddon(id: number): Promise<void> {
    console.log(`Deleting addon with id: ${id}`);
    const result = await db
      .delete(addons)
      .where(eq(addons.id, id))
      .returning();
    
    console.log(`Delete result:`, result);
    
    if (result.length === 0) {
      throw new Error("Addon not found or already deleted");
    }
  }
  
  async getBookingAddons(bookingId: number): Promise<Addon[]> {
    // First, get the addon IDs associated with this booking from the booking_addons table
    const bookingAddonRelations = await db
      .select()
      .from(bookingAddons)
      .where(eq(bookingAddons.bookingId, bookingId));
    
    if (bookingAddonRelations.length === 0) {
      return [];
    }
    
    // Get the addon IDs
    const addonIds = bookingAddonRelations.map(relation => relation.addonId);
    
    // Then fetch the addon details
    const addonDetails = await db
      .select()
      .from(addons)
      .where(inArray(addons.id, addonIds));
    
    return addonDetails;
  }
  
  async addBookingAddons(bookingId: number, addonIds: number[]): Promise<void> {
    // Make sure we have add-ons to add
    if (addonIds.length === 0) return;
    
    // Prepare values for batch insert
    const values = addonIds.map(addonId => ({
      bookingId,
      addonId
    }));
    
    // Insert the new booking-addon relationships
    await db.insert(bookingAddons).values(values);
  }
  
  async removeBookingAddons(bookingId: number, addonIds: number[]): Promise<void> {
    // Make sure we have add-ons to remove
    if (addonIds.length === 0) return;
    
    // Remove the booking-addon relationships
    await db
      .delete(bookingAddons)
      .where(
        and(
          eq(bookingAddons.bookingId, bookingId),
          inArray(bookingAddons.addonId, addonIds)
        )
      );
  }
  
  async updateBookingAddons(bookingId: number, addonIds: number[]): Promise<void> {
    // First get existing addons for this booking
    const existingRelations = await db
      .select()
      .from(bookingAddons)
      .where(eq(bookingAddons.bookingId, bookingId));
    
    const existingAddonIds = existingRelations.map(relation => relation.addonId);
    
    // Calculate which addons to add and which to remove
    const addonsToAdd = addonIds.filter(id => !existingAddonIds.includes(id));
    const addonsToRemove = existingAddonIds.filter(id => !addonIds.includes(id));
    
    // Remove old addons
    if (addonsToRemove.length > 0) {
      await this.removeBookingAddons(bookingId, addonsToRemove);
    }
    
    // Add new addons
    if (addonsToAdd.length > 0) {
      await this.addBookingAddons(bookingId, addonsToAdd);
    }
  }

  // Bookings
  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingByPaymentId(paymentId: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.paymentId, paymentId));
    return booking;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    console.log(`[STORAGE DEBUG] Creating booking with data:`, JSON.stringify(insertBooking, null, 2));
    const [booking] = await db.insert(bookings).values(insertBooking).returning();
    console.log(`[STORAGE DEBUG] Booking created:`, JSON.stringify(booking, null, 2));
    
    // Send notification to location owner about new booking request
    try {
      // Get location details to include in notification
      const location = await this.getLocation(booking.locationId);
      if (location) {
        // Get client details
        const client = await this.getUser(booking.clientId);
        const clientName = client ? client.username : "A user";
        
        // Create notification for location owner based on booking type
        const isInstantBooking = location.instantBooking === true;
        const notificationType = isInstantBooking ? "booking_confirmed" : "booking_request";
        const notificationTitle = isInstantBooking ? "Instant Booking Confirmed" : "New Booking Request";
        const notificationMessage = isInstantBooking 
          ? `${clientName} has made an instant booking for "${location.title}" from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}. This booking has been automatically confirmed.`
          : `${clientName} has requested to book "${location.title}" from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}.`;
        
        await this.createNotification({
          userId: location.ownerId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          relatedId: booking.id,
          relatedType: 'booking',
          actionUrl: `/dashboard` // Direct to dashboard where they can see bookings
        });
        
        console.log(`Created booking_request notification for location owner ${location.ownerId}`);
      }
    } catch (error) {
      console.error(`Failed to create booking request notification: ${error}`);
      // Don't throw error, as we still want to return the booking
    }
    
    return booking;
  }

  async updateBooking(id: number, updateData: Partial<Booking>): Promise<Booking> {
    // Get the existing booking to track status changes
    const existingBooking = await this.getBooking(id);
    if (!existingBooking) {
      throw new Error("Booking not found");
    }
    
    const [updatedBooking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();
    
    if (!updatedBooking) {
      throw new Error("Booking not found after update");
    }
    
    // Handle status change notifications
    try {
      // Status changed and the new status is confirmed, rejected, or cancelled
      if (existingBooking.status !== updatedBooking.status && 
          ['confirmed', 'rejected', 'cancelled'].includes(updatedBooking.status)) {
        
        // Get location details
        const location = await this.getLocation(updatedBooking.locationId);
        if (!location) {
          console.error(`Location not found for booking ${id}`);
          return updatedBooking;
        }
        
        let notificationType: "booking_approved" | "booking_rejected" | "booking_cancelled";
        let title: string;
        let message: string;
        
        // Determine notification type and content based on new status
        if (updatedBooking.status === 'confirmed') {
          notificationType = "booking_approved";
          title = "Booking Approved";
          message = `Your booking for "${location.title}" has been approved.`;
        } else if (updatedBooking.status === 'rejected') {
          notificationType = "booking_rejected";
          title = "Booking Rejected";
          message = `Your booking request for "${location.title}" has been rejected.`;
        } else if (updatedBooking.status === 'cancelled') {
          notificationType = "booking_cancelled";
          title = "Booking Cancelled";
          message = `Your booking for "${location.title}" has been cancelled.`;
        } else {
          return updatedBooking; // No notification needed for other status changes
        }
        
        // Create notification for the client
        await this.createNotification({
          userId: updatedBooking.clientId,
          type: notificationType,
          title: title,
          message: message,
          relatedId: updatedBooking.id,
          relatedType: 'booking',
          actionUrl: `/dashboard` // Direct to dashboard where they can see their bookings
        });
        
        console.log(`Created ${notificationType} notification for client ${updatedBooking.clientId}`);
      }
    } catch (error) {
      console.error(`Failed to create booking status notification: ${error}`);
      // Don't throw error, as we still want to return the updated booking
    }
    
    return updatedBooking;
  }

  async cancelBooking(id: number, cancelledBy?: number): Promise<void> {
    // Get booking details before cancelling
    const booking = await this.getBooking(id);
    if (!booking) {
      throw new Error("Booking not found");
    }
    
    // Update booking status to cancelled
    await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(eq(bookings.id, id));
      
    // Get location details
    const location = await this.getLocation(booking.locationId);
    if (!location) {
      console.error(`Location not found for booking ${id}`);
      return;
    }
    
    // Get client details
    const client = await this.getUser(booking.clientId);
    const clientName = client ? client.username : "A user";
    
    // Get host details
    const host = await this.getUser(location.ownerId);
    const hostName = host ? host.username : "The host";
    
    // Determine who cancelled the booking
    const isHostCancellation = cancelledBy === location.ownerId;
    const isClientCancellation = cancelledBy === booking.clientId;
    
    try {
      if (isHostCancellation) {
        // Host cancelled - notify the client
        await this.createNotification({
          userId: booking.clientId,
          type: "booking_cancelled",
          title: "Booking Cancelled by Host",
          message: `${hostName} has cancelled your booking for "${location.title}" from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}.`,
          relatedId: booking.id,
          relatedType: 'booking',
          actionUrl: `/dashboard` // Direct to dashboard
        });
        console.log(`Created booking_cancelled notification for client ${booking.clientId}`);
        
        // Send email to client
        try {
          const emailService = (await import('./services/email/email.service')).default;
          await emailService.sendBookingUpdate(booking.id, 'cancelled');
          console.log(`Sent booking cancellation email to client ${booking.clientId}`);
        } catch (emailError) {
          console.error(`Failed to send booking cancellation email: ${emailError}`);
          // Don't throw error, as we still want the cancellation to proceed
        }
      } else if (isClientCancellation) {
        // Client cancelled - notify the host (existing behavior)
        await this.createNotification({
          userId: location.ownerId,
          type: "booking_cancelled",
          title: "Booking Cancelled",
          message: `${clientName} has cancelled their booking for "${location.title}" from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()}.`,
          relatedId: booking.id,
          relatedType: 'booking',
          actionUrl: `/dashboard` // Direct to dashboard
        });
        console.log(`Created booking_cancelled notification for location owner ${location.ownerId}`);
      } else {
        // Admin or unknown cancellation - notify both parties
        await this.createNotification({
          userId: booking.clientId,
          type: "booking_cancelled",
          title: "Booking Cancelled",
          message: `Your booking for "${location.title}" from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()} has been cancelled.`,
          relatedId: booking.id,
          relatedType: 'booking',
          actionUrl: `/dashboard`
        });
        
        await this.createNotification({
          userId: location.ownerId,
          type: "booking_cancelled",
          title: "Booking Cancelled",
          message: `The booking for "${location.title}" from ${new Date(booking.startDate).toLocaleDateString()} to ${new Date(booking.endDate).toLocaleDateString()} has been cancelled.`,
          relatedId: booking.id,
          relatedType: 'booking',
          actionUrl: `/dashboard`
        });
        console.log(`Created booking_cancelled notifications for both parties`);
      }
    } catch (error) {
      console.error(`Failed to create booking cancellation notification: ${error}`);
      // Don't throw error, as we still want the cancellation to proceed
    }
  }

  async getUserBookings(userId: number, pagination: PaginationParams = {}): Promise<PaginatedResult<Booking>> {
    console.log(`Getting bookings where user ${userId} is the client`);
    
    try {
      // Verify the user exists first
      const user = await this.getUser(userId);
      if (!user) {
        console.error(`Error in getUserBookings: User ${userId} does not exist`);
        return {
          data: [],
          total: 0,
          page: pagination.page || 1,
          limit: pagination.limit || 10,
          totalPages: 0
        };
      }
      
      console.log(`User ${userId} exists with username: ${user.username}`);
      
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;
      
      // Get total count
      const [{ count: totalCount }] = await db.select({ count: count() }).from(bookings).where(eq(bookings.clientId, userId));
      const total = Number(totalCount);
      
      // Get paginated bookings with detailed logging
      const result = await db.select()
        .from(bookings)
        .where(eq(bookings.clientId, userId))
        .orderBy(desc(bookings.id))
        .limit(limit)
        .offset(offset);
        
      console.log(`Found ${result.length} bookings for client ${userId} (page ${page}, total ${total})`);
      
      if (result.length > 0) {
        console.log(`Booking details for client ${userId}:`, 
          JSON.stringify(result.map(b => ({ 
            id: b.id, 
            locationId: b.locationId, 
            clientId: b.clientId, 
            status: b.status 
          })))
        );
      }
      
      return {
        data: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error(`Error getting bookings for user ${userId}:`, error);
      return {
        data: [],
        total: 0,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: 0
      };
    }
  }

  async getLocationBookings(locationId: number, pagination: PaginationParams = {}): Promise<PaginatedResult<Booking>> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const offset = (page - 1) * limit;
      
      // Get total count
      const [{ count: totalCount }] = await db.select({ count: count() }).from(bookings).where(eq(bookings.locationId, locationId));
      const total = Number(totalCount);
      
      // Select paginated columns from bookings where locationId matches
      const result = await db.select()
        .from(bookings)
        .where(eq(bookings.locationId, locationId))
        .orderBy(desc(bookings.id))
        .limit(limit)
        .offset(offset);
        
      console.log(`Found ${result.length} bookings for location ${locationId} (page ${page}, total ${total})`);
      
      return {
        data: result,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error(`Error getting bookings for location ${locationId}:`, error);
      return {
        data: [],
        total: 0,
        page: pagination.page || 1,
        limit: pagination.limit || 10,
        totalPages: 0
      };
    }
  }
  
  async getPendingBookingsForLocation(locationId: number): Promise<Booking[]> {
    try {
      const result = await db.select()
        .from(bookings)
        .where(and(
          eq(bookings.locationId, locationId),
          eq(bookings.status, 'pending')
        ))
        .orderBy(desc(bookings.startDate));
        
      console.log(`Found ${result.length} pending bookings for location ${locationId}`);
      return result;
    } catch (error) {
      console.error(`Error getting pending bookings for location ${locationId}:`, error);
      return [];
    }
  }
  
  async hasConflictingBookings(locationId: number, startDate: Date, endDate: Date, excludeBookingId?: number): Promise<boolean> {
    try {
      console.log(`Checking for conflicting bookings at location ${locationId} from ${startDate} to ${endDate}`);
      
      // Get all active bookings for this location (only confirmed bookings, not cancelled or payment_pending)
      // Only select the columns we need to check for conflicts
      const existingBookings = await db
        .select({
          id: bookings.id,
          startDate: bookings.startDate,
          endDate: bookings.endDate,
        })
        .from(bookings)
        .where(
          and(
            eq(bookings.locationId, locationId),
            ne(bookings.status, "cancelled"),
            ne(bookings.status, "payment_pending")
          )
        );
      
      if (existingBookings.length === 0) {
        console.log("No existing bookings found for this location");
        return false;
      }
      
      console.log(`Found ${existingBookings.length} existing bookings to check against`);
      
      // Filter out the booking we're trying to update, if any
      const relevantBookings = excludeBookingId 
        ? existingBookings.filter(booking => booking.id !== excludeBookingId)
        : existingBookings;
      
      // Check if any of the existing bookings overlap with the requested time
      const conflict = relevantBookings.some(booking => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        
        // Check for overlap: 
        // Not (new booking ends before existing booking starts OR new booking starts after existing booking ends)
        const hasOverlap = !(
          endDate <= bookingStart || 
          startDate >= bookingEnd
        );
        
        if (hasOverlap) {
          console.log(`Found conflicting booking: Booking #${booking.id} (${bookingStart} - ${bookingEnd})`);
        }
        
        return hasOverlap;
      });
      
      return conflict;
    } catch (error) {
      console.error(`Error checking for conflicting bookings: ${error}`);
      return false;
    }
  }
  
  // Clean up abandoned payment_pending bookings older than 30 minutes
  async cleanupAbandonedBookings(): Promise<void> {
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const result = await db
        .delete(bookings)
        .where(
          and(
            eq(bookings.status, "payment_pending"),
            lte(bookings.startDate, thirtyMinutesAgo)
          )
        )
        .returning({ id: bookings.id });
        
      if (result.length > 0) {
        console.log(`Cleaned up ${result.length} abandoned payment_pending bookings`);
      }
    } catch (error) {
      console.error("Error cleaning up abandoned bookings:", error);
    }
  }
  
  // Booking Edit History
  async createBookingEditHistory(editHistory: InsertBookingEditHistory): Promise<BookingEditHistory> {
    console.log(`Creating edit history record for booking ${editHistory.bookingId}`);
    
    const [history] = await db
      .insert(bookingEditHistory)
      .values({
        ...editHistory,
        editedAt: new Date(),
      })
      .returning();
      
    if (!history) {
      throw new Error("Failed to create booking edit history");
    }
    
    return history;
  }
  
  async getBookingEditHistory(bookingId: number): Promise<BookingEditHistory[]> {
    console.log(`Fetching edit history for booking ${bookingId}`);
    
    const history = await db
      .select()
      .from(bookingEditHistory)
      .where(eq(bookingEditHistory.bookingId, bookingId))
      .orderBy(desc(bookingEditHistory.editedAt));
      
    return history;
  }

  // Reviews
  async getReviews(locationId: number): Promise<Review[]> {
    // Directly query reviews by locationId 
    return db.select().from(reviews).where(eq(reviews.locationId, locationId));
  }

  async getReviewsByUser(userId: number): Promise<Review[]> {
    // Get all reviews written by a user
    return db.select().from(reviews).where(eq(reviews.userId, userId));
  }

  async getReviewForBooking(bookingId: number): Promise<Review | undefined> {
    // Check if a booking already has a review
    const [review] = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId));
    return review;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    // Insert the review
    const [review] = await db.insert(reviews).values({
      ...insertReview,
      createdAt: new Date(),
    }).returning();
    
    // Get the booking to mark it as reviewed
    const booking = await this.getBooking(review.bookingId);
    if (booking) {
      // Create a notification for the location owner about the new review
      try {
        const location = await this.getLocation(review.locationId);
        const reviewer = await this.getUser(review.userId);
        
        if (location && reviewer) {
          // Create notification for location owner
          await this.createNotification({
            userId: location.ownerId,
            type: "review_received", // Using the new review notification type
            title: "New Review Received",
            message: `${reviewer.username} left a ${review.rating}-star review for your location "${location.title}"`,
            relatedId: review.id,
            relatedType: 'review',
            actionUrl: `/locations/${location.id}` // Link to the location page
          });
        }
      } catch (error) {
        console.error("Error creating review notification:", error);
        // Don't throw - we still want to return the review
      }
    }
    
    return review;
  }
  
  async updateReviewHelpful(reviewId: number): Promise<Review> {
    // Increment the helpful count for a review
    const [updatedReview] = await db
      .update(reviews)
      .set({
        helpful: sql`${reviews.helpful} + 1`
      })
      .where(eq(reviews.id, reviewId))
      .returning();
      
    if (!updatedReview) {
      throw new Error("Review not found");
    }
    
    return updatedReview;
  }
  
  async respondToReview(reviewId: number, response: string): Promise<Review> {
    // Add a response from the owner to a review
    const [updatedReview] = await db
      .update(reviews)
      .set({
        response,
        responseDate: new Date()
      })
      .where(eq(reviews.id, reviewId))
      .returning();
      
    if (!updatedReview) {
      throw new Error("Review not found");
    }
    
    // Notify the reviewer that their review received a response
    try {
      const location = await this.getLocation(updatedReview.locationId);
      const reviewer = await this.getUser(updatedReview.userId);
      
      if (location && reviewer) {
        await this.createNotification({
          userId: reviewer.id,
          type: "review_response", // Using the new review response type
          title: "Response to Your Review",
          message: `The owner of "${location.title}" has responded to your review`,
          relatedId: updatedReview.id,
          relatedType: 'review',
          actionUrl: `/locations/${location.id}` // Link to the location
        });
      }
    } catch (error) {
      console.error("Error creating review response notification:", error);
      // Don't throw - we still want to return the updated review
    }
    
    return updatedReview;
  }
  
  async getPendingReviewsForUser(userId: number): Promise<Booking[]> {
    // Find completed bookings that don't have reviews yet
    const userBookingsResult = await this.getUserBookings(userId, { limit: 100 }); // Get larger set for filtering
    const userBookings = userBookingsResult.data;
    
    console.log(`[DEBUG] User ${userId} has ${userBookings.length} total bookings`);
    
    // Filter to only include completed bookings (or confirmed bookings that have ended)
    const completedBookings = userBookings.filter(booking => 
      (booking.status === "completed" || booking.status === "confirmed") && 
      new Date(booking.endDate) < new Date()
    );
    
    console.log(`[DEBUG] User ${userId} has ${completedBookings.length} completed bookings`);
    
    if (completedBookings.length === 0) {
      return [];
    }
    
    // Get booking IDs
    const bookingIds = completedBookings.map(booking => booking.id);
    
    // Find which bookings already have reviews BY THIS USER
    const existingReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          inArray(reviews.bookingId, bookingIds),
          eq(reviews.userId, userId)
        )
      );
    
    const reviewedBookingIds = existingReviews.map(review => review.bookingId);
    
    console.log(`[DEBUG] User ${userId} has ${existingReviews.length} existing reviews`);
    
    // Return bookings that don't have reviews yet
    const pendingReviews = completedBookings.filter(booking => !reviewedBookingIds.includes(booking.id));
    
    console.log(`[DEBUG] User ${userId} has ${pendingReviews.length} pending reviews`);
    
    return pendingReviews;
  }

  async getPendingReviewsForHost(hostUserId: number): Promise<Booking[]> {
    console.log(`[DEBUG] Getting pending reviews for host ${hostUserId}`);
    
    // Get all locations owned by this host
    const locationsResult = await this.getLocationsByOwner(hostUserId);
    const locations = locationsResult.data;
    
    console.log(`[DEBUG] Host ${hostUserId} has ${locations.length} locations`);
    
    if (locations.length === 0) {
      return [];
    }
    
    // Get location IDs
    const locationIds = locations.map(loc => loc.id);
    
    // Get all completed bookings for these locations
    const completedBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          inArray(bookings.locationId, locationIds),
          or(
            eq(bookings.status, "completed"),
            and(
              eq(bookings.status, "confirmed"),
              sql`${bookings.endDate} < now()`
            )
          )
        )
      )
      .orderBy(desc(bookings.endDate));
    
    console.log(`[DEBUG] Host ${hostUserId} has ${completedBookings.length} completed bookings across all locations`);
    
    if (completedBookings.length === 0) {
      return [];
    }
    
    // Get booking IDs
    const bookingIds = completedBookings.map(booking => booking.id);
    
    // Find which bookings already have HOST reviews (host reviewing the guest)
    // These reviews are created by the location owner (host)
    const existingHostReviews = await db
      .select()
      .from(reviews)
      .where(
        and(
          inArray(reviews.bookingId, bookingIds),
          eq(reviews.reviewType, 'host_to_guest')
        )
      );
    
    const reviewedBookingIds = existingHostReviews.map(review => review.bookingId);
    
    console.log(`[DEBUG] Host ${hostUserId} has ${existingHostReviews.length} existing host reviews`);
    
    // Return bookings that don't have host reviews yet
    const pendingReviews = completedBookings.filter(booking => !reviewedBookingIds.includes(booking.id));
    
    console.log(`[DEBUG] Host ${hostUserId} has ${pendingReviews.length} pending host reviews`);
    
    // Enhance bookings with location info (to match the structure expected by frontend)
    const enhancedBookings = pendingReviews.map(booking => {
      const location = locations.find(loc => loc.id === booking.locationId);
      return {
        ...booking,
        location: location || undefined
      } as Booking;
    });
    
    return enhancedBookings;
  }

  async getReviewsByLocation(locationId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.locationId, locationId));
  }

  async getReview(reviewId: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, reviewId));
    return review;
  }

  async getUserReviewForBooking(userId: number, bookingId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, userId), eq(reviews.bookingId, bookingId)));
    return review;
  }

  async getLocationRating(locationId: number): Promise<{ averageRating: number | null; reviewCount: number }> {
    const locationReviews = await db
      .select({
        rating: reviews.rating
      })
      .from(reviews)
      .where(eq(reviews.locationId, locationId));
    
    if (locationReviews.length === 0) {
      return { averageRating: null, reviewCount: 0 };
    }

    const totalRating = locationReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / locationReviews.length;

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount: locationReviews.length
    };
  }

  async updateReviewResponse(reviewId: number, response: string): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set({
        response,
        responseDate: new Date()
      })
      .where(eq(reviews.id, reviewId))
      .returning();
      
    if (!updatedReview) {
      throw new Error("Review not found");
    }
    
    return updatedReview;
  }

  async getReviewsByBookingIds(bookingIds: number[]): Promise<Review[]> {
    if (bookingIds.length === 0) {
      return [];
    }
    
    const result = await db
      .select()
      .from(reviews)
      .where(inArray(reviews.bookingId, bookingIds));
    
    console.log(`getReviewsByBookingIds - Fetching reviews for bookings:`, bookingIds);
    console.log(`Found ${result.length} reviews:`, result.map(r => ({
      id: r.id,
      bookingId: r.bookingId,
      type: r.reviewType,
      userId: r.userId  // The user who wrote the review (for host_to_guest, this is the host)
    })));
    
    return result;
  }

  async createReviewRequirement(bookingId: number, completedAt: Date): Promise<void> {
    // This would be called when a booking is completed to set up review requirements
    // For now, we'll implement this as a simple tracker
    console.log(`Review requirement created for booking ${bookingId} completed at ${completedAt}`);
  }

  async updateReviewRequirement(bookingId: number, reviewType: "guest_to_host" | "host_to_guest"): Promise<void> {
    // This would update the review requirements when a review is submitted
    console.log(`Review requirement updated for booking ${bookingId}, type: ${reviewType}`);
  }

  async getUserReviewRequirements(userId: number): Promise<any[]> {
    // Get pending reviews this user needs to complete
    // This returns completed bookings where the user was either the guest or host
    // but hasn't completed their required review yet
    
    const completedBookings = await db
      .select({
        booking: bookings,
        location: locations
      })
      .from(bookings)
      .innerJoin(locations, eq(bookings.locationId, locations.id))
      .where(
        and(
          or(
            eq(bookings.clientId, userId), // User was the guest
            eq(locations.ownerId, userId)  // User was the host
          ),
          eq(bookings.status, "confirmed"),
          lt(bookings.endDate, new Date()) // Booking has ended
        )
      );

    // Check which bookings still need reviews from this user
    const requirementsNeeded = [];
    
    for (const { booking, location } of completedBookings) {
      const isGuest = booking.clientId === userId;
      const isHost = location.ownerId === userId;
      
      // Check if user has already reviewed this booking
      const existingReview = await this.getUserReviewForBooking(userId, booking.id);
      
      if (!existingReview) {
        requirementsNeeded.push({
          bookingId: booking.id,
          locationId: booking.locationId,
          locationTitle: location.title,
          endDate: booking.endDate,
          userRole: isGuest ? 'guest' : 'host',
          reviewType: isGuest ? 'guest_to_host' : 'host_to_guest'
        });
      }
    }
    
    return requirementsNeeded;
  }

  async canUserMakeBooking(userId: number): Promise<boolean> {
    // Check if user has any pending review requirements
    const requirements = await this.getUserReviewRequirements(userId);
    return requirements.length === 0;
  }

  async sendReviewReminders(): Promise<number> {
    // This would send reminders to users who have pending reviews
    // For now, just return 0 as no reminders sent
    console.log("Review reminders would be sent here");
    return 0;
  }
  
  /**
   * Sends review reminder notifications to users who have completed bookings but haven't left reviews yet
   */
  async sendReviewReminders(): Promise<number> {
    try {
      // Get all confirmed bookings that have ended in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentCompletedBookings = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.status, "confirmed"),
            lt(bookings.endDate, new Date()), // older than now
            gt(bookings.endDate, oneWeekAgo) // but not older than a week
          )
        );
      
      if (recentCompletedBookings.length === 0) {
        return 0;
      }
      
      // Get booking IDs
      const bookingIds = recentCompletedBookings.map(booking => booking.id);
      
      // Find which bookings already have reviews
      const existingReviews = await db
        .select()
        .from(reviews)
        .where(inArray(reviews.bookingId, bookingIds));
      
      const reviewedBookingIds = existingReviews.map(review => review.bookingId);
      
      // Filter to bookings that don't have reviews yet
      const bookingsNeedingReviews = recentCompletedBookings.filter(
        booking => !reviewedBookingIds.includes(booking.id)
      );
      
      if (bookingsNeedingReviews.length === 0) {
        return 0;
      }
      
      let remindersSent = 0;
      
      // Send reminders for each booking
      for (const booking of bookingsNeedingReviews) {
        try {
          // Get location details for the notification
          const location = await this.getLocation(booking.locationId);
          if (!location) continue;
          
          // Get client details for the host notification
          const client = await this.getUser(booking.clientId);
          const clientName = client?.username || 'A guest';
          
          // Check which reviews are missing
          const existingReviewsForBooking = existingReviews.filter(review => review.bookingId === booking.id);
          const hasGuestReview = existingReviewsForBooking.some(review => review.reviewType === 'guest_to_host');
          const hasHostReview = existingReviewsForBooking.some(review => review.reviewType === 'host_to_guest');
          
          // Create notification for the client if they haven't reviewed yet
          if (!hasGuestReview) {
            await this.createNotification({
              userId: booking.clientId,
              type: "review_reminder",
              title: "Please Review Your Recent Booking",
              message: `Don't forget to leave a review for your recent stay at "${location.title}". Your feedback helps our community!`,
              relatedId: booking.id,
              relatedType: 'booking',
              actionUrl: `/dashboard` // Direct to dashboard where they can see their bookings
            });
            remindersSent++;
          }
          
          // Create notification for the host if they haven't reviewed yet
          if (!hasHostReview && location.ownerId) {
            await this.createNotification({
              userId: location.ownerId,
              type: "review_reminder",
              title: "Please Review Your Recent Guest",
              message: `${clientName} stayed at your property "${location.title}". Please leave a review to help build trust in our community!`,
              relatedId: booking.id,
              relatedType: 'booking',
              actionUrl: `/dashboard` // Direct to dashboard where they can see their bookings
            });
            remindersSent++;
          }
        } catch (error) {
          console.error(`Error sending review reminder for booking ${booking.id}:`, error);
          // Continue with other reminders
        }
      }
      
      return remindersSent;
    } catch (error) {
      console.error("Error sending review reminders:", error);
      return 0;
    }
  }

  // Messages
  async getMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        and(
          or(
            eq(messages.senderId, userId),
            eq(messages.receiverId, userId)
          ),
          eq(messages.archived, false) // Filter out archived messages
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getArchivedMessages(userId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        and(
          or(
            eq(messages.senderId, userId),
            eq(messages.receiverId, userId)
          ),
          eq(messages.archived, true) // Only get archived messages
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getMessagesByReceiverId(receiverId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, receiverId),
          eq(messages.archived, false)
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async getConversation(userId1: number, userId2: number, locationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.locationId, locationId),
          or(
            and(
              eq(messages.senderId, userId1),
              eq(messages.receiverId, userId2)
            ),
            and(
              eq(messages.senderId, userId2),
              eq(messages.receiverId, userId1)
            )
          ),
          eq(messages.archived, false) // Filter out archived messages
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  // Get all conversation messages including archived ones (for archive operations)
  async getConversationIncludingArchived(userId1: number, userId2: number, locationId: number): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.locationId, locationId),
          or(
            and(
              eq(messages.senderId, userId1),
              eq(messages.receiverId, userId2)
            ),
            and(
              eq(messages.senderId, userId2),
              eq(messages.receiverId, userId1)
            )
          )
        )
      )
      .orderBy(desc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    try {
      console.log("Creating message with data:", JSON.stringify(message));
      
      // Insert directly into the messages table using the required schema
      const [newMessage] = await db
        .insert(messages)
        .values({
          senderId: message.senderId || 0,
          receiverId: message.receiverId,
          locationId: message.locationId,
          content: message.content,
          bookingId: message.bookingId,
          metadata: message.metadata,
          imageUrl: message.imageUrl, // Add the imageUrl field 
          // Default values for fields not in InsertMessage
          read: false,
          archived: false
        })
        .returning();
      
      // Track message conversations for response time calculation
      try {
        if (newMessage.senderId > 0 && newMessage.receiverId > 0 && newMessage.locationId) {
          // Get location to determine who is the host
          const location = await this.getLocation(newMessage.locationId);
          if (location) {
            const hostId = location.ownerId;
            const clientId = hostId === newMessage.senderId ? newMessage.receiverId : newMessage.senderId;
            
            // Check if this is a new conversation or a response
            const existingConversations = await db
              .select()
              .from(messageConversations)
              .where(
                and(
                  eq(messageConversations.locationId, newMessage.locationId),
                  eq(messageConversations.clientId, clientId),
                  eq(messageConversations.hostId, hostId),
                  eq(messageConversations.conversationStatus, 'pending')
                )
              )
              .orderBy(desc(messageConversations.createdAt))
              .limit(1);
            
            if (existingConversations.length > 0) {
              // This is a response to an existing conversation
              const conversation = existingConversations[0];
              
              // If this is the host responding for the first time
              if (newMessage.senderId === hostId && !conversation.firstResponseId) {
                const responseTime = new Date(newMessage.createdAt);
                const firstMessageTime = new Date(conversation.firstMessageTime);
                const responseTimeMinutes = Math.round((responseTime.getTime() - firstMessageTime.getTime()) / (1000 * 60));
                
                await this.updateMessageConversation(conversation.id, {
                  firstResponseId: newMessage.id,
                  firstResponseTime: responseTime,
                  responseTimeMinutes,
                  conversationStatus: 'responded'
                });
                
                // Update the host's overall response time stats
                await this.calculateAndUpdateUserResponseTime(hostId);
              }
            } else if (newMessage.senderId === clientId) {
              // This is a new conversation initiated by the client
              await this.createMessageConversation({
                locationId: newMessage.locationId,
                clientId,
                hostId,
                firstMessageId: newMessage.id,
                firstMessageTime: new Date(newMessage.createdAt),
                conversationStatus: 'pending'
              });
            }
          }
        }
      } catch (error) {
        console.error(`Failed to track message conversation: ${error}`);
        // Don't throw error since we still want to continue with notifications
      }
      
      // Create notification for message recipient
      try {
        // Skip notification for system messages (senderId = 0)
        if (newMessage.senderId > 0 && newMessage.receiverId > 0) {
          // Get sender details
          const sender = await this.getUser(newMessage.senderId);
          const senderName = sender ? sender.username : "A user";
          
          // Get location details if available
          let locationTitle = "";
          if (newMessage.locationId) {
            const location = await this.getLocation(newMessage.locationId);
            if (location) {
              locationTitle = location.title;
            }
          }
          
          // Create message notification
          let messagePreview = newMessage.content;
          if (messagePreview.length > 50) {
            messagePreview = messagePreview.substring(0, 47) + "...";
          }
          
          let title = `New Message from ${senderName}`;
          let messageContent = messagePreview;
          
          // If this is a booking request message with metadata, create a special notification
          if (newMessage.metadata && typeof newMessage.metadata === 'object' &&
              newMessage.metadata.type === 'booking_request' && locationTitle) {
            title = `Booking Request for "${locationTitle}"`;
            messageContent = `${senderName} has sent you a booking request for "${locationTitle}"`;
          }
          
          await this.createNotification({
            userId: newMessage.receiverId,
            type: "message_received",
            title: title,
            message: messageContent,
            relatedId: newMessage.id,
            relatedType: 'message',
            actionUrl: `/messages` // Direct to messages page
          });
          
          console.log(`Created message_received notification for user ${newMessage.receiverId}`);
        }
      } catch (error) {
        console.error(`Failed to create message notification: ${error}`);
        // Don't throw error since we still want to return the created message
      }
      
      return newMessage;
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Failed to create message");
    }
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, messageId));
  }

  async markMessagesAsRead(messageIds: number[]): Promise<void> {
    if (messageIds.length === 0) return;

    await db
      .update(messages)
      .set({ read: true })
      .where(inArray(messages.id, messageIds));
  }

  // Message Response Tracking Methods
  async createMessageConversation(conversation: InsertMessageConversation): Promise<MessageConversation> {
    const [newConversation] = await db
      .insert(messageConversations)
      .values(conversation)
      .returning();
    return newConversation;
  }

  async updateMessageConversation(id: number, updateData: Partial<MessageConversation>): Promise<MessageConversation> {
    const [updated] = await db
      .update(messageConversations)
      .set(updateData)
      .where(eq(messageConversations.id, id))
      .returning();
    return updated;
  }

  async getPendingConversationsForHost(hostId: number): Promise<MessageConversation[]> {
    return db
      .select()
      .from(messageConversations)
      .where(
        and(
          eq(messageConversations.hostId, hostId),
          eq(messageConversations.conversationStatus, 'pending')
        )
      );
  }

  async getHostResponseStats(hostId: number): Promise<{ averageResponseTime: number | null, responseCount: number, responseRating: string }> {
    // Get the user's response time stats
    const [user] = await db
      .select({
        totalResponseTime: users.totalResponseTime,
        responseCount: users.responseCount,
        averageResponseTime: users.averageResponseTime
      })
      .from(users)
      .where(eq(users.id, hostId));

    if (!user || !user.responseCount || user.responseCount < 2) {
      return {
        averageResponseTime: null,
        responseCount: user?.responseCount || 0,
        responseRating: ''
      };
    }

    const avgTime = user.averageResponseTime || 0;
    let responseRating = '';

    // Calculate rating based on average response time
    if (avgTime <= 60) { // 1 hour or less
      responseRating = 'Excellent';
    } else if (avgTime <= 180) { // 3 hours or less
      responseRating = 'Great';
    } else if (avgTime <= 360) { // 6 hours or less
      responseRating = 'Good';
    } else if (avgTime <= 1440) { // 24 hours or less
      responseRating = 'Average';
    } else {
      responseRating = 'Needs Improvement';
    }

    return {
      averageResponseTime: avgTime,
      responseCount: user.responseCount,
      responseRating
    };
  }

  async calculateAndUpdateUserResponseTime(userId: number): Promise<void> {
    // Get all conversations where the user is the host
    const conversations = await db
      .select()
      .from(messageConversations)
      .where(
        and(
          eq(messageConversations.hostId, userId),
          eq(messageConversations.conversationStatus, 'responded'),
          ne(messageConversations.responseTimeMinutes, null)
        )
      );

    if (conversations.length === 0) return;

    // Calculate total and average response time
    let totalResponseTime = 0;
    let validResponses = 0;

    conversations.forEach(conv => {
      if (conv.responseTimeMinutes !== null && conv.responseTimeMinutes > 0) {
        totalResponseTime += conv.responseTimeMinutes;
        validResponses++;
      }
    });

    const averageResponseTime = validResponses > 0 ? Math.round(totalResponseTime / validResponses) : 0;

    // Update user's response time stats
    await db
      .update(users)
      .set({
        totalResponseTime,
        responseCount: validResponses,
        averageResponseTime,
        lastCalculatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  async getMessage(messageId: number): Promise<Message | undefined> {
    const [message] = await db
      .select()
      .from(messages)
      .where(eq(messages.id, messageId));
    return message;
  }

  async updateMessage(messageId: number, updateData: Partial<Message>): Promise<Message> {
    const [updatedMessage] = await db
      .update(messages)
      .set(updateData)
      .where(eq(messages.id, messageId))
      .returning();

    if (!updatedMessage) {
      throw new Error("Message not found");
    }

    return updatedMessage;
  }

  async getMessagesByLocation(locationId: number): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.locationId, locationId))
      .orderBy(desc(messages.createdAt));
  }

  // Location Folders
  async getLocationFolders(userId: number): Promise<LocationFolder[]> {
    try {
      console.log(`Fetching location folders for user ${userId}`);
      
      // Only select the columns that exist in the database
      const folders = await db
        .select({
          id: locationFolders.id,
          userId: locationFolders.userId,
          name: locationFolders.name,
          createdAt: locationFolders.createdAt
        })
        .from(locationFolders)
        .where(eq(locationFolders.userId, userId))
        .orderBy(asc(locationFolders.name));
      
      // Add default values for missing columns
      return folders.map(folder => ({
        ...folder,
        description: null,
        color: "#4f46e5",
        icon: "folder",
        updatedAt: folder.createdAt
      }));
    } catch (error) {
      console.error("Error fetching location folders:", error);
      throw new Error("Failed to fetch location folders");
    }
  }
  
  async getLocationFolder(id: number): Promise<LocationFolder | undefined> {
    try {
      const [folder] = await db
        .select({
          id: locationFolders.id,
          userId: locationFolders.userId,
          name: locationFolders.name,
          createdAt: locationFolders.createdAt
        })
        .from(locationFolders)
        .where(eq(locationFolders.id, id));
      
      if (!folder) return undefined;
      
      // Add default values for missing columns
      return {
        ...folder,
        description: null,
        color: "#4f46e5",
        icon: "folder",
        updatedAt: folder.createdAt
      };
    } catch (error) {
      console.error(`Error fetching location folder ${id}:`, error);
      throw new Error("Failed to fetch location folder");
    }
  }
  
  async createLocationFolder(folder: InsertLocationFolder): Promise<LocationFolder> {
    try {
      // Only include fields that exist in the database
      const folderData = {
        userId: folder.userId,
        name: folder.name
      };
      
      // Insert folder into database
      const [newFolder] = await db
        .insert(locationFolders)
        .values(folderData)
        .returning({
          id: locationFolders.id,
          userId: locationFolders.userId,
          name: locationFolders.name,
          createdAt: locationFolders.createdAt
        });
      
      // Return the folder with default values for missing columns
      return {
        ...newFolder,
        description: null,
        color: "#4f46e5",
        icon: "folder",
        updatedAt: newFolder.createdAt
      };
    } catch (error) {
      console.error("Error creating location folder:", error);
      throw new Error("Failed to create location folder");
    }
  }
  
  async updateLocationFolder(id: number, updateData: Partial<LocationFolder>): Promise<LocationFolder> {
    try {
      // Only update the fields that exist in the database
      const dataToUpdate: { name?: string } = {};
      
      // Extract only valid fields from updateData
      if (updateData.name !== undefined) {
        dataToUpdate.name = updateData.name;
      }
      
      // Fetch the current folder first
      const currentFolder = await this.getLocationFolder(id);
      if (!currentFolder) {
        throw new Error("Location folder not found");
      }
      
      // Update the folder with only valid fields
      const [updatedFolderData] = await db
        .update(locationFolders)
        .set(dataToUpdate)
        .where(eq(locationFolders.id, id))
        .returning({
          id: locationFolders.id,
          userId: locationFolders.userId,
          name: locationFolders.name,
          createdAt: locationFolders.createdAt
        });
      
      if (!updatedFolderData) {
        throw new Error("Location folder not found");
      }
      
      // Return the folder with virtual fields
      const updatedFolder: LocationFolder = {
        ...updatedFolderData,
        description: updateData.description !== undefined ? updateData.description : currentFolder.description,
        color: updateData.color !== undefined ? updateData.color : currentFolder.color,
        icon: updateData.icon !== undefined ? updateData.icon : currentFolder.icon,
        updatedAt: new Date()
      };
      
      return updatedFolder;
    } catch (error) {
      console.error(`Error updating location folder ${id}:`, error);
      throw new Error("Failed to update location folder");
    }
  }
  
  async deleteLocationFolder(id: number): Promise<void> {
    try {
      // First update any saved locations that reference this folder
      // to set their folderId to null
      await db
        .update(savedLocations)
        .set({ folderId: null })
        .where(eq(savedLocations.folderId, id));
      
      // Then delete the folder
      const result = await db
        .delete(locationFolders)
        .where(eq(locationFolders.id, id))
        .returning();
      
      if (result.length === 0) {
        throw new Error("Location folder not found");
      }
    } catch (error) {
      console.error(`Error deleting location folder ${id}:`, error);
      throw new Error("Failed to delete location folder");
    }
  }

  // Saved Locations
  async getSavedLocations(userId: number, folderId?: number): Promise<Location[]> {
    try {
      console.log(`Fetching saved locations for user ${userId}${folderId ? ` in folder ${folderId}` : ''}`);

      // Build the query conditions
      let conditions = eq(savedLocations.userId, userId);
      
      // Add folder condition if specified
      if (folderId !== undefined) {
        if (folderId === null) {
          conditions = and(conditions, isNull(savedLocations.folderId));
        } else {
          conditions = and(conditions, eq(savedLocations.folderId, folderId));
        }
      }
      
      // First get all saved location IDs for the user with optional folder filter
      const savedLocationIds = await db
        .select({ locationId: savedLocations.locationId })
        .from(savedLocations)
        .where(conditions);

      if (savedLocationIds.length === 0) {
        return [];
      }

      // Then fetch the actual location details
      const locationDetails = await db
        .select()
        .from(locations)
        .where(inArray(locations.id, savedLocationIds.map(sl => sl.locationId)));

      console.log('Found saved locations:', locationDetails);
      return locationDetails;
    } catch (error) {
      console.error("Error fetching saved locations:", error);
      throw new Error("Failed to fetch saved locations");
    }
  }
  
  async getSavedLocationDetails(userId: number): Promise<(SavedLocation & { location: Location, folder?: LocationFolder })[]> {
    try {
      console.log(`Fetching saved location details for user ${userId}`);
      
      // Join saved_locations with locations
      const result = await db
        .select({
          savedLocation: savedLocations,
          location: locations
        })
        .from(savedLocations)
        .innerJoin(locations, eq(savedLocations.locationId, locations.id))
        .where(eq(savedLocations.userId, userId))
        .orderBy(desc(savedLocations.createdAt));
      
      // For each saved location, fetch folder info separately if needed
      const enrichedResults = await Promise.all(
        result.map(async (item) => {
          let folder: LocationFolder | undefined = undefined;
          
          if (item.savedLocation.folderId) {
            // Fetch the folder separately
            try {
              folder = await this.getLocationFolder(item.savedLocation.folderId);
            } catch (folderError) {
              console.error(`Error fetching folder ${item.savedLocation.folderId}:`, folderError);
              // Continue without the folder info
            }
          }
          
          return {
            ...item.savedLocation,
            location: item.location,
            folder
          };
        })
      );
      
      return enrichedResults;
    } catch (error) {
      console.error("Error fetching saved location details:", error);
      throw new Error("Failed to fetch saved location details");
    }
  }

  async saveLocation(savedLocation: InsertSavedLocation): Promise<SavedLocation> {
    try {
      console.log(`Saving location ${savedLocation.locationId} for user ${savedLocation.userId}`);

      // Check if the location exists
      const locationExists = await db
        .select()
        .from(locations)
        .where(eq(locations.id, savedLocation.locationId))
        .limit(1);

      if (locationExists.length === 0) {
        throw new Error("Location does not exist");
      }

      // Check if already saved
      const alreadySaved = await this.isLocationSaved(
        savedLocation.userId,
        savedLocation.locationId
      );

      if (alreadySaved) {
        throw new Error("Location already saved");
      }

      // Save the location
      const [result] = await db
        .insert(savedLocations)
        .values({
          userId: savedLocation.userId,
          locationId: savedLocation.locationId,
          folderId: savedLocation.folderId,
        })
        .returning();

      console.log('Location saved successfully:', result);
      return result;
    } catch (error) {
      console.error("Error saving location:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to save location");
    }
  }
  
  async getSavedLocationIds(userId: number): Promise<number[]> {
    try {
      console.log(`Fetching saved location IDs for user ${userId}`);
      
      const savedLocationIds = await db
        .select({ locationId: savedLocations.locationId })
        .from(savedLocations)
        .where(eq(savedLocations.userId, userId));
      
      const ids = savedLocationIds.map(sl => sl.locationId);
      console.log(`Found ${ids.length} saved locations for user ${userId}`);
      return ids;
    } catch (error) {
      console.error("Error fetching saved location IDs:", error);
      throw new Error("Failed to fetch saved location IDs");
    }
  }
  
  async updateSavedLocation(userId: number, locationId: number, folderId: number | null): Promise<SavedLocation> {
    try {
      console.log(`Updating saved location ${locationId} for user ${userId} to folder ${folderId}`);
      
      // Check if the saved location exists
      const existingSavedLocation = await db
        .select()
        .from(savedLocations)
        .where(
          and(
            eq(savedLocations.userId, userId),
            eq(savedLocations.locationId, locationId)
          )
        )
        .limit(1);
      
      if (existingSavedLocation.length === 0) {
        throw new Error("Location is not saved for this user");
      }
      
      // Update the folder ID
      const [updatedSavedLocation] = await db
        .update(savedLocations)
        .set({ folderId })
        .where(
          and(
            eq(savedLocations.userId, userId),
            eq(savedLocations.locationId, locationId)
          )
        )
        .returning();
      
      console.log('Saved location updated successfully:', updatedSavedLocation);
      return updatedSavedLocation;
    } catch (error) {
      console.error("Error updating saved location:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update saved location");
    }
  }

  async unsaveLocation(userId: number, locationId: number): Promise<void> {
    try {
      console.log(`Unsaving location ${locationId} for user ${userId}`);

      const result = await db
        .delete(savedLocations)
        .where(
          and(
            eq(savedLocations.userId, userId),
            eq(savedLocations.locationId, locationId)
          )
        )
        .returning();

      if (result.length === 0) {
        throw new Error("Location was not saved");
      }

      console.log('Location unsaved successfully');
    } catch (error) {
      console.error("Error unsaving location:", error);
      throw new Error("Failed to unsave location");
    }
  }

  async isLocationSaved(userId: number, locationId: number): Promise<boolean> {
    try {
      console.log(`Checking if location ${locationId} is saved for user ${userId}`);

      const result = await db
        .select()
        .from(savedLocations)
        .where(
          and(
            eq(savedLocations.userId, userId),
            eq(savedLocations.locationId, locationId)
          )
        );

      const isSaved = result.length > 0;
      console.log(`Location saved status: ${isSaved}`);
      return isSaved;
    } catch (error) {
      console.error("Error checking saved status:", error);
      throw new Error("Failed to check saved status");
    }
  }

  // Admin-specific implementation methods

  // User Admin
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUsersByStatus(status: "active" | "banned" | "suspended"): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.status, status));
  }

  async updateUserRoles(userId: number, roles: string[]): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ roles })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async updateUserEditorPermissions(userId: number, permissions: any): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ editorPermissions: permissions })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  async updateUserStatus(userId: number, status: "active" | "banned" | "suspended", reason: string, adminId: number): Promise<User> {
    const now = new Date();
    
    const [updatedUser] = await db
      .update(users)
      .set({
        status,
        statusReason: reason,
        statusUpdatedAt: now,
        statusUpdatedBy: adminId
      })
      .where(eq(users.id, userId))
      .returning();
    
    // Log the admin action
    await this.createAdminLog({
      adminId,
      action: `user_${status}`,
      targetType: 'user',
      targetId: userId,
      details: { status, reason }
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  }

  // Location Admin
  async getLocationsByStatus(status: "pending" | "approved" | "rejected"): Promise<Location[]> {
    return db
      .select()
      .from(locations)
      .where(eq(locations.status, status));
  }

  async updateLocationStatus(locationId: number, status: "pending" | "approved" | "rejected", reason: string, adminId: number): Promise<Location> {
    const now = new Date();
    
    // Get the current location data for history tracking
    const currentLocation = await this.getLocation(locationId);
    if (!currentLocation) {
      throw new Error("Location not found");
    }
    
    // Set default reasons based on status if not provided
    let statusReason = reason;
    if (!statusReason || statusReason.trim() === '') {
      if (status === 'approved') {
        statusReason = 'Location approved by administrator';
      } else if (status === 'rejected') {
        statusReason = 'Location rejected by administrator';
      } else {
        statusReason = 'Status updated by administrator';
      }
    }
    
    const [updatedLocation] = await db
      .update(locations)
      .set({
        status,
        statusReason,
        statusUpdatedAt: now,
        statusUpdatedBy: adminId
      })
      .where(eq(locations.id, locationId))
      .returning();
      
    if (!updatedLocation) {
      throw new Error("Location not found");
    }
    
    // Track the status change in history
    await this.trackLocationUpdate(
      locationId,
      adminId,
      {
        status: currentLocation.status,
        statusReason: currentLocation.statusReason,
        statusUpdatedAt: currentLocation.statusUpdatedAt,
        statusUpdatedBy: currentLocation.statusUpdatedBy
      },
      {
        status,
        statusReason,
        statusUpdatedAt: now,
        statusUpdatedBy: adminId
      },
      ['status', 'statusReason', 'statusUpdatedAt', 'statusUpdatedBy'],
      'status_change',
      statusReason
    );
    
    // Log the admin action
    await this.createAdminLog({
      adminId,
      action: `location_${status}`,
      targetType: 'location',
      targetId: locationId,
      details: { status, reason: statusReason }
    });
    
    // Create a notification for the location owner
    if (status === 'approved' || status === 'rejected') {
      try {
        const notificationType = status === 'approved' ? 'location_approved' : 'location_rejected';
        const title = status === 'approved' 
          ? `Location "${updatedLocation.title}" Approved` 
          : `Location "${updatedLocation.title}" Rejected`;
          
        const message = status === 'approved'
          ? `Your location "${updatedLocation.title}" has been approved and is now visible to users.`
          : `Your location "${updatedLocation.title}" has been rejected. Reason: ${statusReason}`;
          
        const actionUrl = status === 'approved'
          ? `/listings`  // Direct them to listings page to see their approved location
          : `/listings`; // Also direct to listings page where they can see rejected status
          
        await this.createNotification({
          userId: updatedLocation.ownerId,
          type: notificationType,
          title: title,
          message: message,
          relatedId: locationId,
          relatedType: 'location',
          actionUrl: actionUrl
        });
        
        console.log(`Created ${notificationType} notification for user ${updatedLocation.ownerId}`);
      } catch (error) {
        console.error(`Failed to create location status notification: ${error}`);
        // Don't throw the error, as we still want to return the updated location
      }
    }

    return updatedLocation;
  }

  // Booking Admin
  async getAllBookings(): Promise<(Booking & { locationTitle?: string; clientName?: string })[]> {
    try {
      // Get all bookings with joins to get location titles and client names
      const result = await db.select({
        // Booking fields
        id: bookings.id,
        locationId: bookings.locationId,
        clientId: bookings.clientId,
        startDate: bookings.startDate,
        endDate: bookings.endDate,
        totalPrice: bookings.totalPrice,
        status: bookings.status,
        activityType: bookings.activityType,
        projectName: bookings.projectName,
        renterCompany: bookings.renterCompany,
        projectDescription: bookings.projectDescription,
        guestCount: bookings.guestCount,
        paymentId: bookings.paymentId,
        refundAmount: bookings.refundAmount,
        refundReason: bookings.refundReason,
        refundRequestedBy: bookings.refundRequestedBy,
        refundRequestedAt: bookings.refundRequestedAt,
        refundProcessedBy: bookings.refundProcessedBy,
        refundProcessedAt: bookings.refundProcessedAt,
        lastEditedBy: bookings.lastEditedBy,
        lastEditedAt: bookings.lastEditedAt,
        // Join with locations to get location title
        locationTitle: locations.title,
        // Join with users to get client name
        clientName: users.username
      })
      .from(bookings)
      .leftJoin(locations, eq(bookings.locationId, locations.id))
      .leftJoin(users, eq(bookings.clientId, users.id))
      .orderBy(desc(bookings.id)); // Show newest bookings first
      
      console.log(`Retrieved ${result.length} bookings with location and client information`);
      return result;
    } catch (error) {
      console.error("Error getting all bookings:", error);
      // Fallback to basic query if the join fails
      const fallbackResult = await db.select().from(bookings);
      return fallbackResult;
    }
  }

  async processRefund(bookingId: number, amount: number, reason: string, adminId: number): Promise<Booking> {
    const now = new Date();
    
    // Get the current booking to preserve information
    const currentBooking = await this.getBooking(bookingId);
    if (!currentBooking) {
      throw new Error("Booking not found");
    }
    
    // Update booking status to refunded and add refund details
    const [updatedBooking] = await db
      .update(bookings)
      .set({
        status: "refunded",
        refundAmount: amount,
        refundReason: reason,
        refundRequestedBy: adminId,
        refundRequestedAt: now,
        refundProcessedBy: adminId,
        refundProcessedAt: now,
        lastEditedBy: adminId,
        lastEditedAt: now
      })
      .where(eq(bookings.id, bookingId))
      .returning();
    
    // Log the admin action
    await this.createAdminLog({
      adminId,
      action: 'booking_refund',
      targetType: 'booking',
      targetId: bookingId,
      details: { 
        amount,
        reason,
        previousStatus: currentBooking.status
      }
    });

    // Create a booking edit history record
    await this.createBookingEditHistory({
      bookingId,
      editorId: adminId,
      previousData: currentBooking,
      newData: updatedBooking,
      reason: `Admin issued refund: ${reason}`,
      notifiedClient: true
    });
    
    // Create notification for client about refund
    try {
      // Get location details
      const location = await this.getLocation(updatedBooking.locationId);
      if (!location) {
        console.error(`Location not found for booking ${bookingId}`);
        return updatedBooking;
      }
      
      // Create refund notification
      await this.createNotification({
        userId: updatedBooking.clientId,
        type: "booking_refunded",
        title: "Booking Refunded",
        message: `Your booking for "${location.title}" has been refunded. Amount: $${amount}. Reason: ${reason}`,
        relatedId: bookingId,
        relatedType: 'booking',
        actionUrl: `/dashboard` // Direct to dashboard
      });
      
      console.log(`Created booking_refunded notification for client ${updatedBooking.clientId}`);
    } catch (error) {
      console.error(`Failed to create refund notification: ${error}`);
      // Don't throw error, as we still want to return the updated booking
    }

    return updatedBooking;
  }

  // Message Admin
  async getAllUserConversations(): Promise<{ userId1: number, userId2: number, locationId: number, lastMessageDate: Date, userName1?: string, userName2?: string, locationTitle?: string }[]> {
    // This query is complex as we need to find unique conversations between users
    // For simplicity here, we'll use a base approach that can be optimized later
    const allMessages = await db.select().from(messages);
    
    // Create a map to track unique conversations
    const conversationMap = new Map<string, { userId1: number, userId2: number, locationId: number, lastMessageDate: Date }>();
    
    // Process messages to extract unique conversations
    for (const message of allMessages) {
      // Ensure smaller ID is always first to avoid duplicates
      const userId1 = Math.min(message.senderId, message.receiverId);
      const userId2 = Math.max(message.senderId, message.receiverId);
      const locationId = message.locationId;
      
      // Create a unique key for this conversation
      const key = `${userId1}-${userId2}-${locationId}`;
      
      // Update the conversation map with the most recent message
      if (!conversationMap.has(key) || 
          message.createdAt > conversationMap.get(key)!.lastMessageDate) {
        conversationMap.set(key, {
          userId1,
          userId2,
          locationId,
          lastMessageDate: message.createdAt
        });
      }
    }
    
    // Convert the map to an array
    const conversations = Array.from(conversationMap.values());
    
    // Add user names and location titles
    const enhancedConversations = await Promise.all(
      conversations.map(async (conv) => {
        // Get user 1 details
        const user1 = await this.getUser(conv.userId1);
        // Get user 2 details
        const user2 = await this.getUser(conv.userId2);
        // Get location details
        const location = await this.getLocation(conv.locationId);
        
        return {
          ...conv,
          userName1: user1 ? user1.username : undefined,
          userName2: user2 ? user2.username : undefined,
          locationTitle: location ? location.title : undefined
        };
      })
    );
    
    return enhancedConversations;
  }

  async getAdminFilteredMessages(filter: { userId?: number, locationId?: number, dateFrom?: Date, dateTo?: Date }): Promise<Message[]> {
    let query = db.select().from(messages);
    
    // Apply filters
    if (filter.userId) {
      query = query.where(
        or(
          eq(messages.senderId, filter.userId),
          eq(messages.receiverId, filter.userId)
        )
      );
    }
    
    if (filter.locationId) {
      query = query.where(eq(messages.locationId, filter.locationId));
    }
    
    if (filter.dateFrom) {
      query = query.where(gte(messages.createdAt, filter.dateFrom));
    }
    
    if (filter.dateTo) {
      query = query.where(lte(messages.createdAt, filter.dateTo));
    }
    
    const messagesData = await query.orderBy(desc(messages.createdAt));
    
    // Add sender and receiver names to messages
    const enhancedMessages = await Promise.all(
      messagesData.map(async (message) => {
        const sender = await this.getUser(message.senderId);
        const receiver = await this.getUser(message.receiverId);
        const location = await this.getLocation(message.locationId);
        
        return {
          ...message,
          senderName: sender ? sender.username : undefined,
          receiverName: receiver ? receiver.username : undefined,
          locationTitle: location ? location.title : undefined
        };
      })
    );
    
    return enhancedMessages;
  }

  // Admin Logs
  async createAdminLog(log: InsertAdminLog): Promise<AdminLog> {
    const [adminLog] = await db
      .insert(adminLogs)
      .values({
        ...log,
        createdAt: new Date()
      })
      .returning();
      
    if (!adminLog) {
      throw new Error("Failed to create admin log");
    }
    
    return adminLog;
  }

  async getAdminLogs(filter?: { adminId?: number, targetType?: string, targetId?: number, dateFrom?: Date, dateTo?: Date }): Promise<AdminLog[]> {
    let query = db.select().from(adminLogs);
    
    // Apply filters if provided
    if (filter) {
      if (filter.adminId) {
        query = query.where(eq(adminLogs.adminId, filter.adminId));
      }
      
      if (filter.targetType) {
        query = query.where(eq(adminLogs.targetType, filter.targetType));
      }
      
      if (filter.targetId) {
        query = query.where(eq(adminLogs.targetId, filter.targetId));
      }
      
      if (filter.dateFrom) {
        query = query.where(gte(adminLogs.createdAt, filter.dateFrom));
      }
      
      if (filter.dateTo) {
        query = query.where(lte(adminLogs.createdAt, filter.dateTo));
      }
    }
    
    return query.orderBy(desc(adminLogs.createdAt));
  }

  // Spotlight Locations
  async getSpotlightLocations(): Promise<(SpotlightLocation & { location: Location })[]> {
    // Get all spotlight locations with their related location data
    const spotlights = await db
      .select({
        id: spotlightLocations.id,
        locationId: spotlightLocations.locationId,
        startDate: spotlightLocations.startDate,
        endDate: spotlightLocations.endDate,
        spotlightOrder: spotlightLocations.spotlightOrder,
        city: spotlightLocations.city,
        priority: spotlightLocations.priority,
        createdAt: spotlightLocations.createdAt,
        createdBy: spotlightLocations.createdBy,
        location: locations,
      })
      .from(spotlightLocations)
      .leftJoin(locations, eq(spotlightLocations.locationId, locations.id))
      .orderBy(spotlightLocations.spotlightOrder);

    return spotlights;
  }

  async getCurrentSpotlightLocations(city?: string): Promise<(SpotlightLocation & { location: Location })[]> {
    // Get spotlight locations that are currently active (current date is between startDate and endDate)
    const now = new Date();
    
    console.log(`[SPOTLIGHT] getCurrentSpotlightLocations called with city: ${city}`);
    
    let whereConditions = and(
      lte(spotlightLocations.startDate, now),
      gte(spotlightLocations.endDate, now)
    );

    // Try to get city-specific spotlights first
    if (city) {
      const citySpecificConditions = and(
        whereConditions,
        eq(spotlightLocations.city, city)
      );
      
      const citySpotlights = await db
        .select({
          id: spotlightLocations.id,
          locationId: spotlightLocations.locationId,
          startDate: spotlightLocations.startDate,
          endDate: spotlightLocations.endDate,
          spotlightOrder: spotlightLocations.spotlightOrder,
          city: spotlightLocations.city,
          priority: spotlightLocations.priority,
          createdAt: spotlightLocations.createdAt,
          createdBy: spotlightLocations.createdBy,
          location: locations,
        })
        .from(spotlightLocations)
        .leftJoin(locations, eq(spotlightLocations.locationId, locations.id))
        .where(citySpecificConditions)
        .orderBy(desc(spotlightLocations.priority), spotlightLocations.spotlightOrder);

      console.log(`[SPOTLIGHT] Found ${citySpotlights.length} city-specific spotlights for ${city}`);
      
      // If we found city-specific spotlights, return them
      if (citySpotlights.length > 0) {
        return citySpotlights;
      }
      
      console.log(`[SPOTLIGHT] No city-specific spotlights found for ${city}, falling back to all active spotlights`);
    }
    
    // Fallback: return all currently active spotlights (regardless of city)
    const allCurrentSpotlights = await db
      .select({
        id: spotlightLocations.id,
        locationId: spotlightLocations.locationId,
        startDate: spotlightLocations.startDate,
        endDate: spotlightLocations.endDate,
        spotlightOrder: spotlightLocations.spotlightOrder,
        city: spotlightLocations.city,
        priority: spotlightLocations.priority,
        createdAt: spotlightLocations.createdAt,
        createdBy: spotlightLocations.createdBy,
        location: locations,
      })
      .from(spotlightLocations)
      .leftJoin(locations, eq(spotlightLocations.locationId, locations.id))
      .where(whereConditions)
      .orderBy(desc(spotlightLocations.priority), spotlightLocations.spotlightOrder);

    console.log(`[SPOTLIGHT] Returning ${allCurrentSpotlights.length} total active spotlights`);
    return allCurrentSpotlights;
  }

  async getCurrentSpotlightLocationsByCity(city: string): Promise<(SpotlightLocation & { location: Location })[]> {
    // Get spotlight locations specifically for the given city
    const now = new Date();
    
    const citySpotlights = await db
      .select({
        id: spotlightLocations.id,
        locationId: spotlightLocations.locationId,
        startDate: spotlightLocations.startDate,
        endDate: spotlightLocations.endDate,
        spotlightOrder: spotlightLocations.spotlightOrder,
        city: spotlightLocations.city,
        priority: spotlightLocations.priority,
        createdAt: spotlightLocations.createdAt,
        createdBy: spotlightLocations.createdBy,
        location: locations,
      })
      .from(spotlightLocations)
      .leftJoin(locations, eq(spotlightLocations.locationId, locations.id))
      .where(
        and(
          lte(spotlightLocations.startDate, now),
          gte(spotlightLocations.endDate, now),
          eq(spotlightLocations.city, city)
        )
      )
      .orderBy(desc(spotlightLocations.priority), spotlightLocations.spotlightOrder);

    return citySpotlights;
  }

  async getAvailableCitiesForSpotlight(): Promise<string[]> {
    // Return all supported cities for spotlight feature
    // This includes 15 major US cities and 15 major Italian cities
    const US_CITIES = [
      'New York',
      'Los Angeles', 
      'Chicago',
      'Houston',
      'Phoenix',
      'Philadelphia',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
      'Miami',
      'Boston',
      'Seattle',
      'Denver',
      'Atlanta'
    ];
    
    const ITALIAN_CITIES = [
      'Rome',
      'Milan',
      'Naples',
      'Turin',
      'Palermo',
      'Genoa',
      'Bologna',
      'Florence',
      'Venice',
      'Verona',
      'Catania',
      'Bari',
      'Messina',
      'Padua',
      'Trieste'
    ];
    
    return [...US_CITIES, ...ITALIAN_CITIES].sort();
  }

  async createSpotlightLocation(spotlight: InsertSpotlightLocation): Promise<SpotlightLocation> {
    // Make sure the location exists and is approved
    const [location] = await db
      .select()
      .from(locations)
      .where(
        and(
          eq(locations.id, spotlight.locationId),
          eq(locations.status, "approved")
        )
      );

    if (!location) {
      throw new Error("Location not found or not approved");
    }

    // Ensure dates are properly formatted as Date objects
    const preparedData = {
      ...spotlight,
      startDate: new Date(spotlight.startDate),
      endDate: new Date(spotlight.endDate)
    };

    // Insert the spotlight location
    try {
      const [newSpotlight] = await db
        .insert(spotlightLocations)
        .values(preparedData)
        .returning();
        
      // Notify the location owner that their location has been spotlighted
      try {
        // Format dates for display
        const startDateFormatted = new Date(newSpotlight.startDate).toLocaleDateString();
        const endDateFormatted = new Date(newSpotlight.endDate).toLocaleDateString();
        
        // Create notification for the location owner
        await this.createNotification({
          userId: location.ownerId,
          type: "location_spotlighted",
          title: `"${location.title}" Featured in Spotlight`,
          message: `Your location "${location.title}" has been featured in our spotlight section from ${startDateFormatted} to ${endDateFormatted}. This will increase visibility for your property!`,
          relatedId: newSpotlight.id,
          relatedType: 'spotlight',
          actionUrl: `/location/${location.id}` // Direct to location page
        });
        
        console.log(`Created location_spotlighted notification for user ${location.ownerId}`);
      } catch (error) {
        console.error(`Failed to create spotlight notification: ${error}`);
        // Don't throw error, as we still want to return the spotlight location
      }

      return newSpotlight;
    } catch (error) {
      console.error("Error inserting spotlight location:", error);
      throw error;
    }
  }

  async updateSpotlightLocation(id: number, updateData: Partial<SpotlightLocation>): Promise<SpotlightLocation> {
    // Prepare the update data, ensuring dates are handled properly
    const preparedData: Partial<SpotlightLocation> = { ...updateData };
    
    // Convert date strings to Date objects if present
    if (updateData.startDate) {
      preparedData.startDate = new Date(updateData.startDate);
    }
    
    if (updateData.endDate) {
      preparedData.endDate = new Date(updateData.endDate);
    }
    
    // Update the spotlight location
    try {
      const [updatedSpotlight] = await db
        .update(spotlightLocations)
        .set(preparedData)
        .where(eq(spotlightLocations.id, id))
        .returning();
  
      if (!updatedSpotlight) {
        throw new Error("Spotlight location not found");
      }
  
      return updatedSpotlight;
    } catch (error) {
      console.error("Error updating spotlight location:", error);
      throw error;
    }
  }

  async deleteSpotlightLocation(id: number): Promise<void> {
    // Delete the spotlight location
    await db
      .delete(spotlightLocations)
      .where(eq(spotlightLocations.id, id));
  }

  // Notifications
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const unreadNotifications = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    return unreadNotifications[0]?.count || 0;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({
        ...notification,
        isRead: false,
        createdAt: new Date(),
      })
      .returning();
    
    return newNotification;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId));
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await db
      .delete(notifications)
      .where(eq(notifications.id, notificationId));
  }

  // Secret Locations
  async getSecretLocations(): Promise<SecretLocation[]> {
    return db.select().from(secretLocations);
  }
  
  // Secret Corners Access methods
  async applyForSecretCornersAccess(userId: number, application: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        secretCornersAccess: "pending",
        secretCornersApplication: application,
        secretCornersAppliedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    // Log action in admin logs - this will be visible to admins
    await this.createAdminLog({
      adminId: userId, // Self-initiated action
      action: "applied for Secret Corners access",
      targetType: "user",
      targetId: userId,
      details: {
        username: updatedUser.username,
        application: application
      }
    });
    
    return updatedUser;
  }
  
  async getSecretCornersApplications(status: "pending" | "approved" | "rejected"): Promise<User[]> {
    console.log(`Getting Secret Corners applications with status: ${status}`);
    const result = await db
      .select()
      .from(users)
      .where(eq(users.secretCornersAccess, status));
    
    console.log(`Found ${result.length} applications with status ${status}`);
    return result;
  }
  
  async updateSecretCornersAccessStatus(
    userId: number, 
    status: "approved" | "rejected", 
    reason: string, 
    adminId: number
  ): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        secretCornersAccess: status,
        secretCornersRejectionReason: status === "rejected" ? reason : null,
        secretCornersApprovedAt: status === "approved" ? new Date() : null,
        secretCornersApprovedBy: status === "approved" ? adminId : null,
      })
      .where(eq(users.id, userId))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    // Log the admin action
    await this.createAdminLog({
      adminId,
      action: `${status} Secret Corners application`,
      targetType: "user",
      targetId: userId,
      details: {
        username: updatedUser.username,
        status,
        reason: reason || ""
      }
    });
    
    // Create notification for the user
    try {
      const notificationType = status === "approved" 
        ? "secret_corners_application_approved" 
        : "secret_corners_application_rejected";
        
      const title = status === "approved"
        ? "Secret Corners Access Approved"
        : "Secret Corners Access Rejected";
        
      const message = status === "approved"
        ? "Your application for Secret Corners access has been approved! You now have access to our exclusive photography locations."
        : `Your application for Secret Corners access has been rejected. Reason: ${reason || "No reason provided."}`;
      
      const actionUrl = status === "approved" ? "/secret-corners" : null;
      
      await this.createNotification({
        userId: userId,
        type: notificationType,
        title: title,
        message: message,
        relatedId: userId,
        relatedType: "user",
        actionUrl: actionUrl
      });
    } catch (error) {
      console.error(`Failed to create Secret Corners application notification: ${error}`);
      // Don't throw error, as we still want to return the updated user
    }
    
    return updatedUser;
  }
  
  async hasSecretCornersAccess(userId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return false;
    }
    
    // Users with the 'admin' role automatically have access
    if (user.roles.includes("admin")) {
      return true;
    }
    
    // Otherwise check for approved secret corners access
    return user.secretCornersAccess === "approved";
  }
  
  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserSecretCornersSubscription(userId: number, subscriptionData: {
    tier?: string;
    status?: string;
    stripeSubscriptionId?: string;
    startedAt?: Date;
    endsAt?: Date;
  }): Promise<User> {
    const updateData: any = {};
    
    if (subscriptionData.tier !== undefined) {
      updateData.secretCornersSubscriptionTier = subscriptionData.tier;
    }
    if (subscriptionData.status !== undefined) {
      updateData.secretCornersSubscriptionStatus = subscriptionData.status;
    }
    if (subscriptionData.stripeSubscriptionId !== undefined) {
      updateData.stripeSubscriptionId = subscriptionData.stripeSubscriptionId;
    }
    if (subscriptionData.startedAt !== undefined) {
      updateData.secretCornersSubscriptionStartedAt = subscriptionData.startedAt;
    }
    if (subscriptionData.endsAt !== undefined) {
      updateData.secretCornersSubscriptionEndsAt = subscriptionData.endsAt;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    return updatedUser;
  }
  
  async updateUserIdentityVerification(userId: number, verificationData: {
    status?: "not_started" | "pending" | "verified" | "failed" | "expired";
    sessionId?: string;
    verifiedAt?: Date;
    method?: string;
    failureReason?: string;
  }): Promise<User> {
    const updateData: any = {};
    
    if (verificationData.status !== undefined) {
      updateData.identityVerificationStatus = verificationData.status;
    }
    if (verificationData.sessionId !== undefined) {
      updateData.identityVerificationSessionId = verificationData.sessionId;
    }
    if (verificationData.verifiedAt !== undefined) {
      updateData.identityVerifiedAt = verificationData.verifiedAt;
    }
    if (verificationData.method !== undefined) {
      updateData.identityVerificationMethod = verificationData.method;
    }
    if (verificationData.failureReason !== undefined) {
      updateData.identityVerificationFailureReason = verificationData.failureReason;
    }
    
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async getUsersWithVerificationStatus(status: "not_started" | "pending" | "verified" | "failed" | "expired"): Promise<User[]> {
    return db.select().from(users).where(eq(users.identityVerificationStatus, status));
  }
  
  async getSecretLocationsByUser(userId: number): Promise<SecretLocation[]> {
    return db.select().from(secretLocations).where(eq(secretLocations.userId, userId));
  }
  
  async getSecretLocation(id: number): Promise<SecretLocation | undefined> {
    const [secretLocation] = await db.select().from(secretLocations).where(eq(secretLocations.id, id));
    return secretLocation;
  }
  
  async createSecretLocation(insertSecretLocation: InsertSecretLocation): Promise<SecretLocation> {
    const [secretLocation] = await db.insert(secretLocations).values(insertSecretLocation).returning();
    
    // Send notification to admin about new secret location submission
    try {
      // Get user details
      const user = await this.getUser(secretLocation.userId);
      const username = user ? user.username : "A user";
      
      // Find admin users to notify
      const admins = await db
        .select()
        .from(users)
        .where(eq(users.roles, ["admin"]));
      
      // Create notifications for each admin
      for (const admin of admins) {
        await this.createNotification({
          userId: admin.id,
          type: "secret_location_approved", // Using a general type for now
          title: "New Secret Location Submission",
          message: `${username} has submitted a new secret location "${secretLocation.name}" for approval.`,
          relatedId: secretLocation.id,
          relatedType: 'secret_location',
          actionUrl: `/admin/secret-locations` // Admin page to review secret locations
        });
      }
      
      console.log(`Created notifications for ${admins.length} admins about new secret location`);
    } catch (error) {
      console.error(`Failed to create admin notification for secret location: ${error}`);
      // Don't throw error, as we still want to return the created location
    }
    
    return secretLocation;
  }
  
  async updateSecretLocation(id: number, updateData: Partial<SecretLocation>): Promise<SecretLocation> {
    const [updatedSecretLocation] = await db
      .update(secretLocations)
      .set(updateData)
      .where(eq(secretLocations.id, id))
      .returning();
    
    if (!updatedSecretLocation) {
      throw new Error("Secret location not found");
    }
    
    return updatedSecretLocation;
  }
  
  async deleteSecretLocation(id: number): Promise<void> {
    await db.delete(secretLocations).where(eq(secretLocations.id, id));
  }
  
  async getSecretLocationsByStatus(status: "pending" | "approved" | "rejected"): Promise<SecretLocation[]> {
    return db
      .select()
      .from(secretLocations)
      .where(eq(secretLocations.status, status));
  }
  
  async updateSecretLocationStatus(secretLocationId: number, status: "pending" | "approved" | "rejected", reason: string, adminId: number): Promise<SecretLocation> {
    // Get the secret location before updating
    const secretLocation = await this.getSecretLocation(secretLocationId);
    if (!secretLocation) {
      throw new Error("Secret location not found");
    }
    
    // Update the status
    const [updatedSecretLocation] = await db
      .update(secretLocations)
      .set({
        status,
        statusReason: reason,
        statusUpdatedAt: new Date(),
        statusUpdatedBy: adminId
      })
      .where(eq(secretLocations.id, secretLocationId))
      .returning();
    
    if (!updatedSecretLocation) {
      throw new Error("Secret location not found after update");
    }
    
    // Send notification to the user who submitted this location
    try {
      let notificationType: "secret_location_approved" | "secret_location_rejected";
      let title: string;
      let message: string;
      
      if (status === "approved") {
        notificationType = "secret_location_approved";
        title = "Secret Location Approved";
        message = `Your secret location "${updatedSecretLocation.name}" has been approved and is now visible on the map!`;
      } else if (status === "rejected") {
        notificationType = "secret_location_rejected";
        title = "Secret Location Rejected";
        message = `Your secret location "${updatedSecretLocation.name}" has been rejected${reason ? `: ${reason}` : "."}`;
      } else {
        return updatedSecretLocation; // No notification for pending status
      }
      
      // Create the notification
      await this.createNotification({
        userId: updatedSecretLocation.userId,
        type: notificationType,
        title,
        message,
        relatedId: updatedSecretLocation.id,
        relatedType: 'secret_location',
        actionUrl: `/secret-corners` // Direct to secret locations page
      });
      
      // Log admin action
      await this.createAdminLog({
        adminId,
        action: `${status === "approved" ? "Approved" : "Rejected"} secret location`,
        targetType: "secret_location",
        targetId: secretLocationId,
        details: {
          locationName: updatedSecretLocation.name,
          status,
          reason
        }
      });
      
      console.log(`Created ${notificationType} notification for user ${updatedSecretLocation.userId}`);
    } catch (error) {
      console.error(`Failed to create secret location status notification: ${error}`);
      // Don't throw error, as we still want to return the updated secret location
    }
    
    return updatedSecretLocation;
  }
  
  // Concierge Requests
  async createConciergeRequest(request: InsertConciergeRequest): Promise<ConciergeRequest> {
    console.log("Creating new concierge request", request);
    const [conciergeRequest] = await db
      .insert(conciergeRequests)
      .values(request)
      .returning();
    
    return conciergeRequest;
  }
  
  async getConciergeRequests(): Promise<ConciergeRequest[]> {
    return db.select().from(conciergeRequests).orderBy(desc(conciergeRequests.createdAt));
  }
  
  async getConciergeRequest(id: number): Promise<ConciergeRequest | undefined> {
    const [request] = await db
      .select()
      .from(conciergeRequests)
      .where(eq(conciergeRequests.id, id));
    
    return request;
  }
  
  async updateConciergeRequest(id: number, updateData: Partial<ConciergeRequest>): Promise<ConciergeRequest> {
    const [updatedRequest] = await db
      .update(conciergeRequests)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(conciergeRequests.id, id))
      .returning();
    
    if (!updatedRequest) {
      throw new Error("Concierge request not found");
    }
    
    return updatedRequest;
  }
  
  async getConciergeRequestsByStatus(status: "pending" | "in_progress" | "completed" | "cancelled"): Promise<ConciergeRequest[]> {
    return db
      .select()
      .from(conciergeRequests)
      .where(eq(conciergeRequests.status, status))
      .orderBy(desc(conciergeRequests.createdAt));
  }
  
  // Support Emails
  async createSupportEmail(supportEmail: InsertSupportEmail & { referenceId?: string }): Promise<SupportEmail> {
    console.log("Creating new support email", supportEmail);
    
    // Generate unique reference ID if not provided
    let referenceId = supportEmail.referenceId;
    
    if (!referenceId) {
      // Generate a unique reference ID with format SUP-XXXXXX (6 random digits)
      const randomId = Math.floor(100000 + Math.random() * 900000); // Generates 6-digit number
      referenceId = `SUP-${randomId}`;
    }
    
    // Create the support email with the generated reference ID
    // Remove referenceId from supportEmail to avoid duplicate
    const { referenceId: _, ...supportEmailData } = supportEmail;
    
    const [newSupportEmail] = await db
      .insert(supportEmails)
      .values({
        ...supportEmailData,
        referenceId
      })
      .returning();
    
    console.log("Created support email with reference ID:", newSupportEmail.referenceId);
    
    // Send notification to admins about new support request
    try {
      const admins = await db
        .select()
        .from(users)
        .where(sql`${users.roles} @> ARRAY['admin']::text[]`);
      
      for (const admin of admins) {
        await this.createNotification({
          userId: admin.id,
          type: "support_request",
          title: "New Support Request",
          message: `New support request from ${supportEmailData.name}: ${supportEmailData.subject}`,
          relatedId: newSupportEmail.id,
          relatedType: 'support_email',
          actionUrl: `/admin?tab=support`
        });
      }
    } catch (error) {
      console.error(`Failed to create admin notification for support email: ${error}`);
    }
    
    return newSupportEmail;
  }
  
  async getSupportEmail(id: number): Promise<SupportEmail | undefined> {
    const [email] = await db
      .select()
      .from(supportEmails)
      .where(eq(supportEmails.id, id));
    
    return email;
  }
  
  async getAllSupportEmails(): Promise<SupportEmail[]> {
    return db.select().from(supportEmails).orderBy(desc(supportEmails.createdAt));
  }
  
  async getSupportEmailsByStatus(status: "open" | "in_progress" | "resolved" | "closed"): Promise<SupportEmail[]> {
    return db
      .select()
      .from(supportEmails)
      .where(eq(supportEmails.status, status))
      .orderBy(desc(supportEmails.createdAt));
  }
  
  async updateSupportEmail(id: number, updateData: Partial<SupportEmail>): Promise<SupportEmail> {
    const [updatedEmail] = await db
      .update(supportEmails)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(supportEmails.id, id))
      .returning();
    
    if (!updatedEmail) {
      throw new Error("Support email not found");
    }
    
    return updatedEmail;
  }
  
  async deleteSupportEmail(id: number): Promise<void> {
    await db.delete(supportEmails).where(eq(supportEmails.id, id));
  }
  
  // Secret Corners Applications
  async createSecretCornersApplication(application: InsertSecretCornersApplication): Promise<SecretCornersApplication> {
    console.log("Creating new Secret Corners application", application);
    const [newApplication] = await db
      .insert(secretCornersApplications)
      .values(application)
      .returning();
    
    return newApplication;
  }
  
  async getSecretCornersApplication(userId: number): Promise<SecretCornersApplication | undefined> {
    const [application] = await db
      .select()
      .from(secretCornersApplications)
      .where(eq(secretCornersApplications.userId, userId))
      .orderBy(desc(secretCornersApplications.createdAt))
      .limit(1);
    
    return application;
  }
  
  async getUserSecretCornersApplications(): Promise<SecretCornersApplication[]> {
    return db
      .select()
      .from(secretCornersApplications)
      .orderBy(desc(secretCornersApplications.createdAt));
  }

  async getSecretCornersApplicationsByStatus(status: "pending" | "approved" | "rejected"): Promise<SecretCornersApplication[]> {
    console.log(`Getting Secret Corners applications with status: ${status} from new applications table`);
    const result = await db
      .select()
      .from(secretCornersApplications)
      .where(eq(secretCornersApplications.status, status))
      .orderBy(desc(secretCornersApplications.createdAt));
    
    console.log(`Found ${result.length} applications with status ${status} in new applications table`);
    return result;
  }
  
  async updateSecretCornersApplication(id: number, status: "approved" | "rejected" | "pending", reviewedBy: number, rejectionReason?: string): Promise<SecretCornersApplication> {
    const [updatedApplication] = await db
      .update(secretCornersApplications)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
        rejectionReason,
      })
      .where(eq(secretCornersApplications.id, id))
      .returning();
    
    if (!updatedApplication) {
      throw new Error("Secret Corners application not found");
    }
    
    return updatedApplication;
  }

  async deleteSecretCornersApplication(userId: number): Promise<void> {
    await db
      .delete(secretCornersApplications)
      .where(eq(secretCornersApplications.userId, userId));
  }

  // User Reports
  async createUserReport(report: InsertUserReport): Promise<UserReport> {
    console.log("Creating new user report", report);
    const [userReport] = await db
      .insert(userReports)
      .values(report)
      .returning();
    
    return userReport;
  }
  
  async getUserReports(): Promise<UserReport[]> {
    return db.select().from(userReports).orderBy(desc(userReports.createdAt));
  }
  
  async getUserReportsByStatus(status: "pending" | "reviewing" | "resolved" | "dismissed"): Promise<UserReport[]> {
    return db
      .select()
      .from(userReports)
      .where(eq(userReports.status, status))
      .orderBy(desc(userReports.createdAt));
  }
  
  async getUserReport(id: number): Promise<UserReport | undefined> {
    const [report] = await db
      .select()
      .from(userReports)
      .where(eq(userReports.id, id));
    
    return report;
  }
  
  async updateUserReport(id: number, updateData: Partial<UserReport>): Promise<UserReport> {
    const [updatedReport] = await db
      .update(userReports)
      .set(updateData)
      .where(eq(userReports.id, id))
      .returning();
    
    if (!updatedReport) {
      throw new Error("User report not found");
    }
    
    return updatedReport;
  }
  
  async getUserReportsByReporter(reporterId: number): Promise<UserReport[]> {
    return db
      .select()
      .from(userReports)
      .where(eq(userReports.reporterId, reporterId))
      .orderBy(desc(userReports.createdAt));
  }
  
  async getUserReportsAboutUser(reportedUserId: number): Promise<UserReport[]> {
    return db
      .select()
      .from(userReports)
      .where(eq(userReports.reportedUserId, reportedUserId))
      .orderBy(desc(userReports.createdAt));
  }

  // Location Calendar Integration
  async getLocationCalendarIntegration(locationId: number): Promise<LocationCalendarIntegration | undefined> {
    const [integration] = await db
      .select()
      .from(locationCalendarIntegrations)
      .where(eq(locationCalendarIntegrations.locationId, locationId));
    
    return integration;
  }

  async createLocationCalendarIntegration(integration: InsertLocationCalendarIntegration): Promise<LocationCalendarIntegration> {
    const [newIntegration] = await db
      .insert(locationCalendarIntegrations)
      .values(integration)
      .returning();
    
    return newIntegration;
  }

  async updateLocationCalendarIntegration(locationId: number, updateData: Partial<LocationCalendarIntegration>): Promise<LocationCalendarIntegration> {
    const [updatedIntegration] = await db
      .update(locationCalendarIntegrations)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(locationCalendarIntegrations.locationId, locationId))
      .returning();
    
    if (!updatedIntegration) {
      throw new Error("Calendar integration not found");
    }
    
    return updatedIntegration;
  }

  async deleteLocationCalendarIntegration(locationId: number): Promise<void> {
    await db
      .delete(locationCalendarIntegrations)
      .where(eq(locationCalendarIntegrations.locationId, locationId));
  }

  // Location Edit History
  async createLocationEditHistory(history: InsertLocationEditHistory): Promise<LocationEditHistory> {
    const [created] = await db
      .insert(locationEditHistory)
      .values(history)
      .returning();
    
    if (!created) {
      throw new Error("Failed to create location edit history");
    }
    
    return created;
  }

  async getLocationEditHistory(locationId: number): Promise<LocationEditHistory[]> {
    return db
      .select({
        id: locationEditHistory.id,
        locationId: locationEditHistory.locationId,
        editorId: locationEditHistory.editorId,
        editedAt: locationEditHistory.editedAt,
        changedFields: locationEditHistory.changedFields,
        previousData: locationEditHistory.previousData,
        newData: locationEditHistory.newData,
        editType: locationEditHistory.editType,
        reason: locationEditHistory.reason,
        ipAddress: locationEditHistory.ipAddress,
        // Join with users to get editor info
        editorUsername: users.username,
        editorEmail: users.email
      })
      .from(locationEditHistory)
      .leftJoin(users, eq(locationEditHistory.editorId, users.id))
      .where(eq(locationEditHistory.locationId, locationId))
      .orderBy(desc(locationEditHistory.editedAt));
  }

  async trackLocationUpdate(
    locationId: number, 
    editorId: number, 
    previousData: any, 
    newData: any, 
    changedFields: string[], 
    editType: "update" | "status_change" | "creation", 
    reason?: string, 
    ipAddress?: string
  ): Promise<LocationEditHistory> {
    return this.createLocationEditHistory({
      locationId,
      editorId,
      changedFields,
      previousData,
      newData,
      editType,
      reason,
      ipAddress
    });
  }

  // Site Settings
  async getSiteSetting(key: string): Promise<SiteSetting | undefined> {
    const [setting] = await db.select().from(siteSettings).where(eq(siteSettings.key, key));
    return setting;
  }

  async setSiteSetting(key: string, value: string, description?: string, updatedBy?: number): Promise<SiteSetting> {
    const existing = await this.getSiteSetting(key);
    
    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({ 
          value, 
          description: description || existing.description,
          updatedBy,
          updatedAt: new Date()
        })
        .where(eq(siteSettings.key, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(siteSettings)
        .values({ key, value, description, updatedBy })
        .returning();
      return created;
    }
  }

  async getAllSiteSettings(): Promise<SiteSetting[]> {
    return db.select().from(siteSettings);
  }

  // Content Moderation Alerts
  async createContentModerationAlert(alert: InsertContentModerationAlert): Promise<ContentModerationAlert> {
    const [newAlert] = await db
      .insert(contentModerationAlerts)
      .values(alert)
      .returning();
    return newAlert;
  }

  async getContentModerationAlerts(filter?: { resolved?: boolean, violationType?: string, locationId?: number }): Promise<ContentModerationAlert[]> {
    let query = db.select().from(contentModerationAlerts);
    
    const conditions = [];
    if (filter?.resolved !== undefined) {
      conditions.push(eq(contentModerationAlerts.resolved, filter.resolved));
    }
    if (filter?.violationType) {
      conditions.push(eq(contentModerationAlerts.violationType, filter.violationType as any));
    }
    if (filter?.locationId) {
      conditions.push(eq(contentModerationAlerts.locationId, filter.locationId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query.orderBy(desc(contentModerationAlerts.createdAt));
  }

  async getContentModerationAlert(id: number): Promise<ContentModerationAlert | undefined> {
    const [alert] = await db
      .select()
      .from(contentModerationAlerts)
      .where(eq(contentModerationAlerts.id, id));
    return alert;
  }

  async resolveContentModerationAlert(id: number, resolvedBy: number): Promise<ContentModerationAlert> {
    const [resolved] = await db
      .update(contentModerationAlerts)
      .set({
        resolved: true,
        resolvedBy,
        resolvedAt: new Date()
      })
      .where(eq(contentModerationAlerts.id, id))
      .returning();
    
    if (!resolved) {
      throw new Error("Content moderation alert not found");
    }
    
    return resolved;
  }

  async getContentModerationAlertsByMessage(messageId: number): Promise<ContentModerationAlert[]> {
    return db
      .select()
      .from(contentModerationAlerts)
      .where(eq(contentModerationAlerts.messageId, messageId))
      .orderBy(desc(contentModerationAlerts.createdAt));
  }



  async getSupportEmail(id: number): Promise<SupportEmail | undefined> {
    const [supportEmail] = await db.select().from(supportEmails).where(eq(supportEmails.id, id));
    return supportEmail;
  }

  async getAllSupportEmails(): Promise<SupportEmail[]> {
    return db.select().from(supportEmails).orderBy(desc(supportEmails.createdAt));
  }

  async getSupportEmailsByStatus(status: "open" | "in_progress" | "resolved" | "closed"): Promise<SupportEmail[]> {
    return db
      .select()
      .from(supportEmails)
      .where(eq(supportEmails.status, status))
      .orderBy(desc(supportEmails.createdAt));
  }

  async updateSupportEmail(id: number, updateData: Partial<SupportEmail>): Promise<SupportEmail> {
    // Always update the updatedAt timestamp
    const dataWithTimestamp = {
      ...updateData,
      updatedAt: new Date()
    };
    
    const [updated] = await db
      .update(supportEmails)
      .set(dataWithTimestamp)
      .where(eq(supportEmails.id, id))
      .returning();
    
    if (!updated) {
      throw new Error("Support email not found");
    }
    
    return updated;
  }

  async deleteSupportEmail(id: number): Promise<void> {
    await db.delete(supportEmails).where(eq(supportEmails.id, id));
  }

  // Forum Categories
  async getForumCategories(): Promise<ForumCategory[]> {
    return db.select().from(forumCategories).orderBy(forumCategories.name);
  }

  async getForumCategory(id: number): Promise<ForumCategory | undefined> {
    const [category] = await db.select().from(forumCategories).where(eq(forumCategories.id, id));
    return category;
  }

  async createForumCategory(category: InsertForumCategory): Promise<ForumCategory> {
    const [created] = await db.insert(forumCategories).values(category).returning();
    return created;
  }

  async updateForumCategory(id: number, updateData: Partial<ForumCategory>): Promise<ForumCategory> {
    const [updated] = await db
      .update(forumCategories)
      .set(updateData)
      .where(eq(forumCategories.id, id))
      .returning();
    
    if (!updated) {
      throw new Error("Forum category not found");
    }
    
    return updated;
  }

  async deleteForumCategory(id: number): Promise<void> {
    await db.delete(forumCategories).where(eq(forumCategories.id, id));
  }

  // Forum Posts
  async getForumPosts(categoryId?: number): Promise<ForumPost[]> {
    if (categoryId) {
      return db
        .select()
        .from(forumPosts)
        .where(eq(forumPosts.categoryId, categoryId))
        .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt));
    }
    return db
      .select()
      .from(forumPosts)
      .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt));
  }

  async getForumPost(id: number): Promise<ForumPost | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    return post;
  }

  async createForumPost(post: InsertForumPost): Promise<ForumPost> {
    const [created] = await db.insert(forumPosts).values(post).returning();
    return created;
  }

  async updateForumPost(id: number, updateData: Partial<ForumPost>): Promise<ForumPost> {
    const [updated] = await db
      .update(forumPosts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();
    
    if (!updated) {
      throw new Error("Forum post not found");
    }
    
    return updated;
  }

  async deleteForumPost(id: number): Promise<void> {
    await db.delete(forumPosts).where(eq(forumPosts.id, id));
  }

  async getForumPostsByUser(userId: number): Promise<ForumPost[]> {
    return db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.userId, userId))
      .orderBy(desc(forumPosts.createdAt));
  }

  async incrementForumPostViews(postId: number): Promise<void> {
    await db
      .update(forumPosts)
      .set({ views: sql`${forumPosts.views} + 1` })
      .where(eq(forumPosts.id, postId));
  }

  // Forum Comments
  async getForumComments(postId: number): Promise<ForumComment[]> {
    return db
      .select()
      .from(forumComments)
      .where(eq(forumComments.postId, postId))
      .orderBy(forumComments.createdAt);
  }

  async getForumComment(id: number): Promise<ForumComment | undefined> {
    const [comment] = await db.select().from(forumComments).where(eq(forumComments.id, id));
    return comment;
  }

  async createForumComment(comment: InsertForumComment): Promise<ForumComment> {
    const [created] = await db.insert(forumComments).values(comment).returning();
    
    // Update the post's updatedAt timestamp when a new comment is added
    await db
      .update(forumPosts)
      .set({ updatedAt: new Date() })
      .where(eq(forumPosts.id, comment.postId));
    
    return created;
  }

  async updateForumComment(id: number, updateData: Partial<ForumComment>): Promise<ForumComment> {
    const [updated] = await db
      .update(forumComments)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(forumComments.id, id))
      .returning();
    
    if (!updated) {
      throw new Error("Forum comment not found");
    }
    
    return updated;
  }

  async deleteForumComment(id: number): Promise<void> {
    await db.delete(forumComments).where(eq(forumComments.id, id));
  }

  async getForumCommentsByUser(userId: number): Promise<ForumComment[]> {
    return db
      .select()
      .from(forumComments)
      .where(eq(forumComments.userId, userId))
      .orderBy(desc(forumComments.createdAt));
  }

  // Forum Likes
  async createForumLike(like: InsertForumLike): Promise<ForumLike> {
    const [created] = await db.insert(forumLikes).values(like).returning();
    
    // Update the like count on the target
    if (like.targetType === 'post') {
      await db
        .update(forumPosts)
        .set({ likes: sql`${forumPosts.likes} + 1` })
        .where(eq(forumPosts.id, like.targetId));
    } else {
      await db
        .update(forumComments)
        .set({ likes: sql`${forumComments.likes} + 1` })
        .where(eq(forumComments.id, like.targetId));
    }
    
    return created;
  }

  async deleteForumLike(userId: number, targetType: "post" | "comment", targetId: number): Promise<void> {
    await db
      .delete(forumLikes)
      .where(
        and(
          eq(forumLikes.userId, userId),
          eq(forumLikes.targetType, targetType),
          eq(forumLikes.targetId, targetId)
        )
      );
    
    // Update the like count on the target
    if (targetType === 'post') {
      await db
        .update(forumPosts)
        .set({ likes: sql`GREATEST(${forumPosts.likes} - 1, 0)` })
        .where(eq(forumPosts.id, targetId));
    } else {
      await db
        .update(forumComments)
        .set({ likes: sql`GREATEST(${forumComments.likes} - 1, 0)` })
        .where(eq(forumComments.id, targetId));
    }
  }

  async getForumLikes(targetType: "post" | "comment", targetId: number): Promise<ForumLike[]> {
    return db
      .select()
      .from(forumLikes)
      .where(
        and(
          eq(forumLikes.targetType, targetType),
          eq(forumLikes.targetId, targetId)
        )
      );
  }

  async hasUserLikedForumItem(userId: number, targetType: "post" | "comment", targetId: number): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(forumLikes)
        .where(
          and(
            eq(forumLikes.userId, userId),
            eq(forumLikes.targetType, targetType),
            eq(forumLikes.targetId, targetId)
          )
        );
      return result.length > 0;
    } catch (error) {
      console.error('Error checking forum like:', error);
      return false;
    }
  }

  // Weekly Challenges
  async getWeeklyChallenges(): Promise<WeeklyChallenge[]> {
    return db.select().from(weeklyChallenge).orderBy(desc(weeklyChallenge.createdAt));
  }

  async getWeeklyChallenge(id: number): Promise<WeeklyChallenge | undefined> {
    const [challenge] = await db.select().from(weeklyChallenge).where(eq(weeklyChallenge.id, id));
    return challenge;
  }

  async createWeeklyChallenge(challenge: InsertWeeklyChallenge): Promise<WeeklyChallenge> {
    const [created] = await db.insert(weeklyChallenge).values(challenge).returning();
    return created;
  }

  async updateWeeklyChallenge(id: number, updateData: Partial<WeeklyChallenge>): Promise<WeeklyChallenge> {
    const [updated] = await db
      .update(weeklyChallenge)
      .set(updateData)
      .where(eq(weeklyChallenge.id, id))
      .returning();
    if (!updated) {
      throw new Error("Challenge not found");
    }
    return updated;
  }

  async deleteWeeklyChallenge(id: number): Promise<void> {
    await db.delete(weeklyChallenge).where(eq(weeklyChallenge.id, id));
  }

  async getActiveChallenges(): Promise<WeeklyChallenge[]> {
    const now = new Date();
    return db
      .select()
      .from(weeklyChallenge)
      .where(
        and(
          eq(weeklyChallenge.isActive, true),
          lte(weeklyChallenge.startDate, now),
          gte(weeklyChallenge.endDate, now)
        )
      )
      .orderBy(desc(weeklyChallenge.createdAt));
  }

  // Challenge Entries
  async getChallengeEntries(challengeId: number): Promise<ChallengeEntry[]> {
    return db
      .select()
      .from(challengeEntries)
      .where(eq(challengeEntries.challengeId, challengeId))
      .orderBy(desc(challengeEntries.createdAt));
  }

  async getChallengeEntry(id: number): Promise<ChallengeEntry | undefined> {
    const [entry] = await db.select().from(challengeEntries).where(eq(challengeEntries.id, id));
    return entry;
  }

  async createChallengeEntry(entry: InsertChallengeEntry): Promise<ChallengeEntry> {
    const [created] = await db.insert(challengeEntries).values(entry).returning();
    return created;
  }

  async updateChallengeEntry(id: number, updateData: Partial<ChallengeEntry>): Promise<ChallengeEntry> {
    const [updated] = await db
      .update(challengeEntries)
      .set(updateData)
      .where(eq(challengeEntries.id, id))
      .returning();
    if (!updated) {
      throw new Error("Challenge entry not found");
    }
    return updated;
  }

  async deleteChallengeEntry(id: number): Promise<void> {
    await db.delete(challengeEntries).where(eq(challengeEntries.id, id));
  }

  async deleteChallengeEntries(challengeId: number): Promise<void> {
    await db.delete(challengeEntries).where(eq(challengeEntries.challengeId, challengeId));
  }

  async selectChallengeWinner(challengeId: number, entryId: number): Promise<void> {
    // First, unset any existing winners for this challenge
    await db
      .update(challengeEntries)
      .set({ isWinner: false })
      .where(eq(challengeEntries.challengeId, challengeId));
    
    // Then set the new winner
    await db
      .update(challengeEntries)
      .set({ isWinner: true })
      .where(eq(challengeEntries.id, entryId));
    
    // Get the entry's location ID and update the challenge
    const [winner] = await db.select().from(challengeEntries).where(eq(challengeEntries.id, entryId));
    if (winner) {
      await db
        .update(weeklyChallenge)
        .set({ winningLocationId: winner.locationId })
        .where(eq(weeklyChallenge.id, challengeId));
    }
  }

  // Direct SQL execution for debugging
  async executeRawQuery(query: string, params: any[] = []): Promise<any[]> {
    try {
      console.log(`Executing raw SQL query: ${query} with params: ${JSON.stringify(params)}`);
      const result = await pool.query(query, params);
      console.log(`Raw query result: ${result.rowCount} rows`);
      return result.rows;
    } catch (error) {
      console.error('Error executing raw SQL query:', error);
      throw error;
    }
  }

  // Email Template Methods
  async getEmailTemplateByType(type: string, recipientRole: string): Promise<EmailTemplate | undefined> {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(and(
        eq(emailTemplates.type, type),
        eq(emailTemplates.recipientRole, recipientRole),
        eq(emailTemplates.active, true)
      ));
    return template;
  }

  async getEmailTemplateById(id: number): Promise<EmailTemplate | undefined> {
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, id));
    return template;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return db.select().from(emailTemplates).orderBy(desc(emailTemplates.type), desc(emailTemplates.recipientRole));
  }

  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const [newTemplate] = await db
      .insert(emailTemplates)
      .values(template)
      .returning();
    return newTemplate;
  }

  async updateEmailTemplate(id: number, updateData: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const [updated] = await db
      .update(emailTemplates)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(emailTemplates.id, id))
      .returning();
    return updated;
  }

  async deleteEmailTemplate(id: number): Promise<void> {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
  }

  // Email Event Methods
  async createEmailEvent(event: InsertEmailEvent): Promise<EmailEvent> {
    const [newEvent] = await db
      .insert(emailEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getEmailEvent(messageId: string): Promise<EmailEvent | undefined> {
    const [event] = await db
      .select()
      .from(emailEvents)
      .where(eq(emailEvents.messageId, messageId));
    return event;
  }

  async updateEmailEvent(messageId: string, updateData: Partial<EmailEvent>): Promise<EmailEvent> {
    const [updated] = await db
      .update(emailEvents)
      .set(updateData)
      .where(eq(emailEvents.messageId, messageId))
      .returning();
    return updated;
  }

  async getEmailEventsByUser(userId: number): Promise<EmailEvent[]> {
    return db
      .select()
      .from(emailEvents)
      .where(eq(emailEvents.userId, userId))
      .orderBy(desc(emailEvents.createdAt));
  }

  async getEmailEventsByStatus(status: string): Promise<EmailEvent[]> {
    return db
      .select()
      .from(emailEvents)
      .where(eq(emailEvents.status, status))
      .orderBy(desc(emailEvents.createdAt));
  }

  // Marketing Subscription Methods
  async getMarketingSubscription(email: string): Promise<MarketingSubscription | undefined> {
    const [subscription] = await db
      .select()
      .from(marketingSubscriptions)
      .where(eq(marketingSubscriptions.email, email));
    return subscription;
  }

  async createMarketingSubscription(subscription: InsertMarketingSubscription): Promise<MarketingSubscription> {
    const [newSubscription] = await db
      .insert(marketingSubscriptions)
      .values(subscription)
      .returning();
    return newSubscription;
  }

  async updateMarketingSubscription(email: string, updateData: Partial<MarketingSubscription>): Promise<MarketingSubscription> {
    const [updated] = await db
      .update(marketingSubscriptions)
      .set(updateData)
      .where(eq(marketingSubscriptions.email, email))
      .returning();
    return updated;
  }

  async getActiveMarketingSubscriptions(): Promise<MarketingSubscription[]> {
    return db
      .select()
      .from(marketingSubscriptions)
      .where(eq(marketingSubscriptions.status, "subscribed"));
  }

  // Email Campaign Methods
  async getEmailCampaign(id: number): Promise<EmailCampaign | undefined> {
    const [campaign] = await db
      .select()
      .from(emailCampaigns)
      .where(eq(emailCampaigns.id, id));
    return campaign;
  }

  async getEmailCampaigns(): Promise<EmailCampaign[]> {
    return db
      .select()
      .from(emailCampaigns)
      .orderBy(desc(emailCampaigns.createdAt));
  }

  async createEmailCampaign(campaign: InsertEmailCampaign): Promise<EmailCampaign> {
    const [newCampaign] = await db
      .insert(emailCampaigns)
      .values(campaign)
      .returning();
    return newCampaign;
  }

  async updateEmailCampaign(id: number, updateData: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const [updated] = await db
      .update(emailCampaigns)
      .set(updateData)
      .where(eq(emailCampaigns.id, id))
      .returning();
    return updated;
  }

  // User Email Preferences Methods
  async getUserEmailPreferences(userId: number): Promise<UserEmailPreferences | undefined> {
    const [preferences] = await db
      .select()
      .from(userEmailPreferences)
      .where(eq(userEmailPreferences.userId, userId));
    return preferences;
  }

  async createUserEmailPreferences(preferences: InsertUserEmailPreferences): Promise<UserEmailPreferences> {
    const [newPreferences] = await db
      .insert(userEmailPreferences)
      .values(preferences)
      .returning();
    return newPreferences;
  }

  async updateUserEmailPreferences(userId: number, updateData: Partial<UserEmailPreferences>): Promise<UserEmailPreferences> {
    const [updated] = await db
      .update(userEmailPreferences)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(userEmailPreferences.userId, userId))
      .returning();
    return updated;
  }

  // Email Suppression List Methods
  async isEmailSuppressed(email: string): Promise<boolean> {
    const [suppressed] = await db
      .select()
      .from(emailSuppressionList)
      .where(eq(emailSuppressionList.email, email));
    return !!suppressed;
  }

  async addToSuppressionList(suppression: InsertEmailSuppressionList): Promise<EmailSuppressionList> {
    const [newSuppression] = await db
      .insert(emailSuppressionList)
      .values(suppression)
      .onConflictDoNothing()
      .returning();
    return newSuppression;
  }

  async removeFromSuppressionList(email: string): Promise<void> {
    await db
      .delete(emailSuppressionList)
      .where(eq(emailSuppressionList.email, email));
  }

  async getSuppressionList(): Promise<EmailSuppressionList[]> {
    return db
      .select()
      .from(emailSuppressionList)
      .orderBy(desc(emailSuppressionList.createdAt));
  }

  // Password Reset Token Methods
  async createPasswordResetToken(token: InsertPasswordResetToken): Promise<PasswordResetToken> {
    const [newToken] = await db
      .insert(passwordResetTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async getPasswordResetToken(token: string): Promise<PasswordResetToken | undefined> {
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );
    return resetToken;
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.token, token));
  }

  async deleteExpiredPasswordResetTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()));
  }

  // Email Verification Token Methods
  async createEmailVerificationToken(token: InsertEmailVerificationToken): Promise<EmailVerificationToken> {
    const [newToken] = await db
      .insert(emailVerificationTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async getEmailVerificationToken(token: string): Promise<EmailVerificationToken | undefined> {
    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          isNull(emailVerificationTokens.verifiedAt),
          gt(emailVerificationTokens.expiresAt, new Date())
        )
      );
    return verificationToken;
  }

  async markEmailVerificationTokenUsed(token: string): Promise<void> {
    await db
      .update(emailVerificationTokens)
      .set({ verifiedAt: new Date() })
      .where(eq(emailVerificationTokens.token, token));
  }

  async deleteExpiredEmailVerificationTokens(): Promise<void> {
    await db
      .delete(emailVerificationTokens)
      .where(lt(emailVerificationTokens.expiresAt, new Date()));
  }

  // Guides Methods
  async getAllGuideCategories(): Promise<GuideCategory[]> {
    return db
      .select()
      .from(guideCategories)
      .orderBy(guideCategories.orderIndex, guideCategories.title);
  }

  async getGuideCategory(id: number): Promise<GuideCategory | undefined> {
    const [category] = await db
      .select()
      .from(guideCategories)
      .where(eq(guideCategories.id, id));
    return category;
  }

  async getGuideCategoryBySlug(slug: string): Promise<GuideCategory | undefined> {
    const [category] = await db
      .select()
      .from(guideCategories)
      .where(eq(guideCategories.slug, slug));
    return category;
  }

  async createGuideCategory(category: InsertGuideCategory): Promise<GuideCategory> {
    const [newCategory] = await db
      .insert(guideCategories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateGuideCategory(id: number, category: Partial<InsertGuideCategory>): Promise<GuideCategory> {
    const [updatedCategory] = await db
      .update(guideCategories)
      .set({
        ...category,
        updatedAt: new Date()
      })
      .where(eq(guideCategories.id, id))
      .returning();
    
    if (!updatedCategory) {
      throw new Error("Guide category not found");
    }
    
    return updatedCategory;
  }

  async deleteGuideCategory(id: number): Promise<void> {
    await db
      .delete(guideCategories)
      .where(eq(guideCategories.id, id));
  }

  async getAllGuides(includeUnpublished = false): Promise<Guide[]> {
    const query = db
      .select()
      .from(guides)
      .orderBy(desc(guides.featured), desc(guides.createdAt));
    
    if (!includeUnpublished) {
      return query.where(eq(guides.status, "published"));
    }
    
    return query;
  }

  async getGuidesByCategory(categoryId: number, includeUnpublished = false): Promise<Guide[]> {
    if (!includeUnpublished) {
      return db
        .select()
        .from(guides)
        .where(
          and(
            eq(guides.categoryId, categoryId),
            eq(guides.status, "published")
          )
        )
        .orderBy(desc(guides.featured), desc(guides.createdAt));
    }
    
    return db
      .select()
      .from(guides)
      .where(eq(guides.categoryId, categoryId))
      .orderBy(desc(guides.featured), desc(guides.createdAt));
  }

  async getGuide(id: number): Promise<Guide | undefined> {
    const [guide] = await db
      .select()
      .from(guides)
      .where(eq(guides.id, id));
    return guide;
  }

  async getGuideBySlug(slug: string): Promise<Guide | undefined> {
    const [guide] = await db
      .select()
      .from(guides)
      .where(eq(guides.slug, slug));
    return guide;
  }

  async createGuide(guide: InsertGuide): Promise<Guide> {
    console.log("=== STORAGE: Creating guide ===");
    console.log("Guide data to insert:", JSON.stringify(guide, null, 2));
    
    try {
      const [newGuide] = await db
        .insert(guides)
        .values(guide)
        .returning();
      
      console.log("=== STORAGE: Guide created successfully ===");
      console.log("Created guide:", JSON.stringify(newGuide, null, 2));
      
      return newGuide;
    } catch (error) {
      console.error("=== STORAGE: Error creating guide ===");
      console.error("Error details:", error);
      throw error;
    }
  }

  async updateGuide(id: number, guide: Partial<InsertGuide>): Promise<Guide> {
    const [updatedGuide] = await db
      .update(guides)
      .set({
        ...guide,
        updatedAt: new Date()
      })
      .where(eq(guides.id, id))
      .returning();
    
    if (!updatedGuide) {
      throw new Error("Guide not found");
    }
    
    return updatedGuide;
  }

  async deleteGuide(id: number): Promise<void> {
    await db
      .delete(guides)
      .where(eq(guides.id, id));
  }

  async incrementGuideViewCount(id: number): Promise<void> {
    await db
      .update(guides)
      .set({
        viewCount: sql`${guides.viewCount} + 1`
      })
      .where(eq(guides.id, id));
  }

  async getFeaturedGuides(): Promise<Guide[]> {
    return db
      .select()
      .from(guides)
      .where(
        and(
          eq(guides.featured, true),
          eq(guides.status, "published")
        )
      )
      .orderBy(desc(guides.createdAt))
      .limit(6);
  }
  
  async completePastBookings(): Promise<void> {
    const now = new Date();
    
    // Find all bookings with confirmed status where end date is in the past
    const pastBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.status, 'confirmed'),
          lt(bookings.endDate, now)
        )
      );
    
    if (pastBookings.length === 0) {
      return;
    }
    
    console.log(`[STORAGE] Auto-completing ${pastBookings.length} past bookings`);
    
    // Update all past bookings to completed status
    for (const booking of pastBookings) {
      await db
        .update(bookings)
        .set({
          status: 'completed'
        })
        .where(eq(bookings.id, booking.id));
      
      // Create notification for both host and client about auto-completion
      await this.createNotification({
        userId: booking.clientId,
        type: 'booking_completed',
        title: 'Booking Completed',
        message: `Your booking has been automatically marked as completed`,
        relatedEntityType: 'booking',
        relatedEntityId: booking.id
      });
      
      // Notify the host as well
      const location = await this.getLocation(booking.locationId);
      if (location && location.ownerId) {
        await this.createNotification({
          userId: location.ownerId,
          type: 'booking_completed',
          title: 'Booking Completed',
          message: `Booking #${booking.id} has been automatically marked as completed`,
          relatedEntityType: 'booking',
          relatedEntityId: booking.id
        });
      }
    }
    
    console.log(`[STORAGE] Successfully completed ${pastBookings.length} past bookings`);
  }
  
  // Dashboard API aliases and missing functions
  async getBookingsByUserId(userId: number): Promise<Booking[]> {
    const result = await this.getUserBookings(userId, { limit: 100 });
    return result.data;
  }

  async getBookingsByHostId(hostId: number): Promise<Booking[]> {
    try {
      // Get bookings where the user owns the location (is the host)
      const userLocations = await this.getLocationsByOwner(hostId, { limit: 100 });
      
      if (userLocations.data.length === 0) {
        return [];
      }

      const locationIds = userLocations.data.map(loc => loc.id);
      
      const hostBookings = await db
        .select()
        .from(bookings)
        .where(inArray(bookings.locationId, locationIds))
        .orderBy(desc(bookings.id));
      
      console.log(`Found ${hostBookings.length} host bookings for user ${hostId}`);
      return hostBookings;
    } catch (error) {
      console.error(`Error getting host bookings for user ${hostId}:`, error);
      return [];
    }
  }

  async getMessagesByUserId(userId: number): Promise<Message[]> {
    try {
      // Get messages where user is sender or receiver
      const userMessages = await db
        .select()
        .from(messages)
        .where(
          or(
            eq(messages.senderId, userId),
            eq(messages.receiverId, userId)
          )
        )
        .orderBy(desc(messages.createdAt));
      
      console.log(`Found ${userMessages.length} messages for user ${userId}`);
      return userMessages;
    } catch (error) {
      console.error(`Error getting messages for user ${userId}:`, error);
      return [];
    }
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return this.getUserNotifications(userId);
  }

  async getLocationsByOwnerId(ownerId: number): Promise<Location[]> {
    const result = await this.getLocationsByOwner(ownerId, { limit: 100 });
    return result.data;
  }

  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const unreadNotifications = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      );
    
    return unreadNotifications[0]?.count || 0;
  }
}

export const storage = new DatabaseStorage();