CREATE DATABASE bkmk;

USE bkmk;

CREATE TABLE user (
    id           INT(11) AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(20) NOT NULL,
    password     VARCHAR(60) NOT NULL,
    -- bcrypt hash of the recovery passphrase (COS-298). NULL means the account predates
    -- the passphrase and cannot recover its password -- see migrations/ and COS-324.
    recovery_passphrase VARCHAR(60) NULL,
    email        VARCHAR(250) NOT NULL UNIQUE,
    register_date DATE NOT NULL
);

CREATE TABLE category (
    id      INT(11) AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(20) NOT NULL,
    color   VARCHAR(20) NOT NULL,
    user_id INT(11),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- `original` is the link as it was typed or imported, and it is what the record shows and the `↗`
-- opens. `normalised` is the key two urls are compared on (COS-338) -- scheme dropped, `www.` and the
-- trailing slash removed, tracking parameters and fragment cut -- so it does not parse and must never
-- be rendered or fetched; `helpers/normaliseUrl.js` is what fills both it and `host`.
--
-- The index on `normalised` is deliberately not UNIQUE: this table has no `user_id`, and a unique key
-- would put two accounts that bookmark the same page on one row, which `editBookmarkController`
-- updates in place. See migrations/ for the whole reasoning.
--
-- `short` has never been written by anything.
CREATE TABLE url (
    id          INT(11) AUTO_INCREMENT PRIMARY KEY,
    original    VARCHAR(2048) NOT NULL,
    normalised  VARCHAR(2048),
    host        VARCHAR(255),
    short       VARCHAR(255),
    INDEX url_normalised (normalised(255)),
    INDEX url_host (host)
);

CREATE TABLE alarm (
    id          INT(11) AUTO_INCREMENT PRIMARY KEY,
    frequency   INT(3),
    date_added  DATE NOT NULL,
    -- NULL: the alarm runs. A date: it has slept since that day (COS-330). `resume` slides
    -- `date_added` forward by the sleep, which freezes the countdown instead of shifting it.
    -- See migrations/ for the arithmetic and for why `done` needs no column at all.
    paused_at   DATE NULL
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
    title               VARCHAR(512) NOT NULL,
    screenshot          VARCHAR(512),
    priority            ENUM("low", "medium", "high", "highest"),
    notes               TEXT,
    stars               INT(5),
    date_added          DATE NOT NULL,
    date_last_modified  DATE,
    active              TINYINT DEFAULT 1,
    date_inactive       DATE,
    FOREIGN KEY (group_id)  REFERENCES bookmark_group(id),
    FOREIGN KEY (url_id)    REFERENCES url(id),
    FOREIGN KEY (user_id)   REFERENCES user(id),
    FOREIGN KEY (alarm_id)  REFERENCES alarm(id)
);

# CREATE TABLE bookmark_category (
#    bookmark_id INT(11),
#    category_id INT(11),
#    FOREIGN KEY (bookmark_id) REFERENCES bookmark(id),
#    FOREIGN KEY (category_id) REFERENCES category(id)
# );

CREATE TABLE bookmark_category (
   bookmark_id INT(11),
   category_id INT(11),
   FOREIGN KEY (bookmark_id) REFERENCES bookmark(id),
   FOREIGN KEY (category_id) REFERENCES category(id),
   CONSTRAINT uc_bookmark_category UNIQUE (bookmark_id, category_id)
);

-- What the migration runner has applied (COS-332). Here so that a database created from this file
-- is complete, though `migrate.js` also creates it if it is missing — it is the one table that
-- cannot be installed by a migration, being what records that migrations ran.
--
-- ⚠️ A database created from this script already carries every change `migrations/` describes, so
-- the next step is `node src/db/migrate.js baseline`, not `up`.
CREATE TABLE schema_migrations (
    filename   VARCHAR(255) NOT NULL PRIMARY KEY,
    applied_at DATETIME NOT NULL
);

-- One row per committed import (COS-307), written inside the transaction that inserts the
-- bookmarks. It is what the import screen's `last import` line reads; see migrations/.
CREATE TABLE import_run (
    id       INT(11) AUTO_INCREMENT PRIMARY KEY,
    user_id  INT(11) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    entries  INT(11) NOT NULL,
    skipped  INT(11) NOT NULL,
    ran_at   DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
);
