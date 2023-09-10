const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const FilmSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    genre: {
        type: [String],
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    poster: {
        type: String,
        required: true
    }
})

mongoose.model('films',FilmSchema)