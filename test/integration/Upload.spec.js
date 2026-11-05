'use strict';

const MWBot = require('../../src/');
//const log = require('semlog').log;

const chai = require('chai');
const expect = chai.expect;

const loginCredentials = require('../helpers/credentials');

describe('MWBot Upload', function () {
    'use strict';
    this.timeout(20000);

    it('successfully uploads and overwrites an image with uploadOverwrite()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        // make sure, the test file does not exist
        try {
            await bot.delete('File:ExampleImage.png', 'Upload Test');
        } catch {
            //ignore
        }

        // upload
        const r3 = await bot.uploadOverwrite(
            'ExampleImage.png',
            __dirname + '/../mocking/example2.png',
            'Test Reasons'
        );
        expect(r3.upload.result).to.equal('Success');
        expect(r3.warnings).to.equal(undefined);

        // upload again expecting 'fileexists-no-change'
        // (depending on the MediaWiki version, this is either an error or a plain success)
        let result;
        let error;
        try {
            result = await bot.upload('ExampleImage.png', __dirname + '/../mocking/example2.png', 'Test Reasons');
        } catch (err) {
            error = err;
        }
        if (error) {
            expect(error.code).to.equal('fileexists-no-change');
        } else {
            expect(result.upload.result).to.equal('Success');
            expect(result.warnings).to.equal(undefined);
        }
    });

    it('successfully uploads without providing a filename with upload()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        // make sure, the test file does not exist
        try {
            await bot.delete('File:ExampleImage.png', 'Upload Test');
            await bot.delete('File:Example2.png', 'Upload Test');
        } catch {
            //ignore
        }

        // upload
        const r4 = await bot.upload(false, __dirname + '/../mocking/example2.png', 'Test Reasons');
        expect(r4.upload.result).to.equal('Success');
        expect(r4.warnings).to.equal(undefined);
    });

    it('rejects to upload a non-existing file with upload()', async function () {
        const bot = new MWBot();

        await bot.loginGetEditToken(loginCredentials.valid);

        // upload
        await expect(
            bot.upload(false, __dirname + '/../mocking/non-existing-file.png', 'Test Reasons')
        ).to.be.rejectedWith('ENOENT');
    });
});
