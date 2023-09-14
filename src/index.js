const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
// const helper = require('./helper.js')
const config = require('./config.js')
const kd = require('./keyboard.js')

const bcrypt = require('bcrypt');

require('./models/film.model.js')
require('./models/user.model.js')

const Film = mongoose.model('films')
const User = mongoose.model('users')



mongoose.connect(config.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('mongoose connect'))
    .catch((err) => console.log(err))

const bot = new TelegramBot(config.TOKEN, {
    polling: true
})



// Обробка клавіатури
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
    }
})

//Обробка інлайн клавіатури
bot.on('callback_query', async (callbackQuery) => {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;

    if (data.startsWith('add_favourite_')) {
        const uniqueIdentifier = data.replace('add_favourite_', '');

        const user = await User.findOne({})
        console.log(uniqueIdentifier);
    }
});

//Пошук фільма по коді
bot.onText(/\/f(.+)/, (msg, [source, match]) => {
    const idFilm = source.substr(1, source.length)
    findFilm(msg.chat.id, { id: idFilm })
})


//Старт команда
bot.onText(/\/start/, (msg, [source, match]) => {
    bot.sendMessage(msg.chat.id, `Привіт, ${msg.chat.first_name}\nВиберіть команду`, {
        reply_markup: {
            keyboard: kd.home
        }
    })
})


//Реєстрація
bot.onText(/\/signup/, async (msg, [source, match]) => {
    const chatId = msg.chat.id;
    const registrationData = {
        username: '',
        password: '',
    };
    const IsAuth = await isAuth(msg.chat.first_name)
    if (IsAuth) {
        bot.sendMessage(chatId, 'Ви вже зареєстровані')
        return
    } else  {
        bot.sendMessage(chatId, 'Придумайте логін')
        bot.on('message', (msg) => {
            if (registrationData.username === '') {
                registrationData.username = msg.text
                return bot.sendMessage(chatId, 'Придумайте пароль')
            } else if (registrationData.password === '') {
                registrationData.password = msg.text
                 signUpUser(registrationData,msg.chat.id)
            } 
        })
    }
})

//Пошук фільмів
async function findFilms(chatId, params = {}) {
    const films = await Film.find(params)
    const filmsHtml = films.map((film, i) => {
        return html = `<b>${i + 1}. ${film.name}</b> - /${film.id}`
    }).join('\n')
    sendHtml(chatId, filmsHtml)
}


//Пошук фільму
async function findFilm(chatId, params = {}) {
    const film = await Film.findOne(params)

    const caption =
        `<b>Назва: ${film.name}</b>\n<b>Рік: ${film.year}</b>\n<b>Режисер: ${film.director}</b>\n<b>Жанр: ${film.genre.map(g => g)}</b>\n<b>Рейтинг: ${film.rating}</b>\n
`.toString('\n')
    console.log(film.id);
    bot.sendPhoto(chatId, film.poster, {
        caption: caption,
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [{
                    text: 'Трейлер',
                    url: "https://youtube.com"
                }],
                [{
                    text: 'Добавити в улюблені',
                    callback_data: `add_favourite_${film.id}`
                }],
                [{
                    text: 'Дивитись на сайті',
                    url: "https://uakino.club/filmy/genre-action/6-gladator.html"
                }],
            ]
        }

    })
}

function sendHtml(chatId, html) {
    bot.sendMessage(chatId, html, {
        parse_mode: 'HTML'
    })
}


//Реєстрація
function signUpUser({ username, password },chatId) {
    const saltRounds = 10; // Кількість раундів для генерації солі (може бути змінена)
    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.error(err);
        } else {
            // Отриманий хеш паролю зберігається в базі даних
            const newUser = new User({
                username,
                password: hash,
                role: 'user', // або 'admin', залежно від ролі користувача
            });

            newUser.save()
                .then(()=>{
                    bot.sendMessage(chatId, 'Реєстрація пройшла успішно')
                })
                .catch(err => console.log(err))
        }
    });
}


//Перевірка чи є в базі даних
async function isAuth(username) {
    const user = await User.findOne({ username })
    return user
}

// signUpUser()


// const plaintextPassword = 'Роман123'; // Оригінальний пароль, введений користувачем
// const hashedPasswordFromDatabase = "$2b$10$m2N.zV1Y2OnyTUShb/ykTOmvKR/oP4Kn3GEwGgCbLiyWWfjENzZ0C"; // Збережений хеш паролю в базі даних

// bcrypt.compare(plaintextPassword, hashedPasswordFromDatabase, (err, result) => {
//     if (err) {
//         // Обробляйте помилки, якщо вони виникають
//         console.error(err);
//     } else if (result) {
//         // Паролі співпали, користувач успішно ввійшов в систему
//         console.log('Паролі співпали');
//     } else {
//         // Паролі не співпали, відмова в доступі
//         console.log('Паролі не співпали');
//     }
// })
