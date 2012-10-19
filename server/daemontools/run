#!/bin/sh
exec 2>&1
PATH=/usr/bin:/bin:/usr/local/bin
mkdir -p /var/log/roomr/
exec setuidgid ubuntu node /home/ubuntu/roomr/server/bin/room \
>> /var/log/roomr/roomr.log
#multilog t s10485760 n5 '!tai64nlocal' /var/log/roomr/roomr.log
