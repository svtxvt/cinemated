const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

let userSchema = new mongoose.Schema({

    _id: mongoose.Schema.Types.ObjectId,
    githubID: Number,
    login: String,
    password: String,
    fullname: String,
    role: {type: Number, default: 0},
    registeredAt: Date,
    avaUrl: {type: String, default: '/images/default.png'},
    isDisabled: {type: Boolean, default: false}
}, {
    versionKey: false
});

userSchema.methods.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.statics.insert = function (fullname, username, password, _githubID) {
    
    let obj = {password: password};
    let date = new Date();
    obj._id = mongoose.Types.ObjectId();
    obj.githubID = _githubID;
    obj.registeredAt = date.toISOString().slice(0, 19) + 'Z';
    obj.login = username;
    obj.fullname = fullname;
    let User = this.model('Users');
    let user = new User(obj);
    return user.save();
};

userSchema.statics.update = async function(id, fullname, password, role) {
    try
    {
        let hash;
        let obj = {};
        if (password && password !== "") {
            hash = await bcrypt.hash(password, saltRounds);
            obj.password = hash;
        }
        if (fullname && fullname !== "") {
            obj.fullname = fullname;
        }
        if (role) {
            obj.role = role;
        }
        return User.findByIdAndUpdate(id, obj);
    }
    catch(err)
    {
        return Promise.reject(err);
    }
}



const User = mongoose.model('Users', userSchema);

module.exports = User;