const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const config = require('./config');
const cloudinary = require('cloudinary');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const passport = require('passport');
const methodOverride = require('method-override');


const user = require('./models/user');
const collection = require('./models/collection');
const film = require('./models/film');
const Telegram = require('./models/telegram');


cloudinary.config({
    cloud_name: config.Cloud_Name,
    api_key: config.Api_Key,
    api_secret: config.Api_Secret
});

const app = express();

const port = config.ServerPort;
const databaseUrl = config.DataBaseUrl;

const connectOptions = {
    useNewUrlParser: true,
    
    
    useUnifiedTopology: true
};
let default_collection_name = "Favourite";




mongoose.connect(databaseUrl, connectOptions)
    .then(() => console.log('Connected to Mongo db'))
    .catch(err => console.log(err.toString()));

mongoose.set('useFindAndModify', false);

app.listen(port, () => {
    console.log(`Server is working  with port ${port}`);
});

app.set('view engine', 'ejs');

app.use(methodOverride('_method'));

app.use('/public', express.static('public'));
app.use('/views', express.static('views'));

app.use(express.static('data/fs'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(flash());

app.use(session({
    secret: config.sessionSecret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: "auto"
    }
}));

app.use(passport.initialize());

app.use(passport.session());

const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname)
    }
})

const upload = multer({
    storage: storage
}).fields([{
    name: 'film',
    maxCount: 1
}, {
    name: 'poster',
    maxCount: 1
}, {
    name: 'ava',
    maxCount: 1
}]);

const authRouter = require('./routes/auth')(passport);
app.use("/auth", authRouter);

const GithubauthRouter = require('./routes/auth2')(passport);
app.use("/auth", GithubauthRouter);

const api = require('./routes/api')(passport);
app.use('/api/v1', api);

const developer = require('./routes/developer');
app.use('/developer/v1', developer);

app.get('/', (req, res) => {
    res.render('index', {
        user: req.user
    });
});

app.get('/about', (req, res) => {
    res.render('about', {
        user: req.user
    });
});

app.get('/profile', checkAuth, (req, res) => {
    user.findById(req.user.id)
        .then(data => {
            if (!data) return res.status(404).send('Error 404');
            res.render('user', {
                obj: data,
                user: req.user
            });
        })
        .catch(err => res.status(500).send(err.toString()));
});
app.post('/profile', checkAuth, async (req, res) => {
    let id = mongoose.Types.ObjectId();
    console.log(req.user.id);

    upload(req, res, async function (err) {
        if (err) return res.status(500).send(err.toString());

        if (!req.body) return res.sendStatus(400);
        try {
            let ava = await cloudinary.v2.uploader.upload(req.files['ava'][0].path, {
                resource_type: "image",
                public_id: "avatars/" + id
            });
            console.log(ava.url)
            await user.findByIdAndUpdate(req.user.id, {
                avaUrl: ava.url
            });
            res.redirect('/profile');
        } catch (error) {
            res.status(500).send(error.toString());
        }
    });

});

app.get('/users', checkAdmin, async (req, res) => {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    const entitiesPerPage = 8;
    let search = req.query.search;
    let query = new RegExp(search, "i");
    try {
        let pages = await user.countDocuments({
            login: query
        });
        let data = await user.find({
            login: query
        }).skip((page - 1) * entitiesPerPage).limit(entitiesPerPage).exec();
        pages = Math.ceil(pages / entitiesPerPage);
        res.render('users', {
            items: data,
            pages: pages,
            page: page,
            user: req.user
        });
    } catch (err) {
        res.status(500).send(err.toString());
    }
});

app.get('/users/:id', checkAdmin, (req, res) => {
    if (req.query.role) {
        user.findByIdAndUpdate(req.params.id, {
                role: 1
            }, {
                new: true
            })
            .then(data => res.render('user', {
                obj: data,
                user: req.user
            }))
            .catch(err => res.status(500).send(err.toString()));
    } else {
        user.findById(req.params.id)
            .then(data => {
                if (!data) return res.status(404).send('Error 404');
                let check = data.id.toString() === req.user.id.toString();
                res.render('user', {
                    obj: data,
                    user: req.user,
                    check: check
                })
            })
            .catch(err => res.status(500).send(err.toString()));
    }
});

app.post('/users/:id', (req, res) => {
    user.findByIdAndDelete(req.params.id)
        .then(res.redirect('/users'))
        .catch(err => res.status(500).send(err.toString()));
});

