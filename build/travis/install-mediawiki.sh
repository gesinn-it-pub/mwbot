#!/bin/bash
set -ex

cd /var/www

sudo wget https://github.com/wikimedia/mediawiki/archive/$MW.tar.gz
sudo tar -zxf $MW.tar.gz
sudo mv mediawiki-$MW mw

cd mw

which composer
which mysql
which php
which echo
which tee
which cat
which chown

if [ -f composer.json ]
then
  sudo /home/travis/.phpenv/shims/composer install
fi

sudo /usr/bin/mysql -e 'create database traviswiki;'
sudo mysql -e "CREATE USER IF NOT EXISTS 'traviswiki'@'%';"
sudo mysql -e "ALTER USER 'traviswiki'@'%' IDENTIFIED BY 'traviswiki';"
sudo mysql -e "CREATE USER IF NOT EXISTS 'traviswiki'@'localhost';"
sudo mysql -e "ALTER USER 'traviswiki'@'localhost' IDENTIFIED BY 'traviswiki';"
sudo mysql -e "grant select, insert, update, delete, alter, drop, create, create temporary tables, index on \`traviswiki\`.* to 'traviswiki'@'%' WITH GRANT OPTION"
sudo mysql -e "grant select, insert, update, delete, alter, drop, create, create temporary tables, index on \`traviswiki\`.* to 'traviswiki'@'localhost' WITH GRANT OPTION"
sudo /home/travis/.phpenv/shims/php maintenance/install.php --dbtype mysql --dbuser traviswiki --dbpass traviswiki --dbname traviswiki --pass AdminPassword TravisWiki Admin

sudo /usr/bin/find /var/www/mw -type d -exec chmod 755 {} \;
sudo /usr/bin/find /var/www/mw -type f -exec chmod 644 {} \;
sudo /bin/chown -R travis:travis /var/www/mw
ls -la /var/www/mw

sudo /bin/echo '$wgEnableUploads=true;' | sudo /usr/bin/tee -a LocalSettings.php
#sudo /bin/echo "ini_set( 'post_max_size', '50M' );" | sudo /usr/bin/tee -a LocalSettings.php
#sudo /bin/echo "ini_set( 'upload_max_filesize', '50M' );" | sudo /usr/bin/tee -a LocalSettings.php
#sudo /bin/echo "ini_set( 'file_uploads', On );" | sudo /usr/bin/tee -a LocalSettings.php
sudo /bin/cat LocalSettings.php
