'use strict';

/*global describe, it*/

const MWBot = require('../src/');
//const log = require('semlog').log;

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

describe('MWBot Delete', function() {
    'use strict';
    this.timeout(10000);

    it('successfully deletes a page with delete()', async function() {
        let bot = new MWBot();
        const title = 'Page To Be Deleted';

        await bot.loginGetEditToken(loginCredentials.valid);
        await bot.create(
            title,
            'Test Page to be deleted.',
            'Test'
        );

        try {
            const r3 = await bot.delete(
                'Page To Be Deleted',
                'Delete Test'
            );
            expect(r3.delete.title).to.equal(title);
            expect(r3.delete.logid).to.be.above(0);
            expect(JSON.stringify(r3.warnings)).to.not.exist;
        } catch(err) {
            assert.fail(err,'Success',err);
        }
    });

    it('rejects deleting a non-existing page with delete()', async function() {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        try {
            await bot.delete(
                'Non-Existing Page',
                'Delete Test'
            );
            throw new Error('other error');
        } catch (err) {
            let expected = 'missingtitle';
            assert.equal(err.code, expected, err.code + ': ' + err.info + '\n\n' + err.response + '\n');
        }
    });

    it('rejects deleting a Special page with delete()', async function() {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        try {
            await bot.delete(
                'Special:RecentChanges',
                'Delete Test'
            );
            throw new Error('other error');
        } catch (err) {
            let expected = 'pagecannotexist';
            assert.equal(err.code, expected, err.code + ': ' + err.info + '\n\n' + err.response + '\n');
        }
    });

});
