ALTER TABLE rooms ADD COLUMN  created TIMESTAMP DEFAULT current_timestamp NOT NULL;
ALTER TABLE rooms_members ADD COLUMN  entered TIMESTAMP DEFAULT current_timestamp NOT NULL;
CREATE TABLE IF NOT EXISTS events (
    event_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rooms_id varchar(100),
    member_email varchar(255),
    created TIMESTAMP DEFAULT current_timestamp,
    etype varchar(8) NOT NULL,
    evalue blob,
    FOREIGN KEY (rooms_id) REFERENCES rooms(id),
    FOREIGN KEY (member_email) REFERENCES members(email)
);
