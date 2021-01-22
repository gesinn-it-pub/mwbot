'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const log = require('semlog').log;
const crypto = require('crypto');

const chai = require('chai');
const expect = chai.expect;


const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Request', function() {

    'use strict';


    //////////////////////////////////////////
    // SUCESSFULL                           //
    //////////////////////////////////////////

    it('successfully executes a raw HTTP request', function() {
        let bot = new MWBot();

        bot.rawRequest({
            method: 'GET',
            uri: 'https://jsonplaceholder.typicode.com/comments',
            json: true,
            qs: {
                postId: 1
            }
        }).then((response) => {
            expect(response).to.be.instanceof(Array);
            expect(response[0]).to.be.instanceof(Object);
            expect(response[0].postId).to.equal(1);
        }).catch((err) => {
            log(err);
        });
    });

    it('successfully editing a page with custom request()', function() {
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.request({
                action: 'edit',
                title: 'Main_Page',
                text: '=Some Wikitext 2=',
                summary: 'Test Edit',
                token: bot.editToken
            });
        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
        }).catch((err) => {
            log(err);
        });
    });


    it('successfully creates a page with create()', function() {
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.create(crypto.randomBytes(20).toString('hex'), '=Some more Wikitext= [[Category:Test Page]]', 'Test Upload');
        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
        }).catch((err) => {
            log(err);
        });
    });

    it('successfully reads a page with read()', function() {
        let bot = new MWBot();

        bot.login(loginCredentials.valid).then(() => {
            return bot.read('Main Page');
        }).then((response) => {
            expect(response).to.have.any.keys('query');
            expect(response.query).to.have.any.keys('pages');
            expect(Object.keys(response.query.pages).length).to.equal(1);
            expect(response.query.pages).to.have.any.keys('1');
            expect(response.query.pages['1']).to.have.any.keys('revisions');
            log('Fetched Content: ' + response.query.pages['1']['revisions'][0]['*']);
        }).catch((err) => {
            log(err);
        });
    });

    it('successfully reads multiple pages with read()', function() {
        let bot = new MWBot();

        bot.login(loginCredentials.valid).then(() => {
            return bot.read('Main Page|MediaWiki:Sidebar');
        }).then((response) => {
            expect(response).to.have.any.keys('query');
            expect(response.query).to.have.any.keys('pages');
            expect(Object.keys(response.query.pages).length).to.equal(2);
        }).catch((err) => {
            log(err);
        });
    });

    it('successfully reads a page read() with stacked promises', function() {
        this.timeout(3000);
        let bot = new MWBot();

        bot.login(loginCredentials.valid).then(() => {
            bot.read('Test Page', {timeout: 8000}).then((response) => {
                expect(response).to.have.any.keys('query');
                expect(response.query).to.have.any.keys('pages');
            }).catch((err) => {
                log(err);
            });
        }).catch((err) => {
            log(err);
        });
    });

    it('successfully updates a page with update()', function() {
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.edit('Test Page', '=Some more Wikitext=', 'Test Upload');
        }).then(() => {
            return bot.update('Test Page', '=Some more Wikitext=');
        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
            expect(bot.counter.fulfilled).to.equal(5);
        }).catch((err) => {
            log(err);
        });
    });


    it('successfully editing a page with edit()', function() {
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.edit('Test Page', '=Some more Wikitext=', 'Some summary');
        }).then(() => {
            return bot.edit('Test Page', '=Some more Wikitext=');
        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
        });
    });


    it('successfully deletes a page with delete()', function() {
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.delete('Test Page', 'Test Reasons');
        }).then((response) => {
            expect(response.delete.logid).to.be.a.number;
        });
    });

    it('successfully uploads and overwrites an image with uploadOverwrite()', function() {
        this.timeout(3000);
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.uploadOverwrite('ExampleImage.png', __dirname + '/mocking/example2.png', 'Test Reasons');
        }).then((response) => {
            expect(response.upload.result).to.equal('Success');
        }).catch((e) => {
            log(e);
        });
    });

    it('successfully uploads without providing a filename with upload()', function() {
        this.timeout(3000);
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.upload(false, __dirname + '/mocking/example1.png');
        }).then((response) => {
            expect(response.upload.result).to.equal('Warning');
        }).catch((e) => {
            log(e);
        });
    });

    it('successfully skips an upload of an image duplicate with upload()', function() {
        this.timeout(3000);
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.upload('ExampleImage.png', __dirname + '/mocking/example1.png', 'Test Reasons');
        }).then((response) => {
            expect(response.upload.result).to.equal('Warning');
        });
    });


    //////////////////////////////////////////
    // UNSUCESSFULL                         //
    //////////////////////////////////////////

    it('rejects deleting a non-existing page with delete()', function() {
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.delete('Non-Existing Page', 'Test Reasons');
        }).catch((e) => {
            expect(e).to.be.an.instanceof(Error);
            expect(e.message).to.include('missingtitle');
        });
    });

    it('cannot edit a page without providing API URL / Login', function() {
        new MWBot().edit('Main Page', '=Some more Wikitext=', 'Test Upload').catch((e) => {
            expect(e).to.be.an.instanceof(Error);
            expect(e.message).to.include('No URI');
        });
    });

    it('rejects to upload a non-existing file with upload()', function() {
        this.timeout(3000);
        let bot = new MWBot();

        bot.loginGetEditToken(loginCredentials.valid).then(() => {
            return bot.upload(false, __dirname + '/mocking/NonExistingImage.png');
        }).catch((e) => {
            expect(e).to.be.an.instanceof(Error);
            expect(e.message).to.include('ENOENT');
        });
    });

});
