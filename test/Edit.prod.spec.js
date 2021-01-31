'use strict';

/*global describe, it*/

const MWBot = require('../src/');
//const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

let loginCredentials = require('./mocking/loginCredentials.json');

// use local login credentials if available
try {
    let loginCredentialsLocal = require('./mocking/loginCredentials.local.json');
    if (loginCredentialsLocal) loginCredentials = loginCredentialsLocal;
} catch (e) {
    //ignore
}

describe('MWBot Edit', function() {
    'use strict';
    this.timeout(10000);

    it('successfully creates a page with edit()', async function() {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);
        const title = crypto.randomBytes(20).toString('hex');

        try {
            const r2 = await bot.edit(
                title,
                '=Some Wikitext= [[Category:Test Page]]',
                'Test'
            );
            expect(r2.edit.result).to.equal('Success');
            expect(JSON.stringify(r2.warnings)).to.not.exist;
        } catch(err) {
            assert.fail(err,'Success',err);
        }
    });

    it('successfully edits an existing page with edit()', async function() {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);
        const title = crypto.randomBytes(20).toString('hex');

        try {
            const r2 = await bot.edit(
                title,
                'Edit Test',
                'Test'
            );
            expect(r2.edit.result).to.equal('Success');
            expect(JSON.stringify(r2.warnings)).to.not.exist;
        } catch(err) {
            assert.fail(err,'Success',err);
        }

        try {
            const r3 = await bot.edit(
                title,
                'Edit Test 2',
                'Test'
            );
            expect(r3.edit.result).to.equal('Success');
        } catch(err) {
            assert.fail(err,'Success',err);
        }
    });

    it('rejects editing a page without providing API URL/login', async function() {
        let bot = new MWBot();
        const title = crypto.randomBytes(20).toString('hex');

        try {
            await bot.edit(
                title,
                'Edit Test',
                'Test'
            );
        } catch(err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.include('No URI');
        }
    });

});
