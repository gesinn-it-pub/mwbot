'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

const validCredentials = {
    apiUrl: 'http://localhost:8080/wiki01/api.php',
    username: 'Admin',
    password: 'puppet'
};

describe('MWBot Login', function() {

    it('succeeds with valid credentials', function(done) {

        let bot = new MWBot();
        exports.bot = bot;

        bot.login(validCredentials).then((response) => {
            expect(response).to.be.an('object');
            done();
        });

    });

    it('crashes with invalid credentials', function(done) {

        let bot = new MWBot();

        let invalidCredentials = validCredentials;
        invalidCredentials.username = 'InvalidUsername';

        bot.login(invalidCredentials).catch((err) => {
            expect(err.message).to.include('Could not login');
            done();
        });
    });

    it('times out', function(done) {

        let bot = new MWBot({
            request: {
                timeout: 3
            }
        });

        bot.login(validCredentials).catch((err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('ETIMEDOUT');
            done();
        });
    });

    it('crashes with invalid API URL', function(done) {

        let invalidCredentials = validCredentials;
        invalidCredentials.apiUrl = 'google.de/wiki/api.php';

        bot.login(invalidCredentials).catch((err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('Invalid URI');
            done();
        });
    });

});
