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
    //ignore
}

describe('MWBot Request', function() {
    'use strict';
    this.timeout(10000);

    //////////////////////////////////////////
    // SUCCESSFUL                           //
    //////////////////////////////////////////

    it('successfully executes a raw HTTP request', async function() {
        let bot = new MWBot();

        try {
            const response = await bot.rawRequest({
                method: 'GET',
                uri: 'https://jsonplaceholder.typicode.com/comments',
                json: true,
                qs: {
                    postId: 1
                }
            });
            expect(response).to.be.instanceof(Array);
            expect(response[0]).to.be.instanceof(Object);
            expect(response[0].postId).to.equal(1);
        } catch(err) {
            log(err);
        }
    });

    it('successfully edits a page with custom request()', async function () {
        let bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        try {
            const r2 = await bot.request({
                action: 'edit',
                title: 'Main_Page',
                text: '=Some Wikitext 2=',
                summary: 'Test Edit',
                token: bot.editToken
            });
            expect(r2.edit.result).to.equal('Success');
        } catch (err) {
            assert.fail(err,'Success',err);
        }
    });

    it('successfully updates a page with update()', function() {
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.edit('Test Page', '=Some more Wikitext=', 'Test Upload');
        }).then(() => {
            return bot.update('Test Page', '=Some more Wikitext=');
        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
            expect(bot.counter.fulfilled).to.equal(6);
        }).catch((err) => {
            log(err);
        });
    });

});
