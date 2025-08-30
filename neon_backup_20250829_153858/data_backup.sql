--
-- PostgreSQL database dump
--

\restrict cBFwS5Q7erJ9ZImEZthKizJnEKtrUVugrMjb8dfJJxGT7f6aeei85tMxD1bD8kI

-- Dumped from database version 17.5 (1b53132)
-- Dumped by pg_dump version 17.6 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: addons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.addons (id, location_id, name, description, price, price_unit, active) FROM stdin;
\.


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_logs (id, admin_id, action, target_type, target_id, details, created_at) FROM stdin;
\.


--
-- Data for Name: booking_addons; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.booking_addons (id, booking_id, addon_id) FROM stdin;
\.


--
-- Data for Name: booking_edit_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.booking_edit_history (id, booking_id, editor_id, edited_at, previous_data, new_data, reason, notified_client) FROM stdin;
\.


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.bookings (id, location_id, client_id, start_date, end_date, total_price, status, activity_type, project_name, renter_company, project_description, guest_count, payment_id, refund_amount, refund_reason, refund_requested_by, refund_requested_at, refund_processed_by, refund_processed_at, last_edited_by, last_edited_at, activity, cast_and_crew, total_amount, payment_status, special_requests, check_in_date, check_out_date, cancellation_reason) FROM stdin;
\.


--
-- Data for Name: weekly_challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.weekly_challenges (id, title, description, start_date, end_date, winner_location_id, winner_announced_at, active) FROM stdin;
\.


--
-- Data for Name: challenge_entries; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.challenge_entries (id, challenge_id, location_id, user_id, description, is_winner, created_at) FROM stdin;
\.


--
-- Data for Name: concierge_requests; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.concierge_requests (id, name, email, phone, location_type, event_type, description, status, admin_notes, assigned_to, created_at, updated_at, responded_at, budget, date_needed, preferred_contact_method) FROM stdin;
\.


--
-- Data for Name: content_moderation_alerts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.content_moderation_alerts (id, message_id, sender_id, receiver_id, location_id, violation_type, detected_patterns, confidence, original_content_hash, resolved, resolved_by, resolved_at, created_at) FROM stdin;
\.


