import MWBot from '../../src/index.js';
import semlog from 'semlog';
const log = semlog.log;

import chai from 'chai';
const expect = chai.expect;

import loginCredentials from '../helpers/credentials.js';

describe('MWBot advanced requests', function () {
    //////////////////////////////////////////
    // SUCESSFULL                           //
    //////////////////////////////////////////

    it('combines reading, changing and uploading a wiki page', async function () {
        const bot = new MWBot();
        await bot.loginGetEditToken(loginCredentials.valid);

        const readResponse = await bot.read('Main Page');
        const pageContent = readResponse.query.pages['1']['revisions'][0]['*'] + ' Appendix';

        const response = await bot.update('Main Page', pageContent);
        expect(response.edit.result).to.equal('Success');
    });

    it('concurrent jobs with p-map (MWBot.map)', async function () {
        const bot = new MWBot();

        const pages = ['Main Page', 'Test Page'];

        const pagesTotal = pages.length || 0;
        let pageCounter = 0;

        await bot.loginGetEditToken(loginCredentials.valid);

        await MWBot.map(
            pages,
            async (page) => {
                pageCounter += 1;

                try {
                    const response = await bot.request({
                        action: 'purge',
                        titles: page,
                        forcelinkupdate: true,
                    });
                    // Use MWBot.logStatus helper function
                    if (response.error) {
                        MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                    } else {
                        MWBot.logStatus('[=] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                    }
                } catch (err) {
                    MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', page);
                    log(err);
                }
            },
            {
                concurrency: 2,
            }
        );
    });

    it('sequential jobs with MWBot.mapSeries', async function () {
        const bot = new MWBot();

        const pages = ['Main Page', 'Test Page'];

        const pagesTotal = pages.length || 0;
        let pageCounter = 0;

        await bot.loginGetEditToken(loginCredentials.valid);

        await MWBot.mapSeries(pages, async (page) => {
            pageCounter += 1;

            try {
                const response = await bot.request({
                    action: 'purge',
                    titles: page,
                    forcelinkupdate: true,
                });
                // Use MWBot.logStatus helper function
                if (response.error) {
                    MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                } else {
                    MWBot.logStatus('[=] ', pageCounter, pagesTotal, 'PURGE', response.purge[0].title);
                }
            } catch (err) {
                MWBot.logStatus('[E] ', pageCounter, pagesTotal, 'PURGE', page);
                log(err);
            }
        });
    });

    //////////////////////////////////////////
    // UNSUCESSFULL                         //
    //////////////////////////////////////////
});
