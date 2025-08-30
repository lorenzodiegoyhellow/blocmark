--
-- PostgreSQL database dump
--

\restrict SOJDqB1LbfHfW4SOuA4aYzUlfPLAI4Oy8Xmm7OoHMJyBqJmW6cf6wmtChw2phPn

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
-- Name: addons_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.addons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.addons_id_seq OWNER TO neondb_owner;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: addons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.addons (
    id integer DEFAULT nextval('public.addons_id_seq'::regclass) NOT NULL,
    location_id integer NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    price_unit text DEFAULT 'hour'::text NOT NULL,
    active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.addons OWNER TO neondb_owner;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_logs_id_seq OWNER TO neondb_owner;

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_logs (
    id integer DEFAULT nextval('public.admin_logs_id_seq'::regclass) NOT NULL,
    admin_id integer NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id integer NOT NULL,
    details jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_logs OWNER TO neondb_owner;

--
-- Name: booking_addons_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.booking_addons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_addons_id_seq OWNER TO neondb_owner;

--
-- Name: booking_addons; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.booking_addons (
    id integer DEFAULT nextval('public.booking_addons_id_seq'::regclass) NOT NULL,
    booking_id integer NOT NULL,
    addon_id integer NOT NULL
);


ALTER TABLE public.booking_addons OWNER TO neondb_owner;

--
-- Name: booking_edit_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.booking_edit_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.booking_edit_history_id_seq OWNER TO neondb_owner;

--
-- Name: booking_edit_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.booking_edit_history (
    id integer DEFAULT nextval('public.booking_edit_history_id_seq'::regclass) NOT NULL,
    booking_id integer NOT NULL,
    editor_id integer NOT NULL,
    edited_at timestamp without time zone DEFAULT now() NOT NULL,
    previous_data jsonb NOT NULL,
    new_data jsonb NOT NULL,
    reason text,
    notified_client boolean DEFAULT false NOT NULL
);


ALTER TABLE public.booking_edit_history OWNER TO neondb_owner;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.bookings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO neondb_owner;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.bookings (
    id integer DEFAULT nextval('public.bookings_id_seq'::regclass) NOT NULL,
    location_id integer NOT NULL,
    client_id integer NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    total_price integer NOT NULL,
    status text NOT NULL,
    activity_type text,
    project_name text,
    renter_company text,
    project_description text,
    guest_count integer,
    payment_id text,
    refund_amount integer,
    refund_reason text,
    refund_requested_by integer,
    refund_requested_at timestamp without time zone,
    refund_processed_by integer,
    refund_processed_at timestamp without time zone,
    last_edited_by integer,
    last_edited_at timestamp without time zone,
    activity text,
    cast_and_crew text,
    total_amount numeric(10,2),
    payment_status character varying(50),
    special_requests text,
    check_in_date date,
    check_out_date date,
    cancellation_reason text
);


ALTER TABLE public.bookings OWNER TO neondb_owner;

--
-- Name: challenge_entries_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.challenge_entries_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.challenge_entries_id_seq OWNER TO neondb_owner;

--
-- Name: challenge_entries; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.challenge_entries (
    id integer DEFAULT nextval('public.challenge_entries_id_seq'::regclass) NOT NULL,
    challenge_id integer NOT NULL,
    location_id integer NOT NULL,
    user_id integer NOT NULL,
    description text,
    is_winner boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.challenge_entries OWNER TO neondb_owner;

--
-- Name: concierge_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.concierge_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.concierge_requests_id_seq OWNER TO neondb_owner;

--
-- Name: concierge_requests; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.concierge_requests (
    id integer DEFAULT nextval('public.concierge_requests_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    location_type text NOT NULL,
    event_type text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    admin_notes text,
    assigned_to integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    responded_at timestamp without time zone,
    budget integer,
    date_needed text,
    preferred_contact_method text DEFAULT 'email'::text
);


ALTER TABLE public.concierge_requests OWNER TO neondb_owner;

--
-- Name: content_moderation_alerts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.content_moderation_alerts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_moderation_alerts_id_seq OWNER TO neondb_owner;

--
-- Name: content_moderation_alerts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_moderation_alerts (
    id integer DEFAULT nextval('public.content_moderation_alerts_id_seq'::regclass) NOT NULL,
    message_id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    location_id integer NOT NULL,
    violation_type text NOT NULL,
    detected_patterns text[] NOT NULL,
    confidence integer NOT NULL,
    original_content_hash text,
    resolved boolean DEFAULT false NOT NULL,
    resolved_by integer,
    resolved_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.content_moderation_alerts OWNER TO neondb_owner;

--
-- Name: email_campaigns_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_campaigns_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_campaigns_id_seq OWNER TO neondb_owner;

--
-- Name: email_campaigns; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_campaigns (
    id integer DEFAULT nextval('public.email_campaigns_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    template_id integer,
    segment_criteria jsonb,
    status text DEFAULT 'draft'::text NOT NULL,
    scheduled_for timestamp without time zone,
    sent_at timestamp without time zone,
    recipient_count integer DEFAULT 0,
    open_count integer DEFAULT 0,
    click_count integer DEFAULT 0,
    bounce_count integer DEFAULT 0,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_campaigns OWNER TO neondb_owner;

--
-- Name: email_events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_events_id_seq OWNER TO neondb_owner;

--
-- Name: email_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_events (
    id integer DEFAULT nextval('public.email_events_id_seq'::regclass) NOT NULL,
    message_id text NOT NULL,
    user_id integer,
    recipient_email text NOT NULL,
    template_name text,
    subject text,
    status text DEFAULT 'queued'::text NOT NULL,
    metadata jsonb,
    error_message text,
    sent_at timestamp without time zone,
    delivered_at timestamp without time zone,
    opened_at timestamp without time zone,
    clicked_at timestamp without time zone,
    bounced_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_events OWNER TO neondb_owner;

--
-- Name: email_suppression_list_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_suppression_list_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_suppression_list_id_seq OWNER TO neondb_owner;

--
-- Name: email_suppression_list; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_suppression_list (
    id integer DEFAULT nextval('public.email_suppression_list_id_seq'::regclass) NOT NULL,
    email text NOT NULL,
    reason text NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_suppression_list OWNER TO neondb_owner;

--
-- Name: email_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_templates_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_templates_id_seq OWNER TO neondb_owner;

--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_templates (
    id integer DEFAULT nextval('public.email_templates_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    html_content text,
    text_content text,
    variables jsonb DEFAULT '[]'::jsonb,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    type text,
    recipient_role text
);


ALTER TABLE public.email_templates OWNER TO neondb_owner;

--
-- Name: email_verification_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.email_verification_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.email_verification_tokens_id_seq OWNER TO neondb_owner;

--
-- Name: email_verification_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.email_verification_tokens (
    id integer DEFAULT nextval('public.email_verification_tokens_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    verified_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.email_verification_tokens OWNER TO neondb_owner;

--
-- Name: forum_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_categories_id_seq OWNER TO neondb_owner;

--
-- Name: forum_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_categories (
    id integer DEFAULT nextval('public.forum_categories_id_seq'::regclass) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    slug text,
    "order" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.forum_categories OWNER TO neondb_owner;

--
-- Name: forum_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_comments_id_seq OWNER TO neondb_owner;

--
-- Name: forum_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_comments (
    id integer DEFAULT nextval('public.forum_comments_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    post_id integer NOT NULL,
    parent_id integer,
    content text NOT NULL,
    likes integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.forum_comments OWNER TO neondb_owner;

--
-- Name: forum_likes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_likes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_likes_id_seq OWNER TO neondb_owner;

--
-- Name: forum_likes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_likes (
    id integer DEFAULT nextval('public.forum_likes_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    target_type character varying(20) NOT NULL,
    target_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.forum_likes OWNER TO neondb_owner;

--
-- Name: forum_posts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.forum_posts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_posts_id_seq OWNER TO neondb_owner;

--
-- Name: forum_posts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.forum_posts (
    id integer DEFAULT nextval('public.forum_posts_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    category_id integer NOT NULL,
    title character varying(200) NOT NULL,
    content text NOT NULL,
    views integer DEFAULT 0,
    likes integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    is_locked boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.forum_posts OWNER TO neondb_owner;

--
-- Name: guide_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guide_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guide_categories_id_seq OWNER TO neondb_owner;

--
-- Name: guide_categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guide_categories (
    id integer DEFAULT nextval('public.guide_categories_id_seq'::regclass) NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    icon character varying(100),
    order_index integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image text
);


ALTER TABLE public.guide_categories OWNER TO neondb_owner;

--
-- Name: guides_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.guides_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.guides_id_seq OWNER TO neondb_owner;

--
-- Name: guides; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.guides (
    id integer DEFAULT nextval('public.guides_id_seq'::regclass) NOT NULL,
    title character varying(255) NOT NULL,
    slug character varying(255) NOT NULL,
    description text,
    content text NOT NULL,
    cover_image character varying(500),
    category_id integer,
    author character varying(255),
    status character varying(50) DEFAULT 'draft'::character varying,
    featured boolean DEFAULT false,
    view_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    difficulty character varying(20) DEFAULT 'Beginner'::character varying,
    time_to_read integer DEFAULT 5
);


ALTER TABLE public.guides OWNER TO neondb_owner;

--
-- Name: location_calendar_integrations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.location_calendar_integrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_calendar_integrations_id_seq OWNER TO neondb_owner;

--
-- Name: location_calendar_integrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.location_calendar_integrations (
    id integer DEFAULT nextval('public.location_calendar_integrations_id_seq'::regclass) NOT NULL,
    location_id integer NOT NULL,
    google_calendar_id character varying(255),
    google_refresh_token text,
    sync_enabled boolean DEFAULT true,
    last_synced_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    owner_id integer
);


ALTER TABLE public.location_calendar_integrations OWNER TO neondb_owner;

--
-- Name: location_edit_history_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.location_edit_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_edit_history_id_seq OWNER TO neondb_owner;

--
-- Name: location_edit_history; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.location_edit_history (
    id integer DEFAULT nextval('public.location_edit_history_id_seq'::regclass) NOT NULL,
    location_id integer NOT NULL,
    editor_id integer NOT NULL,
    edited_at timestamp without time zone DEFAULT now() NOT NULL,
    changed_fields text[] NOT NULL,
    previous_data jsonb NOT NULL,
    new_data jsonb NOT NULL,
    edit_type text NOT NULL,
    reason text,
    ip_address text
);


ALTER TABLE public.location_edit_history OWNER TO neondb_owner;

--
-- Name: location_folders_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.location_folders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.location_folders_id_seq OWNER TO neondb_owner;

--
-- Name: location_folders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.location_folders (
    id integer DEFAULT nextval('public.location_folders_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    name character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.location_folders OWNER TO neondb_owner;

--
-- Name: locations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.locations_id_seq OWNER TO neondb_owner;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.locations (
    id integer DEFAULT nextval('public.locations_id_seq'::regclass) NOT NULL,
    owner_id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    images text[] DEFAULT ARRAY[]::text[] NOT NULL,
    address text NOT NULL,
    amenities text[] NOT NULL,
    availability jsonb NOT NULL,
    property_type text NOT NULL,
    size integer NOT NULL,
    max_capacity integer NOT NULL,
    incremental_rate integer NOT NULL,
    cancellation_policy text NOT NULL,
    latitude text,
    longitude text,
    instant_booking boolean DEFAULT false NOT NULL,
    min_hours integer DEFAULT 1 NOT NULL,
    category text DEFAULT 'photo-studio'::text NOT NULL,
    image_tags jsonb[] DEFAULT '{}'::jsonb[],
    metadata text,
    status text DEFAULT 'pending'::text,
    status_reason text,
    status_updated_at timestamp without time zone,
    verification_photos text[] DEFAULT '{}'::text[],
    stripe_product_id text,
    stripe_price_id text,
    property_rules text,
    parking_info text,
    check_in_instructions text,
    wifi_info text,
    safety_equipment text,
    accessibility_features text,
    last_updated timestamp without time zone DEFAULT now(),
    price_weekend integer,
    price_event integer,
    price_commercial integer,
    price_multi_day integer,
    allow_smoke_machine boolean DEFAULT false,
    allow_amplified_music boolean DEFAULT false,
    has_truck_access boolean DEFAULT false,
    has_motorhome_parking boolean DEFAULT false,
    parking_spaces integer DEFAULT 0,
    parking_type text DEFAULT 'none'::text,
    ceiling_height integer,
    featured_amenity text,
    neighborhood_info text,
    transportation_info text,
    house_rules text,
    location_highlights text,
    booking_requirements text,
    min_advance_hours integer DEFAULT 24,
    max_advance_days integer DEFAULT 365,
    quiet_hours_start time without time zone,
    quiet_hours_end time without time zone,
    property_features jsonb DEFAULT '[]'::jsonb,
    house_style_subcategory text,
    location_subcategory text,
    ai_description text,
    ai_check_in_instructions text,
    description_language text DEFAULT 'en'::text,
    check_in_language text DEFAULT 'en'::text,
    videos text[],
    photos text[],
    pricing jsonb,
    country text,
    state text,
    city text,
    postal_code text,
    booking_buffer integer DEFAULT 0,
    instant_bookable boolean DEFAULT false,
    check_in_time time without time zone,
    check_out_time time without time zone,
    max_guests integer DEFAULT 1,
    min_stay integer DEFAULT 1,
    max_stay integer,
    status_updated_by integer,
    created_at timestamp without time zone DEFAULT now(),
    prohibited_items text[],
    archived boolean DEFAULT false
);


ALTER TABLE public.locations OWNER TO neondb_owner;

--
-- Name: marketing_subscriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.marketing_subscriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.marketing_subscriptions_id_seq OWNER TO neondb_owner;

--
-- Name: marketing_subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.marketing_subscriptions (
    id integer DEFAULT nextval('public.marketing_subscriptions_id_seq'::regclass) NOT NULL,
    email text NOT NULL,
    user_id integer,
    status text DEFAULT 'active'::text NOT NULL,
    subscribed_at timestamp without time zone DEFAULT now() NOT NULL,
    unsubscribed_at timestamp without time zone,
    source text,
    preferences jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.marketing_subscriptions OWNER TO neondb_owner;

--
-- Name: message_conversations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.message_conversations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.message_conversations_id_seq OWNER TO neondb_owner;

--
-- Name: message_conversations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.message_conversations (
    id integer DEFAULT nextval('public.message_conversations_id_seq'::regclass) NOT NULL,
    participant1_id integer NOT NULL,
    participant2_id integer NOT NULL,
    location_id integer NOT NULL,
    last_message_at timestamp without time zone,
    participant1_unread integer DEFAULT 0 NOT NULL,
    participant2_unread integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.message_conversations OWNER TO neondb_owner;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO neondb_owner;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.messages (
    id integer DEFAULT nextval('public.messages_id_seq'::regclass) NOT NULL,
    conversation_id integer NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    location_id integer NOT NULL,
    message text NOT NULL,
    attachment text,
    is_read boolean DEFAULT false NOT NULL,
    sent_at timestamp without time zone DEFAULT now() NOT NULL,
    custom_offer jsonb,
    quick_reply_type text,
    moderation_status text DEFAULT 'pending'::text,
    moderated_at timestamp without time zone,
    original_message text,
    violation_count integer DEFAULT 0,
    sanitized_message text,
    content text,
    subject character varying(255),
    message_type character varying(50),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    booking_id integer,
    message_thread_id integer,
    is_system_message boolean DEFAULT false,
    read boolean DEFAULT false,
    archived boolean DEFAULT false
);


ALTER TABLE public.messages OWNER TO neondb_owner;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO neondb_owner;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.migrations (
    id integer DEFAULT nextval('public.migrations_id_seq'::regclass) NOT NULL,
    name character varying(255) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.migrations OWNER TO neondb_owner;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id integer DEFAULT nextval('public.notifications_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    type text NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    link text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    related_id integer,
    related_type character varying(50),
    action_url text,
    priority character varying(20),
    notification_type text DEFAULT 'general'::text,
    is_read boolean DEFAULT false,
    expires_at timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: password_reset_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.password_reset_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_id_seq OWNER TO neondb_owner;

--
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.password_reset_tokens (
    id integer DEFAULT nextval('public.password_reset_tokens_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_reset_tokens OWNER TO neondb_owner;

--
-- Name: playing_with_neon; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.playing_with_neon (
    id integer NOT NULL,
    name text NOT NULL,
    value real
);


ALTER TABLE public.playing_with_neon OWNER TO neondb_owner;

--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.playing_with_neon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.playing_with_neon_id_seq OWNER TO neondb_owner;

--
-- Name: playing_with_neon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.playing_with_neon_id_seq OWNED BY public.playing_with_neon.id;


--
-- Name: review_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.review_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.review_requirements_id_seq OWNER TO neondb_owner;

--
-- Name: review_requirements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.review_requirements (
    id integer DEFAULT nextval('public.review_requirements_id_seq'::regclass) NOT NULL,
    booking_id integer NOT NULL,
    client_can_review boolean DEFAULT false NOT NULL,
    host_can_review boolean DEFAULT false NOT NULL,
    client_reviewed boolean DEFAULT false NOT NULL,
    host_reviewed boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    booking_end_date timestamp without time zone NOT NULL
);


ALTER TABLE public.review_requirements OWNER TO neondb_owner;

--
-- Name: reviews_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.reviews_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reviews_id_seq OWNER TO neondb_owner;

--
-- Name: reviews; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.reviews (
    id integer DEFAULT nextval('public.reviews_id_seq'::regclass) NOT NULL,
    location_id integer NOT NULL,
    booking_id integer NOT NULL,
    reviewer_id integer NOT NULL,
    reviewed_user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    reviewer_type text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reviews OWNER TO neondb_owner;

--
-- Name: saved_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.saved_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_locations_id_seq OWNER TO neondb_owner;

--
-- Name: saved_locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.saved_locations (
    id integer DEFAULT nextval('public.saved_locations_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    location_id integer NOT NULL,
    folder_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.saved_locations OWNER TO neondb_owner;

--
-- Name: secret_corners_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.secret_corners_applications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secret_corners_applications_id_seq OWNER TO neondb_owner;

--
-- Name: secret_corners_applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.secret_corners_applications (
    id integer DEFAULT nextval('public.secret_corners_applications_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    instagram_handle text,
    portfolio_url text,
    bio text,
    reason text,
    photography_style text,
    years_experience integer,
    equipment text,
    sample_images text[],
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    reviewed_at timestamp without time zone,
    reviewed_by integer,
    review_notes text
);


ALTER TABLE public.secret_corners_applications OWNER TO neondb_owner;

--
-- Name: secret_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.secret_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secret_locations_id_seq OWNER TO neondb_owner;

--
-- Name: secret_locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.secret_locations (
    id integer DEFAULT nextval('public.secret_locations_id_seq'::regclass) NOT NULL,
    name text NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    description text NOT NULL,
    category text NOT NULL,
    best_time text NOT NULL,
    difficulty text NOT NULL,
    equipment_needed text[],
    images text[] NOT NULL,
    tags text[] NOT NULL,
    submitted_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    tips text[],
    access_info text,
    parking_info text,
    safety_notes text
);


ALTER TABLE public.secret_locations OWNER TO neondb_owner;

--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.site_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO neondb_owner;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.site_settings (
    id integer DEFAULT nextval('public.site_settings_id_seq'::regclass) NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    type text DEFAULT 'string'::text NOT NULL,
    description text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_by integer
);


ALTER TABLE public.site_settings OWNER TO neondb_owner;

--
-- Name: spotlight_locations_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.spotlight_locations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.spotlight_locations_id_seq OWNER TO neondb_owner;

--
-- Name: spotlight_locations; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.spotlight_locations (
    id integer DEFAULT nextval('public.spotlight_locations_id_seq'::regclass) NOT NULL,
    location_id integer NOT NULL,
    title text NOT NULL,
    subtitle text NOT NULL,
    featured_image text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    click_count integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    cta_text text DEFAULT 'View Location'::text,
    badge_text text,
    badge_color text
);


ALTER TABLE public.spotlight_locations OWNER TO neondb_owner;

--
-- Name: support_emails_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.support_emails_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_emails_id_seq OWNER TO neondb_owner;

--
-- Name: support_emails; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.support_emails (
    id integer DEFAULT nextval('public.support_emails_id_seq'::regclass) NOT NULL,
    user_id integer,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    category text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'open'::text NOT NULL,
    priority text DEFAULT 'normal'::text,
    reference_id character varying(10) NOT NULL,
    admin_notes text,
    assigned_to integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone,
    first_response_at timestamp without time zone,
    resolution_summary text,
    user_satisfaction integer
);


ALTER TABLE public.support_emails OWNER TO neondb_owner;

--
-- Name: user_email_preferences_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_email_preferences_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_email_preferences_id_seq OWNER TO neondb_owner;

--
-- Name: user_email_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_email_preferences (
    id integer DEFAULT nextval('public.user_email_preferences_id_seq'::regclass) NOT NULL,
    user_id integer NOT NULL,
    booking_confirmations boolean DEFAULT true NOT NULL,
    booking_reminders boolean DEFAULT true NOT NULL,
    messages boolean DEFAULT true NOT NULL,
    reviews boolean DEFAULT true NOT NULL,
    marketing boolean DEFAULT true NOT NULL,
    newsletter boolean DEFAULT true NOT NULL,
    security_alerts boolean DEFAULT true NOT NULL,
    feature_updates boolean DEFAULT true NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_email_preferences OWNER TO neondb_owner;

--
-- Name: user_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_reports_id_seq OWNER TO neondb_owner;

--
-- Name: user_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_reports (
    id integer DEFAULT nextval('public.user_reports_id_seq'::regclass) NOT NULL,
    reporter_id integer NOT NULL,
    reported_user_id integer NOT NULL,
    reason text NOT NULL,
    description text,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone,
    resolved_by integer,
    admin_notes text
);


ALTER TABLE public.user_reports OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text,
    roles text[] DEFAULT ARRAY['owner'::text, 'client'::text] NOT NULL,
    google_id text,
    facebook_id text,
    apple_id text,
    auth_provider text DEFAULT 'local'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    status_reason text,
    status_updated_at timestamp without time zone,
    status_updated_by integer,
    secret_corners_access text DEFAULT 'not_applied'::text NOT NULL,
    secret_corners_application text,
    secret_corners_applied_at timestamp without time zone,
    secret_corners_approved_at timestamp without time zone,
    secret_corners_approved_by integer,
    secret_corners_rejection_reason text,
    profile_image text,
    bio text,
    location text,
    phone_number text,
    email text,
    phone text,
    terms_accepted boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    secret_corners_subscription_tier text DEFAULT 'none'::text NOT NULL,
    secret_corners_subscription_status text DEFAULT 'inactive'::text NOT NULL,
    secret_corners_subscription_started_at timestamp without time zone,
    secret_corners_subscription_ends_at timestamp without time zone,
    stripe_customer_id text,
    stripe_subscription_id text,
    stripe_connect_account_id text,
    w9_form_url text,
    w9_uploaded_at timestamp without time zone,
    notification_preferences jsonb DEFAULT '{"text": {"messages": true, "marketing": false, "bookingRequests": true}, "email": {"messages": true, "marketing": false, "bookingRequests": true}}'::jsonb,
    total_response_time integer DEFAULT 0,
    response_count integer DEFAULT 0,
    average_response_time integer,
    last_calculated_at timestamp without time zone,
    last_login_ip text,
    last_login_at timestamp without time zone,
    identity_verification_status text DEFAULT 'not_started'::text NOT NULL,
    identity_verification_session_id text,
    identity_verified_at timestamp without time zone,
    identity_verification_method text,
    identity_verification_failure_reason text,
    editor_permissions jsonb DEFAULT '{"blog": false, "logs": false, "users": false, "reports": false, "bookings": false, "analytics": false, "concierge": false, "locations": false, "spotlight": false, "conversations": false, "secretCorners": false}'::jsonb,
    CONSTRAINT users_auth_provider_check CHECK ((auth_provider = ANY (ARRAY['local'::text, 'google'::text, 'facebook'::text, 'apple'::text]))),
    CONSTRAINT users_identity_verification_status_check CHECK ((identity_verification_status = ANY (ARRAY['not_started'::text, 'pending'::text, 'verified'::text, 'failed'::text, 'expired'::text]))),
    CONSTRAINT users_secret_corners_access_check CHECK ((secret_corners_access = ANY (ARRAY['not_applied'::text, 'pending'::text, 'approved'::text, 'rejected'::text]))),
    CONSTRAINT users_secret_corners_subscription_status_check CHECK ((secret_corners_subscription_status = ANY (ARRAY['inactive'::text, 'active'::text, 'cancelled'::text, 'past_due'::text]))),
    CONSTRAINT users_secret_corners_subscription_tier_check CHECK ((secret_corners_subscription_tier = ANY (ARRAY['none'::text, 'wanderer'::text, 'explorer'::text, 'architect'::text]))),
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'banned'::text, 'suspended'::text])))
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: weekly_challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.weekly_challenges_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.weekly_challenges_id_seq OWNER TO neondb_owner;

--
-- Name: weekly_challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.weekly_challenges (
    id integer DEFAULT nextval('public.weekly_challenges_id_seq'::regclass) NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    winner_location_id integer,
    winner_announced_at timestamp without time zone,
    active boolean DEFAULT true
);


ALTER TABLE public.weekly_challenges OWNER TO neondb_owner;

--
-- Name: playing_with_neon id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playing_with_neon ALTER COLUMN id SET DEFAULT nextval('public.playing_with_neon_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


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
-- Data for Name: forum_posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.forum_posts (id, user_id, category_id, title, content, views, likes, is_pinned, is_locked, created_at, updated_at) FROM stdin;
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
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.locations (id, owner_id, title, description, price, images, address, amenities, availability, property_type, size, max_capacity, incremental_rate, cancellation_policy, latitude, longitude, instant_booking, min_hours, category, image_tags, metadata, status, status_reason, status_updated_at, verification_photos, stripe_product_id, stripe_price_id, property_rules, parking_info, check_in_instructions, wifi_info, safety_equipment, accessibility_features, last_updated, price_weekend, price_event, price_commercial, price_multi_day, allow_smoke_machine, allow_amplified_music, has_truck_access, has_motorhome_parking, parking_spaces, parking_type, ceiling_height, featured_amenity, neighborhood_info, transportation_info, house_rules, location_highlights, booking_requirements, min_advance_hours, max_advance_days, quiet_hours_start, quiet_hours_end, property_features, house_style_subcategory, location_subcategory, ai_description, ai_check_in_instructions, description_language, check_in_language, videos, photos, pricing, country, state, city, postal_code, booking_buffer, instant_bookable, check_in_time, check_out_time, max_guests, min_stay, max_stay, status_updated_by, created_at, prohibited_items, archived) FROM stdin;
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
-- Data for Name: weekly_challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.weekly_challenges (id, title, description, start_date, end_date, winner_location_id, winner_announced_at, active) FROM stdin;
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
-- Name: addons addons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.addons
    ADD CONSTRAINT addons_pkey PRIMARY KEY (id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: booking_addons booking_addons_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_addons
    ADD CONSTRAINT booking_addons_pkey PRIMARY KEY (id);


--
-- Name: booking_edit_history booking_edit_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.booking_edit_history
    ADD CONSTRAINT booking_edit_history_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: challenge_entries challenge_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenge_entries
    ADD CONSTRAINT challenge_entries_pkey PRIMARY KEY (id);


--
-- Name: concierge_requests concierge_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.concierge_requests
    ADD CONSTRAINT concierge_requests_pkey PRIMARY KEY (id);


--
-- Name: content_moderation_alerts content_moderation_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_moderation_alerts
    ADD CONSTRAINT content_moderation_alerts_pkey PRIMARY KEY (id);


--
-- Name: email_campaigns email_campaigns_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_campaigns
    ADD CONSTRAINT email_campaigns_pkey PRIMARY KEY (id);


--
-- Name: email_events email_events_message_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_events
    ADD CONSTRAINT email_events_message_id_key UNIQUE (message_id);


--
-- Name: email_events email_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_events
    ADD CONSTRAINT email_events_pkey PRIMARY KEY (id);


--
-- Name: email_suppression_list email_suppression_list_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_suppression_list
    ADD CONSTRAINT email_suppression_list_email_key UNIQUE (email);


--
-- Name: email_suppression_list email_suppression_list_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_suppression_list
    ADD CONSTRAINT email_suppression_list_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_name_key UNIQUE (name);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_pkey PRIMARY KEY (id);


--
-- Name: email_verification_tokens email_verification_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.email_verification_tokens
    ADD CONSTRAINT email_verification_tokens_token_key UNIQUE (token);


--
-- Name: forum_categories forum_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_categories
    ADD CONSTRAINT forum_categories_pkey PRIMARY KEY (id);


--
-- Name: forum_categories forum_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_categories
    ADD CONSTRAINT forum_categories_slug_key UNIQUE (slug);


--
-- Name: forum_comments forum_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_pkey PRIMARY KEY (id);


--
-- Name: forum_likes forum_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_likes
    ADD CONSTRAINT forum_likes_pkey PRIMARY KEY (id);


--
-- Name: forum_likes forum_likes_user_id_target_type_target_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_likes
    ADD CONSTRAINT forum_likes_user_id_target_type_target_id_key UNIQUE (user_id, target_type, target_id);


--
-- Name: forum_posts forum_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_pkey PRIMARY KEY (id);


--
-- Name: guide_categories guide_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guide_categories
    ADD CONSTRAINT guide_categories_pkey PRIMARY KEY (id);


--
-- Name: guide_categories guide_categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guide_categories
    ADD CONSTRAINT guide_categories_slug_key UNIQUE (slug);


--
-- Name: guides guides_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guides
    ADD CONSTRAINT guides_pkey PRIMARY KEY (id);


--
-- Name: guides guides_slug_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guides
    ADD CONSTRAINT guides_slug_key UNIQUE (slug);


--
-- Name: location_calendar_integrations location_calendar_integrations_location_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_calendar_integrations
    ADD CONSTRAINT location_calendar_integrations_location_id_key UNIQUE (location_id);


--
-- Name: location_calendar_integrations location_calendar_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_calendar_integrations
    ADD CONSTRAINT location_calendar_integrations_pkey PRIMARY KEY (id);


--
-- Name: location_edit_history location_edit_history_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_edit_history
    ADD CONSTRAINT location_edit_history_pkey PRIMARY KEY (id);


--
-- Name: location_folders location_folders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_folders
    ADD CONSTRAINT location_folders_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: marketing_subscriptions marketing_subscriptions_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_subscriptions
    ADD CONSTRAINT marketing_subscriptions_email_key UNIQUE (email);


--
-- Name: marketing_subscriptions marketing_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.marketing_subscriptions
    ADD CONSTRAINT marketing_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: message_conversations message_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.message_conversations
    ADD CONSTRAINT message_conversations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id);


--
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- Name: playing_with_neon playing_with_neon_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.playing_with_neon
    ADD CONSTRAINT playing_with_neon_pkey PRIMARY KEY (id);


--
-- Name: review_requirements review_requirements_booking_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.review_requirements
    ADD CONSTRAINT review_requirements_booking_id_key UNIQUE (booking_id);


--
-- Name: review_requirements review_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.review_requirements
    ADD CONSTRAINT review_requirements_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


--
-- Name: saved_locations saved_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_locations
    ADD CONSTRAINT saved_locations_pkey PRIMARY KEY (id);


--
-- Name: secret_corners_applications secret_corners_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secret_corners_applications
    ADD CONSTRAINT secret_corners_applications_pkey PRIMARY KEY (id);


--
-- Name: secret_locations secret_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secret_locations
    ADD CONSTRAINT secret_locations_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: site_settings site_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_key UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: spotlight_locations spotlight_locations_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.spotlight_locations
    ADD CONSTRAINT spotlight_locations_pkey PRIMARY KEY (id);


--
-- Name: support_emails support_emails_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_emails
    ADD CONSTRAINT support_emails_pkey PRIMARY KEY (id);


--
-- Name: support_emails support_emails_reference_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.support_emails
    ADD CONSTRAINT support_emails_reference_id_key UNIQUE (reference_id);


--
-- Name: user_email_preferences user_email_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_email_preferences
    ADD CONSTRAINT user_email_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_email_preferences user_email_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_email_preferences
    ADD CONSTRAINT user_email_preferences_user_id_key UNIQUE (user_id);


--
-- Name: user_reports user_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_reports
    ADD CONSTRAINT user_reports_pkey PRIMARY KEY (id);


--
-- Name: users users_apple_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_apple_id_key UNIQUE (apple_id);


--
-- Name: users users_facebook_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_facebook_id_key UNIQUE (facebook_id);


--
-- Name: users users_google_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_google_id_key UNIQUE (google_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: weekly_challenges weekly_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.weekly_challenges
    ADD CONSTRAINT weekly_challenges_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: idx_email_campaigns_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_campaigns_status ON public.email_campaigns USING btree (status);


--
-- Name: idx_email_events_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_events_created_at ON public.email_events USING btree (created_at);


--
-- Name: idx_email_events_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_events_status ON public.email_events USING btree (status);


--
-- Name: idx_email_events_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_events_user_id ON public.email_events USING btree (user_id);


--
-- Name: idx_email_verification_tokens_expires_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_verification_tokens_expires_at ON public.email_verification_tokens USING btree (expires_at);


--
-- Name: idx_email_verification_tokens_token; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_email_verification_tokens_token ON public.email_verification_tokens USING btree (token);


--
-- Name: idx_forum_comments_post_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_forum_comments_post_id ON public.forum_comments USING btree (post_id);


--
-- Name: idx_forum_comments_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_forum_comments_user_id ON public.forum_comments USING btree (user_id);


--
-- Name: idx_forum_likes_user_target; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_forum_likes_user_target ON public.forum_likes USING btree (user_id, target_type, target_id);


--
-- Name: idx_forum_posts_category_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_forum_posts_category_id ON public.forum_posts USING btree (category_id);


--
-- Name: idx_forum_posts_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_forum_posts_user_id ON public.forum_posts USING btree (user_id);


--
-- Name: idx_guide_categories_slug; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_guide_categories_slug ON public.guide_categories USING btree (slug);


--
-- Name: idx_guides_category_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_guides_category_id ON public.guides USING btree (category_id);


--
-- Name: idx_guides_featured; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_guides_featured ON public.guides USING btree (featured);


--
-- Name: idx_guides_slug; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_guides_slug ON public.guides USING btree (slug);


--
-- Name: idx_guides_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_guides_status ON public.guides USING btree (status);


--
-- Name: idx_marketing_subscriptions_email; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_marketing_subscriptions_email ON public.marketing_subscriptions USING btree (email);


--
-- Name: idx_marketing_subscriptions_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_marketing_subscriptions_status ON public.marketing_subscriptions USING btree (status);


--
-- Name: idx_password_reset_tokens_expires_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_password_reset_tokens_expires_at ON public.password_reset_tokens USING btree (expires_at);


--
-- Name: idx_password_reset_tokens_token; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- Name: idx_users_apple_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_apple_id ON public.users USING btree (apple_id);


--
-- Name: idx_users_created_at; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_created_at ON public.users USING btree (created_at);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_facebook_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_facebook_id ON public.users USING btree (facebook_id);


--
-- Name: idx_users_google_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_google_id ON public.users USING btree (google_id);


--
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: challenge_entries challenge_entries_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.challenge_entries
    ADD CONSTRAINT challenge_entries_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.weekly_challenges(id);


--
-- Name: forum_comments forum_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.forum_comments(id);


--
-- Name: forum_comments forum_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.forum_posts(id);


--
-- Name: forum_comments forum_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_comments
    ADD CONSTRAINT forum_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: forum_likes forum_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_likes
    ADD CONSTRAINT forum_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: forum_posts forum_posts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.forum_categories(id);


--
-- Name: forum_posts forum_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.forum_posts
    ADD CONSTRAINT forum_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: guides guides_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.guides
    ADD CONSTRAINT guides_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.guide_categories(id);


--
-- Name: location_calendar_integrations location_calendar_integrations_location_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_calendar_integrations
    ADD CONSTRAINT location_calendar_integrations_location_id_fkey FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: location_folders location_folders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.location_folders
    ADD CONSTRAINT location_folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: locations locations_status_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_status_updated_by_fkey FOREIGN KEY (status_updated_by) REFERENCES public.users(id);


--
-- Name: saved_locations saved_locations_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.saved_locations
    ADD CONSTRAINT saved_locations_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.location_folders(id);


--
-- Name: secret_corners_applications secret_corners_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.secret_corners_applications
    ADD CONSTRAINT secret_corners_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict SOJDqB1LbfHfW4SOuA4aYzUlfPLAI4Oy8Xmm7OoHMJyBqJmW6cf6wmtChw2phPn

