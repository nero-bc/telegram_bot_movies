const kb = require('./keyboard-buttons.js')
module.exports = {
    home: [
        [kb.home.films,kb.home.cinemas],
        [kb.home.favourite],
    ],
    film: [
        [kb.film.random],
        [kb.film.action, kb.film.advantures],
        [kb.film.back]
    ]
}