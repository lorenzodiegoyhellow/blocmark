// Define translation keys with typescript for type safety
export type TranslationKey = 
  | "common.search"
  | "common.login"
  | "common.logout"
  | "common.profile"
  | "common.settings"
  | "common.bookNow"
  | "common.viewDetails"
  | "common.save"
  | "common.cancel"
  | "common.confirm"
  | "common.back"
  | "common.next"
  | "common.pickDate"
  | "common.loading"
  | "common.error"
  | "common.success"
  | "common.failed"
  | "common.reserve"
  | "common.accept"
  | "common.decline"
  | "common.edit"
  | "common.delete"
  | "common.add"
  | "common.remove"
  | "common.submit"
  | "common.retry"
  | "common.close"
  | "common.open"
  | "common.show"
  | "common.hide"
  | "common.yes"
  | "common.no"
  | "common.required"
  | "common.optional"
  | "common.total"
  | "common.subtotal"
  | "common.tax"
  | "common.fee"
  | "common.discount"
  | "common.payment"
  | "common.processing"
  | "common.complete"
  | "common.pending"
  | "common.approved"
  | "common.rejected"
  | "common.cancelled"
  | "common.refunded"
  | "nav.home"
  | "nav.explore"
  | "nav.bookings"
  | "nav.messages"
  | "nav.savedLocations"
  | "nav.listings"
  | "nav.addListing"
  | "nav.analytics"
  | "nav.account"
  | "nav.secretCorners"
  | "home.heroTitle"
  | "home.heroSubtitle"
  | "home.searchPlaceholder"
  | "home.featuredTitle"
  | "home.featuredSubtitle"
  | "home.spotlightTitle"
  | "home.spotlightSubtitle"
  | "home.exploreTitle"
  | "home.exploreSubtitle"
  | "gallery.madeWith"
  | "gallery.subtitle"
  | "concierge.premiumService"
  | "concierge.title"
  | "concierge.subtitle"
  | "concierge.requestHelp"
  | "concierge.unlockSpaceTitle"
  | "concierge.unlockSpaceDesc"
  | "concierge.permitTitle"
  | "concierge.permitDesc"
  | "concierge.supportTitle"
  | "concierge.supportDesc"
  | "concierge.teamTitle"
  | "concierge.teamDesc"
  | "secretCorners.title"
  | "secretCorners.subtitle"
  | "secretCorners.premiumTitle"
  | "secretCorners.premiumDesc"
  | "secretCorners.memberTitle"
  | "secretCorners.memberDesc"
  | "secretCorners.submitTitle"
  | "secretCorners.submitDesc"
  | "secretCorners.curatedTitle"
  | "secretCorners.curatedDesc"
  | "hostBenefits.whyListTitle"
  | "hostBenefits.whyChooseTitle"
  | "hostBenefits.hostsTab"
  | "hostBenefits.rentersTab"
  | "hostBenefits.getPaidTitle"
  | "hostBenefits.getPaidDesc"
  | "hostBenefits.scheduleTitle"
  | "hostBenefits.scheduleDesc"
  | "hostBenefits.peaceTitle"
  | "hostBenefits.peaceDesc"
  | "hostBenefits.zeroTitle"
  | "hostBenefits.zeroDesc"
  | "hostBenefits.spotlightTitle"
  | "hostBenefits.spotlightDesc"
  | "hostBenefits.controlTitle"
  | "hostBenefits.controlDesc"
  | "hostBenefits.verifiedTitle"
  | "hostBenefits.verifiedDesc"
  | "hostBenefits.aiTitle"
  | "hostBenefits.aiDesc"
  | "hostBenefits.bookTitle"
  | "hostBenefits.bookDesc"
  | "hostBenefits.minutesTitle"
  | "hostBenefits.minutesDesc"
  | "hostBenefits.hiddenTitle"
  | "hostBenefits.hiddenDesc"
  | "hostBenefits.smartTitle"
  | "hostBenefits.smartDesc"
  | "hostBenefits.ctaTitle"
  | "hostBenefits.ctaSubtitle"
  | "hostBenefits.propertyOwner"
  | "hostBenefits.renterCreator"
  | "mobileApp.badge"
  | "mobileApp.title"
  | "mobileApp.subtitle"
  | "mobileApp.downloadOn"
  | "mobileApp.appStore"
  | "mobileApp.getItOn"
  | "mobileApp.googlePlay"
  | "mobileApp.linkText"
  | "guides.expertResources"
  | "guides.title"
  | "guides.subtitle"
  | "guides.browseAll"
  | "guides.studioTitle"
  | "guides.studioDesc"
  | "guides.scoutingTitle"
  | "guides.scoutingDesc"
  | "guides.eventTitle"
  | "guides.eventDesc"
  | "guides.aiTitle"
  | "guides.aiDesc"
  | "guides.photographyCategory"
  | "guides.filmingCategory"
  | "guides.eventsCategory"
  | "guides.technologyCategory"
  | "guides.readTime12"
  | "guides.readTime15"
  | "guides.readTime10"
  | "guides.readTime8"
  | "footer.description"
  | "footer.stayUpdated"
  | "footer.newsletterDesc"
  | "footer.emailPlaceholder"
  | "footer.subscribe"
  | "footer.subscribed"
  | "footer.company"
  | "footer.about"
  | "footer.careers"
  | "footer.press"
  | "footer.blog"
  | "footer.support"
  | "footer.help"
  | "footer.safety"
  | "footer.terms"
  | "footer.privacy"
  | "footer.accessibility"
  | "footer.community"
  | "footer.guidelines"
  | "footer.listSpace"
  | "footer.faq"
  | "footer.trustSafety"
  | "footer.activities"
  | "footer.photoShoot"
  | "footer.filming"
  | "footer.events"
  | "footer.meetings"
  | "footer.production"
  | "footer.types"
  | "footer.photoStudio"
  | "footer.filmStudio"
  | "footer.eventSpace"
  | "footer.officeSpace"
  | "footer.warehouse"
  | "footer.cities"
  | "footer.losAngeles"
  | "footer.newYork"
  | "footer.miami"
  | "footer.chicago"
  | "footer.viewAll"
  | "footer.connect"
  | "footer.guides"
  | "region.europe"
  | "region.americas"
  | "region.asia-pacific"
  | "seo.homeTitle"
  | "seo.homeDescription"
  | "location.price"
  | "location.perHour"
  | "location.amenities"
  | "location.book"
  | "listing.addListing"
  | "listing.yourListings"
  | "search.aiSearch"
  | "search.classicSearch"
  | "search.magicSearch"
  | "search.cityPlaceholder"
  | "search.featurePlaceholder"
  | "search.activityType"
  | "activity.photoShoot"
  | "activity.videoProduction"
  | "activity.event"
  | "activity.meeting"
  | "activity.filming"
  | "activity.commercial"
  | "activity.wedding"
  | "activity.corporate"
  | "booking.title"
  | "booking.completeBooking"
  | "booking.projectDetails"
  | "booking.paymentStep"
  | "booking.summary"
  | "booking.activity"
  | "booking.castCrew"
  | "booking.projectName"
  | "booking.company"
  | "booking.aboutProject"
  | "booking.date"
  | "booking.startTime"
  | "booking.endTime"
  | "booking.additionalServices"
  | "booking.paymentInformation"
  | "booking.paymentLoading"
  | "booking.paymentFailed"
  | "booking.paymentSuccess"
  | "booking.acceptAndPay"
  | "booking.creatingBooking"
  | "booking.processingPayment"
  | "booking.paymentOptions"
  | "booking.payInFull"
  | "booking.payInstallments"
  | "booking.cancellationPolicy"
  | "booking.gracePeriod"
  | "booking.whatHappensNext"
  | "booking.instantBooking"
  | "booking.locationAgreement"
  | "booking.bookingRules"
  | "booking.termsOfService"
  | "booking.bookingError"
  | "booking.formError"
  | "booking.paymentError"
  | "booking.success"
  | "booking.confirmationNumber"
  | "booking.thankYou"
  | "booking.checkEmail"
  | "booking.contactHost"
  | "booking.viewBooking"
  | "booking.backToSearch"
  | "form.activity"
  | "form.castCrew"
  | "form.projectName"
  | "form.company"
  | "form.description"
  | "form.date"
  | "form.startTime"
  | "form.endTime"
  | "form.activityPlaceholder"
  | "form.castCrewPlaceholder"
  | "form.projectNamePlaceholder"
  | "form.companyPlaceholder"
  | "form.descriptionPlaceholder"
  | "form.validation.required"
  | "form.validation.email"
  | "form.validation.phone"
  | "form.validation.date"
  | "form.validation.time"
  | "form.validation.number"
  | "form.validation.minLength"
  | "form.validation.maxLength"
  | "pricing.basePrice"
  | "pricing.hourlyRate"
  | "pricing.serviceFee"
  | "pricing.taxes"
  | "pricing.total"
  | "pricing.perHour"
  | "pricing.perDay"
  | "pricing.breakdown"
  | "pricing.addons"
  | "pricing.discount"
  | "pricing.subtotal"
  | "error.generic"
  | "error.network"
  | "error.server"
  | "error.notFound"
  | "error.unauthorized"
  | "error.forbidden"
  | "error.validation"
  | "error.payment"
  | "error.booking"
  | "error.upload"
  | "error.connection"
  | "error.timeout"
  | "error.retry"
  | "error.contact"
  | "success.bookingCreated"
  | "success.paymentProcessed"
  | "success.messageSent"
  | "success.profileUpdated"
  | "success.listingCreated"
  | "success.reviewSubmitted"
  | "success.saved"
  | "success.deleted"
  | "success.updated"
  | "success.uploaded"
  | "date.today"
  | "date.tomorrow"
  | "date.yesterday"
  | "date.thisWeek"
  | "date.nextWeek"
  | "date.thisMonth"
  | "date.nextMonth"
  | "date.flexible"
  | "date.selectDate"
  | "date.selectTime"
  | "time.morning"
  | "time.afternoon"
  | "time.evening"
  | "time.night"
  | "time.allDay"
  | "time.duration"
  | "time.hours"
  | "time.minutes"
  | "time.am"
  | "time.pm"
  | "dashboard.title"
  | "dashboard.hostMode"
  | "dashboard.clientMode"
  | "dashboard.yourBookings"
  | "dashboard.hostDashboard"
  | "dashboard.clientBookings"
  | "dashboard.manageProperties"
  | "dashboard.analytics"
  | "dashboard.addNewLocation"
  | "dashboard.noBookings"
  | "dashboard.needToListProperty"
  | "dashboard.listPropertyDesc"
  | "dashboard.recentActivity"
  | "dashboard.viewDetails"
  | "dashboard.loading"
  | "dashboard.error"
  | "dashboard.noListings"
  | "dashboard.createFirstListing"
  | "secretCorners.searchLocations"
  | "secretCorners.clear"
  | "secretCorners.featured"
  | "secretCorners.community"
  | "secretCorners.premium"
  | "secretCorners.abandoned"
  | "secretCorners.urban"
  | "secretCorners.natural"
  | "secretCorners.beach"
  | "secretCorners.forest"
  | "secretCorners.desert"
  | "secretCorners.streetArt"
  | "secretCorners.sunset"
  | "secretCorners.historic"
  | "secretCorners.errorTitle"
  | "secretCorners.errorMessage"
  | "analytics.title"
  | "analytics.subtitle"
  | "analytics.performance"
  | "analytics.revenue"
  | "analytics.bookings"
  | "analytics.views"
  | "analytics.conversions"
  | "analytics.timeframe"
  | "analytics.yearly"
  | "analytics.monthly"
  | "analytics.weekly"
  | "analytics.daily"
  | "analytics.photoShoots"
  | "analytics.filming"
  | "analytics.events"
  | "analytics.meetings"
  | "analytics.other"
  | "analytics.activityBreakdown"
  | "analytics.revenueOverview"
  | "analytics.bookingTrends"
  | "analytics.locationPerformance"
  | "analytics.weeklyTrends"
  | "analytics.inquiries"
  | "analytics.totalRevenue"
  | "analytics.totalBookings"
  | "analytics.avgBookingValue"
  | "analytics.topPerformingLocations"
  | "owner.dashboard"
  | "owner.subtitle"
  | "owner.analytics"
  | "owner.addNewLocation"
  | "owner.performance"
  | "owner.quickOverview"
  | "owner.totalBookings"
  | "owner.monthlyRevenue"
  | "owner.activeListings"
  | "owner.fromLastMonth"
  | "owner.viewAllAnalytics"
  | "owner.myProperties"
  | "owner.manageListings"
  | "owner.pending"
  | "owner.confirmed"
  | "owner.completed"
  | "owner.noProperties"
  | "owner.startListing"
  | "owner.editListing"
  | "owner.viewDetails"
  | "settings.title"
  | "settings.personalInfo"
  | "settings.loginSecurity"
  | "settings.payments"
  | "settings.payouts"
  | "settings.notifications"
  | "settings.firstName"
  | "settings.lastName"
  | "settings.phone"
  | "settings.email"
  | "settings.currentPassword"
  | "settings.newPassword"
  | "settings.confirmPassword"
  | "settings.passwordRequirements"
  | "settings.updateProfile"
  | "settings.updatePassword"
  | "settings.addPaymentMethod"
  | "settings.paymentMethods"
  | "settings.noPaymentMethods"
  | "settings.addBankAccount"
  | "settings.payoutMethods"
  | "settings.noPayoutMethods"
  | "settings.emailNotifications"
  | "settings.smsNotifications"
  | "settings.marketingEmails"
  | "settings.bookingUpdates"
  | "settings.newMessages"
  | "settings.promotions"
  | "settings.personalInfoDescription"
  | "settings.cellPhone"
  | "settings.saveChanges"
  | "settings.saving"
  | "help.title"
  | "help.subtitle"
  | "help.liveChat"
  | "help.chatDescription"
  | "help.startChat"
  | "help.emailSupport"
  | "help.emailDescription"
  | "help.sendEmail"
  | "help.phoneSupport"
  | "help.phoneDescription"
  | "help.callNow"
  | "help.frequentlyAsked"
  | "help.stillQuestions"
  | "help.supportIntro"
  | "help.responseTime"
  | "help.browseKnowledge"
  | "help.visitHelpCenter"
  | "faq.title"
  | "faq.subtitle"
  | "faq.bookingPayments"
  | "faq.hostingListing"
  | "faq.howBooking"
  | "faq.howBookingAnswer"
  | "faq.cancellationPolicy"
  | "faq.cancellationAnswer"
  | "faq.contactHost"
  | "faq.contactHostAnswer"
  | "faq.paymentsWork"
  | "faq.paymentsAnswer"
  | "faq.issuesDuringStay"
  | "faq.issuesAnswer"
  | "faq.listSpace"
  | "faq.listSpaceAnswer"
  | "faq.typesOfSpaces"
  | "faq.typesAnswer"
  | "faq.howMuchEarn"
  | "faq.earnAnswer"
  | "faq.protection"
  | "faq.protectionAnswer"
  | "faq.feesCharged"
  | "faq.feesAnswer"
  | "messages.title"
  | "messages.newMessage"
  | "messages.receivedNewMessage"
  | "messages.connectionError"
  | "messages.connectionErrorDesc"
  | "messages.selectConversation"
  | "messages.noMessages"
  | "messages.startConversation"
  | "messages.send"
  | "messages.typePlaceholder"
  | "messages.loading"
  | "messages.sendError"
  | "messages.user"
  | "trustSafety.title"
  | "trustSafety.subtitle"
  | "trustSafety.ourFeatures"
  | "trustSafety.verifiedUsers"
  | "trustSafety.verifiedUsersDesc"
  | "trustSafety.securePayments"
  | "trustSafety.securePaymentsDesc"
  | "trustSafety.insurance"
  | "trustSafety.insuranceDesc"
  | "trustSafety.dataProtection"
  | "trustSafety.dataProtectionDesc"
  | "trustSafety.beforeBooking"
  | "trustSafety.beforeBookingTip1"
  | "trustSafety.beforeBookingTip2"
  | "trustSafety.beforeBookingTip3"
  | "trustSafety.beforeBookingTip4"
  | "trustSafety.beforeBookingTip5"
  | "trustSafety.beforeHosting"
  | "trustSafety.beforeHostingTip1"
  | "trustSafety.beforeHostingTip2"
  | "trustSafety.beforeHostingTip3"
  | "trustSafety.beforeHostingTip4"
  | "trustSafety.beforeHostingTip5"
  | "trustSafety.reportIssue"
  | "trustSafety.contactSupport"
  | "trustSafety.emergencyHelp"
  | "trustSafety.needHelp"
  | "trustSafety.availableSupport"
  | "trustSafety.safetyTips"
  | "trustSafety.disputeResolution"
  | "trustSafety.disputeDescription"
  | "trustSafety.disputeRecommendation"
  | "trustSafety.disputeStep1"
  | "trustSafety.disputeStep2"
  | "trustSafety.disputeStep3"
  | "trustSafety.disputeStep4"
  | "trustSafety.disputeConclusion"
  | "trustSafety.emergencySupport"
  | "trustSafety.emergencyTitle"
  | "trustSafety.emergencyDescription"
  | "trustSafety.emergencyContact"
  | "trustSafety.emergencyNote"
  | "trustSafety.emergencyNoteText"
  | "trustSafety.ctaTitle"
  | "trustSafety.ctaDescription"
  | "trustSafety.contactSupport"
  | "trustSafety.viewGuidelines"
  // About page
  | "about.title"
  | "about.subtitle"
  | "about.ourStory"
  | "about.foundedDescription"
  | "about.founderDescription"
  | "about.missionValues"
  | "about.empoweringCreativity"
  | "about.empoweringCreativityDesc"
  | "about.communityFirst"
  | "about.communityFirstDesc"
  | "about.globalPerspective"
  | "about.globalPerspectiveDesc"
  | "about.whyChoose"
  | "about.curatedSelection"
  | "about.curatedSelectionDesc"
  | "about.transparentPricing"
  | "about.transparentPricingDesc"
  | "about.diverseLocations"
  | "about.diverseLocationsDesc"
  | "about.communityDriven"
  | "about.communityDrivenDesc"
  | "about.joinTeam"
  | "about.joinTeamDesc"
  | "about.viewPositions"
  // Blog page
  | "blog.title"
  | "blog.subtitle"
  | "blog.searchPlaceholder"
  | "blog.all"
  | "blog.foundArticles"
  | "blog.foundArticlesSingular"
  | "blog.in"
  | "blog.matching"
  | "blog.featuredArticle"
  | "blog.noArticlesFound"
  | "blog.noArticlesFoundDesc"
  | "blog.clearFilters"
  | "blog.searchResults"
  | "blog.latestArticles"
  | "blog.loadMore"
  | "blog.readMore"
  | "blog.read"
  | "blog.subscribeTitle"
  | "blog.subscribeDesc"
  | "blog.emailPlaceholder"
  | "blog.subscribe"
  // Guides page
  | "guides.title"
  | "guides.subtitle"
  | "guides.searchPlaceholder"
  | "guides.browseByCategory"
  | "guides.photography"
  | "guides.photographyDesc"
  | "guides.videography"
  | "guides.videographyDesc"
  | "guides.forHosts"
  | "guides.forHostsDesc"
  | "guides.aiTools"
  | "guides.aiToolsDesc"
  | "guides.production"
  | "guides.productionDesc"
  | "guides.events"
  | "guides.eventsDesc"
  | "guides.featuredGuides"
  | "guides.recentlyAdded"
  | "guides.readGuide"
  | "guides.needHelp"
  | "guides.needHelpDesc"
  | "guides.visitFaq"
  | "guides.contactSupport"
  // Careers page
  | "careers.title"
  | "careers.subtitle"
  | "careers.whyJoinUs"
  | "careers.whyJoinUsDesc1"
  | "careers.whyJoinUsDesc2"
  | "careers.viewPositions"
  | "careers.coreValues"
  | "careers.innovation"
  | "careers.innovationDesc"
  | "careers.community"
  | "careers.communityDesc"
  | "careers.discovery"
  | "careers.discoveryDesc"
  | "careers.inclusion"
  | "careers.inclusionDesc"
  | "careers.benefitsPerks"
  | "careers.competitiveComp"
  | "careers.competitiveCompDesc"
  | "careers.creativeStipend"
  | "careers.creativeStipendDesc"
  | "careers.flexibleWork"
  | "careers.flexibleWorkDesc"
  | "careers.learningDev"
  | "careers.learningDevDesc"
  | "careers.openPositions"
  | "careers.new"
  | "careers.applyNow"
  | "careers.faqTitle"
  | "careers.dontSeeRightFit"
  | "careers.dontSeeRightFitDesc"
  | "careers.contactRecruiting";

