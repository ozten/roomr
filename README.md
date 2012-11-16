rooms
=====

Experimental personal space for niche social networking

https://etherpad.mozilla.org/experiments-rooms

http://www.flickr.com/photos/ozten/tags/rooms/

local hacking
=============

1. `git clone` this repo
2. cd into that directory
3. `npm install`
4. Setup a database

        $ mysql -u root -ppassword
        mysql> create database dev_roomr
        mysql> quit
        $ mysql -u root -ppassword dev_roomr < server/db/schema_000.sql
        $ mysql -u root -ppassword dev_roomr < server/db/schema_001.sql

5. `cp server/etc/config.js-dist server/etc/config.js`

    Make sure your mysql username and password details are updated.

6. `npm start`
7. Visit http://localhost:9714