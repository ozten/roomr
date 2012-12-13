- [![build status](https://secure.travis-ci.org/ozten/roomr.png)](http://travis-ci.org/ozten/roomr) [ozten](https://github.com/ozten/roomr)

- [![build status](https://secure.travis-ci.org/jedp/roomr.png)](http://travis-ci.org/jedp/roomr) [jedp](https://github.com/jedp/roomr) fork

rooms
=====

Experimental personal space for niche social networking

https://etherpad.mozilla.org/experiments-rooms

http://www.flickr.com/photos/ozten/tags/rooms/

local hacking
=============

1. `git clone` this repo
2. `cd` into that directory
3. `npm install`
4. Setup a database

        $ mysql -u root -ppassword
        mysql> create database dev_roomr
        mysql> quit

        $ foreach schema (`ls -1 server/db`)
        mysql -u root -ppassword dev_roomr < $schema
        end


5. `cp server/etc/config.js-dist server/etc/config.js`

    Make sure your mysql username and password details are updated.

6. `npm start`
7. Visit http://localhost:9714

awsbox hacking
==============

1. `git clone` this repo
2. `cd` into that directory
3. `npm install`
4. Get your aws creds into your environment:

    export AWS_ID=your_aws_id
    export AWS_SECRET=your_aws_secret

5. Deploy!

    node_modules/.bin/awsbox create -n roomr

6. Push code to start server:

    git push roomr master

Now hack and make branches and be happy.  When you want to test something, `git
push` it to `roomr` and the server will be updated with your changes.

Note that this will currently push all the schema updates in `server/db` on
creation, but any subsequent updates will not have any effect with git pushes.
You will have to implement them manually by ssh'ing to `app@your_ip`, invoking
`mysql -u roomr`, and making the updates yourself.

If that seems too laborious, just delete the awsbox instance and create another :)

If you forget your awsbox ip address, you can get it from `git remote -v`.



