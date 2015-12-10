'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Login', function() {

    it('succeeds with valid credentials', function(done) {
        let bot = new MWBot();
        expect(bot.loggedIn).to.equal(false);
        bot.login(loginCredentials.valid).then((response) => {
            expect(response).to.be.an('object');
            expect(response.result).to.equal('Success');
            expect(bot.loggedIn).to.equal(true);
            done();
        });
    });

    it('crashes with invalid credentials', function(done) {
        new MWBot().login(loginCredentials.invalid).catch((err) => {
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
            done();
        });
    });

    it('succeeds and get edit token afterwards', function(done) {
        let bot = new MWBot();
        bot.login(loginCredentials.valid).then(() => {
            return bot.getEditToken();
        }).then((response) => {
            expect(response).to.be.an('object');
            expect(response.result).to.equal('Success');
            expect(response).to.include.key('csrftoken');
            done();
        });
    });

    it('convenience loginGetEditToken()', function(done) {
        new MWBot().loginGetEditToken(loginCredentials.valid).then((response) => {
            expect(response).to.be.an('object');
            expect(response.result).to.equal('Success');
            expect(response).to.include.key('csrftoken');
            done();
        });
    });

});
