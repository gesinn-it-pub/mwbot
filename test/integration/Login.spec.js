'use strict';

const MWBot = require('../../src/');
const chai = require('chai');
const expect = chai.expect;
const semver = require('semver');

const loginCredentials = require('../helpers/credentials');

describe('MWBot Login', function () {
    this.timeout(10000);

    it('succeeds with valid credentials', async function () {
        const bot = new MWBot();
        expect(bot.loggedIn).to.equal(false);

        const r = await bot.login(loginCredentials.valid);
        expect(r).to.be.an('object');
        expect(r.result).to.equal('Success');
        expect(bot.loggedIn).to.equal(true);
        expect(r.warnings).to.equal(undefined);
        expect(bot.mwversion.major).to.be.least(0);
        expect(bot.mwversion.minor).to.be.least(0);
        expect(semver.valid(bot.mwversion.version)).to.not.equal(null);
    });

    it('crashes with invalid credentials', async function () {
        const bot = new MWBot({ silent: true });

        await expect(bot.login(loginCredentials.invalid)).to.be.rejectedWith('Could not login: Failed');
    });

    it('aborts because of timeout', async function () {
        const bot = new MWBot();
        bot.setGlobalRequestOptions({
            timeout: 1, // 1ms
        });

        let error;
        try {
            await bot.login(loginCredentials.valid);
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an.instanceof(Error);
        expect(error.name).to.equal('AbortError');
    });

    it('crashes with invalid API URL', async function () {
        const bot = new MWBot();

        let error;
        try {
            await bot.login(loginCredentials.invalidApiUrl);
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an.instanceof(Error);
    });

    it('succeeds and get edit token afterwards', async function () {
        const bot = new MWBot();

        await bot.login(loginCredentials.valid);

        const r2 = await bot.getEditToken();
        expect(r2).to.be.an('object');
        expect(r2.result).to.equal('Success');
        expect(r2).to.include.key('csrftoken');
    });

    it('convenience loginGetEditToken()', async function () {
        const bot = new MWBot();

        const r = await bot.loginGetEditToken(loginCredentials.valid);
        expect(r).to.be.an('object');
        expect(r.result).to.equal('Success');
        expect(r).to.include.key('csrftoken');
        expect(r.warnings).to.equal(undefined);
    });

    it('convenience loginGetCreateaccountToken()', async function () {
        const bot = new MWBot();

        const r = await bot.loginGetCreateaccountToken(loginCredentials.valid);
        expect(r).to.be.an('object');
        expect(r.result).to.equal('Success');
        expect(r).to.include.key('createaccounttoken');
        expect(r.warnings).to.equal(undefined);
    });
});
