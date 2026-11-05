import MWBot from '../../src/index.js';
import crypto from 'node:crypto';

import * as chai from 'chai';
const expect = chai.expect;

import loginCredentials from '../helpers/credentials.js';

describe('MWBot Delete', function () {
    this.timeout(10000);

    it('successfully deletes a page with delete()', async function () {
        const bot = new MWBot();
        const title = 'Page To Be Deleted ' + crypto.randomBytes(8).toString('hex');

        await bot.loginGetEditToken(loginCredentials.valid);
        await bot.create(title, 'Test Page to be deleted.', 'Test');

        const r3 = await bot.delete(title, 'Delete Test');
        expect(r3.delete.title).to.equal(title);
        expect(r3.delete.logid).to.be.above(0);
        expect(r3.warnings).to.equal(undefined);
    });

    it('rejects deleting a non-existing page with delete()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        await expect(bot.delete('Non-Existing Page', 'Delete Test')).to.be.rejected.and.eventually.have.property(
            'code',
            'missingtitle'
        );
    });

    it('rejects deleting a Special page with delete()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        await expect(bot.delete('Special:RecentChanges', 'Delete Test')).to.be.rejected.and.eventually.have.property(
            'code',
            'pagecannotexist'
        );
    });
});