--
-- Data for Name: email_campaigns; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_campaigns (id, name, subject, template_id, segment_criteria, status, scheduled_for, sent_at, recipient_count, open_count, click_count, bounce_count, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: email_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_events (id, message_id, user_id, recipient_email, template_name, subject, status, metadata, error_message, sent_at, delivered_at, opened_at, clicked_at, bounced_at, created_at) FROM stdin;
\.


--
-- Data for Name: email_suppression_list; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_suppression_list (id, email, reason, metadata, created_at) FROM stdin;
\.


--
-- Data for Name: email_templates; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_templates (id, name, subject, html_content, text_content, variables, active, created_at, updated_at, type, recipient_role) FROM stdin;
\.


--
-- Data for Name: email_verification_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.email_verification_tokens (id, user_id, email, token, expires_at, verified_at, created_at) FROM stdin;
\.


--
-- Data for Name: forum_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_categories (id, name, description, created_at, updated_at, slug, "order") FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, roles, google_id, facebook_id, apple_id, auth_provider, status, status_reason, status_updated_at, status_updated_by, secret_corners_access, secret_corners_application, secret_corners_applied_at, secret_corners_approved_at, secret_corners_approved_by, secret_corners_rejection_reason, profile_image, bio, location, phone_number, email, phone, terms_accepted, created_at, secret_corners_subscription_tier, secret_corners_subscription_status, secret_corners_subscription_started_at, secret_corners_subscription_ends_at, stripe_customer_id, stripe_subscription_id, stripe_connect_account_id, w9_form_url, w9_uploaded_at, notification_preferences, total_response_time, response_count, average_response_time, last_calculated_at, last_login_ip, last_login_at, identity_verification_status, identity_verification_session_id, identity_verified_at, identity_verification_method, identity_verification_failure_reason, editor_permissions) FROM stdin;
1	porcodio	35bb29547f77a61100612f5d8cc2eb9478feac6b024e3d90f1c6a3e313fa18ba9050f0d2beee71e6bbc945e2c54f694503f5c27b668e13e031938e2d7c319512.33b9f958e27a038538ad59db4b8cdb3a	{owner,client}	\N	\N	\N	local	active	\N	\N	\N	not_applied	\N	\N	\N	\N	\N	\N	\N	\N	333444555666	porca@madonna.com	\N	t	2025-08-28 06:21:29.402195	none	inactive	\N	\N	\N	\N	\N	\N	\N	{"text": {"messages": true, "marketing": false, "bookingRequests": true}, "email": {"messages": true, "marketing": false, "bookingRequests": true}}	0	0	\N	\N	\N	\N	not_started	\N	\N	\N	\N	{"blog": false, "logs": false, "users": false, "reports": false, "bookings": false, "analytics": false, "concierge": false, "locations": false, "spotlight": false, "conversations": false, "secretCorners": false}
2	testtest1	c215b653943346aa5b79d437f7b0972ae1b0a364ff5d7e5a8bbd7b48d3a84640d13fc54087417c2c41430981a9c079b6bff978781192e0f8667bb29dee5bd53f.105d27b4dbd6a8fa2421be66eef2c1b2	{owner,client}	\N	\N	\N	local	active	\N	\N	\N	not_applied	\N	\N	\N	\N	\N	\N	\N	\N	22233343234	allora@gmaio.com	\N	t	2025-08-28 06:23:21.209614	none	inactive	\N	\N	\N	\N	\N	\N	\N	{"text": {"messages": true, "marketing": false, "bookingRequests": true}, "email": {"messages": true, "marketing": false, "bookingRequests": true}}	0	0	\N	\N	\N	\N	not_started	\N	\N	\N	\N	{"blog": false, "logs": false, "users": false, "reports": false, "bookings": false, "analytics": false, "concierge": false, "locations": false, "spotlight": false, "conversations": false, "secretCorners": false}
3	provinaprova	7e0aaf02b94e6463685a31c43bf9b250bb7066bbb6290ff0864c86ffd7cb76c056b6af93597510dacf7b4ca92320b4cacdfcc05ac589df0544828e3ac42e0b8e.33a9cab075131cadc0cb3b1d82c06f4a	{owner,client}	\N	\N	\N	local	active	\N	\N	\N	not_applied	\N	\N	\N	\N	\N	\N	\N	\N	2223334343	iononcapisco@gmaii.com	\N	t	2025-08-28 06:33:02.30368	none	inactive	\N	\N	\N	\N	\N	\N	\N	{"text": {"messages": true, "marketing": false, "bookingRequests": true}, "email": {"messages": true, "marketing": false, "bookingRequests": true}}	0	0	\N	\N	\N	\N	not_started	\N	\N	\N	\N	{"blog": false, "logs": false, "users": false, "reports": false, "bookings": false, "analytics": false, "concierge": false, "locations": false, "spotlight": false, "conversations": false, "secretCorners": false}
4	experimenter	e5948f3d433c868761056c437286219fcd124455edaf131b4ec87fca0562d669a87fa5dc9e1d830b3b1b0bfc1690adbe0dbc9334ebe2f12de9b9581ebe464709.288d03a8118f51ca17fcb7a888880ae0	{owner,client}	\N	\N	\N	local	active	\N	\N	\N	not_applied	\N	\N	\N	\N	\N	\N	\N	\N	232-200-2000	esperinemtno@1.com	\N	t	2025-08-28 06:35:35.121943	none	inactive	\N	\N	\N	\N	\N	\N	\N	{"text": {"messages": true, "marketing": false, "bookingRequests": true}, "email": {"messages": true, "marketing": false, "bookingRequests": true}}	0	0	\N	\N	\N	\N	not_started	\N	\N	\N	\N	{"blog": false, "logs": false, "users": false, "reports": false, "bookings": false, "analytics": false, "concierge": false, "locations": false, "spotlight": false, "conversations": false, "secretCorners": false}
6	famounaltraprova	7476bb814939f3ba1756eb11cc11b4ccae9bd9b045a3fbd16724db670714c8752070748eed5c1c1429bf2b2674822105a547cf77d51f777b7bfd1f8499ea5f85.35307ba5daafeee9836d82c38c4b126d	{owner,client}	\N	\N	\N	local	active	\N	\N	\N	not_applied	\N	\N	\N	\N	\N	\N	\N	\N	23344344324	provaprvoina@gmsail.com	\N	t	2025-08-28 06:53:18.471522	none	inactive	\N	\N	\N	\N	\N	\N	\N	{"text": {"messages": true, "marketing": false, "bookingRequests": true}, "email": {"messages": true, "marketing": false, "bookingRequests": true}}	0	0	\N	\N	\N	\N	not_started	\N	\N	\N	\N	{"blog": false, "logs": false, "users": false, "reports": false, "bookings": false, "analytics": false, "concierge": false, "locations": false, "spotlight": false, "conversations": false, "secretCorners": false}
5	pizzapizza	f9e1c3c7b3e29846bcf02585ffe39b9187a6144c69cc0911148e8e6f52d85551d48a15b1f92716b7a875778baa5d298992a5cbd3a89b6cde833534774557781b.ef5c252b8843e8e5db372853d4c9d3ba	{owner,client}	\N	\N	\N	local	active	\N	\N	\N	not_applied	\N	\N	\N	\N	\N	\N	\N	\N	322-939-3993	pizza@pizza.com	\N	t	2025-08-28 06:38:45.429479	none	inactive	\N	\N	\N	\N	\N	\N	\N	{"text": {"messages": true, "marketing": false, "bookingRequests": true}, "email": {"messages": true, "marketing": false, "bookingRequests": true}}	0	0	\N	\N	76.32.1.108	2025-08-29 21:38:30.894	not_started	\N	\N	\N	\N	{"blog": false, "logs": false, "users": false, "reports": false, "bookings": false, "analytics": false, "concierge": false, "locations": false, "spotlight": false, "conversations": false, "secretCorners": false}
\.


