'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Login', function() {

    it('succeeds with valid credentials', function() {
        let bot = new MWBot();
        expect(bot.loggedIn).to.equal(false);

        bot.login(loginCredentials.valid).then((response) => {
            expect(response).to.be.an('object');
            expect(response.result).to.equal('Success');
            expect(bot.loggedIn).to.equal(true);
        });
    });

    it('crashes with invalid credentials', function() {
        new MWBot().login(loginCredentials.invalid).catch((err) => {
            expect(err.message).to.include('Could not login');
        });
    });

    it('aborts because of timeout', function() {
        let bot = new MWBot();
        bot.setGlobalRequestOptions({
            timeout: 1 // 1ms
        });

        bot.login(loginCredentials.valid).catch((err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('ETIMEDOUT');
        });
    });

    it('crashes with invalid API URL', function() {
        let bot = new MWBot();

        bot.login(loginCredentials.invalidApiUrl).catch((err) => {
            expect(err).to.be.an.instanceof(Error);
        });
    });

    it('succeeds and get edit token afterwards', function() {
        let bot = new MWBot();
        bot.login(loginCredentials.valid).then(() => {
            return bot.getEditToken();
        }).then((response) => {
            expect(response).to.be.an('object');
            expect(response.result).to.equal('Success');
            expect(response).to.include.key('csrftoken');
        });
    });

    it('convenience loginGetEditToken()', function() {
        new MWBot().loginGetEditToken(loginCredentials.valid).then((response) => {
            expect(response).to.be.an('object');
            expect(response.result).to.equal('Success');
            expect(response).to.include.key('csrftoken');
        });
    });

});
