'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const semver = require('semver');

let loginCredentials = require('./mocking/loginCredentials.json');

// use local login credentials if available
try {
    let loginCredentialsLocal = require('./mocking/loginCredentials.local.json');
    if (loginCredentialsLocal) loginCredentials = loginCredentialsLocal;
} catch (e) {
    //ignore
}

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
            expect(JSON.stringify(r.warnings)).to.not.exist;
            expect(bot.mwversion.major).to.be.least(0);
            expect(bot.mwversion.minor).to.be.least(0);
            expect(semver.valid(bot.mwversion.version)).to.not.equal(null);
        } catch (err) {
            log('[E] ' + this.test.fullTitle() + ': ' + err.code + ': ' + err.info + '\n' + err.response);
            throw(err);
        }
    });

    it('crashes with invalid credentials', async function () {
        let bot = new MWBot({silent: true});

        try {
            await bot.login(loginCredentials.invalid);
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
            expect(err.message).to.include('TIMEDOUT');
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

        await bot.login(loginCredentials.valid);

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
            const r = await bot.loginGetEditToken(loginCredentials.valid);
            expect(r).to.be.an('object');
            expect(r.result).to.equal('Success');
            expect(r).to.include.key('csrftoken');
            expect(JSON.stringify(r.warnings)).to.not.exist;
        } catch (err) {
            log('[E] ' + this.test.fullTitle() + ': ' + err.code + ': ' + err.info + '\n' + err.response);
            throw(err);
        }
    });

    it('convenience loginGetCreateaccountToken()', async function () {
        let bot = new MWBot();

        try {
            const r = await bot.loginGetCreateaccountToken(loginCredentials.valid);
            expect(r).to.be.an('object');
            expect(r.result).to.equal('Success');
            expect(r).to.include.key('createaccounttoken');
            expect(JSON.stringify(r.warnings)).to.not.exist;
        } catch (err) {
            log('[E] ' + this.test.fullTitle() + ': ' + err.code + ': ' + err.info + '\n' + err.response);
            throw(err);
        }
    });


});