// English translations (default)
export const enTranslations: Record<TranslationKey, string> = {
  "common.search": "Search",
  "common.login": "Login/Sign Up",
  "common.logout": "Logout",
  "common.profile": "Profile",
  "common.settings": "Settings",
  "common.bookNow": "Book Now",
  "common.viewDetails": "View Details",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.back": "Back",
  "common.next": "Next",
  "common.pickDate": "Pick a date",
  "nav.home": "Home",
  "nav.explore": "Explore",
  "nav.bookings": "Bookings",
  "nav.messages": "Messages",
  "nav.savedLocations": "Saved Locations",
  "nav.listings": "Listings",
  "nav.addListing": "Add Listing",
  "nav.analytics": "Analytics",
  "nav.account": "Account",
  "nav.secretCorners": "Secret Corners",
  "home.heroTitle": "Find Your Perfect Location",
  "home.heroSubtitle": "Discover unique spaces for photography, film, and events",
  "home.searchPlaceholder": "Search for a location",
  "home.featuredTitle": "Book with Confidence",
  "home.featuredSubtitle": "Experience hassle-free location booking with features designed to make your creative projects succeed",
  "home.spotlightTitle": "Spotlight Locations", 
  "home.spotlightSubtitle": "Discover our hand-picked selection of exceptional spaces perfect for your next project",
  "home.exploreTitle": "Explore All Locations",
  "home.exploreSubtitle": "Browse our full collection of vetted locations",
  "gallery.madeWith": "Made with",
  "gallery.subtitle": "From blockbuster films to intimate portraits, from corporate boardrooms to underground music venues — witness the creative magic that happens when vision meets the perfect space.",
  "concierge.premiumService": "Premium Service",
  "concierge.title": "Concierge Service",
  "concierge.subtitle": "We unlock your dreams, no matter where you want to celebrate your event or shoot your next movie. We can access any space available on planet Earth. Just tell us what you need.",
  "concierge.requestHelp": "Request Concierge Help",
  "concierge.unlockSpaceTitle": "Unlock Any Space",
  "concierge.unlockSpaceDesc": "Access to private and exclusive venues worldwide",
  "concierge.permitTitle": "Permit Filing",
  "concierge.permitDesc": "We handle all the required paperwork and permissions",
  "concierge.supportTitle": "Premium Support",
  "concierge.supportDesc": "Dedicated 24/7 team to assist with any request",
  "concierge.teamTitle": "Dedicated Team",
  "concierge.teamDesc": "Personalized service to find your perfect location",
  "secretCorners.title": "Secret Corners",
  "secretCorners.subtitle": "Subscribe for just $4/month to access exclusive hidden gems perfect for photography, filming, watching sunsets, and taking cool walks.",
  "secretCorners.premiumTitle": "Premium Locations",
  "secretCorners.premiumDesc": "Access hidden spots not available to regular users",
  "secretCorners.memberTitle": "Member Benefits",
  "secretCorners.memberDesc": "Exclusive access to scenic views, photo spots and more",
  "secretCorners.submitTitle": "Submit Your Spots",
  "secretCorners.submitDesc": "Share your own locations and earn from the subscription pool",
  "secretCorners.curatedTitle": "Curated Selection",
  "secretCorners.curatedDesc": "Only the best locations make it into our Secret Corners",
  "hostBenefits.whyListTitle": "Why List With Blocmark?",
  "hostBenefits.whyChooseTitle": "Why Choose Blocmark?",
  "hostBenefits.hostsTab": "Hosts",
  "hostBenefits.rentersTab": "Renters",
  "hostBenefits.getPaidTitle": "Get Paid in 24h",
  "hostBenefits.getPaidDesc": "Forget 30-day payouts. We transfer your money within 24 hours of a completed booking.",
  "hostBenefits.scheduleTitle": "Own Your Schedule",
  "hostBenefits.scheduleDesc": "You're in control — set your own calendar and blackout dates with one click.",
  "hostBenefits.peaceTitle": "Peace of Mind",
  "hostBenefits.peaceDesc": "Each booking includes damage & liability coverage, automatically.",
  "hostBenefits.zeroTitle": "Zero to Booked Fast",
  "hostBenefits.zeroDesc": "No setup fees. No monthly costs. Start earning today.",
  "hostBenefits.spotlightTitle": "Spotlight Exposure",
  "hostBenefits.spotlightDesc": "Be discovered in curated features, collections, and editorial picks.",
  "hostBenefits.controlTitle": "Effortless Control",
  "hostBenefits.controlDesc": "A modern dashboard to manage everything from bookings to payments, beautifully.",
  "hostBenefits.verifiedTitle": "Verified. Vetted. Valued.",
  "hostBenefits.verifiedDesc": "Every space is handpicked by our team. No randomness, no surprises.",
  "hostBenefits.aiTitle": "AI That Gets You",
  "hostBenefits.aiDesc": "Tell us what you need — our AI matches you with the perfect space instantly.",
  "hostBenefits.bookTitle": "Book With Confidence",
  "hostBenefits.bookDesc": "Secure payments. Transparent terms. You're covered.",
  "hostBenefits.minutesTitle": "Book in Minutes",
  "hostBenefits.minutesDesc": "Search. Chat. Book. All in one smooth flow.",
  "hostBenefits.hiddenTitle": "Hidden Gems Await",
  "hostBenefits.hiddenDesc": "Discover secret corners, off-the-grid gems, and exclusive listings.",
  "hostBenefits.smartTitle": "Smart Support",
  "hostBenefits.smartDesc": "Our AI and real people are available 24/7 to guide you.",
  "hostBenefits.ctaTitle": "Ready to turn your space into a film set?",
  "hostBenefits.ctaSubtitle": "Or find your next dream shoot location?",
  "hostBenefits.propertyOwner": "I'm a Property Owner",
  "hostBenefits.renterCreator": "I'm a Renter / Creator",
  "mobileApp.badge": "Mobile Experience",
  "mobileApp.title": "Discover Spaces Anywhere, Anytime",
  "mobileApp.subtitle": "Book top venues directly from your pocket. Find and reserve the perfect location for your next project while on the go.",
  "mobileApp.downloadOn": "Download on the",
  "mobileApp.appStore": "App Store",
  "mobileApp.getItOn": "Get it on",
  "mobileApp.googlePlay": "Google Play",
  "mobileApp.linkText": "Get a download link sent to your phone:",
  "guides.expertResources": "Expert Resources",
  "guides.title": "Location Guides & Inspiration",
  "guides.subtitle": "Discover professional tips, industry insights, and expert advice to help you find and book the perfect spaces for your creative projects",
  "guides.browseAll": "Browse All Guides",
  "guides.studioTitle": "Studio Selection Guide",
  "guides.studioDesc": "Learn how to find and book the perfect photography studio with lighting, equipment, and space considerations",
  "guides.scoutingTitle": "Location Scouting Tips",
  "guides.scoutingDesc": "Expert advice on finding unique filming locations, from urban settings to natural landscapes",
  "guides.eventTitle": "Event Space Planning",
  "guides.eventDesc": "Complete guide to selecting the ideal venue for your events, including capacity and amenity considerations",
  "guides.aiTitle": "AI Location Selection",
  "guides.aiDesc": "Using Blocmark's AI-powered tools to find the perfect location for your specific project needs",
  "guides.photographyCategory": "Photography",
  "guides.filmingCategory": "Filming",
  "guides.eventsCategory": "Events",
  "guides.technologyCategory": "Technology",
  "guides.readTime12": "12 min",
  "guides.readTime15": "15 min",
  "guides.readTime10": "10 min",
  "guides.readTime8": "8 min",
  "footer.description": "Blocmark connects creative professionals with unique spaces for projects, photoshoots, and productions with transparent pricing and secure bookings.",
  "footer.stayUpdated": "Stay Updated",
  "footer.newsletterDesc": "Subscribe to our newsletter for the latest locations, features, and industry insights.",
  "footer.emailPlaceholder": "Your email address",
  "footer.subscribe": "Subscribe",
  "footer.subscribed": "Subscribed!",
  "footer.company": "Company",
  "footer.about": "About",
  "footer.careers": "Careers",
  "footer.press": "Press",
  "footer.blog": "Blog",
  "footer.support": "Support",
  "footer.help": "Help",
  "footer.safety": "Safety",
  "footer.terms": "Terms",
  "footer.privacy": "Privacy",
  "footer.accessibility": "Accessibility",
  "footer.community": "Community",
  "footer.guidelines": "Guidelines",
  "footer.listSpace": "List Your Space",
  "footer.faq": "FAQ",
  "footer.trustSafety": "Trust & Safety",
  "footer.activities": "Activities",
  "footer.photoShoot": "Photo Shoot",
  "footer.filming": "Filming",
  "footer.events": "Events",
  "footer.meetings": "Meetings",
  "footer.production": "Production",
  "footer.types": "Types",
  "footer.photoStudio": "Photo Studio",
  "footer.filmStudio": "Film Studio",
  "footer.eventSpace": "Event Space",
  "footer.officeSpace": "Office Space",
  "footer.warehouse": "Warehouse",
  "footer.cities": "Cities",
  "footer.losAngeles": "Los Angeles",
  "footer.newYork": "New York",
  "footer.miami": "Miami",
  "footer.chicago": "Chicago",
  "footer.viewAll": "View All",
  "footer.connect": "Connect",
  "footer.guides": "Guides",
  "region.europe": "Europe",
  "region.americas": "The Americas",
  "region.asia-pacific": "Asia Pacific",
  "seo.homeTitle": "Blocmark - Discover and Book Unique Locations",
  "seo.homeDescription": "Find and book the perfect location for your next shoot, event, or production. Browse unique, curated spaces with transparent pricing.",
  "location.price": "Price",
  "location.perHour": "per hour",
  "location.amenities": "Amenities",
  "location.book": "Book This Location",
  "listing.addListing": "List your space",
  "listing.yourListings": "Your Listings",
  "search.aiSearch": "AI Search",
  "search.classicSearch": "Classic Search",
  "search.magicSearch": "Magic Search",
  "search.cityPlaceholder": "Search cities worldwide...",
  "search.featurePlaceholder": "Try: kitchen, bathroom, hardwood floor, high ceiling...",
  "search.activityType": "Activity type",
  "activity.photoShoot": "Photo Shoot",
  "activity.videoProduction": "Video Production",
  "activity.event": "Event",
  "activity.meeting": "Meeting",
  "activity.filming": "Filming",
  "activity.commercial": "Commercial",
  "activity.wedding": "Wedding",
  "activity.corporate": "Corporate Event",
  "common.loading": "Loading",
  "common.error": "Error",
  "common.success": "Success",
  "common.failed": "Failed",
  "common.reserve": "Reserve",
  "common.accept": "Accept",
  "common.decline": "Decline",
  "common.edit": "Edit",
  "common.delete": "Delete",
  "common.add": "Add",
  "common.remove": "Remove",
  "common.submit": "Submit",
  "common.retry": "Retry",
  "common.close": "Close",
  "common.open": "Open",
  "common.show": "Show",
  "common.hide": "Hide",
  "common.yes": "Yes",
  "common.no": "No",
  "common.required": "Required",
  "common.optional": "Optional",
  "common.total": "Total",
  "common.subtotal": "Subtotal",
  "common.tax": "Tax",
  "common.fee": "Fee",
  "common.discount": "Discount",
  "common.payment": "Payment",
  "common.processing": "Processing",
  "common.complete": "Complete",
  "common.pending": "Pending",
  "common.approved": "Approved",
  "common.rejected": "Rejected",
  "common.cancelled": "Cancelled",
  "common.refunded": "Refunded",
  "booking.title": "Complete Your Booking",
  "booking.completeBooking": "Complete Your Booking",
  "booking.projectDetails": "Your project details",
  "booking.paymentStep": "Payment",
  "booking.summary": "Booking Summary",
  "booking.activity": "Activity (be as specific as possible)",
  "booking.castCrew": "Cast & Crew",
  "booking.projectName": "Project name",
  "booking.company": "Renter/Company",
  "booking.aboutProject": "About your project",
  "booking.date": "Date",
  "booking.startTime": "Start Time",
  "booking.endTime": "End Time",
  "booking.additionalServices": "Additional Services",
  "booking.paymentInformation": "Payment Information",
  "booking.paymentLoading": "Loading payment form...",
  "booking.paymentFailed": "Failed to initialize payment system",
  "booking.paymentSuccess": "Payment Successful",
  "booking.acceptAndPay": "Accept and Pay",
  "booking.creatingBooking": "Creating Booking...",
  "booking.processingPayment": "Processing Payment...",
  "booking.paymentOptions": "Payment Options",
  "booking.payInFull": "Pay in full",
  "booking.payInstallments": "Pay in 4 payments with",
  "booking.cancellationPolicy": "Cancellation Policy and Grace Period",
  "booking.gracePeriod": "All bookings adhere to our Grace Period policy which allows a full refund for bookings cancelled within 24 hours of confirmation.",
  "booking.whatHappensNext": "What happens next?",
  "booking.instantBooking": "The booking parameters you have selected meet the criteria set by the Host for Instant Booking.",
  "booking.locationAgreement": "Location Agreement",
  "booking.bookingRules": "Booking Rules",
  "booking.termsOfService": "Terms of Service",
  "booking.bookingError": "Booking Error",
  "booking.formError": "Form Error", 
  "booking.paymentError": "Payment Error",
  "booking.success": "Booking Success",
  "booking.confirmationNumber": "Confirmation Number",
  "booking.thankYou": "Thank you for your booking!",
  "booking.checkEmail": "Check your email for confirmation",
  "booking.contactHost": "Contact Host",
  "booking.viewBooking": "View Booking",
  "booking.backToSearch": "Back to Search",
  "form.activity": "Activity",
  "form.castCrew": "Cast & Crew",
  "form.projectName": "Project Name",
  "form.company": "Company",
  "form.description": "Description",
  "form.date": "Date",
  "form.startTime": "Start Time",
  "form.endTime": "End Time",
  "form.activityPlaceholder": "Filming",
  "form.castCrewPlaceholder": "6 - 15 people",
  "form.projectNamePlaceholder": "Enter project name",
  "form.companyPlaceholder": "Enter company name",
  "form.descriptionPlaceholder": "Let the host know what you're planning",
  "form.validation.required": "This field is required",
  "form.validation.email": "Please enter a valid email address",
  "form.validation.phone": "Please enter a valid phone number",
  "form.validation.date": "Please select a valid date",
  "form.validation.time": "Please select a valid time",
  "form.validation.number": "Please enter a valid number",
  "form.validation.minLength": "Minimum length required",
  "form.validation.maxLength": "Maximum length exceeded",
  "pricing.basePrice": "Base Price",
  "pricing.hourlyRate": "Hourly Rate",
  "pricing.serviceFee": "Service Fee",
  "pricing.taxes": "Taxes",
  "pricing.total": "Total",
  "pricing.perHour": "per hour",
  "pricing.perDay": "per day",
  "pricing.breakdown": "Price Breakdown",
  "pricing.addons": "Add-ons",
  "pricing.discount": "Discount",
  "pricing.subtotal": "Subtotal",
  "error.generic": "An error occurred. Please try again.",
  "error.network": "Network error. Please check your connection.",
  "error.server": "Server error. Please try again later.",
  "error.notFound": "Resource not found.",
  "error.unauthorized": "You are not authorized to perform this action.",
  "error.forbidden": "Access forbidden.",
  "error.validation": "Please check your input and try again.",
  "error.payment": "Payment processing failed. Please try again.",
  "error.booking": "Booking creation failed. Please try again.",
  "error.upload": "File upload failed. Please try again.",
  "error.connection": "Connection lost. Please try again.",
  "error.timeout": "Request timed out. Please try again.",
  "error.retry": "Please try again",
  "error.contact": "Please contact support if the problem persists.",
  "success.bookingCreated": "Booking created successfully!",
  "success.paymentProcessed": "Payment processed successfully!",
  "success.messageSent": "Message sent successfully!",
  "success.profileUpdated": "Profile updated successfully!",
  "success.listingCreated": "Listing created successfully!",
  "success.reviewSubmitted": "Review submitted successfully!",
  "success.saved": "Saved successfully!",
  "success.deleted": "Deleted successfully!",
  "success.updated": "Updated successfully!",
  "success.uploaded": "Uploaded successfully!",
  "date.today": "Today",
  "date.tomorrow": "Tomorrow",
  "date.yesterday": "Yesterday",
  "date.thisWeek": "This Week",
  "date.nextWeek": "Next Week",
  "date.thisMonth": "This Month",
  "date.nextMonth": "Next Month",
  "date.flexible": "Flexible",
  "date.selectDate": "Select Date",
  "date.selectTime": "Select Time",
  "time.morning": "Morning",
  "time.afternoon": "Afternoon",
  "time.evening": "Evening",
  "time.night": "Night",
  "time.allDay": "All Day",
  "time.duration": "Duration",
  "time.hours": "hours",
  "time.minutes": "minutes",
  "time.am": "AM",
  "time.pm": "PM",
  "dashboard.title": "Dashboard",
  "dashboard.hostMode": "Host Mode",
  "dashboard.clientMode": "Client Mode",
  "dashboard.yourBookings": "Your Bookings",
  "dashboard.hostDashboard": "Host Dashboard",
  "dashboard.clientBookings": "Client Bookings",
  "dashboard.manageProperties": "Manage your properties and bookings",
  "dashboard.analytics": "Analytics",
  "dashboard.addNewLocation": "Add New Location",
  "dashboard.noBookings": "No bookings yet",
  "dashboard.needToListProperty": "You need to list a property before using host features",
  "dashboard.listPropertyDesc": "Create your first listing to start hosting",
  "dashboard.recentActivity": "Recent Activity",
  "dashboard.viewDetails": "View Details",
  "dashboard.loading": "Loading...",
  "dashboard.error": "Error loading data",
  "dashboard.noListings": "No listings yet",
  "dashboard.createFirstListing": "Create your first listing",
  "secretCorners.searchLocations": "Search locations...",
  "secretCorners.clear": "Clear",
  "secretCorners.featured": "Featured",
  "secretCorners.community": "Community",
  "secretCorners.premium": "Premium",
  "secretCorners.abandoned": "Abandoned",
  "secretCorners.urban": "Urban",
  "secretCorners.natural": "Natural",
  "secretCorners.beach": "Beach",
  "secretCorners.forest": "Forest",
  "secretCorners.desert": "Desert",
  "secretCorners.streetArt": "Street Art",
  "secretCorners.sunset": "Sunset",
  "secretCorners.historic": "Historic",
  "secretCorners.errorTitle": "Error",
  "secretCorners.errorMessage": "Failed to load locations. Please try again later.",
  "analytics.title": "Analytics Dashboard",
  "analytics.subtitle": "Track your performance and revenue",
  "analytics.performance": "Performance Dashboard",
  "analytics.revenue": "Revenue",
  "analytics.bookings": "Bookings",
  "analytics.views": "Views",
  "analytics.conversions": "Conversion Rate",
  "analytics.timeframe": "Timeframe",
  "analytics.yearly": "Yearly",
  "analytics.monthly": "Monthly",
  "analytics.weekly": "Weekly",
  "analytics.daily": "Daily",
  "analytics.photoShoots": "Photo Shoots",
  "analytics.filming": "Filming",
  "analytics.events": "Events",
  "analytics.meetings": "Meetings",
  "analytics.other": "Other",
  "analytics.activityBreakdown": "Activity Breakdown",
  "analytics.revenueOverview": "Revenue Overview",
  "analytics.bookingTrends": "Booking Trends",
  "analytics.locationPerformance": "Location Performance",
  "analytics.weeklyTrends": "Weekly Trends",
  "analytics.inquiries": "Inquiries",
  "analytics.totalRevenue": "Total Revenue",
  "analytics.totalBookings": "Total Bookings",
  "analytics.avgBookingValue": "Average Booking Value",
  "analytics.topPerformingLocations": "Top Performing Locations",
  "owner.dashboard": "Owner Dashboard",
  "owner.subtitle": "Manage your properties and bookings",
  "owner.analytics": "Analytics",
  "owner.addNewLocation": "Add New Location",
  "owner.performance": "Performance Dashboard",
  "owner.quickOverview": "Quick overview of your listings and bookings performance",
  "owner.totalBookings": "Total Bookings",
  "owner.monthlyRevenue": "Monthly Revenue",
  "owner.activeListings": "Active Listings",
  "owner.fromLastMonth": "from last month",
  "owner.viewAllAnalytics": "View Full Analytics",
  "owner.myProperties": "My Properties",
  "owner.manageListings": "Manage your listings and see booking activity",
  "owner.pending": "Pending",
  "owner.confirmed": "Confirmed",
  "owner.completed": "Completed",
  "owner.noProperties": "No properties listed yet",
  "owner.startListing": "Start by adding your first property",
  "owner.editListing": "Edit Listing",
  "owner.viewDetails": "View Details",
  "settings.title": "Account Settings",
  "settings.personalInfo": "Personal Info",
  "settings.loginSecurity": "Login & Security",
  "settings.payments": "Payments",
  "settings.payouts": "Payouts",
  "settings.notifications": "Notifications",
  "settings.firstName": "First Name",
  "settings.lastName": "Last Name",
  "settings.phone": "Phone Number",
  "settings.email": "Email Address",
  "settings.currentPassword": "Current Password",
  "settings.newPassword": "New Password",
  "settings.confirmPassword": "Confirm Password",
  "settings.passwordRequirements": "Password must be at least 8 characters with uppercase, lowercase, and numbers",
  "settings.updateProfile": "Update Profile",
  "settings.updatePassword": "Update Password",
  "settings.addPaymentMethod": "Add Payment Method",
  "settings.paymentMethods": "Payment Methods",
  "settings.noPaymentMethods": "No payment methods added",
  "settings.addBankAccount": "Add Bank Account",
  "settings.payoutMethods": "Payout Methods",
  "settings.noPayoutMethods": "No payout methods added",
  "settings.emailNotifications": "Email Notifications",
  "settings.smsNotifications": "SMS Notifications",
  "settings.marketingEmails": "Marketing Emails",
  "settings.bookingUpdates": "Booking Updates",
  "settings.newMessages": "New Messages",
  "settings.promotions": "Promotions & Offers",
  "settings.personalInfoDescription": "Update your personal information and how it is displayed to others",
  "settings.cellPhone": "Cell Phone",
  "settings.saveChanges": "Save Changes",
  "settings.saving": "Saving...",
  "help.title": "Help & Support",
  "help.subtitle": "How can we help you today?",
  "help.liveChat": "Live Chat",
  "help.chatDescription": "Chat with our support team",
  "help.startChat": "Start Chat",
  "help.emailSupport": "Email Support",
  "help.emailDescription": "Get help via email",
  "help.sendEmail": "Send Email",
  "help.phoneSupport": "Phone Support",
  "help.phoneDescription": "Call us directly",
  "help.callNow": "Call Now",
  "help.frequentlyAsked": "Frequently Asked Questions",
  "help.stillQuestions": "Still have questions?",
  "help.supportIntro": "Our support team is here to help. Contact us through one of the following channels:",
  "help.responseTime": "Send us an email and we'll respond within 24 hours.",
  "help.browseKnowledge": "Browse our knowledge base for more detailed guides.",
  "help.visitHelpCenter": "Visit Help Center",
  "faq.title": "Frequently Asked Questions",
  "faq.subtitle": "Find answers to common questions about Blocmark. If you can't find what you're looking for, please contact our support team.",
  "faq.bookingPayments": "Booking & Payments",
  "faq.hostingListing": "Hosting & Listing",
  "faq.howBooking": "How do I make a booking?",
  "faq.howBookingAnswer": "To make a booking, browse through available locations, select your desired dates, and click the 'Reserve' button. Follow the prompts to complete your reservation. You'll receive a confirmation email once your booking is approved by the host. If the Listing has Instant Book active your booking will be approved automatically.",
  "faq.cancellationPolicy": "What is the cancellation policy?",
  "faq.cancellationAnswer": "Cancellation policies vary by location. You can find the specific policy for each location on their listing page before making a booking. Most hosts offer flexible, moderate, or strict cancellation options.",
  "faq.contactHost": "How do I contact my host?",
  "faq.contactHostAnswer": "Once your booking is confirmed, you can message your host directly through our messaging system. Click on 'Messages' in the navigation menu to access your conversations. We recommend discussing any specific requirements or questions before your booking date.",
  "faq.paymentsWork": "How do payments work?",
  "faq.paymentsAnswer": "We handle all payments securely through our platform. Your payment is held safely until after check-in, ensuring a smooth and protected transaction for both parties. Payment is typically processed 24 hours after a successful booking, and hosts receive funds within 48 hours from the end of the booking.",
  "faq.issuesDuringStay": "What if something goes wrong during my stay?",
  "faq.issuesAnswer": "If you encounter any issues during your stay, contact your host first through our messaging system. If the issue persists, our support team is available 24/7 to assist you. We're committed to ensuring you have a positive experience.",
  "faq.listSpace": "How do I list my space on Blocmark?",
  "faq.listSpaceAnswer": "Click on \"List Your Space\" in the navigation menu or on the Listings page while in Host mode to begin the listing process. If you don't already have an account, you'll be prompted to create one first. From there, simply follow the step-by-step instructions to set up your listing. Be sure to include high-quality photos, a detailed description, and your preferred pricing and availability.",
  "faq.typesOfSpaces": "What types of spaces can I list?",
  "faq.typesAnswer": "Blocmark welcomes a variety of spaces including residential properties, commercial spaces, studios, warehouses, offices, event venues, and more. Unique spaces with distinct character or features often attract the most interest.",
  "faq.howMuchEarn": "How much can I earn with my space?",
  "faq.earnAnswer": "Earnings vary based on your location, type of space, amenities, and availability. Residential properties can earn $500-$2,500 per day for film shoots, while commercial spaces often command $1,000-$5,000 daily. You set your own rates and can adjust them at any time.",
  "faq.protection": "How does Blocmark protect hosts and guests?",
  "faq.protectionAnswer": "We verify all users on our platform and provide host insurance. Hosts can set house rules, require security deposits, and communicate directly with renters. All bookings are covered by our Terms of Service and Host Protection Policy.",
  "faq.feesCharged": "What fees does Blocmark charge?",
  "faq.feesAnswer": "Blocmark charges a simple and transparent service fee of 5% from hosts and 5% from guests on each booking. Unlike other platforms that typically take between 20–30%, we are committed to keeping fees fair and accessible. Our goal is to build a platform that truly helps people—supporting hosts in earning more from their spaces while giving guests better value. These modest fees cover our platform services, secure payment processing, dedicated customer support, and host protection.",
  
  // Messages page
  "messages.title": "Messages",
  "messages.newMessage": "New Message",
  "messages.receivedNewMessage": "You have received a new message",
  "messages.connectionError": "Connection Error",
  "messages.connectionErrorDesc": "Failed to establish real-time connection",
  "messages.selectConversation": "Select a conversation to start messaging",
  "messages.noMessages": "No messages yet",
  "messages.startConversation": "Start a conversation",
  "messages.send": "Send",
  "messages.typePlaceholder": "Type a message...",
  "messages.loading": "Loading messages...",
  "messages.sendError": "Failed to send message",
  "messages.user": "User",
  
  // Trust & Safety page
  "trustSafety.title": "Trust & Safety at Blocmark",
  "trustSafety.subtitle": "Your safety and security are our top priorities. Learn about the systems and processes we've implemented to create a trustworthy platform for all users.",
  "trustSafety.ourFeatures": "Our Safety Features",
  "trustSafety.verifiedUsers": "Verified Users",
  "trustSafety.verifiedUsersDesc": "All users on our platform undergo identity verification. We verify phone numbers, email addresses, and in some cases, government-issued IDs to ensure the authenticity of our community members.",
  "trustSafety.securePayments": "Secure Payments",
  "trustSafety.securePaymentsDesc": "All transactions are processed through our secure payment system. We never share your financial information with hosts or guests. Payments are held in escrow until after check-in to ensure protection for both parties.",
  "trustSafety.insurance": "Comprehensive Insurance",
  "trustSafety.insuranceDesc": "Our host protection insurance covers property damage up to $1M. This provides peace of mind for hosts and encourages responsible behavior from guests during their bookings.",
  "trustSafety.dataProtection": "Data Protection",
  "trustSafety.dataProtectionDesc": "We use industry-leading encryption and security measures to protect your personal data. We only collect information necessary for platform functionality and never sell your data to third parties.",
  "trustSafety.beforeBooking": "Before You Book",
  "trustSafety.beforeBookingTip1": "Carefully review the space details, amenities, and house rules",
  "trustSafety.beforeBookingTip2": "Read reviews from previous guests to understand their experiences",
  "trustSafety.beforeBookingTip3": "Communicate with the host about your specific needs and requirements",
  "trustSafety.beforeBookingTip4": "Verify that the space is suitable for your intended activities",
  "trustSafety.beforeBookingTip5": "Confirm check-in procedures and access details before arrival",
  "trustSafety.beforeHosting": "Before You Host",
  "trustSafety.beforeHostingTip1": "Set clear house rules and communicate them effectively",
  "trustSafety.beforeHostingTip2": "Ensure your space listing is accurate with high-quality photos",
  "trustSafety.beforeHostingTip3": "Prepare comprehensive check-in instructions",
  "trustSafety.beforeHostingTip4": "Secure or remove any valuable or personal items",
  "trustSafety.beforeHostingTip5": "Have a contingency plan for emergencies or unexpected issues",
  "trustSafety.reportIssue": "Report an Issue",
  "trustSafety.contactSupport": "Contact Support",
  "trustSafety.emergencyHelp": "Emergency Help",
  "trustSafety.needHelp": "Need Help?",
  "trustSafety.availableSupport": "Our support team is available 24/7 to assist with any safety concerns or issues you may encounter.",
  "trustSafety.safetyTips": "Safety Tips",
  "trustSafety.disputeResolution": "Dispute Resolution",
  "trustSafety.disputeDescription": "Despite our best efforts to prevent issues, disagreements may occasionally arise. Our dedicated support team is available to help mediate and resolve disputes between hosts and guests.",
  "trustSafety.disputeRecommendation": "If you encounter an issue during your booking or hosting experience, we recommend:",
  "trustSafety.disputeStep1": "First attempting to resolve the issue directly with the other party through our messaging system",
  "trustSafety.disputeStep2": "If direct communication doesn't resolve the issue, contact our support team within 24 hours",
  "trustSafety.disputeStep3": "Provide all relevant details and evidence to help us understand the situation",
  "trustSafety.disputeStep4": "Our team will review the case and work with both parties to find a fair resolution",
  "trustSafety.disputeConclusion": "In most cases, disputes can be resolved amicably with clear communication and reasonable expectations from all parties involved.",
  "trustSafety.emergencySupport": "Emergency Support",
  "trustSafety.emergencyTitle": "24/7 Emergency Assistance",
  "trustSafety.emergencyDescription": "In case of emergencies during a booking, our emergency support line is available 24/7. This service is reserved for genuine emergencies that require immediate attention.",
  "trustSafety.emergencyContact": "Emergency Contact:",
  "trustSafety.emergencyNote": "Note:",
  "trustSafety.emergencyNoteText": "For non-emergency issues, please use our regular support channels through the app or website.",
  "trustSafety.ctaTitle": "Your Safety Is Our Priority",
  "trustSafety.ctaDescription": "We're constantly improving our safety features and policies. If you have suggestions or feedback on how we can make Blocmark safer, we'd love to hear from you.",
  "trustSafety.contactSupport": "Contact Support",
  "trustSafety.viewGuidelines": "View Guidelines",

  // About page
  "about.title": "About Blocmark",
  "about.subtitle": "We're on a mission to transform how creative professionals discover, book, and manage unique spaces for their projects.",
  "about.ourStory": "Our Story",
  "about.foundedDescription": "Founded in 2023, Blocmark was born from a simple observation: finding and booking unique locations for creative projects was unnecessarily complex.",
  "about.founderDescription": "Our founder, a former photographer, experienced firsthand the challenges of securing locations for shoots. What started as a solution to a personal problem has evolved into a comprehensive platform serving thousands of creatives and space owners worldwide.",
  "about.missionValues": "Our Mission & Values",
  "about.empoweringCreativity": "Empowering Creativity",
  "about.empoweringCreativityDesc": "We believe in removing barriers to creative expression by making exceptional spaces accessible to all.",
  "about.communityFirst": "Community First",
  "about.communityFirstDesc": "We're building more than a platform—we're nurturing a community of like-minded creators and space owners.",
  "about.globalPerspective": "Global Perspective",
  "about.globalPerspectiveDesc": "We celebrate diversity and aim to showcase unique spaces from every corner of the world.",
  "about.whyChoose": "Why Choose Blocmark",
  "about.curatedSelection": "Curated Selection",
  "about.curatedSelectionDesc": "Every location on our platform meets our high standards for quality, uniqueness, and photogenic appeal.",
  "about.transparentPricing": "Transparent Pricing",
  "about.transparentPricingDesc": "No hidden fees or surprises. We believe in clear, upfront pricing for a stress-free booking experience.",
  "about.diverseLocations": "Diverse Locations",
  "about.diverseLocationsDesc": "From industrial warehouses to luxurious penthouses, we offer an unmatched variety of spaces to suit any creative vision.",
  "about.communityDriven": "Community-Driven",
  "about.communityDrivenDesc": "Our platform facilitates connections between creatives and space owners, fostering collaboration and mutual growth.",
  "about.joinTeam": "Join Our Team",
  "about.joinTeamDesc": "We're always looking for passionate individuals to help us build the future of creative space booking.",
  "about.viewPositions": "View Open Positions",

  // Blog page
  "blog.title": "Blocmark Blog",
  "blog.subtitle": "Insights, tips, and inspiration for creative professionals and location owners.",
  "blog.searchPlaceholder": "Search articles...",
  "blog.all": "All",
  "blog.foundArticles": "Found ${count} articles",
  "blog.foundArticlesSingular": "Found ${count} article",
  "blog.in": "in",
  "blog.matching": "matching",
  "blog.featuredArticle": "Featured Article",
  "blog.noArticlesFound": "No articles found",
  "blog.noArticlesFoundDesc": "We couldn't find any articles matching your search criteria.",
  "blog.clearFilters": "Clear filters",
  "blog.searchResults": "Search Results",
  "blog.latestArticles": "Latest Articles",
  "blog.loadMore": "Load More Articles",
  "blog.readMore": "Read More",
  "blog.read": "Read",
  "blog.subscribeTitle": "Subscribe to Our Newsletter",
  "blog.subscribeDesc": "Get the latest articles, resources, and trends in creative location bookings delivered straight to your inbox.",
  "blog.emailPlaceholder": "Your email address",
  "blog.subscribe": "Subscribe",

  // Guides page
  "guides.title": "Resources & Guides",
  "guides.subtitle": "Expert advice and comprehensive guides to help you make the most of the Blocmark platform.",
  "guides.searchPlaceholder": "Search guides and resources...",
  "guides.browseByCategory": "Browse by Category",
  "guides.photography": "Photography",
  "guides.photographyDesc": "Tips and techniques for maximizing your photo shoots at different locations.",
  "guides.videography": "Videography",
  "guides.videographyDesc": "Best practices for filming in various spaces and lighting conditions.",
  "guides.forHosts": "For Hosts",
  "guides.forHostsDesc": "Learn how to optimize your space listing and maximize bookings.",
  "guides.aiTools": "AI Tools",
  "guides.aiToolsDesc": "Leverage our AI features to find the perfect location for your needs.",
  "guides.production": "Production",
  "guides.productionDesc": "Production planning and execution guides for film and commercial shoots.",
  "guides.events": "Events",
  "guides.eventsDesc": "Planning successful events in unique spaces and managing logistics.",
  "guides.featuredGuides": "Featured Guides",
  "guides.recentlyAdded": "Recently Added",
  "guides.readGuide": "Read Guide",
  "guides.needHelp": "Need Personalized Help?",
  "guides.needHelpDesc": "Our team of experts is ready to answer your questions and provide tailored advice for your specific needs.",
  "guides.visitFaq": "Visit FAQ",
  "guides.contactSupport": "Contact Support",

  // Careers page
  "careers.title": "Join the Blocmark Team",
  "careers.subtitle": "Help us revolutionize how creative professionals discover and book unique spaces for their projects.",
  "careers.whyJoinUs": "Why Join Us?",
  "careers.whyJoinUsDesc1": "At Blocmark, we're building the future of location booking for the creative industry. Our platform connects photographers, filmmakers, and event planners with unique spaces that bring their visions to life.",
  "careers.whyJoinUsDesc2": "We're a team of passionate individuals who value innovation, collaboration, and impact. Join us to work on challenging problems in a fast-growing market with global reach.",
  "careers.viewPositions": "View Open Positions",
  "careers.coreValues": "Our Core Values",
  "careers.innovation": "Innovation",
  "careers.innovationDesc": "We embrace creative problem-solving and aren't afraid to try new approaches.",
  "careers.community": "Community",
  "careers.communityDesc": "We build meaningful connections between creators and space owners.",
  "careers.discovery": "Discovery",
  "careers.discoveryDesc": "We celebrate uniqueness and help our users discover hidden gems.",
  "careers.inclusion": "Inclusion",
  "careers.inclusionDesc": "We value diversity of thought, background, and experience.",
  "careers.benefitsPerks": "Benefits & Perks",
  "careers.competitiveComp": "Competitive Compensation",
  "careers.competitiveCompDesc": "Salary packages that reflect your expertise and contributions.",
  "careers.creativeStipend": "Creative Stipend",
  "careers.creativeStipendDesc": "Annual budget for your own creative projects and skill development.",
  "careers.flexibleWork": "Flexible Work",
  "careers.flexibleWorkDesc": "Remote-first culture with flexible hours to support work-life balance.",
  "careers.learningDev": "Learning & Development",
  "careers.learningDevDesc": "Budget and time for courses, conferences, and professional growth.",
  "careers.openPositions": "Open Positions",
  "careers.new": "New",
  "careers.applyNow": "Apply Now",
  "careers.faqTitle": "Frequently Asked Questions",
  "careers.dontSeeRightFit": "Don't See the Right Fit?",
  "careers.dontSeeRightFitDesc": "We're always interested in connecting with talented individuals. Send us your resume and tell us why you'd be a great addition to the Blocmark team.",
  "careers.contactRecruiting": "Contact Recruiting Team"
};