--
-- Data for Name: forum_posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_posts (id, user_id, category_id, title, content, views, likes, is_pinned, is_locked, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: forum_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_comments (id, user_id, post_id, parent_id, content, likes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: forum_likes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_likes (id, user_id, target_type, target_id, created_at) FROM stdin;
\.


--
-- Data for Name: guide_categories; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guide_categories (id, title, slug, description, icon, order_index, created_at, updated_at, image) FROM stdin;
\.


--
-- Data for Name: guides; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.guides (id, title, slug, description, content, cover_image, category_id, author, status, featured, view_count, created_at, updated_at, difficulty, time_to_read) FROM stdin;
\.


--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.locations (id, owner_id, title, description, price, images, address, amenities, availability, property_type, size, max_capacity, incremental_rate, cancellation_policy, latitude, longitude, instant_booking, min_hours, category, image_tags, metadata, status, status_reason, status_updated_at, verification_photos, stripe_product_id, stripe_price_id, property_rules, parking_info, check_in_instructions, wifi_info, safety_equipment, accessibility_features, last_updated, price_weekend, price_event, price_commercial, price_multi_day, allow_smoke_machine, allow_amplified_music, has_truck_access, has_motorhome_parking, parking_spaces, parking_type, ceiling_height, featured_amenity, neighborhood_info, transportation_info, house_rules, location_highlights, booking_requirements, min_advance_hours, max_advance_days, quiet_hours_start, quiet_hours_end, property_features, house_style_subcategory, location_subcategory, ai_description, ai_check_in_instructions, description_language, check_in_language, videos, photos, pricing, country, state, city, postal_code, booking_buffer, instant_bookable, check_in_time, check_out_time, max_guests, min_stay, max_stay, status_updated_by, created_at, prohibited_items, archived) FROM stdin;
\.


--
-- Data for Name: location_calendar_integrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.location_calendar_integrations (id, location_id, google_calendar_id, google_refresh_token, sync_enabled, last_synced_at, created_at, updated_at, owner_id) FROM stdin;
\.


--
-- Data for Name: location_edit_history; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.location_edit_history (id, location_id, editor_id, edited_at, changed_fields, previous_data, new_data, edit_type, reason, ip_address) FROM stdin;
\.


--
-- Data for Name: location_folders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.location_folders (id, user_id, name, created_at) FROM stdin;
\.


--
-- Data for Name: marketing_subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.marketing_subscriptions (id, email, user_id, status, subscribed_at, unsubscribed_at, source, preferences) FROM stdin;
\.


--
-- Data for Name: message_conversations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.message_conversations (id, participant1_id, participant2_id, location_id, last_message_at, participant1_unread, participant2_unread) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.messages (id, conversation_id, sender_id, receiver_id, location_id, message, attachment, is_read, sent_at, custom_offer, quick_reply_type, moderation_status, moderated_at, original_message, violation_count, sanitized_message, content, subject, message_type, created_at, updated_at, booking_id, message_thread_id, is_system_message, read, archived) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.migrations (id, name, executed_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, type, title, message, read, link, created_at, related_id, related_type, action_url, priority, notification_type, is_read, expires_at) FROM stdin;
\.


--
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.password_reset_tokens (id, user_id, token, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: playing_with_neon; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.playing_with_neon (id, name, value) FROM stdin;
1	c4ca4238a0	0.09612504
2	c81e728d9d	0.99102277
3	eccbc87e4b	0.15899193
4	a87ff679a2	0.18832704
5	e4da3b7fbb	0.12408772
6	1679091c5a	0.8187877
7	8f14e45fce	0.13583332
8	c9f0f895fb	0.096824065
9	45c48cce2e	0.34380364
10	d3d9446802	0.7012745
11	c4ca4238a0	0.6141254
12	c81e728d9d	0.5867142
13	eccbc87e4b	0.13617566
14	a87ff679a2	0.030140087
15	e4da3b7fbb	0.16423541
16	1679091c5a	0.44725975
17	8f14e45fce	0.86940986
18	c9f0f895fb	0.92927366
19	45c48cce2e	0.5326026
20	d3d9446802	0.96006685
21	c4ca4238a0	0.3557893
22	c81e728d9d	0.5164239
23	eccbc87e4b	0.041336317
24	a87ff679a2	0.9581314
25	e4da3b7fbb	0.403248
26	1679091c5a	0.96068287
27	8f14e45fce	0.7431618
28	c9f0f895fb	0.83943367
29	45c48cce2e	0.96475255
30	d3d9446802	0.73981655
\.


--
-- Data for Name: review_requirements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.review_requirements (id, booking_id, client_can_review, host_can_review, client_reviewed, host_reviewed, created_at, booking_end_date) FROM stdin;
\.


--
-- Data for Name: reviews; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.reviews (id, location_id, booking_id, reviewer_id, reviewed_user_id, rating, comment, reviewer_type, created_at) FROM stdin;
\.


--
-- Data for Name: saved_locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.saved_locations (id, user_id, location_id, folder_id, created_at) FROM stdin;
\.


--
-- Data for Name: secret_corners_applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.secret_corners_applications (id, user_id, status, instagram_handle, portfolio_url, bio, reason, photography_style, years_experience, equipment, sample_images, created_at, reviewed_at, reviewed_by, review_notes) FROM stdin;
\.


--
-- Data for Name: secret_locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.secret_locations (id, name, latitude, longitude, description, category, best_time, difficulty, equipment_needed, images, tags, submitted_by, created_at, is_featured, tips, access_info, parking_info, safety_notes) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
TSz_mnfYbg7q6hs3EKY_ls19V3tan5Xu	{"cookie":{"originalMaxAge":86400000,"expires":"2025-08-30T21:38:30.908Z","secure":true,"httpOnly":true,"path":"/"},"passport":{"user":5}}	2025-08-30 22:38:27
\.


--
-- Data for Name: site_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.site_settings (id, key, value, type, description, updated_at, updated_by) FROM stdin;
\.


--
-- Data for Name: spotlight_locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.spotlight_locations (id, location_id, title, subtitle, featured_image, start_date, end_date, active, click_count, created_at, cta_text, badge_text, badge_color) FROM stdin;
\.


--
-- Data for Name: support_emails; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.support_emails (id, user_id, name, email, subject, category, message, status, priority, reference_id, admin_notes, assigned_to, created_at, updated_at, resolved_at, first_response_at, resolution_summary, user_satisfaction) FROM stdin;
\.


--
-- Data for Name: user_email_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_email_preferences (id, user_id, booking_confirmations, booking_reminders, messages, reviews, marketing, newsletter, security_alerts, feature_updates, updated_at) FROM stdin;
\.


--
-- Data for Name: user_reports; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_reports (id, reporter_id, reported_user_id, reason, description, status, created_at, resolved_at, resolved_by, admin_notes) FROM stdin;
\.


--
-- Name: addons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.addons_id_seq', 1, false);


--
-- Name: admin_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_logs_id_seq', 1, false);


--
-- Name: booking_addons_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.booking_addons_id_seq', 1, false);


--
-- Name: booking_edit_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.booking_edit_history_id_seq', 1, false);


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.bookings_id_seq', 1, false);


--
-- Name: challenge_entries_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.challenge_entries_id_seq', 1, false);


--
-- Name: concierge_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.concierge_requests_id_seq', 1, false);


--
-- Name: content_moderation_alerts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.content_moderation_alerts_id_seq', 1, false);


--
-- Name: email_campaigns_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_campaigns_id_seq', 1, false);


--
-- Name: email_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_events_id_seq', 1, false);


--
-- Name: email_suppression_list_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_suppression_list_id_seq', 1, false);


--
-- Name: email_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_templates_id_seq', 1, false);


--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.email_verification_tokens_id_seq', 1, false);


--
-- Name: forum_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_categories_id_seq', 1, false);


--
-- Name: forum_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_comments_id_seq', 1, false);


--
-- Name: forum_likes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_likes_id_seq', 1, false);


--
-- Name: forum_posts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.forum_posts_id_seq', 1, false);


--
-- Name: guide_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guide_categories_id_seq', 1, false);


--
-- Name: guides_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.guides_id_seq', 1, false);


--
-- Name: location_calendar_integrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.location_calendar_integrations_id_seq', 1, false);


--
-- Name: location_edit_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.location_edit_history_id_seq', 1, false);


--
-- Name: location_folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.location_folders_id_seq', 1, false);


--
-- Name: locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.locations_id_seq', 1, false);


--
-- Name: marketing_subscriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.marketing_subscriptions_id_seq', 1, false);


--
-- Name: message_conversations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.message_conversations_id_seq', 1, false);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.messages_id_seq', 1, false);


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.migrations_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.password_reset_tokens_id_seq', 1, false);


--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.playing_with_neon_id_seq', 30, true);


--
-- Name: review_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.review_requirements_id_seq', 1, false);


--
-- Name: reviews_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.reviews_id_seq', 1, false);


--
-- Name: saved_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.saved_locations_id_seq', 1, false);


--
-- Name: secret_corners_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.secret_corners_applications_id_seq', 1, false);


--
-- Name: secret_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.secret_locations_id_seq', 1, false);


--
-- Name: site_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.site_settings_id_seq', 1, false);


--
-- Name: spotlight_locations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.spotlight_locations_id_seq', 1, false);


--
-- Name: support_emails_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.support_emails_id_seq', 1, false);


--
-- Name: user_email_preferences_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_email_preferences_id_seq', 1, false);


--
-- Name: user_reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_reports_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 6, true);


--
-- Name: weekly_challenges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.weekly_challenges_id_seq', 1, false);


--
-- PostgreSQL database dump complete
--

\unrestrict cBFwS5Q7erJ9ZImEZthKizJnEKtrUVugrMjb8dfJJxGT7f6aeei85tMxD1bD8kI

