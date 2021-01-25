#!/bin/bash
set -ex

cd /var/www

sudo wget https://github.com/wikimedia/mediawiki/archive/$MW.tar.gz
sudo tar -zxf $MW.tar.gz
sudo mv mediawiki-$MW mw

ls -la /var/www

cd mw

which composer
which mysql
which php

if [ -f composer.json ]
then
  sudo /home/travis/.phpenv/shims/composer install
fi

sudo /usr/bin/mysql -e 'create database traviswiki;'
sudo /home/travis/.phpenv/shims/php maintenance/install.php --dbtype mysql --dbuser root --dbname traviswiki --dbpath $(pwd) --pass AdminPassword TravisWiki admin --scriptpath /TravisWiki