// German translations
export const deTranslations: Record<TranslationKey, string> = {
  "common.search": "Suchen",
  "common.login": "Anmelden",
  "common.logout": "Abmelden",
  "common.profile": "Profil",
  "common.settings": "Einstellungen",
  "common.bookNow": "Jetzt Buchen",
  "common.viewDetails": "Details Anzeigen",
  "common.save": "Speichern",
  "common.cancel": "Abbrechen",
  "common.confirm": "Bestätigen",
  "common.back": "Zurück",
  "common.next": "Weiter",
  "common.pickDate": "Datum auswählen",
  "nav.home": "Startseite",
  "nav.explore": "Entdecken",
  "nav.bookings": "Buchungen",
  "nav.messages": "Nachrichten",
  "nav.savedLocations": "Gespeicherte Orte",
  "nav.listings": "Angebote",
  "nav.addListing": "Angebot Hinzufügen",
  "nav.analytics": "Analysen",
  "nav.account": "Konto",
  "nav.secretCorners": "Geheime Ecken",
  "home.heroTitle": "Finden Sie Ihren perfekten Ort",
  "home.heroSubtitle": "Entdecken Sie einzigartige Räume für Fotografie, Film und Veranstaltungen",
  "home.searchPlaceholder": "Nach einem Ort suchen",
  "home.featuredTitle": "Buchen Sie mit Vertrauen",
  "home.featuredSubtitle": "Erleben Sie problemlose Ortsbuchung mit Funktionen, die auf den Erfolg Ihrer kreativen Projekte ausgerichtet sind",
  "home.spotlightTitle": "Ausgewählte Orte",
  "home.exploreTitle": "Alle Orte erkunden",
  "home.exploreSubtitle": "Durchsuchen Sie unsere vollständige Sammlung geprüfter Standorte",
  "footer.company": "Unternehmen",
  "footer.about": "Über uns",
  "footer.careers": "Karriere",
  "footer.press": "Presse",
  "footer.blog": "Blog",
  "footer.support": "Support",
  "footer.help": "Hilfe",
  "footer.safety": "Sicherheit",
  "footer.terms": "AGB",
  "footer.privacy": "Datenschutz",
  "footer.accessibility": "Barrierefreiheit",
  "footer.community": "Community",
  "footer.guidelines": "Richtlinien",
  "region.europe": "Europa",
  "region.americas": "Amerika",
  "region.asia-pacific": "Asien-Pazifik",
  "seo.homeTitle": "Blocmark - Entdecken und buchen Sie einzigartige Orte",
  "seo.homeDescription": "Finden und buchen Sie den perfekten Ort für Ihren nächsten Dreh, Ihre Veranstaltung oder Produktion. Stöbern Sie in einzigartigen, kuratierten Räumen mit transparenter Preisgestaltung.",
  "location.price": "Preis",
  "location.perHour": "pro Stunde",
  "location.amenities": "Ausstattung",
  "location.book": "Diesen Ort buchen",
  "listing.addListing": "Vermieten Sie Ihren Raum",
  "listing.yourListings": "Ihre Angebote",
  "search.aiSearch": "KI-Suche",
  "search.classicSearch": "Klassische Suche",
  "search.magicSearch": "Magische Suche",
  "search.cityPlaceholder": "Städte weltweit suchen...",
  "search.featurePlaceholder": "Versuchen Sie: Küche, Badezimmer, Holzboden, hohe Decke...",
  "search.activityType": "Aktivitätstyp",
  "activity.photoShoot": "Fotoshooting",
  "activity.videoProduction": "Videoproduktion",
  "activity.event": "Veranstaltung",
  "activity.meeting": "Besprechung",
  "activity.filming": "Filmaufnahme",
  "activity.commercial": "Werbung",
  "activity.wedding": "Hochzeit",
  "activity.corporate": "Unternehmensveranstaltung",
  "common.loading": "Laden",
  "common.error": "Fehler",
  "common.success": "Erfolg",
  "common.failed": "Fehlgeschlagen",
  "common.reserve": "Reservieren",
  "common.accept": "Akzeptieren",
  "common.decline": "Ablehnen",
  "common.edit": "Bearbeiten",
  "common.delete": "Löschen",
  "common.add": "Hinzufügen",
  "common.remove": "Entfernen",
  "common.submit": "Absenden",
  "common.retry": "Erneut versuchen",
  "common.close": "Schließen",
  "common.open": "Öffnen",
  "common.show": "Zeigen",
  "common.hide": "Verstecken",
  "common.yes": "Ja",
  "common.no": "Nein",
  "common.required": "Erforderlich",
  "common.optional": "Optional",
  "common.total": "Gesamt",
  "common.subtotal": "Zwischensumme",
  "common.tax": "Steuer",
  "common.fee": "Gebühr",
  "common.discount": "Rabatt",
  "common.payment": "Zahlung",
  "common.processing": "Verarbeitung",
  "common.complete": "Vollständig",
  "common.pending": "Ausstehend",
  "common.approved": "Genehmigt",
  "common.rejected": "Abgelehnt",
  "common.cancelled": "Storniert",
  "common.refunded": "Rückerstattet",
  "booking.title": "Ihre Buchung abschließen",
  "booking.completeBooking": "Ihre Buchung abschließen",
  "booking.projectDetails": "Ihre Projektdetails",
  "booking.paymentStep": "Zahlung",
  "booking.summary": "Buchungsübersicht",
  "booking.activity": "Aktivität (so spezifisch wie möglich)",
  "booking.castCrew": "Darsteller & Crew",
  "booking.projectName": "Projektname",
  "booking.company": "Mieter/Firma",
  "booking.aboutProject": "Über Ihr Projekt",
  "booking.date": "Datum",
  "booking.startTime": "Startzeit",
  "booking.endTime": "Endzeit",
  "booking.additionalServices": "Zusätzliche Dienstleistungen",
  "booking.paymentInformation": "Zahlungsinformationen",
  "booking.paymentLoading": "Zahlungsformular wird geladen...",
  "booking.paymentFailed": "Zahlungssystem konnte nicht initialisiert werden",
  "booking.paymentSuccess": "Zahlung erfolgreich",
  "booking.acceptAndPay": "Akzeptieren und bezahlen",
  "booking.creatingBooking": "Buchung wird erstellt...",
  "booking.processingPayment": "Zahlung wird verarbeitet...",
  "booking.paymentOptions": "Zahlungsoptionen",
  "booking.payInFull": "Vollständig bezahlen",
  "booking.payInstallments": "In 4 Raten bezahlen mit",
  "booking.cancellationPolicy": "Stornierungsbedingungen und Kulanzfrist",
  "booking.gracePeriod": "Alle Buchungen unterliegen unserer Kulanzfrist, die eine vollständige Rückerstattung für Stornierungen innerhalb von 24 Stunden nach Bestätigung ermöglicht.",
  "booking.whatHappensNext": "Was passiert als nächstes?",
  "booking.instantBooking": "Die von Ihnen gewählten Buchungsparameter erfüllen die vom Gastgeber für Sofortbuchungen festgelegten Kriterien.",
  "booking.locationAgreement": "Standortvereinbarung",
  "booking.bookingRules": "Buchungsregeln",
  "booking.termsOfService": "Nutzungsbedingungen",
  "booking.bookingError": "Buchungsfehler",
  "booking.formError": "Formularfehler",
  "booking.paymentError": "Zahlungsfehler",
  "booking.success": "Buchung erfolgreich",
  "booking.confirmationNumber": "Bestätigungsnummer",
  "booking.thankYou": "Vielen Dank für Ihre Buchung!",
  "booking.checkEmail": "Überprüfen Sie Ihre E-Mail für die Bestätigung",
  "booking.contactHost": "Gastgeber kontaktieren",
  "booking.viewBooking": "Buchung anzeigen",
  "booking.backToSearch": "Zurück zur Suche",
  "form.activity": "Aktivität",
  "form.castCrew": "Darsteller & Crew",
  "form.projectName": "Projektname",
  "form.company": "Firma",
  "form.description": "Beschreibung",
  "form.date": "Datum",
  "form.startTime": "Startzeit",
  "form.endTime": "Endzeit",
  "form.activityPlaceholder": "Filmaufnahme",
  "form.castCrewPlaceholder": "6 - 15 Personen",
  "form.projectNamePlaceholder": "Projektname eingeben",
  "form.companyPlaceholder": "Firmennamen eingeben",
  "form.descriptionPlaceholder": "Teilen Sie dem Gastgeber mit, was Sie planen",
  "form.validation.required": "Dieses Feld ist erforderlich",
  "form.validation.email": "Bitte geben Sie eine gültige E-Mail-Adresse ein",
  "form.validation.phone": "Bitte geben Sie eine gültige Telefonnummer ein",
  "form.validation.date": "Bitte wählen Sie ein gültiges Datum",
  "form.validation.time": "Bitte wählen Sie eine gültige Zeit",
  "form.validation.number": "Bitte geben Sie eine gültige Zahl ein",
  "form.validation.minLength": "Mindestlänge erforderlich",
  "form.validation.maxLength": "Maximale Länge überschritten",
  "pricing.basePrice": "Grundpreis",
  "pricing.hourlyRate": "Stundensatz",
  "pricing.serviceFee": "Servicegebühr",
  "pricing.taxes": "Steuern",
  "pricing.total": "Gesamt",
  "pricing.perHour": "pro Stunde",
  "pricing.perDay": "pro Tag",
  "pricing.breakdown": "Preisaufschlüsselung",
  "pricing.addons": "Zusatzleistungen",
  "pricing.discount": "Rabatt",
  "pricing.subtotal": "Zwischensumme",
  "error.generic": "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
  "error.network": "Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.",
  "error.server": "Serverfehler. Bitte versuchen Sie es später erneut.",
  "error.notFound": "Ressource nicht gefunden.",
  "error.unauthorized": "Sie sind nicht berechtigt, diese Aktion durchzuführen.",
  "error.forbidden": "Zugriff verweigert.",
  "error.validation": "Bitte überprüfen Sie Ihre Eingabe und versuchen Sie es erneut.",
  "error.payment": "Zahlungsverarbeitung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  "error.booking": "Buchungserstellung fehlgeschlagen. Bitte versuchen Sie es erneut.",
  "error.upload": "Datei-Upload fehlgeschlagen. Bitte versuchen Sie es erneut.",
  "error.connection": "Verbindung verloren. Bitte versuchen Sie es erneut.",
  "error.timeout": "Anfrage ist abgelaufen. Bitte versuchen Sie es erneut.",
  "error.retry": "Bitte versuchen Sie es erneut",
  "error.contact": "Bitte kontaktieren Sie den Support, wenn das Problem weiterhin besteht.",
  "success.bookingCreated": "Buchung erfolgreich erstellt!",
  "success.paymentProcessed": "Zahlung erfolgreich verarbeitet!",
  "success.messageSent": "Nachricht erfolgreich gesendet!",
  "success.profileUpdated": "Profil erfolgreich aktualisiert!",
  "success.listingCreated": "Angebot erfolgreich erstellt!",
  "success.reviewSubmitted": "Bewertung erfolgreich eingereicht!",
  "success.saved": "Erfolgreich gespeichert!",
  "success.deleted": "Erfolgreich gelöscht!",
  "success.updated": "Erfolgreich aktualisiert!",
  "success.uploaded": "Erfolgreich hochgeladen!",
  "date.today": "Heute",
  "date.tomorrow": "Morgen",
  "date.yesterday": "Gestern",
  "date.thisWeek": "Diese Woche",
  "date.nextWeek": "Nächste Woche",
  "date.thisMonth": "Diesen Monat",
  "date.nextMonth": "Nächsten Monat",
  "date.flexible": "Flexibel",
  "date.selectDate": "Datum wählen",
  "date.selectTime": "Zeit wählen",
  "time.morning": "Morgen",
  "time.afternoon": "Nachmittag",
  "time.evening": "Abend",
  "time.night": "Nacht",
  "time.allDay": "Ganztägig",
  "time.duration": "Dauer",
  "time.hours": "Stunden",
  "time.minutes": "Minuten",
  "time.am": "AM",
  "time.pm": "PM"
};

