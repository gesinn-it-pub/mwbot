'use strict';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const { expect } = chai;

const MWBot = require('../src/');

const API_URL = 'http://example.com/api.php';

/**
 * Replaces bot.rawRequest with a stub that resolves once with the given body.
 */
function mockRaw(bot, body) {
    bot.rawRequest = () => Promise.resolve(body);
}

/**
 * Replaces bot.rawRequest with a stub that returns successive responses per call.
 */
function mockRawSequence(bot, ...bodies) {
    let i = 0;
    bot.rawRequest = () => {
        if (i >= bodies.length) {
            return Promise.reject(new Error('mockRawSequence: unexpected extra call'));
        }
        return Promise.resolve(bodies[i++]);
    };
}

// ============================================================
// request()
// ============================================================
describe('MWBot request()', function () {
    it('rejects with invalidjson when response is not an object', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, 'not json');

        return expect(bot.request({ action: 'query' })).to.be.rejectedWith('invalidjson');
    });

    it('rejects and exposes code/info when response.error is set', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { error: { code: 'permissiondenied', info: 'Action requires login' } });

        return bot.request({ action: 'edit' }).then(
            () => {
                throw new Error('should have rejected');
            },
            (err) => {
                expect(err).to.be.instanceof(Error);
                expect(err.code).to.equal('permissiondenied');
                expect(err.info).to.equal('Action requires login');
                expect(err.errorResponse).to.equal(true);
                expect(err.request).to.be.an('object');
            }
        );
    });

    it('resolves with the response body on success', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { pages: { 1: { title: 'Main Page' } } } });

        return bot.request({ action: 'query' }).then((response) => {
            expect(response.query.pages[1].title).to.equal('Main Page');
        });
    });

    it('rejects with transport error when rawRequest rejects', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.rawRequest = () => Promise.reject(new Error('ECONNREFUSED'));

        return expect(bot.request({ action: 'query' })).to.be.rejectedWith('ECONNREFUSED');
    });
});

// ============================================================
// rawRequest()
// ============================================================
describe('MWBot rawRequest()', function () {
    it('rejects when no URI is provided', function () {
        const bot = new MWBot();
        // no uri in requestOptions → rejection
        return expect(bot.rawRequest({})).to.be.rejectedWith('No URI provided!');
    });

    it('increments the total counter on each call', function () {
        const bot = new MWBot();
        const before = bot.counter.total;
        // even a failing call increments total
        bot.rawRequest({}).catch(() => {});
        expect(bot.counter.total).to.equal(before + 1);
    });
});

// ============================================================
// login()
// ============================================================
describe('MWBot login()', function () {
    it('rejects when apiUrl is missing', function () {
        const bot = new MWBot();
        return expect(bot.login({ username: 'Bot', password: 'pass' })).to.be.rejectedWith(
            'Incomplete login credentials!'
        );
    });

    it('rejects when username is missing', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        return expect(bot.login({ password: 'pass', apiUrl: API_URL })).to.be.rejectedWith(
            'Incomplete login credentials!'
        );
    });

    it('rejects when first response has no login object', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, {}); // response without login field

        return expect(bot.login({ username: 'Bot', password: 'pass', apiUrl: API_URL })).to.be.rejectedWith(
            'Invalid response from API'
        );
    });

    it('rejects with reason when login result is not Success', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(
            bot,
            { login: { result: 'NeedToken', token: 'abc123' } },
            { login: { result: 'WrongPassword' } }
        );

        return expect(bot.login({ username: 'Bot', password: 'wrong', apiUrl: API_URL })).to.be.rejectedWith(
            'Could not login: WrongPassword'
        );
    });

    it('resolves and sets loggedIn=true on successful login', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(
            bot,
            { login: { result: 'NeedToken', token: 'abc123' } },
            { login: { result: 'Success', lguserid: 1, lgusername: 'TestBot' } },
            { query: { general: { generator: 'MediaWiki 1.43.0', sitename: 'TestWiki' } } }
        );

        return bot.login({ username: 'TestBot', password: 'pass', apiUrl: API_URL }).then((state) => {
            expect(bot.loggedIn).to.equal(true);
            expect(state.lgusername).to.equal('TestBot');
        });
    });

    it('rejects when MediaWiki version cannot be parsed', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(
            bot,
            { login: { result: 'NeedToken', token: 'abc' } },
            { login: { result: 'Success', lguserid: 1 } },
            { query: { general: { generator: 'not-a-version', sitename: 'Wiki' } } }
        );

        return expect(bot.login({ username: 'Bot', password: 'pass', apiUrl: API_URL })).to.be.rejectedWith(
            'Invalid MediaWiki version'
        );
    });
});

