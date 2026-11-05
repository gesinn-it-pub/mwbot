import MWBot from '../../src/index.js';

import * as chai from 'chai';
const expect = chai.expect;

import loginCredentials from '../helpers/credentials.js';

describe('MWBot Request', function () {
    this.timeout(10000);

    //////////////////////////////////////////
    // SUCCESSFUL                           //
    //////////////////////////////////////////

    it('successfully edits a page with custom request()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        const r2 = await bot.request({
            action: 'edit',
            title: 'Main_Page',
            text: '=Some Wikitext 2=',
            summary: 'Test Edit',
            token: bot.editToken,
        });
        expect(r2.edit.result).to.equal('Success');
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
