const config = require('../config');

const TelegramBotApi = require('telegram-bot-api');

const User = require('../models/telegram_user');
const Film = require('../models/film');

const telegramBotApi = new TelegramBotApi({
    token: config.bot_token,
    updates: {
        enabled: true // do message pull
    }
});

telegramBotApi.on('message', onMessage);

async function registerTgUser(chatId) {
    const user = await User.getById(chatId);
    if (typeof user === 'undefined') {
        await User.insert(chatId);
    }
}



function onMessage(message) {
    processRequest(message)
        .catch(err => telegramBotApi.sendMessage({
            chat_id: message.chat.id,
            text: `Something went wrong. Try again later. Error: ${err.toString()}`,
        }));
}

async function processRequest(message) {
    const chatId = message.chat.id;
    if (message.text === '/start') {
        await registerTgUser(chatId);
        telegramBotApi.sendMessage({
            chat_id: chatId,
            text: "Hello! I am Cinemated Telegram bot. ",
        });
    }
    if (message.text === '/random') {

        Film.countDocuments().exec(function (err, count) {            
            let random = Math.floor(Math.random() * count)           
            Film.findOne().skip(random).exec(
              function (err, result) {               
                telegramBotApi.sendMessage({
                    chat_id: chatId,
                    text: result.title +" ||  Here is your random film: https://cinemated.herokuapp.com/films/" + result._id,
                    parse_mode: "HTML"
                });
              })
          });

    } else {    
    return telegramBotApi.sendMessage({
        chat_id: chatId,
        text: "What`s up??!",
    });
    }
}

module.exports = {
    async sendNotification(text) {
        const users = await User.getAll();
        for (const userId of users) {
            await telegramBotApi.sendMessage({
                chat_id: userId,
                text: text,
            });
        }
    }
};