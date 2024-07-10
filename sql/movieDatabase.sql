--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3
-- Dumped by pg_dump version 16.3

-- Started on 2024-07-10 14:50:48 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 220 (class 1259 OID 16802)
-- Name: directors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.directors (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    birthday character varying(10) NOT NULL,
    deathday character varying(10),
    biography character varying(1000)
);


ALTER TABLE public.directors OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16801)
-- Name: directors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.directors_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.directors_id_seq OWNER TO postgres;

--
-- TOC entry 3638 (class 0 OID 0)
-- Dependencies: 219
-- Name: directors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.directors_id_seq OWNED BY public.directors.id;


--
-- TOC entry 224 (class 1259 OID 16830)
-- Name: favourites; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favourites (
    id integer NOT NULL,
    userid integer NOT NULL,
    movieid integer NOT NULL
);


ALTER TABLE public.favourites OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16829)
-- Name: favourites_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.favourites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.favourites_id_seq OWNER TO postgres;

--
-- TOC entry 3639 (class 0 OID 0)
-- Dependencies: 223
-- Name: favourites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.favourites_id_seq OWNED BY public.favourites.id;


--
-- TOC entry 218 (class 1259 OID 16793)
-- Name: genres; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.genres (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    description character varying(1000) NOT NULL
);


ALTER TABLE public.genres OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16792)
-- Name: genres_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.genres_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.genres_id_seq OWNER TO postgres;

--
-- TOC entry 3640 (class 0 OID 0)
-- Dependencies: 217
-- Name: genres_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.genres_id_seq OWNED BY public.genres.id;


--
-- TOC entry 222 (class 1259 OID 16811)
-- Name: movies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movies (
    id integer NOT NULL,
    title character varying(50) NOT NULL,
    description character varying(1000) NOT NULL,
    genre integer NOT NULL,
    director integer NOT NULL,
    image character varying(300)
);


ALTER TABLE public.movies OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16810)
-- Name: movies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.movies_id_seq OWNER TO postgres;

--
-- TOC entry 3641 (class 0 OID 0)
-- Dependencies: 221
-- Name: movies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movies_id_seq OWNED BY public.movies.id;


--
-- TOC entry 216 (class 1259 OID 16786)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    password character varying(8) NOT NULL,
    birthday character varying(10)
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16785)
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
-- TOC entry 3642 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3465 (class 2604 OID 16805)
-- Name: directors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directors ALTER COLUMN id SET DEFAULT nextval('public.directors_id_seq'::regclass);


--
-- TOC entry 3467 (class 2604 OID 16833)
-- Name: favourites id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites ALTER COLUMN id SET DEFAULT nextval('public.favourites_id_seq'::regclass);


--
-- TOC entry 3464 (class 2604 OID 16796)
-- Name: genres id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres ALTER COLUMN id SET DEFAULT nextval('public.genres_id_seq'::regclass);


--
-- TOC entry 3466 (class 2604 OID 16814)
-- Name: movies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies ALTER COLUMN id SET DEFAULT nextval('public.movies_id_seq'::regclass);


--
-- TOC entry 3463 (class 2604 OID 16789)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3628 (class 0 OID 16802)
-- Dependencies: 220
-- Data for Name: directors; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (1, 'Francis Ford Coppola', '1939-04-07', NULL, 'Francis is awesome!');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (2, 'Jonathan Demme', '1944-01-01', '2017-01-01', 'He was an American director, producer, and screenwriter.');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (3, 'Ferenc Árpád ''Frank'' Darabont', '1959-01-28', NULL, 'He has been nominated for three Academy Awards and a Golden Globe Award.');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (4, 'Christopher Nolan', '1970-07-30', NULL, 'Known for his Hollywood blockbusters with complex storytelling, he is considered a leading filmmaker of the 21st century.');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (5, 'Quentin Jerome Tarantino', '1963-03-27', NULL, 'His films are characterized by stylized violence, extended dialogue often with profanity, and references to popular culture.');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (6, 'Robert Zemeckis', '1952-05-14', NULL, 'Zemeckis is regarded as an innovator in visual effects.');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (7, 'David Andrew Leo Fincher', '1962-08-28', NULL, 'His films, most of which are psychological thrillers, have collectively grossed over $2.1 billion worldwide and have received numerous accolades, including three nominations for the Academy Awards for Best Director');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (8, 'The Wachowskis', '1965-06-21', NULL, 'Lana Wachowski (born Larry Wachowski; June 21, 1965) and Lilly Wachowski (born Andy Wachowski; December 29, 1967) are American film and television directors, writers and producers. The sisters are both trans women.');
INSERT INTO public.directors (id, name, birthday, deathday, biography) VALUES (9, 'Sir Peter Robert Jackson ONZ KNZM', '1961-10-31', NULL, 'Jackson is best known as the director, writer and producer of the Lord of the Rings trilogy (2001–2003) and the Hobbit trilogy (2012–2014)');


--
-- TOC entry 3632 (class 0 OID 16830)
-- Dependencies: 224
-- Data for Name: favourites; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.favourites (id, userid, movieid) VALUES (1, 1, 1);
INSERT INTO public.favourites (id, userid, movieid) VALUES (2, 2, 2);
INSERT INTO public.favourites (id, userid, movieid) VALUES (3, 3, 3);


