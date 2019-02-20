// TODO: please remember to set the bot's username and password in WP_USER and WP_PASSWORD

// use this line instead in your own bot
// const MWBot = require('mwbot');

const MWBot = require('../src/index');

const botUserName = '<WP username of your bot>'
const botPassword = '<WP password of your bot>'
const baseUrl = 'https://en.wikipedia.org' // you can also change it  to https://www.wikdata.org
async function main() {
    const bot = new MWBot({
        apiUrl: `${baseUrl}/w/api.php`
    });
    await bot.loginGetEditToken({
        username: botUserName,
        password: botPassword
    });


    bot.edit(`User:${botUserName}/sandbox/HelloWorld`, 
        `Hello World! Congrats, you have created a bot edit. Now head to [[WP:Bots]] to find information on how to get your bot approved and running!`, 
        `Edit from a bot called [[User:${botUserName}]] built with #mwbot`).then((response) => {
        console.log(`Success`, response);
        console.log(`Now visit on your browser to see your edit:
		${baseUrl}/wiki/User:${botUserName}/sandbox/HelloWorld`);
        // Success
    }).catch((err) => {
        // Error
        console.warn(`Error`, err);
    });
}
// In the root scope of a script, you must use the promise notation, as await is not allowed there.
main().catch(console.error);