// ============================================================
// getSiteinfo()
// ============================================================
describe('MWBot getSiteinfo()', function () {
    it('resolves and merges query.general into state', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { general: { generator: 'MediaWiki 1.43.0', sitename: 'TestWiki' } } });

        return bot.getSiteinfo().then((state) => {
            expect(state.generator).to.equal('MediaWiki 1.43.0');
            expect(state.sitename).to.equal('TestWiki');
        });
    });

    it('rejects when query.general is missing from response', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: {} });

        return expect(bot.getSiteinfo()).to.be.rejectedWith('Could not get siteinfo');
    });

    it('rejects when query is missing from response', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, {});

        return expect(bot.getSiteinfo()).to.be.rejectedWith('Could not get siteinfo');
    });
});

// ============================================================
// getEditToken()
// ============================================================
describe('MWBot getEditToken()', function () {
    it('resolves immediately when editToken is already set', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'existing+\\';
        bot.rawRequest = () => {
            throw new Error('should not be called');
        };

        return bot.getEditToken().then((state) => {
            expect(state).to.equal(bot.state);
        });
    });

    it('fetches, stores and resolves with csrf token', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: { csrftoken: 'csrf+\\' } } });

        return bot.getEditToken().then(() => {
            expect(bot.editToken).to.equal('csrf+\\');
        });
    });

    it('rejects when csrftoken is absent from response', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: {} } });

        return expect(bot.getEditToken()).to.be.rejectedWith('Could not get edit token');
    });

    it('rejects when query.tokens is absent from response', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: {} });

        return expect(bot.getEditToken()).to.be.rejectedWith('Could not get edit token');
    });
});

// ============================================================
// getCreateaccountToken()
// ============================================================
describe('MWBot getCreateaccountToken()', function () {
    it('resolves immediately when createaccountToken is already set', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.createaccountToken = 'existing+\\';
        bot.rawRequest = () => {
            throw new Error('should not be called');
        };

        return bot.getCreateaccountToken().then((state) => {
            expect(state).to.equal(bot.state);
        });
    });

    it('fetches, stores and resolves with createaccount token', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: { createaccounttoken: 'ca+\\' } } });

        return bot.getCreateaccountToken().then(() => {
            expect(bot.createaccountToken).to.equal('ca+\\');
        });
    });

    it('rejects when createaccounttoken is absent from response', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: {} } });

        return expect(bot.getCreateaccountToken()).to.be.rejectedWith('Could not get createaccount token');
    });
});

// ============================================================
// loginGetCreateaccountToken()
// ============================================================
describe('MWBot loginGetCreateaccountToken()', function () {
    it('logs in and then fetches the createaccount token', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(
            bot,
            { login: { result: 'NeedToken', token: 'abc' } },
            { login: { result: 'Success', lguserid: 1, lgusername: 'Bot' } },
            { query: { general: { generator: 'MediaWiki 1.43.0' } } },
            { query: { tokens: { createaccounttoken: 'ca+\\' } } }
        );

        return bot.loginGetCreateaccountToken({ username: 'Bot', password: 'pass', apiUrl: API_URL }).then(() => {
            expect(bot.loggedIn).to.equal(true);
            expect(bot.createaccountToken).to.equal('ca+\\');
        });
    });
});

// ============================================================
// createProtect() / editProtect()
// ============================================================
describe('MWBot createProtect() / editProtect()', function () {
    it('createProtect calls create then protect', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'csrf+\\';

        const calls = [];
        bot.rawRequest = (opts) => {
            calls.push(opts.form.action);
            if (opts.form.action === 'edit') {
                return Promise.resolve({ edit: { result: 'Success', new: '' } });
            }
            return Promise.resolve({ protect: { title: 'TestPage', protections: [] } });
        };

        return bot.createProtect('TestPage', 'content', 'summary').then(() => {
            expect(calls).to.deep.equal(['edit', 'protect']);
        });
    });

    it('editProtect calls edit then protect', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'csrf+\\';

        const calls = [];
        bot.rawRequest = (opts) => {
            calls.push(opts.form.action);
            if (opts.form.action === 'edit') {
                return Promise.resolve({ edit: { result: 'Success', newrevid: 42 } });
            }
            return Promise.resolve({ protect: { title: 'TestPage', protections: [] } });
        };

        return bot.editProtect('TestPage', 'updated content', 'summary').then(() => {
            expect(calls).to.deep.equal(['edit', 'protect']);
        });
    });

    it('createProtect rejects when create fails', function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'csrf+\\';
        mockRaw(bot, {
            error: { code: 'articleexists', info: 'The article you tried to create has been created already.' },
        });

        return expect(bot.createProtect('TestPage', 'content')).to.be.rejectedWith('articleexists');
    });
});
