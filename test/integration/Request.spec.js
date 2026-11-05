'use strict';

const MWBot = require('../../src/');

const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;

let loginCredentials = require('../mocking/loginCredentials.json');

// use local login credentials if available
try {
    const loginCredentialsLocal = require('../mocking/loginCredentials.local.json');
    if (loginCredentialsLocal) loginCredentials = loginCredentialsLocal;
} catch {
    //ignore
}

describe('MWBot Request', function () {
    'use strict';
    this.timeout(10000);

    //////////////////////////////////////////
    // SUCCESSFUL                           //
    //////////////////////////////////////////

    it('successfully edits a page with custom request()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        try {
            const r2 = await bot.request({
                action: 'edit',
                title: 'Main_Page',
                text: '=Some Wikitext 2=',
                summary: 'Test Edit',
                token: bot.editToken,
            });
            expect(r2.edit.result).to.equal('Success');
        } catch (err) {
            assert.fail(err, 'Success', err);
        }
    });

    it('successfully updates a page with update()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);
        await bot.edit('Test Page', '=Some more Wikitext=', 'Test Upload');
        const response = await bot.update('Test Page', '=Some more Wikitext=');

        expect(response.edit.result).to.equal('Success');
        expect(bot.counter.fulfilled).to.equal(6);
    });
});
