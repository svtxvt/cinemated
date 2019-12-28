const mongoose = require('mongoose');

let filmSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: String,
    quality: String,
    length: String,
    addedAt: Date,
    link: String,
    poster: String,
}, {
    versionKey: false
});

filmSchema.statics.insert = function (obj, id, title, poster) {
    let date = new Date();
    obj.addedAt = date.toISOString().slice(0, 19) + 'Z';
    obj.length = obj.length;
    obj.quality = obj.quality;
    obj._id = id;   
    obj.link = title;
    obj.poster = poster;
    let Film = this.model('Films');
    let film = new Film(obj);
    return film.save();
};

filmSchema.statics.update = function (id, length, title, quality) {
    return Film.findByIdAndUpdate(id, {length: length, title: title, quality: quality});
}

const Film = mongoose.model('Films', filmSchema);

module.exports = Film;