'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Login', function() {

    it('succeeds with valid credentials', function(done) {

        let bot = new MWBot();
        exports.bot = bot;

        bot.login(loginCredentials.valid).then((response) => {
            expect(response).to.be.an('object');
            done();
        });

    });

    it('crashes with invalid credentials', function(done) {

        let bot = new MWBot();

        bot.login(loginCredentials.invalid).catch((err) => {
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

        bot.login(loginCredentials.valid).catch((err) => {

            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('ETIMEDOUT');
            done();
        });
    });

    it('crashes with invalid API URL', function(done) {

        let bot = new MWBot();

        bot.login(loginCredentials.invalidApiUrl).catch((err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('301');
            done();
        });
    });

});
