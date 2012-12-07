#!/bin/sh

sudo /sbin/chkconfig mysqld on
sudo /sbin/service mysqld start

echo "CREATE USER 'roomr'@'localhost';" | mysql -u root
echo "CREATE DATABASE roomr;" | mysql -u root
echo "GRANT ALL ON roomr.* TO 'roomr'@'localhost';" | mysql -u root

