import http from 'node:http';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
const { expect } = chai;

import MWBot from '../../src/index.js';

describe('MWBot rawRequest()', function () {
    let server;
    let baseUrl;
    let handler;
    let lastRequest;

    before(async function () {
        server = http.createServer((req, res) => {
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
                lastRequest = {
                    method: req.method,
                    url: req.url,
                    headers: req.headers,
                    body: Buffer.concat(chunks).toString(),
                };
                handler(req, res);
            });
        });
        await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
        baseUrl = `http://127.0.0.1:${server.address().port}/api.php`;
    });

    after(function () {
        server.close();
    });

    beforeEach(function () {
        lastRequest = undefined;
        handler = (req, res) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
        };
    });

    it('rejects when no URI is given and counts the failure', async function () {
        const bot = new MWBot();

        await expect(bot.rawRequest({})).to.be.rejectedWith('No URI provided!');
        expect(bot.counter.total).to.equal(1);
        expect(bot.counter.rejected).to.equal(1);
    });

    it('parses a JSON response', async function () {
        const bot = new MWBot();

        const response = await bot.rawRequest({ method: 'GET', uri: baseUrl });

        expect(response).to.deep.equal({ ok: true });
        expect(bot.counter.fulfilled).to.equal(1);
    });

    it('returns the raw text when the response is not JSON', async function () {
        handler = (req, res) => res.end('<html>not json</html>');
        const bot = new MWBot();

        const response = await bot.rawRequest({ method: 'GET', uri: baseUrl });

        expect(response).to.equal('<html>not json</html>');
    });

    it('appends query-string parameters to the URL', async function () {
        const bot = new MWBot();

        await bot.rawRequest({ method: 'GET', uri: baseUrl, qs: { action: 'query', titles: 'A B' } });

        expect(lastRequest.method).to.equal('GET');
        expect(lastRequest.url).to.equal('/api.php?action=query&titles=A+B');
    });

    it('sends the form as url-encoded POST body by default', async function () {
        const bot = new MWBot();

        await bot.rawRequest({ uri: baseUrl, form: { action: 'edit', text: 'a&b' } });

        expect(lastRequest.method).to.equal('POST');
        expect(lastRequest.headers['content-type']).to.include('application/x-www-form-urlencoded');
        expect(lastRequest.body).to.equal('action=edit&text=a%26b');
    });

    it('sends FormData as multipart body', async function () {
        const bot = new MWBot();
        const formData = new FormData();
        formData.append('action', 'upload');

        await bot.rawRequest({ uri: baseUrl, formData });

        expect(lastRequest.headers['content-type']).to.include('multipart/form-data; boundary=');
        expect(lastRequest.body).to.include('name="action"');
    });

    it('merges global and request headers, request headers win', async function () {
        const bot = new MWBot();
        bot.setGlobalRequestOptions({ headers: { 'X-Global': 'global', 'X-Shared': 'global' } });

        await bot.rawRequest({
            method: 'GET',
            uri: baseUrl,
            headers: { 'X-Shared': 'request' },
        });

        expect(lastRequest.headers['x-global']).to.equal('global');
        expect(lastRequest.headers['x-shared']).to.equal('request');
    });

    it('stores cookies from the response and sends them on the next request', async function () {
        handler = (req, res) => {
            res.setHeader('Set-Cookie', 'session=abc123; Path=/');
            res.end('{}');
        };
        const bot = new MWBot();

        await bot.rawRequest({ method: 'GET', uri: baseUrl });
        expect(lastRequest.headers.cookie).to.equal(undefined);

        await bot.rawRequest({ method: 'GET', uri: baseUrl });
        expect(lastRequest.headers.cookie).to.equal('session=abc123');
    });

    it('does not share cookies between bot instances', async function () {
        handler = (req, res) => {
            res.setHeader('Set-Cookie', 'session=abc123; Path=/');
            res.end('{}');
        };
        const bot1 = new MWBot();
        const bot2 = new MWBot();

        await bot1.rawRequest({ method: 'GET', uri: baseUrl });
        await bot2.rawRequest({ method: 'GET', uri: baseUrl });

        expect(lastRequest.headers.cookie).to.equal(undefined);
    });

    it('aborts after the configured timeout and counts the failure', async function () {
        handler = () => {
            // never respond
        };
        const bot = new MWBot();

        let error;
        try {
            await bot.rawRequest({ method: 'GET', uri: baseUrl, timeout: 50 });
        } catch (err) {
            error = err;
        }

        expect(error).to.be.an.instanceof(Error);
        expect(error.name).to.equal('AbortError');
        expect(bot.counter.rejected).to.equal(1);
        expect(bot.counter.fulfilled).to.equal(0);
    });

    it('rejects on a connection error and counts the failure', async function () {
        const bot = new MWBot();

        await expect(bot.rawRequest({ method: 'GET', uri: 'http://127.0.0.1:1/api.php' })).to.be.rejected;
        expect(bot.counter.rejected).to.equal(1);
    });
});
