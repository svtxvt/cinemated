const mongoose = require('mongoose');

let collectionSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Name: String,
    UserId: mongoose.Schema.Types.ObjectId,
    FilmsId: [mongoose.Schema.Types.ObjectId],
}, {
    versionKey: false
});

collectionSchema.statics.insert = function (obj_name, user_id) {

    let obj = {Name: obj_name};;
    obj._id = mongoose.Types.ObjectId();
    obj.UserId = user_id;

    let Collection = this.model('Collections');
    let collection = new Collection(obj);
    return collection.save();
};

collectionSchema.statics.update = function (obj, obj_name, films_id) {

    obj.Name = obj_name;
    obj.FilmsId = films_id;
    
    let Collection = this.model('Collections');
    let collection = new Collection(obj);
    return collection.save();
};


const Collection = mongoose.model('Collections', collectionSchema);

module.exports = Collection;