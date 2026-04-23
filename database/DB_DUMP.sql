--
-- PostgreSQL database dump
--

\restrict YGGs94lA66iG2dJLstPwzrrIDtcBkY2qa01nnUSHGHrFr8LQvahd0G2EU1bF2ab

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

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
-- Name: advert_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.advert_status AS ENUM (
    'draft',
    'moderation',
    'declined',
    'published',
    'archived'
);


ALTER TYPE public.advert_status OWNER TO postgres;

--
-- Name: service_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.service_type AS ENUM (
    'VIP',
    'TOP'
);


ALTER TYPE public.service_type OWNER TO postgres;

--
-- Name: user_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role AS ENUM (
    'user',
    'moderator'
);


ALTER TYPE public.user_role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: advantage_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.advantage_services (
    id integer NOT NULL,
    advert_id integer,
    type public.service_type NOT NULL,
    activated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone NOT NULL
);


ALTER TABLE public.advantage_services OWNER TO postgres;

--
-- Name: advantage_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.advantage_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.advantage_services_id_seq OWNER TO postgres;

--
-- Name: advantage_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.advantage_services_id_seq OWNED BY public.advantage_services.id;


--
-- Name: adverts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.adverts (
    id integer NOT NULL,
    status public.advert_status DEFAULT 'draft'::public.advert_status,
    title character varying(200) NOT NULL,
    text text NOT NULL,
    price numeric(12,2) NOT NULL,
    category_id integer,
    user_id integer,
    photos jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.adverts OWNER TO postgres;

--
-- Name: adverts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.adverts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adverts_id_seq OWNER TO postgres;

--
-- Name: adverts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.adverts_id_seq OWNED BY public.adverts.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(100),
    phone character varying(20) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.views (
    advert_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.views OWNER TO postgres;

--
-- Name: advantage_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advantage_services ALTER COLUMN id SET DEFAULT nextval('public.advantage_services_id_seq'::regclass);


--
-- Name: adverts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adverts ALTER COLUMN id SET DEFAULT nextval('public.adverts_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: advantage_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.advantage_services (id, advert_id, type, activated_at, expires_at) FROM stdin;
\.


--
-- Data for Name: adverts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.adverts (id, status, title, text, price, category_id, user_id, photos, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name) FROM stdin;
1	LEGO sets
2	Board games
3	Books
4	Souvenirs
5	Video games
6	Toys
7	Collectibles
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, phone, email, password, role, created_at, updated_at) FROM stdin;
1	ansar	87784845135	ansargabit@gmail.com	ansGAB2009.	user	2026-04-17 16:24:54.247666+05	2026-04-17 16:24:54.247666+05
\.


--
-- Data for Name: views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.views (advert_id, user_id, created_at, updated_at) FROM stdin;
\.


--
-- Name: advantage_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.advantage_services_id_seq', 1, false);


--
-- Name: adverts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.adverts_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, true);


--
-- Name: advantage_services advantage_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advantage_services
    ADD CONSTRAINT advantage_services_pkey PRIMARY KEY (id);


--
-- Name: adverts adverts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adverts
    ADD CONSTRAINT adverts_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: views views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT views_pkey PRIMARY KEY (advert_id, user_id);


--
-- Name: advantage_services advantage_services_advert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.advantage_services
    ADD CONSTRAINT advantage_services_advert_id_fkey FOREIGN KEY (advert_id) REFERENCES public.adverts(id) ON DELETE CASCADE;


--
-- Name: adverts adverts_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adverts
    ADD CONSTRAINT adverts_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: adverts adverts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.adverts
    ADD CONSTRAINT adverts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: views views_advert_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT views_advert_id_fkey FOREIGN KEY (advert_id) REFERENCES public.adverts(id);


--
-- Name: views views_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.views
    ADD CONSTRAINT views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict YGGs94lA66iG2dJLstPwzrrIDtcBkY2qa01nnUSHGHrFr8LQvahd0G2EU1bF2ab

