const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
const helper = require('./helper.js')
const config = require('./config.js')
const kd = require('./keyboard.js')

require('./models/film.model.js')

const Film = mongoose.model('films')


mongoose.connect(config.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('mongoose connect'))
    .catch((err) => console.log(err))

const bot = new TelegramBot(config.TOKEN, {
    polling: true
})

/* ===================================LOGIC============* */



bot.on('message', (msg) => {
    const { id } = msg.chat
    switch (msg.text) {
        case 'Пригоди':
            findFilms(msg.chat.id, { genre: 'Пригоди' })
            break;
        case 'Бойовик':
            findFilms(msg.chat.id, { genre: 'Бойовик' })
            break;
        case 'Випадковий Жанр':
            findFilms(msg.chat.id, {})
            break;
        case 'Зараз в кіно':
            bot.sendMessage(id, 'Виберіть жанр', {
                reply_markup: {
                    keyboard: kd.film
                }
            })
            break;

        default:
            bot.sendMessage(id, `Привіт, ${msg.chat.first_name}\nВиберіть команду`, {
                reply_markup: {
                    keyboard: kd.home
                }
            })
            break;
    }


})

bot.onText(/\/f(.+)/, (msg, [source, match])=>{
    const idFilm = source.substr(1, source.length)
    findFilm(msg.chat.id,{id: idFilm})
})


async function findFilms(chatId, params = {}) {
    const films = await Film.find(params)
    const filmsHtml = films.map((film, i) => {
        return html = `<b>${i + 1}. ${film.name}</b> - /${film.id}`
    }).join('\n')
    sendHtml(chatId, filmsHtml)
}

async function findFilm(chatId, params = {}) {
    const film = await Film.findOne(params)

    const caption = 
    `<b>Назва: ${film.name}</b>\n<b>Рік: ${film.year}</b>\n<b>Режисер: ${film.director}</b>\n<b>Жанр: ${film.genre.map(g=>g)}</b>\n<b>Рейтинг: ${film.rating}</b>\n
`.toString('\n')

    bot.sendPhoto(chatId, film.poster, {
        caption: caption,
        parse_mode: "HTML",
        reply_markup:{
            inline_keyboard:[
                [{
                    text: 'Трейлер',
                    url: "https://youtube.com"
                }],
                [{
                    text: 'Добавити в улюблені',
                    callback_data: 'add_favourite'
                }],
                [{
                    text: 'Дивитись на сайті',
                    url: "https://uakino.club/filmy/genre-action/6-gladator.html"
                }]
            ]
        }
        
    })
}

function sendHtml(chatId, html) {
    bot.sendMessage(chatId, html, {
        parse_mode: 'HTML'
    })
}