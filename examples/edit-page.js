// Usage: WP_USER=MyBot WP_PASSWORD=secret node edit-page.js

// use this line instead in your own bot
// const MWBot = require('mwbot');

const MWBot = require('../src/index');

const botUserName = process.env.WP_USER ?? '<WP username of your bot>';
const botPassword = process.env.WP_PASSWORD ?? '<WP password of your bot>';
const baseUrl = 'https://en.wikipedia.org'; // you can also change it to https://www.wikidata.org

async function main() {
    const bot = new MWBot({
        apiUrl: `${baseUrl}/w/api.php`,
    });

    await bot.loginGetEditToken({
        username: botUserName,
        password: botPassword,
    });

    const response = await bot.edit(
        `User:${botUserName}/sandbox/HelloWorld`,
        `Hello World! Congrats, you have created a bot edit. Now head to [[WP:Bots]] to find information on how to get your bot approved and running!`,
        `Edit from a bot called [[User:${botUserName}]] built with #mwbot`
    );

    console.log('Success', response);
    console.log(`Now visit in your browser to see your edit:\n\t${baseUrl}/wiki/User:${botUserName}/sandbox/HelloWorld`);
}

main().catch(console.error);