// Spanish translations
export const esTranslations: Record<TranslationKey, string> = {
  "common.search": "Buscar",
  "common.login": "Iniciar Sesión",
  "common.logout": "Cerrar Sesión",
  "common.profile": "Perfil",
  "common.settings": "Configuración",
  "common.bookNow": "Reservar Ahora",
  "common.viewDetails": "Ver Detalles",
  "common.save": "Guardar",
  "common.cancel": "Cancelar",
  "common.confirm": "Confirmar",
  "common.back": "Atrás",
  "common.next": "Siguiente",
  "common.pickDate": "Elegir fecha",
  "nav.home": "Inicio",
  "nav.explore": "Explorar",
  "nav.bookings": "Reservas",
  "nav.messages": "Mensajes",
  "nav.savedLocations": "Lugares Guardados",
  "nav.listings": "Listados",
  "nav.addListing": "Añadir Listado",
  "nav.analytics": "Analíticas",
  "nav.account": "Cuenta",
  "nav.secretCorners": "Rincones Secretos",
  "home.heroTitle": "Encuentra Tu Lugar Perfecto",
  "home.heroSubtitle": "Descubre espacios únicos para fotografía, cine y eventos",
  "home.searchPlaceholder": "Buscar un lugar",
  "home.featuredTitle": "Reserva con Confianza",
  "home.featuredSubtitle": "Disfruta de una reserva de ubicación sin complicaciones con funciones diseñadas para que tus proyectos creativos tengan éxito",
  "home.spotlightTitle": "Lugares Destacados",
  "home.exploreTitle": "Explorar Todos los Lugares",
  "home.exploreSubtitle": "Navega por nuestra colección completa de ubicaciones verificadas",
  "footer.company": "Empresa",
  "footer.about": "Acerca de",
  "footer.careers": "Carreras",
  "footer.press": "Prensa",
  "footer.blog": "Blog",
  "footer.support": "Soporte",
  "footer.help": "Ayuda",
  "footer.safety": "Seguridad",
  "footer.terms": "Términos",
  "footer.privacy": "Privacidad",
  "footer.accessibility": "Accesibilidad",
  "footer.community": "Comunidad",
  "footer.guidelines": "Directrices",
  "region.europe": "Europa",
  "region.americas": "Las Américas",
  "region.asia-pacific": "Asia Pacífico",
  "seo.homeTitle": "Blocmark - Descubre y Reserva Ubicaciones Únicas",
  "seo.homeDescription": "Encuentra y reserva la ubicación perfecta para tu próxima sesión, evento o producción. Explora espacios únicos y seleccionados con precios transparentes.",
  "location.price": "Precio",
  "location.perHour": "por hora",
  "location.amenities": "Comodidades",
  "location.book": "Reservar Esta Ubicación",
  "listing.addListing": "Listar tu espacio",
  "listing.yourListings": "Tus Listados",
  "search.aiSearch": "Búsqueda por IA",
  "search.classicSearch": "Búsqueda Clásica",
  "search.magicSearch": "Búsqueda Mágica",
  "search.cityPlaceholder": "Buscar ciudades en todo el mundo...",
  "search.featurePlaceholder": "Prueba: cocina, baño, piso de madera, techo alto...",
  "search.activityType": "Tipo de actividad",
  "activity.photoShoot": "Sesión Fotográfica",
  "activity.videoProduction": "Producción de Video",
  "activity.event": "Evento",
  "activity.meeting": "Reunión"
};

