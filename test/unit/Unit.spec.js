import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const { expect } = chai;

import MWBot from '../../src/index.js';

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
    it('rejects with invalidjson when response is not an object', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, 'not json');

        await expect(bot.request({ action: 'query' })).to.be.rejectedWith('invalidjson');
    });

    it('rejects and exposes code/info when response.error is set', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { error: { code: 'permissiondenied', info: 'Action requires login' } });

        let err;
        try {
            await bot.request({ action: 'edit' });
        } catch (e) {
            err = e;
        }

        expect(err, 'should have rejected').to.be.instanceof(Error);
        expect(err.code).to.equal('permissiondenied');
        expect(err.info).to.equal('Action requires login');
        expect(err.errorResponse).to.equal(true);
        expect(err.request).to.be.an('object');
    });

    it('resolves with the response body on success', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { pages: { 1: { title: 'Main Page' } } } });

        const response = await bot.request({ action: 'query' });
        expect(response.query.pages[1].title).to.equal('Main Page');
    });

    it('rejects with transport error when rawRequest rejects', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.rawRequest = () => Promise.reject(new Error('ECONNREFUSED'));

        await expect(bot.request({ action: 'query' })).to.be.rejectedWith('ECONNREFUSED');
    });
});

// ============================================================
// rawRequest()
// ============================================================
describe('MWBot rawRequest()', function () {
    it('rejects when no URI is provided', async function () {
        const bot = new MWBot();
        // no uri in requestOptions → rejection
        await expect(bot.rawRequest({})).to.be.rejectedWith('No URI provided!');
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
    it('rejects when apiUrl is missing', async function () {
        const bot = new MWBot();
        await expect(bot.login({ username: 'Bot', password: 'pass' })).to.be.rejectedWith(
            'Incomplete login credentials!'
        );
    });

    it('rejects when username is missing', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        await expect(bot.login({ password: 'pass', apiUrl: API_URL })).to.be.rejectedWith(
            'Incomplete login credentials!'
        );
    });

    it('rejects when first response has no login object', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, {}); // response without query.tokens.logintoken

        await expect(bot.login({ username: 'Bot', password: 'pass', apiUrl: API_URL })).to.be.rejectedWith(
            'Invalid response from API'
        );
    });

    it('rejects with reason when login result is not Success', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(bot, { query: { tokens: { logintoken: 'abc123' } } }, { login: { result: 'WrongPassword' } });

        await expect(bot.login({ username: 'Bot', password: 'wrong', apiUrl: API_URL })).to.be.rejectedWith(
            'Could not login: WrongPassword'
        );
    });

    it('resolves and sets loggedIn=true on successful login', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(
            bot,
            { query: { tokens: { logintoken: 'abc123' } } },
            { login: { result: 'Success', lguserid: 1, lgusername: 'TestBot' } },
            { query: { general: { generator: 'MediaWiki 1.43.0', sitename: 'TestWiki' } } }
        );

        const state = await bot.login({ username: 'TestBot', password: 'pass', apiUrl: API_URL });
        expect(bot.loggedIn).to.equal(true);
        expect(state.lgusername).to.equal('TestBot');
    });

    it('rejects when MediaWiki version cannot be parsed', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(
            bot,
            { query: { tokens: { logintoken: 'abc' } } },
            { login: { result: 'Success', lguserid: 1 } },
            { query: { general: { generator: 'not-a-version', sitename: 'Wiki' } } }
        );

        await expect(bot.login({ username: 'Bot', password: 'pass', apiUrl: API_URL })).to.be.rejectedWith(
            'Invalid MediaWiki version'
        );
    });
});

// ============================================================
// getSiteinfo()
// ============================================================
describe('MWBot getSiteinfo()', function () {
    it('resolves and merges query.general into state', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { general: { generator: 'MediaWiki 1.43.0', sitename: 'TestWiki' } } });

        const state = await bot.getSiteinfo();
        expect(state.generator).to.equal('MediaWiki 1.43.0');
        expect(state.sitename).to.equal('TestWiki');
    });

    it('rejects when query.general is missing from response', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: {} });

        await expect(bot.getSiteinfo()).to.be.rejectedWith('Could not get siteinfo');
    });

    it('rejects when query is missing from response', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, {});

        await expect(bot.getSiteinfo()).to.be.rejectedWith('Could not get siteinfo');
    });
});

