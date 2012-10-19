CREATE TABLE IF NOT EXISTS rooms (
  id varchar(256) NOT NULL,
  name varchar(100) NOT NULL,
  PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS members (
  email varchar(320) NOT NULL,
  name varchar(40),
  PRIMARY KEY(email)
);

CREATE TABLE IF NOT EXISTS rooms_members (
  rooms_id varchar(256),
  member_email varchar(40),
  FOREIGN KEY (rooms_id) REFERENCES rooms(id),
  FOREIGN KEY (member_email) REFERENCES members(email),
  PRIMARY KEY (rooms_id, member_email)
);