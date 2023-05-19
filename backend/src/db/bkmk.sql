CREATE DATABASE bkmk;

USE bkmk;

CREATE TABLE user (
    id           INT(11) AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(20) NOT NULL,
    password     VARCHAR(60) NOT NULL,
    email        VARCHAR(250) NOT NULL UNIQUE,
    register_date DATE NOT NULL
);

CREATE TABLE category (
    id      INT(11) AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(20) NOT NULL UNIQUE,
    color   VARCHAR(20) NOT NULL,
    user_id INT(11),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE url (
    id          INT(11) AUTO_INCREMENT PRIMARY KEY,
    original    VARCHAR(2048) NOT NULL,
    short       VARCHAR(255)
);

CREATE TABLE alarm (
    id          INT(11) AUTO_INCREMENT PRIMARY KEY,
    frequency   INT(3),
    date_added  DATE NOT NULL
);

CREATE TABLE bookmark_group (
    id      INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id int(11),
    title   VARCHAR(256),
    color   VARCHAR(20),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

CREATE TABLE bookmark (
    id                  INT(11) AUTO_INCREMENT PRIMARY KEY,
    url_id              INT(11),
    user_id             INT(11),
    group_id            INT(11),
    alarm_id            INT(11),
    title               VARCHAR(60) NOT NULL,
    screenshot_path     VARCHAR(512),
    priority            ENUM("low", "medium", "high", "highest"),
    notes               TEXT,
    stars               INT(5),
    date_added          DATE NOT NULL,
    date_last_modified  DATE,
    FOREIGN KEY (group_id)  REFERENCES bookmark_group(id),
    FOREIGN KEY (url_id)    REFERENCES url(id),
    FOREIGN KEY (user_id)   REFERENCES user(id),
    FOREIGN KEY (alarm_id)  REFERENCES alarm(id)

);

CREATE TABLE bookmark_category (
   bookmark_id INT(11),
   category_id INT(11),
   FOREIGN KEY (bookmark_id) REFERENCES bookmark(id),
   FOREIGN KEY (category_id) REFERENCES category(id)
);
