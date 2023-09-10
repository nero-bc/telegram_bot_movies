const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Схема користувача
const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true, // Ім'я користувача повинно бути унікальним
    },
    password: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        default: false, // По замовчуванню користувач не є адміном
    },
    favoriteFilms: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Film', // Зверніть увагу, що 'Film' повинно відповідати назві моделі фільму
    }],
    ratings: [{
        filmId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Film',
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
    }],
});

// Створення моделі користувача
const User = mongoose.model('users', UserSchema);

module.exports = User; // Експортуємо модель для використання в інших частинах вашого програмного коду