--
-- TOC entry 3626 (class 0 OID 16793)
-- Dependencies: 218
-- Data for Name: genres; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.genres (id, name, description) VALUES (1, 'Thriller', 'The ‘Thriller’ movie genre is characterized by its focus on suspense, tension, and excitement, often involving high-stakes scenarios and unexpected plot twists that keep the audience on the edge of their seats.');
INSERT INTO public.genres (id, name, description) VALUES (2, 'Drama', 'Drama is a film genre that focuses on character development and emotional narratives, often exploring complex human relationships and societal issues.');
INSERT INTO public.genres (id, name, description) VALUES (3, 'Superhero film', 'A superhero film is a film that focuses on superheroes and their actions. Superheroes are individuals who usually possess superhuman abilities');
INSERT INTO public.genres (id, name, description) VALUES (4, 'Gangster film', 'The gangster fil genre focuses on gangs and organized crime.');
INSERT INTO public.genres (id, name, description) VALUES (5, 'Comedy drama', 'Comedy drama, also known by the portmanteau dramedy, is a genre of dramatic works that combines elements of comedy and drama.');
INSERT INTO public.genres (id, name, description) VALUES (6, 'Fantasy', 'Fantasy is a genre of fiction involving magical elements, as well as a work in this genre.');


--
-- TOC entry 3630 (class 0 OID 16811)
-- Dependencies: 222
-- Data for Name: movies; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (2, 'The Godfather', 'The Godfather is a gripping crime drama that chronicles the powerful Corleone family’s rise and struggles within the mafia underworld, blending themes of loyalty, power, and betrayal.', 4, 1, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (3, 'The Shawshank Redemption', 'The film tells the story of banker Andy Dufresne (Tim Robbins), who is sentenced to life in Shawshank State Penitentiary for the murders of his wife and her lover, despite his claims of innocence.', 2, 3, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (4, 'The Dark Knight', 'The plot follows the vigilante Batman, police lieutenant James Gordon, and district attorney Harvey Dent, who form an alliance to dismantle organized crime in Gotham City', 3, 4, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (5, 'Pulp Fiction', 'The film tells four intertwining tales of crime and violence in Los Angeles, California', 4, 5, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (6, 'Forrest Gump', 'The film follows the life of an Alabama man named Forrest Gump and his experiences in the 20th-century United States.', 5, 6, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (7, 'Memento', 'The film follows Leonard Shelby (Pearce), a man who suffers from anterograde amnesia—resulting in short-term memory loss and the inability to form new memories—who uses an elaborate system of photographs, handwritten notes, and tattoos in an attempt to uncover the perpetrator who killed his wife', 1, 4, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (8, 'Fight Club', 'The protagonist forms a fight club with a soap salesman, and becomes embroiled in a relationship with an impoverished but beguilingly attractive woman.', 1, 7, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (9, 'The Matrix', 'The movie depicts a dystopian future in which humanity is unknowingly trapped inside the Matrix, a simulated reality that intelligent machines have created to distract humans while using their bodies as an energy source.', 1, 8, 'imagelink');
INSERT INTO public.movies (id, title, description, genre, director, image) VALUES (10, 'The Lord of the Rings: The Return of the King', 'Continuing the plot of the previous film, Frodo, Sam and, Gollum make their final way toward Mount Doom to destroy the One Ring, unaware of Gollum''s true intentions, while Merry, Pippin, Gandalf, Aragorn, Legolas, Gimli and, their allies join forces against Sauron and his legions from Mordor.', 6, 9, 'imagelink');


--
-- TOC entry 3624 (class 0 OID 16786)
-- Dependencies: 216
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users (id, username, email, password, birthday) VALUES (2, 'user2', 'email', 'password', '1994-09-26');
INSERT INTO public.users (id, username, email, password, birthday) VALUES (3, 'user3', 'email', 'password', '1994-09-26');
INSERT INTO public.users (id, username, email, password, birthday) VALUES (1, 'user1', 'new email', 'password', '1994-09-26');


--
-- TOC entry 3643 (class 0 OID 0)
-- Dependencies: 219
-- Name: directors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.directors_id_seq', 9, true);


--
-- TOC entry 3644 (class 0 OID 0)
-- Dependencies: 223
-- Name: favourites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favourites_id_seq', 3, true);


--
-- TOC entry 3645 (class 0 OID 0)
-- Dependencies: 217
-- Name: genres_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.genres_id_seq', 6, true);


--
-- TOC entry 3646 (class 0 OID 0)
-- Dependencies: 221
-- Name: movies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movies_id_seq', 10, true);


--
-- TOC entry 3647 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 3473 (class 2606 OID 16809)
-- Name: directors directors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.directors
    ADD CONSTRAINT directors_pkey PRIMARY KEY (id);


--
-- TOC entry 3477 (class 2606 OID 16835)
-- Name: favourites favourites_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favourites
    ADD CONSTRAINT favourites_pkey PRIMARY KEY (id);


--
-- TOC entry 3471 (class 2606 OID 16800)
-- Name: genres genres_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.genres
    ADD CONSTRAINT genres_pkey PRIMARY KEY (id);


--
-- TOC entry 3475 (class 2606 OID 16818)
-- Name: movies movies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT movies_pkey PRIMARY KEY (id);


--
-- TOC entry 3469 (class 2606 OID 16791)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3478 (class 2606 OID 16824)
-- Name: movies directorkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT directorkey FOREIGN KEY (director) REFERENCES public.directors(id);


--
-- TOC entry 3479 (class 2606 OID 16819)
-- Name: movies genreykey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movies
    ADD CONSTRAINT genreykey FOREIGN KEY (genre) REFERENCES public.genres(id);


-- Completed on 2024-07-10 14:50:48 CEST

--
-- PostgreSQL database dump complete
--

