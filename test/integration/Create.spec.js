'use strict';

const MWBot = require('../../src/');
//const log = require('semlog').log;
const crypto = require('crypto');
const semver = require('semver');

const chai = require('chai');
const expect = chai.expect;

const loginCredentials = require('../helpers/credentials');

describe('MWBot Create', function () {
    'use strict';
    this.timeout(10000);

    it('successfully creates a page with create()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        const r = await bot.create(
            crypto.randomBytes(20).toString('hex'),
            '=Some more Wikitext= [[Category:Test Page]]',
            'Test'
        );
        expect(r.edit.result).to.equal('Success');
        expect(r.warnings).to.equal(undefined);
    });

    it('rejects creating an existing page with create()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);
        const title = crypto.randomBytes(20).toString('hex');

        const r1 = await bot.create(title, 'Create Test', 'Test');
        expect(r1.edit.result).to.equal('Success');
        expect(r1.warnings).to.equal(undefined);

        const expected = semver.gte(bot.mwversion, '1.43.0')
            ? 'articleexists: The page you tried to create has been created already.'
            : 'articleexists: The article you tried to create has been created already.';

        await expect(bot.create(title, 'Create Test', 'Test')).to.be.rejectedWith(expected);
    });
});
