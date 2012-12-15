/**
 * Change rooms table to have int primary key (for issue 7)
 * Requires first dropping tables and recreating them after
 */

DROP TABLE events;
DROP TABLE rooms_members;
DROP TABLE rooms;

CREATE TABLE rooms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name varchar(100) NOT NULL,
    created timestamp DEFAULT current_timestamp NOT NULL
);

CREATE TABLE rooms_members (
    rooms_id BIGINT,
    member_email varchar(40),
    entered timestamp DEFAULT current_timestamp NOT NULL, 
    FOREIGN KEY (rooms_id) REFERENCES rooms(id),
    FOREIGN KEY (member_email) REFERENCES members(email),
    PRIMARY KEY (rooms_id, member_email)
);

CREATE TABLE events (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rooms_id BIGINT,
    member_email varchar(255),
    created TIMESTAMP DEFAULT current_timestamp,
    etype varchar(8) NOT NULL,
    evalue blob,
    FOREIGN KEY (rooms_id) REFERENCES rooms(id),
    FOREIGN KEY (member_email) REFERENCES members(email)
);
