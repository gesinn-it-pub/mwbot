'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

//const chai = require('chai-as-promised');

describe('MWBot Login', function() {

    it('succeeds with valid credentials', function(done) {

        let bot = new MWBot();
        exports.bot = bot;

        bot.login({
            apiUrl: 'http://localhost:8080/wiki01/api.php',
            username: 'Admin',
            password: 'puppet'
        }).then((response) => {
            expect(response).to.be.an('object');
            done();
        });

    });

    it('crashes with invalid credentials', function(done) {

        let bot = new MWBot();

        bot.login({
            apiUrl: 'http://localhost:8080/wiki01/api.php',
            username: 'InvalidUserName',
            password: 'puppet'
        }).catch((err) => {
            expect(err).to.include('Could not login');
            done();
        });
    });

});
