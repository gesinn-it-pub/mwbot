#!/bin/bash
set -ex

cd /var/www

sudo wget https://github.com/wikimedia/mediawiki/archive/$MW.tar.gz
sudo tar -zxf $MW.tar.gz
sudo mv mediawiki-$MW mw

ls -la /var/www

cd mw

sudo which composer

if [ -f composer.json ]
then
  sudo /usr/local/bin/composer install
fi

sudo mysql -e 'create database traviswiki;'
sudo php maintenance/install.php --dbtype mysql --dbuser root --dbname traviswiki --dbpath $(pwd) --pass AdminPassword TravisWiki admin --scriptpath /TravisWiki
