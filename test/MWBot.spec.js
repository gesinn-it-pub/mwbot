'use strict';

/*global describe, it*/

const MWBot = require('../src/');
const expect = require('chai').expect;

describe('MWBot', function() {

    it('can be constructed', function() {
        let bot = new MWBot();
        expect(bot).to.be.an('object');
    });

    it('has a valid semver version number', function() {
        let bot = new MWBot();
        expect(bot.version).to.be.a('string');
        expect(bot.version).to.match(/^(\d+\.)?(\d+\.)?(\*|\d+)$/);
    });

});
