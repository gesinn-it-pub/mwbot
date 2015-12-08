'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

const loginCredentials = require('./mocking/loginCredentials.json');

describe('MWBot Request', function() {

    it('successfully editing a page with request()', function(done) {

        let bot = new MWBot();

        bot.login(loginCredentials.valid).then(() => {
            return bot.request({
                action: 'edit',
                title: 'Main_Page',
                text: '=Some Wikitext 2=',
                summary: 'Test Edit'
            });

        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
            done();
        });

    });

    it('successfully editing a page with edit()', function(done) {

        let bot = new MWBot();

        bot.login(loginCredentials.valid).then(() => {
            return bot.edit('Main Page', '=Some more Wikitext=', 'Test Upload');
        }).then((response) => {
            expect(response.edit.result).to.equal('Success');
            done();
        });
    });





    it('cannot edit a page without beeing logged in', function(done) {

        let bot = new MWBot();

        bot.edit('Main Page', '=Some more Wikitext=', 'Test Upload').catch((err) => {
            expect(err).to.include('Must be logged in');
            done();
        });
    });

});