// French translations
export const frTranslations: Record<TranslationKey, string> = {
  "common.search": "Rechercher",
  "common.login": "Connexion",
  "common.logout": "Déconnexion",
  "common.profile": "Profil",
  "common.settings": "Paramètres",
  "common.bookNow": "Réserver Maintenant",
  "common.viewDetails": "Voir Détails",
  "common.save": "Enregistrer",
  "common.cancel": "Annuler",
  "common.confirm": "Confirmer",
  "common.back": "Retour",
  "common.next": "Suivant",
  "common.pickDate": "Choisir une date",
  "nav.home": "Accueil",
  "nav.explore": "Explorer",
  "nav.bookings": "Réservations",
  "nav.messages": "Messages",
  "nav.savedLocations": "Lieux Sauvegardés",
  "nav.listings": "Annonces",
  "nav.addListing": "Ajouter une Annonce",
  "nav.analytics": "Analytique",
  "nav.account": "Compte",
  "nav.secretCorners": "Coins Secrets",
  "home.heroTitle": "Trouvez Votre Lieu Parfait",
  "home.heroSubtitle": "Découvrez des espaces uniques pour la photographie, le cinéma et les événements",
  "home.searchPlaceholder": "Rechercher un lieu",
  "home.featuredTitle": "Réservez en Toute Confiance",
  "home.featuredSubtitle": "Expérimentez une réservation de lieu sans tracas avec des fonctionnalités conçues pour faire réussir vos projets créatifs",
  "home.spotlightTitle": "Lieux en Vedette",
  "home.exploreTitle": "Explorer Tous les Lieux",
  "home.exploreSubtitle": "Parcourez notre collection complète de lieux vérifiés",
  "footer.company": "Entreprise",
  "footer.about": "À Propos",
  "footer.careers": "Carrières",
  "footer.press": "Presse",
  "footer.blog": "Blog",
  "footer.support": "Support",
  "footer.help": "Aide",
  "footer.safety": "Sécurité",
  "footer.terms": "Conditions",
  "footer.privacy": "Confidentialité",
  "footer.accessibility": "Accessibilité",
  "footer.community": "Communauté",
  "footer.guidelines": "Directives",
  "region.europe": "Europe",
  "region.americas": "Les Amériques",
  "region.asia-pacific": "Asie Pacifique",
  "seo.homeTitle": "Blocmark - Découvrez et Réservez des Lieux Uniques",
  "seo.homeDescription": "Trouvez et réservez le lieu parfait pour votre prochain tournage, événement ou production. Parcourez des espaces uniques et sélectionnés avec des prix transparents.",
  "location.price": "Prix",
  "location.perHour": "par heure",
  "location.amenities": "Équipements",
  "location.book": "Réserver Ce Lieu",
  "listing.addListing": "Publiez votre espace",
  "listing.yourListings": "Vos Annonces",
  "search.aiSearch": "Recherche IA",
  "search.classicSearch": "Recherche Classique",
  "search.magicSearch": "Recherche Magique",
  "search.cityPlaceholder": "Rechercher des villes dans le monde entier...",
  "search.featurePlaceholder": "Essayez: cuisine, salle de bain, parquet, plafond haut...",
  "search.activityType": "Type d'activité",
  "activity.photoShoot": "Séance Photo",
  "activity.videoProduction": "Production Vidéo",
  "activity.event": "Événement",
  "activity.meeting": "Réunion"
};

