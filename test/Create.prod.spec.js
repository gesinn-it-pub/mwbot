'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;
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
}

describe('MWBot Create', function() {
    'use strict';
    this.timeout(10000);

    it('successfully creates a page with create()', async function() {
        let bot = new MWBot();

        const r1 = await bot.loginGetEditToken(loginCredentials.valid);

        try {
            const r2 = await bot.create(
                crypto.randomBytes(20).toString('hex'),
                '=Some more Wikitext= [[Category:Test Page]]',
                'Test'
            );
            expect(r2.edit.result).to.equal('Success');
            expect(JSON.stringify(r2.warnings)).to.not.exist;
        } catch(err) {
            assert.fail(err,'Success',err)
        }
    });

    it('rejects creating an existing page with create()', async function() {
        let bot = new MWBot();

        const r1 = await bot.loginGetEditToken(loginCredentials.valid);
        const title = crypto.randomBytes(20).toString('hex');

        try {
            const r2 = await bot.create(
                title,
                'Create Test',
                'Test'
            );
            expect(r2.edit.result).to.equal('Success');
            expect(JSON.stringify(r2.warnings)).to.not.exist;
        } catch(err) {
            assert.fail(err,'Success',err)
        }

        try {
            const r3 = await bot.create(
                title,
                'Create Test',
                'Test'
            );
            throw new Error('other error');
        } catch(err) {
            let expected = 'articleexists: The article you tried to create has been created already.';
            assert.equal(err.message, expected);
        }
    });

});
