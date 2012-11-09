CREATE TABLE IF NOT EXISTS rooms (
    id varchar(100) NOT NULL,
    name varchar(100) NOT NULL,
/*  created timestamp DEFAULT current_timestamp NOT NULL, */
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS members (
    email varchar(255) NOT NULL,
    name varchar(40),
    PRIMARY KEY(email)
);

CREATE TABLE IF NOT EXISTS rooms_members (
    rooms_id varchar(255),
    member_email varchar(40),
/*  entered timestamp DEFAULT current_timestamp NOT NULL, */
    FOREIGN KEY (rooms_id) REFERENCES rooms(id),
    FOREIGN KEY (member_email) REFERENCES members(email),
    PRIMARY KEY (rooms_id, member_email)
);

/*
CREATE TABLE IF NOT EXISTS events (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rooms_id varchar(256),
    member_email varchar(40),
    created TIMESTAMP DEFAULT current_timestamp,
    etype varchar(8) NOT NULL,
    evalue blob,
    FOREIGN KEY (rooms_id) REFERENCES rooms(id),
    FOREIGN KEY (member_email) REFERENCES members(email)
);
*/
