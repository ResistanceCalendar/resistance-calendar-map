FROM debian:stable-slim

# Work Dir
WORKDIR /opt/app  
ADD . /opt/app

# Install Dependencies
RUN apt update 
RUN apt install -y libpq-dev git php-pgsql php-zip php-xml php-mbstring curl composer 

#RUN curl -sS https://getcomposer.org/installer | php  
#RUN mv composer.phar /usr/local/bin/composer  
#RUN chmod +x /usr/local/bin/composer

RUN composer install
RUN php artisan key:generate

RUN apt-get -y install apt-transport-https gnupg
RUN curl -sL https://deb.nodesource.com/setup_9.x |  bash -
RUN apt-get install -y nodejs
RUN curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update
RUN apt-get -y install yarn
RUN yarn install

# Expose the port
EXPOSE 8000

# Run the app
CMD php artisan serve --host=0.0.0.0 --port=8000