// Chinese translations
export const zhTranslations: Record<TranslationKey, string> = {
  "common.search": "搜索",
  "common.login": "登录",
  "common.logout": "登出",
  "common.profile": "个人资料",
  "common.settings": "设置",
  "common.bookNow": "立即预订",
  "common.viewDetails": "查看详情",
  "common.save": "保存",
  "common.cancel": "取消",
  "common.confirm": "确认",
  "common.back": "返回",
  "common.next": "下一步",
  "common.pickDate": "选择日期",
  "nav.home": "首页",
  "nav.explore": "探索",
  "nav.bookings": "预订",
  "nav.messages": "消息",
  "nav.savedLocations": "已保存位置",
  "nav.listings": "房源列表",
  "nav.addListing": "添加房源",
  "nav.analytics": "分析",
  "nav.account": "账户",
  "nav.secretCorners": "秘密角落",
  "home.heroTitle": "找到您的完美场地",
  "home.heroSubtitle": "发现摄影、电影和活动的独特空间",
  "home.searchPlaceholder": "搜索场地",
  "home.featuredTitle": "放心预订",
  "home.featuredSubtitle": "体验无忧的场地预订，功能设计旨在使您的创意项目取得成功",
  "home.spotlightTitle": "精选场地",
  "home.exploreTitle": "探索所有场地",
  "home.exploreSubtitle": "浏览我们经过审核的完整场地集合",
  "footer.company": "公司",
  "footer.about": "关于我们",
  "footer.careers": "职业机会",
  "footer.press": "新闻",
  "footer.blog": "博客",
  "footer.support": "支持",
  "footer.help": "帮助",
  "footer.safety": "安全",
  "footer.terms": "条款",
  "footer.privacy": "隐私",
  "footer.accessibility": "无障碍",
  "footer.community": "社区",
  "footer.guidelines": "指南",
  "region.europe": "欧洲",
  "region.americas": "美洲",
  "region.asia-pacific": "亚太地区",
  "seo.homeTitle": "Blocmark - 发现并预订独特场地",
  "seo.homeDescription": "为您的下一次拍摄、活动或制作找到并预订完美场地。浏览独特、精心策划的空间，价格透明。",
  "location.price": "价格",
  "location.perHour": "每小时",
  "location.amenities": "设施",
  "location.book": "预订此场地",
  "listing.addListing": "上线您的空间",
  "listing.yourListings": "您的房源",
  "search.aiSearch": "AI搜索",
  "search.classicSearch": "经典搜索",
  "search.magicSearch": "魔法搜索",
  "search.cityPlaceholder": "搜索全球城市...",
  "search.featurePlaceholder": "尝试：厨房、浴室、硬木地板、高天花板...",
  "search.activityType": "活动类型",
  "activity.photoShoot": "摄影拍摄",
  "activity.videoProduction": "视频制作",
  "activity.event": "活动",
  "activity.meeting": "会议"
};

// Japanese translations
export const jaTranslations: Record<TranslationKey, string> = {
  "common.search": "検索",
  "common.login": "ログイン",
  "common.logout": "ログアウト",
  "common.profile": "プロフィール",
  "common.settings": "設定",
  "common.bookNow": "今すぐ予約",
  "common.viewDetails": "詳細を見る",
  "common.save": "保存",
  "common.cancel": "キャンセル",
  "common.confirm": "確認",
  "common.back": "戻る",
  "common.next": "次へ",
  "common.pickDate": "日付を選択",
  "nav.home": "ホーム",
  "nav.explore": "探索",
  "nav.bookings": "予約",
  "nav.messages": "メッセージ",
  "nav.savedLocations": "保存した場所",
  "nav.listings": "リスティング",
  "nav.addListing": "リスティングを追加",
  "nav.analytics": "分析",
  "nav.account": "アカウント",
  "nav.secretCorners": "秘密の場所",
  "home.heroTitle": "あなたの完璧な場所を見つけましょう",
  "home.heroSubtitle": "写真撮影、映画、イベントのためのユニークな空間を発見する",
  "home.searchPlaceholder": "場所を検索",
  "home.featuredTitle": "安心して予約",
  "home.featuredSubtitle": "クリエイティブプロジェクトを成功させるための機能を備えた、手間のかからない場所予約を体験",
  "home.spotlightTitle": "注目の場所",
  "home.exploreTitle": "すべての場所を探索",
  "home.exploreSubtitle": "厳選された場所の完全なコレクションを閲覧",
  "footer.company": "会社",
  "footer.about": "会社概要",
  "footer.careers": "採用情報",
  "footer.press": "プレス",
  "footer.blog": "ブログ",
  "footer.support": "サポート",
  "footer.help": "ヘルプ",
  "footer.safety": "安全",
  "footer.terms": "利用規約",
  "footer.privacy": "プライバシー",
  "footer.accessibility": "アクセシビリティ",
  "footer.community": "コミュニティ",
  "footer.guidelines": "ガイドライン",
  "region.europe": "ヨーロッパ",
  "region.americas": "アメリカ大陸",
  "region.asia-pacific": "アジア太平洋",
  "seo.homeTitle": "Blocmark - ユニークな場所を発見して予約",
  "seo.homeDescription": "次の撮影、イベント、制作のための完璧な場所を見つけて予約しましょう。透明な価格設定で厳選されたユニークな空間を閲覧。",
  "location.price": "価格",
  "location.perHour": "1時間あたり",
  "location.amenities": "アメニティ",
  "location.book": "この場所を予約",
  "listing.addListing": "あなたのスペースを掲載",
  "listing.yourListings": "あなたのリスティング",
  "search.aiSearch": "AI検索",
  "search.classicSearch": "通常検索",
  "search.magicSearch": "マジック検索",
  "search.cityPlaceholder": "世界中の都市を検索...",
  "search.featurePlaceholder": "試してみる: キッチン、バスルーム、木製の床、高い天井...",
  "search.activityType": "アクティビティタイプ",
  "activity.photoShoot": "写真撮影",
  "activity.videoProduction": "ビデオ制作",
  "activity.event": "イベント",
  "activity.meeting": "ミーティング"
};

