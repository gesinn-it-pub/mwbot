'use strict';

const MWBot = require('../../src/');
//const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect;

const loginCredentials = require('../helpers/credentials');

describe('MWBot Edit', function () {
    'use strict';
    this.timeout(10000);

    it('successfully creates a page with edit()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);
        const title = crypto.randomBytes(20).toString('hex');

        const r2 = await bot.edit(title, '=Some Wikitext= [[Category:Test Page]]', 'Test');
        expect(r2.edit.result).to.equal('Success');
        expect(r2.warnings).to.equal(undefined);
    });

    it('successfully edits an existing page with edit()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);
        const title = crypto.randomBytes(20).toString('hex');

        const r2 = await bot.edit(title, 'Edit Test', 'Test');
        expect(r2.edit.result).to.equal('Success');
        expect(r2.warnings).to.equal(undefined);

        const r3 = await bot.edit(title, 'Edit Test 2', 'Test');
        expect(r3.edit.result).to.equal('Success');
    });

    it('rejects editing a page without providing API URL/login', async function () {
        const bot = new MWBot();
        const title = crypto.randomBytes(20).toString('hex');

        await expect(bot.edit(title, 'Edit Test', 'Test')).to.be.rejectedWith('No URI');
    });
});