//to do
app.get('/films', checkAuth, async (req, res) => {
    let page = req.query.page ? parseInt(req.query.page) : 1;
    const entitiesPerPage = 8;
    let search = req.query.search;
    let query = new RegExp(search, "i");
    try {
        let pages = await film.countDocuments({
            title: query
        });
        let data = await film.find({
            title: query
        }).skip((page - 1) * entitiesPerPage).limit(entitiesPerPage).exec();
        pages = Math.ceil(pages / entitiesPerPage);
        res.render('films', {
            items: data,
            pages: pages,
            page: page,
            user: req.user
        });
    } catch (err) {
        res.status(500).send(err.toString());
    }
});


app.get('/films/new', (req, res) => {
    res.render('new', {
        obj: true,
        user: req.user
    });
});

app.post('/films/new', (req, res) => {

    let id = mongoose.Types.ObjectId();
    upload(req, res, async function (err) {
        if (err) return res.status(500).send(err.toString());
        if (!req.body) return res.sendStatus(400);
        try {
            let result = await cloudinary.v2.uploader.upload(req.files['film'][0].path, {
                resource_type: "video",
                public_id: "films/" + id
            });
            let poster = await cloudinary.v2.uploader.upload(req.files['poster'][0].path, {
                resource_type: "image",
                public_id: "posters/" + id
            });
            let data = await film.insert(req.body, id, result.url, poster.url)
            await Telegram.sendNotification(data.title + " || Hey! The new movie on Cinemated: https://cinemated.herokuapp.com/films/" + data.id);
            res.redirect('/films/' + data.id);
        } catch (error) {
            res.status(500).send(error.toString());
        }
    });
});

app.get('/films/:id', checkAuth, (req, res) => {
    film.findById(req.params.id)
        .then(data => {
            if (!data) return res.status(404).send('Error 404');
            res.render('film', {
                obj: data,
                user: req.user
            });
        })
        .catch(err => res.status(500).send(err.toString()));
});

app.post('/films/:id', (req, res) => {
    film.findByIdAndDelete(req.params.id)
        .then(res.redirect('/films'))
        .catch(err => res.status(500).send(err.toString()));
});

app.get('/collections', async (req, res) => {

    let search = req.query.search;
    let query = new RegExp(search, "i");
    collection.find({
            UserId: req.user.id,
            Name: default_collection_name
        })
        .then(async data => {
            let page = req.query.page ? parseInt(req.query.page) : 1;
            const entitiesPerPage = 4;
            let arr = await film.countDocuments({
                _id: {
                    $in: data[0].FilmsId
                }
            });
            let pages = Math.ceil(arr / entitiesPerPage);
            film.find({
                    _id: {
                        $in: data[0].FilmsId
                    },
                    title: query
                }).skip((page - 1) * entitiesPerPage).limit(entitiesPerPage).exec()
                .then(data => {
                    res.render('collection', {
                        items: data,
                        pages: pages,
                        page: 1,
                        user: req.user
                    });
                }).catch(err => res.status(500).send(err.toString()));
        })
        .catch(err => res.status(500).send(err.toString()));
});

app.post('/collections/del/:id', (req, res) => {
    collection.find({
            UserId: req.user._id
        })
        .then(data => {
            let index = data[0].FilmsId.findIndex(id => id == req.params.id);
            data[0].FilmsId.splice(index, 1);
            return data[0];

        })
        .then(obj => {
            collection.update(obj, default_collection_name, obj.FilmsId);
            res.redirect('/collections');
        })
        .catch(err => res.status(500).send(err.toString()));

});

app.post('/collections/add_film/:id', (req, res) => {
    collection.find({
            UserId: req.user._id
        })
        .then(data => {
            data[0].FilmsId.indexOf(req.params.id) === -1 ? data[0].FilmsId.push(req.params.id) : res.redirect('/films/' + req.params.id)
            // : console.log("This item already exists")

            return data[0];

        })
        .then(obj => {
            collection.update(obj, default_collection_name, obj.FilmsId);
            res.redirect('/collections');
        })
        .catch(err => res.status(500).send(err.toString()))
});


app.get('*', (req, res) => {
    res.sendFile(__dirname + "/404.html");
});

function checkAuth(req, res, next) {
    if (!req.user) res.redirect('/auth/register');
    next();
}

function checkAdmin(req, res, next) {
    if (!req.user) res.sendStatus(401);
    else if (req.user.role !== 1) res.sendStatus(403);
    else next();
}