// Group all translations
// Italian translations
export const itTranslations: Record<TranslationKey, string> = {
  "common.search": "Cerca",
  "common.login": "Accedi/Registrati",
  "common.logout": "Esci",
  "common.profile": "Profilo",
  "common.settings": "Impostazioni",
  "common.bookNow": "Prenota Ora",
  "common.viewDetails": "Visualizza Dettagli",
  "common.save": "Salva",
  "common.cancel": "Annulla",
  "common.confirm": "Conferma",
  "common.back": "Indietro",
  "common.next": "Avanti",
  "common.pickDate": "Scegli una data",
  "nav.home": "Home",
  "nav.explore": "Esplora",
  "nav.bookings": "Prenotazioni",
  "nav.messages": "Messaggi",
  "nav.savedLocations": "Luoghi Salvati",
  "nav.listings": "Annunci",
  "nav.addListing": "Aggiungi Annuncio",
  "nav.analytics": "Analisi",
  "nav.account": "Account",
  "nav.secretCorners": "Angoli Segreti",
  "home.heroTitle": "Trova il Tuo Luogo Perfetto",
  "home.heroSubtitle": "Scopri spazi unici per fotografia, film ed eventi",
  "home.searchPlaceholder": "Cerca un luogo",
  "home.featuredTitle": "Prenota con Fiducia",
  "home.featuredSubtitle": "Vivi un'esperienza di prenotazione senza problemi con funzionalità progettate per far avere successo ai tuoi progetti creativi",
  "home.spotlightTitle": "Luoghi in Evidenza",
  "home.spotlightSubtitle": "Scopri la nostra selezione accurata di spazi eccezionali perfetti per il tuo prossimo progetto",
  "home.exploreTitle": "Esplora Tutti i Luoghi",
  "home.exploreSubtitle": "Sfoglia la nostra collezione completa di località verificate",
  "gallery.madeWith": "Realizzato con",
  "gallery.subtitle": "Da film blockbuster a ritratti intimi, da sale riunioni aziendali a locali musicali underground — testimonia la magia creativa che accade quando la visione incontra lo spazio perfetto.",
  "concierge.premiumService": "Servizio Premium",
  "concierge.title": "Servizio Concierge",
  "concierge.subtitle": "Sblocchiamo i tuoi sogni, non importa dove vuoi celebrare il tuo evento o girare il tuo prossimo film. Possiamo accedere a qualsiasi spazio disponibile sul pianeta Terra. Dicci solo cosa ti serve.",
  "concierge.requestHelp": "Richiedi Aiuto Concierge",
  "concierge.unlockSpaceTitle": "Sblocca Qualsiasi Spazio",
  "concierge.unlockSpaceDesc": "Accesso a location private ed esclusive in tutto il mondo",
  "concierge.permitTitle": "Gestione Permessi",
  "concierge.permitDesc": "Gestiamo tutta la documentazione e le autorizzazioni necessarie",
  "concierge.supportTitle": "Supporto Premium",
  "concierge.supportDesc": "Team dedicato 24/7 per assistere con qualsiasi richiesta",
  "concierge.teamTitle": "Team Dedicato",
  "concierge.teamDesc": "Servizio personalizzato per trovare la tua location perfetta",
  "secretCorners.title": "Angoli Segreti",
  "secretCorners.subtitle": "Abbonati per soli €4/mese per accedere a gemme nascoste esclusive perfette per fotografia, riprese, tramonti e passeggiate speciali.",
  "secretCorners.premiumTitle": "Location Premium",
  "secretCorners.premiumDesc": "Accesso a luoghi nascosti non disponibili agli utenti normali",
  "secretCorners.memberTitle": "Vantaggi Membri",
  "secretCorners.memberDesc": "Accesso esclusivo a panorami mozzafiato, punti fotografici e altro",
  "secretCorners.submitTitle": "Invia i Tuoi Luoghi",
  "secretCorners.submitDesc": "Condividi le tue location e guadagna dal pool di abbonamenti",
  "secretCorners.curatedTitle": "Selezione Curata",
  "secretCorners.curatedDesc": "Solo le migliori location entrano nei nostri Angoli Segreti",
  "hostBenefits.whyListTitle": "Perché Listare con Blocmark?",
  "hostBenefits.whyChooseTitle": "Perché Scegliere Blocmark?",
  "hostBenefits.hostsTab": "Host",
  "hostBenefits.rentersTab": "Affittuari",
  "hostBenefits.getPaidTitle": "Pagato in 24h",
  "hostBenefits.getPaidDesc": "Dimentica i pagamenti di 30 giorni. Trasferiamo i tuoi soldi entro 24 ore da una prenotazione completata.",
  "hostBenefits.scheduleTitle": "Controlla i Tuoi Orari",
  "hostBenefits.scheduleDesc": "Hai il controllo — imposta il tuo calendario e le date non disponibili con un clic.",
  "hostBenefits.peaceTitle": "Tranquillità",
  "hostBenefits.peaceDesc": "Ogni prenotazione include copertura per danni e responsabilità, automaticamente.",
  "hostBenefits.zeroTitle": "Da Zero a Prenotato Velocemente",
  "hostBenefits.zeroDesc": "Nessuna commissione di setup. Nessun costo mensile. Inizia a guadagnare oggi.",
  "hostBenefits.spotlightTitle": "Esposizione Spotlight",
  "hostBenefits.spotlightDesc": "Fatti scoprire in funzionalità curate, collezioni e selezioni editoriali.",
  "hostBenefits.controlTitle": "Controllo Senza Sforzo",
  "hostBenefits.controlDesc": "Una dashboard moderna per gestire tutto dalle prenotazioni ai pagamenti, magnificamente.",
  "hostBenefits.verifiedTitle": "Verificato. Controllato. Apprezzato.",
  "hostBenefits.verifiedDesc": "Ogni spazio è selezionato a mano dal nostro team. Nessuna casualità, nessuna sorpresa.",
  "hostBenefits.aiTitle": "AI che Ti Capisce",
  "hostBenefits.aiDesc": "Dicci cosa ti serve — la nostra AI ti abbina con lo spazio perfetto istantaneamente.",
  "hostBenefits.bookTitle": "Prenota con Fiducia",
  "hostBenefits.bookDesc": "Pagamenti sicuri. Termini trasparenti. Sei coperto.",
  "hostBenefits.minutesTitle": "Prenota in Minuti",
  "hostBenefits.minutesDesc": "Cerca. Chatta. Prenota. Tutto in un flusso fluido.",
  "hostBenefits.hiddenTitle": "Gemme Nascoste Ti Aspettano",
  "hostBenefits.hiddenDesc": "Scopri angoli segreti, gemme fuori dai sentieri battuti e listing esclusivi.",
  "hostBenefits.smartTitle": "Supporto Intelligente",
  "hostBenefits.smartDesc": "La nostra AI e persone reali sono disponibili 24/7 per guidarti.",
  "hostBenefits.ctaTitle": "Pronto a trasformare il tuo spazio in un set cinematografico?",
  "hostBenefits.ctaSubtitle": "O trovare la tua prossima location da sogno?",
  "hostBenefits.propertyOwner": "Sono un Proprietario",
  "hostBenefits.renterCreator": "Sono un Affittuario / Creatore",
  "mobileApp.badge": "Esperienza Mobile",
  "mobileApp.title": "Scopri Spazi Ovunque, Sempre",
  "mobileApp.subtitle": "Prenota location top direttamente dalla tua tasca. Trova e riserva la location perfetta per il tuo prossimo progetto in movimento.",
  "mobileApp.downloadOn": "Scarica su",
  "mobileApp.appStore": "App Store",
  "mobileApp.getItOn": "Scarica su",
  "mobileApp.googlePlay": "Google Play",
  "mobileApp.linkText": "Ricevi un link di download sul tuo telefono:",
  "guides.expertResources": "Risorse Expert",
  "guides.title": "Guide Location & Ispirazione",
  "guides.subtitle": "Scopri consigli professionali, approfondimenti del settore e consulenza esperta per aiutarti a trovare e prenotare gli spazi perfetti per i tuoi progetti creativi",
  "guides.browseAll": "Sfoglia Tutte le Guide",
  "guides.studioTitle": "Guida Selezione Studio",
  "guides.studioDesc": "Impara come trovare e prenotare lo studio fotografico perfetto con considerazioni su illuminazione, attrezzature e spazio",
  "guides.scoutingTitle": "Consigli Location Scouting",
  "guides.scoutingDesc": "Consulenza esperta per trovare location cinematografiche uniche, da ambientazioni urbane a paesaggi naturali",
  "guides.eventTitle": "Pianificazione Spazi Eventi",
  "guides.eventDesc": "Guida completa per selezionare la venue ideale per i tuoi eventi, incluse considerazioni su capacità e servizi",
  "guides.aiTitle": "Selezione Location AI",
  "guides.aiDesc": "Utilizzare gli strumenti AI di Blocmark per trovare la location perfetta per le tue specifiche esigenze di progetto",
  "guides.photographyCategory": "Fotografia",
  "guides.filmingCategory": "Cinema",
  "guides.eventsCategory": "Eventi",
  "guides.technologyCategory": "Tecnologia",
  "guides.readTime12": "12 min",
  "guides.readTime15": "15 min",
  "guides.readTime10": "10 min",
  "guides.readTime8": "8 min",
  "footer.description": "Blocmark collega professionisti creativi con spazi unici per progetti, servizi fotografici e produzioni con prezzi trasparenti e prenotazioni sicure.",
  "footer.stayUpdated": "Rimani Aggiornato",
  "footer.newsletterDesc": "Iscriviti alla nostra newsletter per le ultime location, funzionalità e approfondimenti del settore.",
  "footer.emailPlaceholder": "Il tuo indirizzo email",
  "footer.subscribe": "Iscriviti",
  "footer.subscribed": "Iscritto!",
  "footer.company": "Azienda",
  "footer.about": "Chi Siamo",
  "footer.careers": "Carriere",
  "footer.press": "Stampa",
  "footer.blog": "Blog",
  "footer.support": "Supporto",
  "footer.help": "Aiuto",
  "footer.safety": "Sicurezza",
  "footer.terms": "Termini",
  "footer.privacy": "Privacy",
  "footer.accessibility": "Accessibilità",
  "footer.community": "Comunità",
  "footer.guidelines": "Linee Guida",
  "footer.listSpace": "Pubblica il Tuo Spazio",
  "footer.faq": "FAQ",
  "footer.trustSafety": "Fiducia e Sicurezza",
  "footer.activities": "Attività",
  "footer.photoShoot": "Servizio Fotografico",
  "footer.filming": "Riprese",
  "footer.events": "Eventi",
  "footer.meetings": "Riunioni",
  "footer.production": "Produzione",
  "footer.types": "Tipi",
  "footer.photoStudio": "Studio Fotografico",
  "footer.filmStudio": "Studio Cinematografico",
  "footer.eventSpace": "Spazio Eventi",
  "footer.officeSpace": "Spazio Ufficio",
  "footer.warehouse": "Magazzino",
  "footer.cities": "Città",
  "footer.losAngeles": "Los Angeles",
  "footer.newYork": "New York",
  "footer.miami": "Miami",
  "footer.chicago": "Chicago",
  "footer.viewAll": "Visualizza Tutto",
  "footer.connect": "Connetti",
  "footer.guides": "Guide",
  "region.europe": "Europa",
  "region.americas": "Le Americhe",
  "region.asia-pacific": "Asia Pacifico",
  "seo.homeTitle": "Blocmark - Scopri e Prenota Luoghi Unici",
  "seo.homeDescription": "Trova e prenota il luogo perfetto per il tuo prossimo scatto, evento o produzione. Sfoglia spazi unici e curati con prezzi trasparenti.",
  "location.price": "Prezzo",
  "location.perHour": "all'ora",
  "location.amenities": "Servizi",
  "location.book": "Prenota Questo Luogo",
  "listing.addListing": "Pubblica il tuo spazio",
  "listing.yourListings": "I Tuoi Annunci",
  "search.aiSearch": "Ricerca AI",
  "search.classicSearch": "Ricerca Classica",
  "search.magicSearch": "Ricerca Magica",
  "search.cityPlaceholder": "Cerca città in tutto il mondo...",
  "search.featurePlaceholder": "Prova: cucina, bagno, pavimento in legno, soffitto alto...",
  "search.activityType": "Tipo di attività",
  "activity.photoShoot": "Servizio Fotografico",
  "activity.videoProduction": "Produzione Video",
  "activity.event": "Evento",
  "activity.meeting": "Riunione",
  "activity.filming": "Riprese",
  "activity.commercial": "Commerciale",
  "activity.wedding": "Matrimonio",
  "activity.corporate": "Evento Aziendale",
  "common.loading": "Caricamento",
  "common.error": "Errore",
  "common.success": "Successo",
  "common.failed": "Fallito",
  "common.reserve": "Prenota",
  "common.accept": "Accetta",
  "common.decline": "Rifiuta",
  "common.edit": "Modifica",
  "common.delete": "Elimina",
  "common.add": "Aggiungi",
  "common.remove": "Rimuovi",
  "common.submit": "Invia",
  "common.retry": "Riprova",
  "common.close": "Chiudi",
  "common.open": "Apri",
  "common.filter": "Filtra",
  "common.sort": "Ordina",
  "common.reset": "Reimposta",
  "common.apply": "Applica",
  "common.clear": "Cancella",
  "common.selectAll": "Seleziona tutto",
  "common.deselectAll": "Deseleziona tutto",
  "nav.hostMode": "Modalità Host",
  "nav.clientMode": "Modalità Cliente",
  "hero.title": "Trova il tuo posto perfetto",
  "hero.subtitle": "Scopri spazi unici per fotografia, film ed eventi",
  "hero.searchPlaceholder": "Cerca una posizione",
  "hero.getStarted": "Inizia",
  "hero.learnMore": "Scopri di più",
  "error.networkError": "Errore di rete. Controlla la tua connessione e riprova.",
  "error.serverError": "Errore del server. Riprova più tardi.",
  "error.timeout": "Richiesta scaduta. Riprova.",
  "error.retry": "Riprova",
  "error.contact": "Contatta l'assistenza se il problema persiste.",
  "success.bookingCreated": "Prenotazione creata con successo!",
  "success.paymentProcessed": "Pagamento elaborato con successo!",
  "success.messageSent": "Messaggio inviato con successo!",
  "success.profileUpdated": "Profilo aggiornato con successo!",
  "success.listingCreated": "Annuncio creato con successo!",
  "success.reviewSubmitted": "Recensione inviata con successo!",
  "success.saved": "Salvato con successo!",
  "success.deleted": "Eliminato con successo!",
  "success.updated": "Aggiornato con successo!",
  "success.uploaded": "Caricato con successo!",
  "date.today": "Oggi",
  "date.tomorrow": "Domani",
  "date.yesterday": "Ieri",
  "date.thisWeek": "Questa settimana",
  "date.nextWeek": "Prossima settimana",
  "date.thisMonth": "Questo mese",
  "date.nextMonth": "Prossimo mese",
  "date.flexible": "Flessibile",
  "date.selectDate": "Seleziona data",
  "date.selectTime": "Seleziona ora",
  "time.morning": "Mattina",
  "time.afternoon": "Pomeriggio",
  "time.evening": "Sera",
  "time.night": "Notte",
  "time.allDay": "Tutto il giorno",
  "time.duration": "Durata",
  "time.hours": "ore",
  "time.minutes": "minuti",
  "time.am": "AM",
  "time.pm": "PM",
  "dashboard.title": "Dashboard",
  "dashboard.hostMode": "Modalità Host",
  "dashboard.clientMode": "Modalità Cliente",
  "dashboard.yourBookings": "Le Tue Prenotazioni",
  "dashboard.hostDashboard": "Dashboard Host",
  "dashboard.clientBookings": "Prenotazioni Cliente",
  "dashboard.manageProperties": "Gestisci le tue proprietà e prenotazioni",
  "dashboard.analytics": "Analisi",
  "dashboard.addNewLocation": "Aggiungi Nuova Location",
  "dashboard.noBookings": "Nessuna prenotazione ancora",
  "dashboard.needToListProperty": "Devi inserire una proprietà prima di usare le funzioni host",
  "dashboard.listPropertyDesc": "Crea il tuo primo annuncio per iniziare ad ospitare",
  "dashboard.recentActivity": "Attività Recente",
  "dashboard.viewDetails": "Visualizza Dettagli",
  "dashboard.loading": "Caricamento...",
  "dashboard.error": "Errore nel caricamento dati",
  "dashboard.noListings": "Nessun annuncio ancora",
  "dashboard.createFirstListing": "Crea il tuo primo annuncio",
  "secretCorners.searchLocations": "Cerca location...",
  "secretCorners.clear": "Cancella",
  "secretCorners.featured": "In Evidenza",
  "secretCorners.community": "Community",
  "secretCorners.premium": "Premium",
  "secretCorners.abandoned": "Abbandonato",
  "secretCorners.urban": "Urbano",
  "secretCorners.natural": "Naturale",
  "secretCorners.beach": "Spiaggia",
  "secretCorners.forest": "Foresta",
  "secretCorners.desert": "Deserto",
  "secretCorners.streetArt": "Arte di Strada",
  "secretCorners.sunset": "Tramonto",
  "secretCorners.historic": "Storico",
  "secretCorners.errorTitle": "Errore",
  "secretCorners.errorMessage": "Impossibile caricare le location. Riprova più tardi.",
  "analytics.title": "Dashboard Analisi",
  "analytics.subtitle": "Monitora le tue prestazioni e ricavi",
  "analytics.performance": "Dashboard Prestazioni",
  "analytics.revenue": "Ricavi",
  "analytics.bookings": "Prenotazioni",
  "analytics.views": "Visualizzazioni",
  "analytics.conversions": "Tasso di Conversione",
  "analytics.timeframe": "Periodo",
  "analytics.yearly": "Annuale",
  "analytics.monthly": "Mensile",
  "analytics.weekly": "Settimanale",
  "analytics.daily": "Giornaliero",
  "analytics.photoShoots": "Servizi Fotografici",
  "analytics.filming": "Riprese",
  "analytics.events": "Eventi",
  "analytics.meetings": "Riunioni",
  "analytics.other": "Altro",
  "analytics.activityBreakdown": "Suddivisione Attività",
  "analytics.revenueOverview": "Panoramica Ricavi",
  "analytics.bookingTrends": "Tendenze Prenotazioni",
  "analytics.locationPerformance": "Prestazioni Location",
  "analytics.weeklyTrends": "Tendenze Settimanali",
  "analytics.inquiries": "Richieste",
  "analytics.totalRevenue": "Ricavi Totali",
  "analytics.totalBookings": "Prenotazioni Totali",
  "analytics.avgBookingValue": "Valore Medio Prenotazione",
  "analytics.topPerformingLocations": "Location più Performanti",
  "owner.dashboard": "Dashboard Proprietario",
  "owner.subtitle": "Gestisci le tue proprietà e prenotazioni",
  "owner.analytics": "Analisi",
  "owner.addNewLocation": "Aggiungi Nuova Location",
  "owner.performance": "Dashboard Prestazioni",
  "owner.quickOverview": "Panoramica veloce delle prestazioni dei tuoi annunci e prenotazioni",
  "owner.totalBookings": "Prenotazioni Totali",
  "owner.monthlyRevenue": "Ricavi Mensili",
  "owner.activeListings": "Annunci Attivi",
  "owner.fromLastMonth": "dal mese scorso",
  "owner.viewAllAnalytics": "Visualizza Analisi Complete",
  "owner.myProperties": "Le Mie Proprietà",
  "owner.manageListings": "Gestisci i tuoi annunci e visualizza l'attività di prenotazione",
  "owner.pending": "In Attesa",
  "owner.confirmed": "Confermato",
  "owner.completed": "Completato",
  "owner.noProperties": "Nessuna proprietà inserita ancora",
  "owner.startListing": "Inizia aggiungendo la tua prima proprietà",
  "owner.editListing": "Modifica Annuncio",
  "owner.viewDetails": "Visualizza Dettagli",
  "settings.title": "Impostazioni Account",
  "settings.personalInfo": "Informazioni Personali",
  "settings.loginSecurity": "Login e Sicurezza",
  "settings.payments": "Pagamenti",
  "settings.payouts": "Incassi",
  "settings.notifications": "Notifiche",
  "settings.firstName": "Nome",
  "settings.lastName": "Cognome",
  "settings.phone": "Numero di Telefono",
  "settings.email": "Indirizzo Email",
  "settings.currentPassword": "Password Attuale",
  "settings.newPassword": "Nuova Password",
  "settings.confirmPassword": "Conferma Password",
  "settings.passwordRequirements": "La password deve avere almeno 8 caratteri con maiuscole, minuscole e numeri",
  "settings.updateProfile": "Aggiorna Profilo",
  "settings.updatePassword": "Aggiorna Password",
  "settings.addPaymentMethod": "Aggiungi Metodo di Pagamento",
  "settings.paymentMethods": "Metodi di Pagamento",
  "settings.noPaymentMethods": "Nessun metodo di pagamento aggiunto",
  "settings.addBankAccount": "Aggiungi Conto Bancario",
  "settings.payoutMethods": "Metodi di Incasso",
  "settings.noPayoutMethods": "Nessun metodo di incasso aggiunto",
  "settings.emailNotifications": "Notifiche Email",
  "settings.smsNotifications": "Notifiche SMS",
  "settings.marketingEmails": "Email di Marketing",
  "settings.bookingUpdates": "Aggiornamenti Prenotazioni",
  "settings.newMessages": "Nuovi Messaggi",
  "settings.promotions": "Promozioni e Offerte",
  "settings.personalInfoDescription": "Aggiorna le tue informazioni personali e come vengono visualizzate agli altri",
  "settings.cellPhone": "Cellulare",
  "settings.saveChanges": "Salva Modifiche",
  "settings.saving": "Salvataggio...",
  "help.title": "Aiuto e Supporto",
  "help.subtitle": "Come possiamo aiutarti oggi?",
  "help.liveChat": "Chat dal Vivo",
  "help.chatDescription": "Chatta con il nostro team di supporto",
  "help.startChat": "Inizia Chat",
  "help.emailSupport": "Supporto Email",
  "help.emailDescription": "Ricevi aiuto via email",
  "help.sendEmail": "Invia Email",
  "help.phoneSupport": "Supporto Telefonico",
  "help.phoneDescription": "Chiamaci direttamente",
  "help.callNow": "Chiama Ora",
  "help.frequentlyAsked": "Domande Frequenti",
  "help.stillQuestions": "Hai ancora domande?",
  "help.supportIntro": "Il nostro team di supporto è qui per aiutarti. Contattaci attraverso uno dei seguenti canali:",
  "help.responseTime": "Inviaci un'email e ti risponderemo entro 24 ore.",
  "help.browseKnowledge": "Sfoglia la nostra knowledge base per guide più dettagliate.",
  "help.visitHelpCenter": "Visita il Centro Assistenza",
  "faq.title": "Domande Frequenti",
  "faq.subtitle": "Trova risposte alle domande comuni su Blocmark. Se non trovi quello che cerchi, contatta il nostro team di supporto.",
  "faq.bookingPayments": "Prenotazioni e Pagamenti",
  "faq.hostingListing": "Hosting e Annunci",
  "faq.howBooking": "Come faccio a fare una prenotazione?",
  "faq.howBookingAnswer": "Per fare una prenotazione, sfoglia le location disponibili, seleziona le date desiderate e clicca sul pulsante 'Prenota Ora'. Segui le istruzioni per completare la prenotazione. Riceverai un'email di conferma una volta che la prenotazione sarà approvata dall'host.",
  "faq.cancellationPolicy": "Qual è la politica di cancellazione?",
  "faq.cancellationAnswer": "Le politiche di cancellazione variano per location. Puoi trovare la politica specifica per ogni location sulla pagina dell'annuncio prima di effettuare una prenotazione. La maggior parte degli host offre opzioni di cancellazione flessibili, moderate o rigide.",
  "faq.contactHost": "Come posso contattare il mio host?",
  "faq.contactHostAnswer": "Una volta confermata la prenotazione, puoi inviare messaggi direttamente al tuo host attraverso il nostro sistema di messaggistica. Clicca su 'Messaggi' nel menu di navigazione per accedere alle tue conversazioni. Ti consigliamo di discutere eventuali requisiti o domande specifiche prima della data di prenotazione.",
  "faq.paymentsWork": "Come funzionano i pagamenti?",
  "faq.paymentsAnswer": "Gestiamo tutti i pagamenti in modo sicuro attraverso la nostra piattaforma. Il tuo pagamento viene trattenuto in sicurezza fino al check-in, garantendo una transazione fluida e protetta per entrambe le parti. Il pagamento viene tipicamente elaborato 24 ore dopo una prenotazione riuscita, e gli host ricevono i fondi entro 1-3 giorni lavorativi.",
  "faq.issuesDuringStay": "Cosa succede se qualcosa va storto durante il mio soggiorno?",
  "faq.issuesAnswer": "Se incontri problemi durante il tuo soggiorno, contatta prima il tuo host attraverso il nostro sistema di messaggistica. Se il problema persiste, il nostro team di supporto è disponibile 24/7 per assisterti. Ci impegniamo a garantirti un'esperienza positiva.",
  "faq.listSpace": "Come posso inserire il mio spazio su Blocmark?",
  "faq.listSpaceAnswer": "Clicca su 'Inserisci il Tuo Spazio' nel menu di navigazione o nel footer per iniziare il processo di inserimento. Dovrai creare un account se non ne hai già uno, quindi segui le istruzioni passo-passo per creare il tuo annuncio. Aggiungi foto di alta qualità, descrizioni dettagliate e imposta prezzi e disponibilità.",
  "faq.typesOfSpaces": "Che tipi di spazi posso inserire?",
  "faq.typesAnswer": "Blocmark accoglie una varietà di spazi tra cui proprietà residenziali, spazi commerciali, studi, magazzini, uffici, location per eventi e altro. Gli spazi unici con carattere o caratteristiche distintive spesso attirano più interesse.",
  "faq.howMuchEarn": "Quanto posso guadagnare con il mio spazio?",
  "faq.earnAnswer": "I guadagni variano in base alla location, tipo di spazio, servizi e disponibilità. Le proprietà residenziali possono guadagnare $500-$2.500 al giorno per riprese cinematografiche, mentre gli spazi commerciali spesso richiedono $1.000-$5.000 al giorno. Imposti tu i tuoi prezzi e puoi modificarli in qualsiasi momento.",
  "faq.protection": "Come Blocmark protegge host e ospiti?",
  "faq.protectionAnswer": "Verifichiamo tutti gli utenti sulla nostra piattaforma e forniamo assicurazione agli host. Gli host possono impostare regole della casa, richiedere depositi cauzionali e comunicare direttamente con gli affittuari. Tutte le prenotazioni sono coperte dai nostri Termini di Servizio e dalla Politica di Protezione Host.",
  "faq.feesCharged": "Quali commissioni applica Blocmark?",
  "faq.feesAnswer": "Blocmark applica una commissione di servizio sia agli host che agli ospiti per ogni prenotazione. Le commissioni per gli host variano tipicamente dal 3-5% del totale della prenotazione, mentre le commissioni per gli ospiti variano dal 5-15% a seconda dell'importo della prenotazione. Queste commissioni coprono i servizi della piattaforma, l'elaborazione dei pagamenti, il supporto clienti e la protezione host.",
  
  // Messages page
  "messages.title": "Messaggi",
  "messages.newMessage": "Nuovo Messaggio",
  "messages.receivedNewMessage": "Hai ricevuto un nuovo messaggio",
  "messages.connectionError": "Errore di Connessione",
  "messages.connectionErrorDesc": "Impossibile stabilire una connessione in tempo reale",
  "messages.selectConversation": "Seleziona una conversazione per iniziare a messaggiare",
  "messages.noMessages": "Ancora nessun messaggio",
  "messages.startConversation": "Inizia una conversazione",
  "messages.send": "Invia",
  "messages.typePlaceholder": "Scrivi un messaggio...",
  "messages.loading": "Caricamento messaggi...",
  "messages.sendError": "Impossibile inviare il messaggio",
  "messages.user": "Utente",
  
  // Trust & Safety page
  "trustSafety.title": "Fiducia e Sicurezza su Blocmark",
  "trustSafety.subtitle": "La tua sicurezza e protezione sono le nostre priorità principali. Scopri i sistemi e i processi che abbiamo implementato per creare una piattaforma affidabile per tutti gli utenti.",
  "trustSafety.ourFeatures": "Le Nostre Funzionalità di Sicurezza",
  "trustSafety.verifiedUsers": "Utenti Verificati",
  "trustSafety.verifiedUsersDesc": "Tutti gli utenti sulla nostra piattaforma sono sottoposti a verifica dell'identità. Verifichiamo numeri di telefono, indirizzi email e, in alcuni casi, documenti d'identità rilasciati dal governo per garantire l'autenticità dei membri della nostra comunità.",
  "trustSafety.securePayments": "Pagamenti Sicuri",
  "trustSafety.securePaymentsDesc": "Tutte le transazioni vengono elaborate attraverso il nostro sistema di pagamento sicuro. Non condividiamo mai le tue informazioni finanziarie con host o ospiti. I pagamenti sono trattenuti in deposito fino al check-in per garantire protezione a entrambe le parti.",
  "trustSafety.insurance": "Assicurazione Completa",
  "trustSafety.insuranceDesc": "La nostra assicurazione di protezione host copre danni alla proprietà fino a $1M. Questo fornisce tranquillità agli host e incoraggia un comportamento responsabile da parte degli ospiti durante le loro prenotazioni.",
  "trustSafety.dataProtection": "Protezione dei Dati",
  "trustSafety.dataProtectionDesc": "Utilizziamo crittografia e misure di sicurezza leader del settore per proteggere i tuoi dati personali. Raccogliamo solo le informazioni necessarie per la funzionalità della piattaforma e non vendiamo mai i tuoi dati a terze parti.",
  "trustSafety.beforeBooking": "Prima di Prenotare",
  "trustSafety.beforeBookingTip1": "Rivedi attentamente i dettagli dello spazio, i servizi e le regole della casa",
  "trustSafety.beforeBookingTip2": "Leggi le recensioni degli ospiti precedenti per comprendere le loro esperienze",
  "trustSafety.beforeBookingTip3": "Comunica con l'host riguardo alle tue esigenze e requisiti specifici",
  "trustSafety.beforeBookingTip4": "Verifica che lo spazio sia adatto alle tue attività previste",
  "trustSafety.beforeBookingTip5": "Conferma le procedure di check-in e i dettagli di accesso prima dell'arrivo",
  "trustSafety.beforeHosting": "Prima di Ospitare",
  "trustSafety.beforeHostingTip1": "Stabilisci regole della casa chiare e comunicale efficacemente",
  "trustSafety.beforeHostingTip2": "Assicurati che il tuo annuncio sia accurato con foto di alta qualità",
  "trustSafety.beforeHostingTip3": "Prepara istruzioni complete per il check-in",
  "trustSafety.beforeHostingTip4": "Metti al sicuro o rimuovi oggetti di valore o personali",
  "trustSafety.beforeHostingTip5": "Prepara un piano di emergenza per problemi inaspettati",
  "trustSafety.reportIssue": "Segnala un Problema",
  "trustSafety.contactSupport": "Contatta il Supporto",
  "trustSafety.emergencyHelp": "Aiuto di Emergenza",
  "trustSafety.needHelp": "Hai Bisogno di Aiuto?",
  "trustSafety.availableSupport": "Il nostro team di supporto è disponibile 24/7 per assistere con qualsiasi problema di sicurezza o difficoltà che potresti incontrare.",
  "trustSafety.safetyTips": "Consigli di Sicurezza",
  "trustSafety.disputeResolution": "Risoluzione delle Controversie",
  "trustSafety.disputeDescription": "Nonostante i nostri migliori sforzi per prevenire problemi, possono occasionalmente sorgere disaccordi. Il nostro team di supporto dedicato è disponibile per aiutare a mediare e risolvere controversie tra host e ospiti.",
  "trustSafety.disputeRecommendation": "Se incontri un problema durante la tua esperienza di prenotazione o hosting, consigliamo:",
  "trustSafety.disputeStep1": "Prima tentare di risolvere il problema direttamente con l'altra parte tramite il nostro sistema di messaggistica",
  "trustSafety.disputeStep2": "Se la comunicazione diretta non risolve il problema, contatta il nostro team di supporto entro 24 ore",
  "trustSafety.disputeStep3": "Fornisci tutti i dettagli e le prove rilevanti per aiutarci a comprendere la situazione",
  "trustSafety.disputeStep4": "Il nostro team esaminerà il caso e lavorerà con entrambe le parti per trovare una risoluzione equa",
  "trustSafety.disputeConclusion": "Nella maggior parte dei casi, le controversie possono essere risolte amichevolmente con comunicazione chiara e aspettative ragionevoli da tutte le parti coinvolte.",
  "trustSafety.emergencySupport": "Supporto di Emergenza",
  "trustSafety.emergencyTitle": "Assistenza di Emergenza 24/7",
  "trustSafety.emergencyDescription": "In caso di emergenze durante una prenotazione, la nostra linea di supporto di emergenza è disponibile 24/7. Questo servizio è riservato a emergenze genuine che richiedono attenzione immediata.",
  "trustSafety.emergencyContact": "Contatto di Emergenza:",
  "trustSafety.emergencyNote": "Nota:",
  "trustSafety.emergencyNoteText": "Per problemi non di emergenza, utilizza i nostri canali di supporto regolari tramite l'app o il sito web.",
  "trustSafety.ctaTitle": "La Tua Sicurezza è la Nostra Priorità",
  "trustSafety.ctaDescription": "Stiamo costantemente migliorando le nostre funzionalità e politiche di sicurezza. Se hai suggerimenti o feedback su come possiamo rendere Blocmark più sicuro, ci piacerebbe sentirti.",
  "trustSafety.contactSupport": "Contatta il Supporto",
  "trustSafety.viewGuidelines": "Visualizza Linee Guida",

  // About page
  "about.title": "Chi Siamo",
  "about.subtitle": "Siamo in missione per trasformare il modo in cui i professionisti creativi scoprono, prenotano e gestiscono spazi unici per i loro progetti.",
  "about.ourStory": "La Nostra Storia",
  "about.foundedDescription": "Fondata nel 2023, Blocmark è nata da una semplice osservazione: trovare e prenotare location uniche per progetti creativi era inutilmente complesso.",
  "about.founderDescription": "Il nostro fondatore, un ex fotografo, ha sperimentato in prima persona le sfide nel trovare location per servizi fotografici. Quello che è iniziato come una soluzione a un problema personale si è evoluto in una piattaforma completa che serve migliaia di creativi e proprietari di spazi in tutto il mondo.",
  "about.missionValues": "La Nostra Missione e Valori",
  "about.empoweringCreativity": "Potenziare la Creatività",
  "about.empoweringCreativityDesc": "Crediamo nel rimuovere le barriere all'espressione creativa rendendo gli spazi eccezionali accessibili a tutti.",
  "about.communityFirst": "Comunità Prima di Tutto",
  "about.communityFirstDesc": "Stiamo costruendo più di una piattaforma—stiamo coltivando una comunità di creativi e proprietari di spazi affini.",
  "about.globalPerspective": "Prospettiva Globale",
  "about.globalPerspectiveDesc": "Celebriamo la diversità e miriamo a mostrare spazi unici da ogni angolo del mondo.",
  "about.whyChoose": "Perché Scegliere Blocmark",
  "about.curatedSelection": "Selezione Curata",
  "about.curatedSelectionDesc": "Ogni location sulla nostra piattaforma soddisfa i nostri elevati standard di qualità, unicità e appeal fotografico.",
  "about.transparentPricing": "Prezzi Trasparenti",
  "about.transparentPricingDesc": "Nessuna commissione nascosta o sorprese. Crediamo in prezzi chiari e trasparenti per un'esperienza di prenotazione senza stress.",
  "about.diverseLocations": "Location Diverse",
  "about.diverseLocationsDesc": "Da magazzini industriali a attico di lusso, offriamo una varietà ineguagliabile di spazi per adattarsi a qualsiasi visione creativa.",
  "about.communityDriven": "Guidata dalla Comunità",
  "about.communityDrivenDesc": "La nostra piattaforma facilita le connessioni tra creativi e proprietari di spazi, promuovendo collaborazione e crescita reciproca.",
  "about.joinTeam": "Unisciti al Nostro Team",
  "about.joinTeamDesc": "Stiamo sempre cercando persone appassionate per aiutarci a costruire il futuro della prenotazione di spazi creativi.",
  "about.viewPositions": "Visualizza Posizioni Aperte",

  // Blog page
  "blog.title": "Blog Blocmark",
  "blog.subtitle": "Intuizioni, consigli e ispirazione per professionisti creativi e proprietari di location.",
  "blog.searchPlaceholder": "Cerca articoli...",
  "blog.all": "Tutti",
  "blog.foundArticles": "Trovati ${count} articoli",
  "blog.foundArticlesSingular": "Trovato ${count} articolo",
  "blog.in": "in",
  "blog.matching": "corrispondenti",
  "blog.featuredArticle": "Articolo in Evidenza",
  "blog.noArticlesFound": "Nessun articolo trovato",
  "blog.noArticlesFoundDesc": "Non siamo riusciti a trovare articoli che corrispondono ai tuoi criteri di ricerca.",
  "blog.clearFilters": "Pulisci filtri",
  "blog.searchResults": "Risultati della Ricerca",
  "blog.latestArticles": "Articoli Recenti",
  "blog.loadMore": "Carica Altri Articoli",
  "blog.readMore": "Leggi di Più",
  "blog.read": "Leggi",
  "blog.subscribeTitle": "Iscriviti alla Nostra Newsletter",
  "blog.subscribeDesc": "Ricevi gli ultimi articoli, risorse e tendenze nella prenotazione di location creative direttamente nella tua casella di posta.",
  "blog.emailPlaceholder": "Il tuo indirizzo email",
  "blog.subscribe": "Iscriviti",

  // Guides page
  "guides.title": "Risorse e Guide",
  "guides.subtitle": "Consigli di esperti e guide complete per aiutarti a sfruttare al meglio la piattaforma Blocmark.",
  "guides.searchPlaceholder": "Cerca guide e risorse...",
  "guides.browseByCategory": "Sfoglia per Categoria",
  "guides.photography": "Fotografia",
  "guides.photographyDesc": "Consigli e tecniche per massimizzare i tuoi servizi fotografici in diverse location.",
  "guides.videography": "Videografia",
  "guides.videographyDesc": "Migliori pratiche per riprese in vari spazi e condizioni di illuminazione.",
  "guides.forHosts": "Per Host",
  "guides.forHostsDesc": "Impara come ottimizzare il tuo annuncio e massimizzare le prenotazioni.",
  "guides.aiTools": "Strumenti AI",
  "guides.aiToolsDesc": "Sfrutta le nostre funzionalità AI per trovare la location perfetta per le tue esigenze.",
  "guides.production": "Produzione",
  "guides.productionDesc": "Guide per la pianificazione ed esecuzione di produzioni per film e spot pubblicitari.",
  "guides.events": "Eventi",
  "guides.eventsDesc": "Pianificare eventi di successo in spazi unici e gestire la logistica.",
  "guides.featuredGuides": "Guide in Evidenza",
  "guides.recentlyAdded": "Aggiunte di Recente",
  "guides.readGuide": "Leggi Guida",
  "guides.needHelp": "Hai Bisogno di Aiuto Personalizzato?",
  "guides.needHelpDesc": "Il nostro team di esperti è pronto a rispondere alle tue domande e fornire consigli personalizzati per le tue esigenze specifiche.",
  "guides.visitFaq": "Visita FAQ",
  "guides.contactSupport": "Contatta il Supporto",

  // Careers page
  "careers.title": "Unisciti al Team Blocmark",
  "careers.subtitle": "Aiutaci a rivoluzionare il modo in cui i professionisti creativi scoprono e prenotano spazi unici per i loro progetti.",
  "careers.whyJoinUs": "Perché Unirti a Noi?",
  "careers.whyJoinUsDesc1": "In Blocmark, stiamo costruendo il futuro della prenotazione di location per l'industria creativa. La nostra piattaforma connette fotografi, registi e organizzatori di eventi con spazi unici che danno vita alle loro visioni.",
  "careers.whyJoinUsDesc2": "Siamo un team di persone appassionate che valorizzano innovazione, collaborazione e impatto. Unisciti a noi per lavorare su problemi sfidanti in un mercato in rapida crescita con portata globale.",
  "careers.viewPositions": "Visualizza Posizioni Aperte",
  "careers.coreValues": "I Nostri Valori Fondamentali",
  "careers.innovation": "Innovazione",
  "careers.innovationDesc": "Abbracciamo la risoluzione creativa dei problemi e non abbiamo paura di provare nuovi approcci.",
  "careers.community": "Comunità",
  "careers.communityDesc": "Costruiamo connessioni significative tra creativi e proprietari di spazi.",
  "careers.discovery": "Scoperta",
  "careers.discoveryDesc": "Celebriamo l'unicità e aiutiamo i nostri utenti a scoprire gemme nascoste.",
  "careers.inclusion": "Inclusione",
  "careers.inclusionDesc": "Valorziamo la diversità di pensiero, background ed esperienza.",
  "careers.benefitsPerks": "Benefici e Vantaggi",
  "careers.competitiveComp": "Compenso Competitivo",
  "careers.competitiveCompDesc": "Pacchetti salariali che riflettono la tua esperienza e contributi.",
  "careers.creativeStipend": "Stipendio Creativo",
  "careers.creativeStipendDesc": "Budget annuale per i tuoi progetti creativi e sviluppo delle competenze.",
  "careers.flexibleWork": "Lavoro Flessibile",
  "careers.flexibleWorkDesc": "Cultura remote-first con orari flessibili per supportare l'equilibrio lavoro-vita.",
  "careers.learningDev": "Apprendimento e Sviluppo",
  "careers.learningDevDesc": "Budget e tempo per corsi, conferenze e crescita professionale.",
  "careers.openPositions": "Posizioni Aperte",
  "careers.new": "Nuovo",
  "careers.applyNow": "Candidati Ora",
  "careers.faqTitle": "Domande Frequenti",
  "careers.dontSeeRightFit": "Non Vedi la Posizione Giusta?",
  "careers.dontSeeRightFitDesc": "Siamo sempre interessati a connetterci con persone di talento. Inviaci il tuo curriculum e dicci perché saresti un'ottima aggiunta al team Blocmark.",
  "careers.contactRecruiting": "Contatta il Team di Reclutamento"
};

export const translations = {
  en: enTranslations,
  it: itTranslations
};

// Default translations
export const defaultTranslations = enTranslations;