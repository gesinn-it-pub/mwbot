'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;

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

describe('MWBot Read', function() {
    'use strict';
    this.timeout(10000);

    it('successfully reads a page with read()', async function() {
        let bot = new MWBot();

        const r1 = await bot.login(loginCredentials.valid);

        try {
            const r2 = await bot.read('Main Page');
            // log(r2);
            expect(r2).to.have.any.keys('query');
            expect(r2.query).to.have.any.keys('pages');
            expect(Object.keys(r2.query.pages).length).to.equal(1);
            expect(r2.query.pages).to.have.any.keys('1');
            expect(r2.query.pages['1']).to.have.any.keys('revisions');
            expect(JSON.stringify(r2.warnings)).to.not.exist;
            // log('Fetched Content:\n' + r2.query.pages['1']['revisions'][0]['*']);
        } catch(err) {
            log(err)
            assert.fail(err,'Success',err)
        }
    });

    it('successfully reads a page with readFromID()', async function() {
        let bot = new MWBot();

        const r1 = await bot.login(loginCredentials.valid);

        try {
            const r2 = await bot.readFromID(1);
            // log(r2);
            expect(r2).to.have.any.keys('query');
            expect(r2.query).to.have.any.keys('pages');
            expect(Object.keys(r2.query.pages).length).to.equal(1);
            expect(r2.query.pages).to.have.any.keys('1');
            expect(r2.query.pages['1']).to.have.any.keys('revisions');
            expect(JSON.stringify(r2.warnings)).to.not.exist;
            // log('Fetched Content:\n' + r2.query.pages['1']['revisions'][0]['*']);
        } catch(err) {
            log(err)
            assert.fail(err,'Success',err)
        }
    });

    it('successfully reads multiple pages with read()', async function() {
        let bot = new MWBot();

        const r1 = await bot.login(loginCredentials.valid);

        try {
            const r2 = await bot.read('Main_Page|MediaWiki:Sidebar');
            expect(r2).to.have.any.keys('query');
            expect(r2.query).to.have.any.keys('pages');
            expect(Object.keys(r2.query.pages).length).to.equal(2);
            expect(JSON.stringify(r2.warnings)).to.not.exist;
        } catch(err) {
            assert.fail(err,'Success',err)
        }
    });

    it('rejects reading a non-existing page with read()', async function() {
        let bot = new MWBot();

        const r1 = await bot.login(loginCredentials.valid);

        try {
            const r2 = await bot.read('Non-Existing Page');
            expect(r2).to.have.any.keys('query');
            expect(r2.query).to.have.any.keys('pages');
            expect(Object.keys(r2.query.pages).length).to.equal(1);
            expect(r2.query.pages).to.have.any.keys('-1');
            expect(JSON.stringify(r2.warnings)).to.not.exist;
        } catch(err) {
            log(err)
            assert.fail(err,'Success',err)
        }
    })

});