// ============================================================
// getEditToken()
// ============================================================
describe('MWBot getEditToken()', function () {
    it('resolves immediately when editToken is already set', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'existing+\\';
        bot.rawRequest = () => {
            throw new Error('should not be called');
        };

        const state = await bot.getEditToken();
        expect(state).to.equal(bot.state);
    });

    it('fetches, stores and resolves with csrf token', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: { csrftoken: 'csrf+\\' } } });

        await bot.getEditToken();
        expect(bot.editToken).to.equal('csrf+\\');
    });

    it('rejects when csrftoken is absent from response', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: {} } });

        await expect(bot.getEditToken()).to.be.rejectedWith('Could not get edit token');
    });

    it('rejects when query.tokens is absent from response', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: {} });

        await expect(bot.getEditToken()).to.be.rejectedWith('Could not get edit token');
    });
});

// ============================================================
// getCreateaccountToken()
// ============================================================
describe('MWBot getCreateaccountToken()', function () {
    it('resolves immediately when createaccountToken is already set', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.createaccountToken = 'existing+\\';
        bot.rawRequest = () => {
            throw new Error('should not be called');
        };

        const state = await bot.getCreateaccountToken();
        expect(state).to.equal(bot.state);
    });

    it('fetches, stores and resolves with createaccount token', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: { createaccounttoken: 'ca+\\' } } });

        await bot.getCreateaccountToken();
        expect(bot.createaccountToken).to.equal('ca+\\');
    });

    it('rejects when createaccounttoken is absent from response', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRaw(bot, { query: { tokens: {} } });

        await expect(bot.getCreateaccountToken()).to.be.rejectedWith('Could not get createaccount token');
    });
});

// ============================================================
// loginGetCreateaccountToken()
// ============================================================
describe('MWBot loginGetCreateaccountToken()', function () {
    it('logs in and then fetches the createaccount token', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        mockRawSequence(
            bot,
            { query: { tokens: { logintoken: 'abc' } } },
            { login: { result: 'Success', lguserid: 1, lgusername: 'Bot' } },
            { query: { general: { generator: 'MediaWiki 1.43.0' } } },
            { query: { tokens: { createaccounttoken: 'ca+\\' } } }
        );

        await bot.loginGetCreateaccountToken({ username: 'Bot', password: 'pass', apiUrl: API_URL });
        expect(bot.loggedIn).to.equal(true);
        expect(bot.createaccountToken).to.equal('ca+\\');
    });
});

// ============================================================
// logout()
// ============================================================
describe('MWBot logout()', function () {
    it('calls action=logout and resets state when editToken is already set', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.loggedIn = true;
        bot.editToken = 'csrf+\\';
        bot.state = { lgusername: 'TestBot' };
        mockRaw(bot, { logout: {} });

        await bot.logout();
        expect(bot.loggedIn).to.equal(false);
        expect(bot.editToken).to.equal(false);
        expect(bot.state).to.deep.equal({});
    });

    it('fetches a CSRF token first when editToken is not set', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.loggedIn = true;
        bot.state = { lgusername: 'TestBot' };
        mockRawSequence(bot, { query: { tokens: { csrftoken: 'csrf+\\' } } }, { logout: {} });

        await bot.logout();
        expect(bot.loggedIn).to.equal(false);
        expect(bot.editToken).to.equal(false);
    });
});

