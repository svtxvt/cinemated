const user = require('../models/user');
const collection = require('../models/collection');

const express = require('express');
const router = express.Router();
const LocalStrategy = require('passport-local').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
let default_collection_name = "Favourite";

module.exports = (passport) => {
    passport.use(new LocalStrategy(
        (username, password, done) => {
          user.findOne({ login: username }, async (err, user) => {
            try
            {
                if (err) { return done(err); }
                if (!user) { return done(null, false); }
                if (!await user.verifyPassword(password)) { return done(null, false); }
                return done(null, user);
            }
            catch(err)
            {
                return done(err);
            }
          });
        }
    ));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
      
    passport.deserializeUser((id, done) => {
        user.findById(id, (err, user) => {
            done(err, user);
        });
    });

    router.get('/register', (req, res) => {
        res.render('register', {obj: true, user: req.user});
    });
    
    router.post('/register', async (req, res) => {
        if (!req.body) return res.sendStatus(400);
        if (req.body.password !== req.body.repassword) {
            return res.status(400).json({
                message: "Password does not match",
            });
        }
        if (req.body.username == "" || req.body.fullname == "") {
            return res.status(400).json({
                message: "Please fill all forms",
            });
        }
        else {
            try {
                let data = await user.findOne({login: req.body.username});
                if (!data) {
                    let password = req.body.password;
                    let hash = await bcrypt.hash(password, saltRounds);
                    data = await user.insert(req.body.fullname, req.body.username, hash);
                    collection.insert(default_collection_name, data.id);
                    req.login(data,  (err) => {
                        if (err) return res.send(err);
                        const token = jwt.sign({ id: user.id }, 'shhhhhhhhh');
                        return newFunction(res, token);
                    }); 
                }
                else {
                    return res.status(400).json({
                        message: "This username is already exist",
                    });
                }
            }
            catch(error) {
                res.status(500).send(error.toString());
            }
        }
    });
    
    router.get('/login', (req, res) => {
        res.render('login', {obj:true, user: req.user});
    });
    
    router.post('/login', (req, res) => {
        passport.authenticate('local', (err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    message: "Wrong password or username",
                });
            }
            req.login(user,  (err) => {
                if (err) return res.send(err);
                const token = jwt.sign({ id: user.id }, 'shhhhhhhhh');
                return res.json({ user, token });
            });   
        })(req, res);
    });
    
    router.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });

    return router;
}

function newFunction(res, token) {
    return res.json({ user, token });
}
