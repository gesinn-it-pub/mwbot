import MWBot from '../../src/index.js';

import chai from 'chai';
const expect = chai.expect;

import loginCredentials from '../helpers/credentials.js';

describe('MWBot Read', function () {
    this.timeout(10000);

    it('successfully reads a page with read()', async function () {
        const bot = new MWBot();

        await bot.login(loginCredentials.valid);

        const r2 = await bot.read('Main Page');
        // log(r2);
        expect(r2).to.have.any.keys('query');
        expect(r2.query).to.have.any.keys('pages');
        expect(Object.keys(r2.query.pages).length).to.equal(1);
        expect(r2.query.pages).to.have.any.keys('1');
        expect(r2.query.pages['1']).to.have.any.keys('revisions');
        expect(r2.warnings).to.equal(undefined);
        // log('Fetched Content:\n' + r2.query.pages['1']['revisions'][0]['*']);
    });

    it('successfully reads a page read() with a custom timeout', async function () {
        this.timeout(3000);
        const bot = new MWBot();

        await bot.login(loginCredentials.valid);
        const response = await bot.read('Test Page', undefined, { timeout: 8000 });

        expect(response).to.have.any.keys('query');
        expect(response.query).to.have.any.keys('pages');
    });

    it('successfully reads a page with readFromID()', async function () {
        const bot = new MWBot();

        await bot.login(loginCredentials.valid);

        const r2 = await bot.readFromID(1);
        // log(r2);
        expect(r2).to.have.any.keys('query');
        expect(r2.query).to.have.any.keys('pages');
        expect(Object.keys(r2.query.pages).length).to.equal(1);
        expect(r2.query.pages).to.have.any.keys('1');
        expect(r2.query.pages['1']).to.have.any.keys('revisions');
        expect(r2.warnings).to.equal(undefined);
        // log('Fetched Content:\n' + r2.query.pages['1']['revisions'][0]['*']);
    });

    it('successfully reads multiple pages with read()', async function () {
        const bot = new MWBot();

        await bot.login(loginCredentials.valid);

        const r2 = await bot.read('Main_Page|MediaWiki:Sidebar');
        expect(r2).to.have.any.keys('query');
        expect(r2.query).to.have.any.keys('pages');
        expect(Object.keys(r2.query.pages).length).to.equal(2);
        expect(r2.warnings).to.equal(undefined);
    });

    it('rejects reading a non-existing page with read()', async function () {
        const bot = new MWBot();

        await bot.login(loginCredentials.valid);

        const r2 = await bot.read('Non-Existing Page');
        expect(r2).to.have.any.keys('query');
        expect(r2.query).to.have.any.keys('pages');
        expect(Object.keys(r2.query.pages).length).to.equal(1);
        expect(r2.query.pages).to.have.any.keys('-1');
        expect(r2.warnings).to.equal(undefined);
    });
});
