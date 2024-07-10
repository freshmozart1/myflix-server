DROP TABLE IF EXISTS users, genres, directors, movies, favourites CASCADE;

CREATE TABLE users (
	id serial PRIMARY KEY,
	username varchar(50) NOT NULL,
	email varchar(50) NOT NULL,
	password varchar(8) NOT NULL,
	birthday varchar(10)
);

CREATE TABLE genres (
	id serial PRIMARY KEY,
	name varchar(50) NOT NULL,
	description varchar(1000) NOT NULL
);

CREATE TABLE directors (
	id serial PRIMARY KEY,
	name varchar(50) NOT NULL,
	birthday varchar(10) NOT NULL,
	deathday varchar(10),
	biography varchar(1000)
);

CREATE TABLE movies (
	id serial PRIMARY KEY,
	title varchar(50) NOT NULL,
	description varchar(1000) NOT NULL,
	genre integer NOT NULL,
	director integer NOT NULL,
	image varchar(300),
	CONSTRAINT GenreyKey FOREIGN KEY (genre) REFERENCES genres (id),
	CONSTRAINT DirectorKey FOREIGN KEY (director) REFERENCES directors (id)
);

CREATE TABLE favourites (
	id serial PRIMARY KEY,
	userId integer NOT NULL,
	movieId integer NOT NULL
);