// ============================================================
// createProtect() / editProtect()
// ============================================================
describe('MWBot createProtect() / editProtect()', function () {
    it('createProtect calls create then protect', async function () {
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

        await bot.createProtect('TestPage', 'content', 'summary');
        expect(calls).to.deep.equal(['edit', 'protect']);
    });

    it('editProtect calls edit then protect', async function () {
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

        await bot.editProtect('TestPage', 'updated content', 'summary');
        expect(calls).to.deep.equal(['edit', 'protect']);
    });

    it('createProtect rejects when create fails', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'csrf+\\';
        mockRaw(bot, {
            error: { code: 'articleexists', info: 'The article you tried to create has been created already.' },
        });

        await expect(bot.createProtect('TestPage', 'content')).to.be.rejectedWith('articleexists');
    });

    // Regression: editProtect/createProtect used to return only the protect response, discarding
    // the edit response entirely.  The batch() status logic checks response.edit.new / response.edit.newrevid
    // to decide between [+] / [C] / [=].  Without the edit data, every editProtect job was
    // logged as [=] (no-change) regardless of whether the page was actually created or updated —
    // making it impossible to diagnose silent upload failures on a fresh wiki.

    it('editProtect resolves with combined response including edit.new for new pages', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'csrf+\\';

        bot.rawRequest = (opts) => {
            if (opts.form.action === 'edit') {
                return Promise.resolve({ edit: { result: 'Success', new: '', newrevid: 42 } });
            }
            return Promise.resolve({ protect: { title: 'TestPage', protections: [] } });
        };

        const response = await bot.editProtect('TestPage', 'content', 'summary');
        expect(response).to.have.property('protect');
        expect(response).to.have.nested.property('edit.new', '');
        expect(response).to.have.nested.property('edit.newrevid', 42);
    });

    it('editProtect resolves with combined response including edit.newrevid for existing pages', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'csrf+\\';

        bot.rawRequest = (opts) => {
            if (opts.form.action === 'edit') {
                return Promise.resolve({ edit: { result: 'Success', newrevid: 99 } });
            }
            return Promise.resolve({ protect: { title: 'TestPage', protections: [] } });
        };

        const response = await bot.editProtect('TestPage', 'updated content', 'summary');
        expect(response).to.have.property('protect');
        expect(response).to.have.nested.property('edit.newrevid', 99);
    });

    it('createProtect resolves with combined response including edit.new for new pages', async function () {
        const bot = new MWBot({ apiUrl: API_URL });
        bot.editToken = 'csrf+\\';

        bot.rawRequest = (opts) => {
            if (opts.form.action === 'edit') {
                return Promise.resolve({ edit: { result: 'Success', new: '', newrevid: 55 } });
            }
            return Promise.resolve({ protect: { title: 'TestPage', protections: [] } });
        };

        const response = await bot.createProtect('TestPage', 'content', 'summary');
        expect(response).to.have.property('protect');
        expect(response).to.have.nested.property('edit.new', '');
        expect(response).to.have.nested.property('edit.newrevid', 55);
    });
});

// ---------------------------------------------------------------------------
// batch() operation whitelist
// ---------------------------------------------------------------------------

describe('MWBot batch() operations', function () {
    it('rejects with an Error for an unsupported operation', async function () {
        const bot = new MWBot({ apiUrl: API_URL, silent: true });

        await expect(bot.batch([['noSuchOperation', 'TestPage']])).to.be.rejectedWith(
            'Unsupported operation: noSuchOperation'
        );
    });

    it('does not allow invoking methods that are not batch operations', async function () {
        const bot = new MWBot({ apiUrl: API_URL, silent: true });

        await expect(bot.batch([['logout', 'TestPage']])).to.be.rejectedWith('Unsupported operation: logout');
        await expect(bot.batch([['constructor', 'TestPage']])).to.be.rejectedWith('Unsupported operation: constructor');
    });

    it('aborts the batch on a badtoken error without logging the edit token', async function () {
        const bot = new MWBot({ apiUrl: API_URL, silent: true });
        bot.editToken = 'secret-token+\\';
        bot.edit = async () => {
            const err = new Error('badtoken: Invalid CSRF token.');
            err.response = { error: { code: 'badtoken', info: 'Invalid CSRF token.' } };
            throw err;
        };
        const logged = [];
        const originalLog = console.log;
        console.log = (...args) => logged.push(args.join(' '));

        let rejection;
        try {
            await bot.batch([['edit', 'TestPage', 'content']], undefined, 1);
        } catch (err) {
            rejection = err;
        } finally {
            console.log = originalLog;
        }

        // batch rejects with the (empty) results object, not with an Error
        expect(rejection).to.not.be.instanceof(Error);
        expect(rejection).to.deep.equal({});
        expect(logged.join('\n')).to.not.include('secret-token');
    });

    it('invokes a supported operation with the job arguments', async function () {
        const bot = new MWBot({ apiUrl: API_URL, silent: true });
        const calls = [];
        bot.delete = async (...args) => {
            calls.push(args);
            return { delete: { title: args[0] } };
        };

        const results = await bot.batch([['delete', 'TestPage', 'some reason']]);

        expect(calls).to.deep.equal([['TestPage', 'some reason', undefined, undefined]]);
        expect(results).to.have.nested.property('delete.TestPage.delete.title', 'TestPage');
    });
});
