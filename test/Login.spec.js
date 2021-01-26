'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Login', async function () {
    this.timeout(10000);

    it('succeeds with valid credentials', async function () {
        let bot = new MWBot();
        expect(bot.loggedIn).to.equal(false);

        try {
            const r = await bot.login(loginCredentials.valid);
            expect(r).to.be.an('object');
            expect(r.result).to.equal('Success');
            expect(bot.loggedIn).to.equal(true);
        } catch (err) {
            log('[E] ' + this.test.fullTitle() + ': ' + err.code + ': ' + err.info + '\n' + err.response);
            throw(err);
        }
    });

    it('crashes with invalid credentials', async function () {
        let bot = new MWBot({silent: true});

        try {
            const r = await bot.login(loginCredentials.invalid);
            throw new Error('other error');
        } catch (err) {
            let expected = 'Could not login: Failed';
            assert.equal(err.message, expected, err.code + ': ' + err.info + '\n\n' + err.response + '\n');
        }
    });

    it('aborts because of timeout', function () {
        let bot = new MWBot();
        bot.setGlobalRequestOptions({
            timeout: 1 // 1ms
        });

        bot.login(loginCredentials.valid).catch((err) => {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('ETIMEDOUT');
        });
    });

    it('crashes with invalid API URL', function () {
        let bot = new MWBot();

        bot.login(loginCredentials.invalidApiUrl).catch((err) => {
            expect(err).to.be.an.instanceof(Error);
        });
    });

    it('succeeds and get edit token afterwards', async function () {
        let bot = new MWBot();

        const r1 = await bot.login(loginCredentials.valid);

        try {
            const r2 = await bot.getEditToken();
            expect(r2).to.be.an('object');
            expect(r2.result).to.equal('Success');
            expect(r2).to.include.key('csrftoken');
        } catch (err) {
            log('[E] ' + this.test.fullTitle() + ': ' + err.code + ': ' + err.info + '\n' + err.response);
            throw(err);
        }
    });

    it('convenience loginGetEditToken()', async function () {
        let bot = new MWBot();

        try {
            const r = await bot.loginGetEditToken(loginCredentials.valid)
            expect(r).to.be.an('object');
            expect(r.result).to.equal('Success');
            expect(r).to.include.key('csrftoken');
        } catch (err) {
            log('[E] ' + this.test.fullTitle() + ': ' + err.code + ': ' + err.info + '\n' + err.response);
            throw(err);
        }
    });

});
