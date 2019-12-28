const user = require('../models/user');

const film = require('../models/film');
const collection = require('../models/collection');

const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const bcrypt = require('bcryptjs');
const saltRounds = 10;
let default_collection_name = "Favourite";

module.exports = (passport) => {
    passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'shhhhhhhhh'
    },
    function (jwtPayload, cb) {
        return user.findOneById(jwtPayload.id)
            .then(user => cb(null, user))
            .catch(err => cb(err));
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

     router.get('/me', passport.authenticate('jwt', { session: false }), (req, res) => {
            res.json(req.user);
        });
     
     router.get('/', (req, res) => {
         res.json();
     });

     
     
     router.route('/users')
     .get(async (req, res) => {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        if (page < 1) return res.sendStatus(400);
        const entitiesPerPage = 8;         
        let search = req.query.search;
        let query = new RegExp(search, "i");   
        try {
            let pages = await user.countDocuments({login: query});
            if (page > pages && pages !== 0) return res.sendStatus(400);
            pages = Math.ceil(pages/entitiesPerPage);
            let data = await user.find({login: query}).skip((page - 1) * entitiesPerPage).limit(entitiesPerPage).exec()                
            res.json({items: data, page: page, pages: pages});
        }          
            catch(err) {
            res.status(500).json(err);
        }
     })
     .post(async (req, res) => {
        try {
            let data = await user.findOne({login: req.body.username});
            if (!data) {
                let password = req.body.password;
                let hash = await bcrypt.hash(password, saltRounds);
                data = await user.insert(req.body.fullname, req.body.username, hash);
                res.status(201).json(data);
            }
            else {
                res.status(400).json({error: "This user is already exist"});
            }
        }
        catch(error) {
            res.status(500).json(error);
        }
     });

     router.route('/users/:id')
     .get((req, res) => {
         user.findById(req.params.id)
         .then(data => {
             if (!data) return res.sendStatus(404);
             res.json(data);
         })
         .catch(err => res.status(500).json(err));
     })
     .put(async (req, res) => {
        let password = req.body.password;
        let hash = await bcrypt.hash(password, saltRounds);
        user.update(req.params.id, req.body.fullname, hash)
        .then(res.sendStatus(204))
        .catch(err => res.status(500).json(err));
     })
     .delete((req, res) => {
        Promise.all([user.findByIdAndDelete(req.params.id), collection.deleteMany({UserId: req.params.id})])
        .then(() => res.sendStatus(204))
        .catch(err => res.status(500).send(err))
     })

     router.use('/films', checkAuth);
     
     router.route('/films')
     .get(async(req, res) => {
        let page = req.query.page ? parseInt(req.query.page) : 1;
        if (page < 1) return res.sendStatus(400);
        const entitiesPerPage = 8;         
        let search = req.query.search;
        let query = new RegExp(search, "i");   
        try {
            let pages = await film.countDocuments({title: query});
            if (page > pages && pages !== 0) return res.sendStatus(400);
            pages = Math.ceil(pages/entitiesPerPage);
            let data = await film.find({title: query}).skip((page - 1) * entitiesPerPage).limit(entitiesPerPage).exec()                
            res.json({items: data, page: page, pages: pages});
        }
        catch(err) {
            res.status(500).json(err);
        }
     })    
     .post(checkAuth, async (req, res) => {
        try {
            if (!req.body) return res.sendStatus(400);
            let obj_id = mongoose.Types.ObjectId();
            let data = await film.insert(req.body, obj_id, req.body.link, req.body.poster)
            res.status(201).json(data)
        }
        catch(err) {
            res.status(500).json(err)
        } 
     });
     
     router.use('/films/:id', checkAuth);

     router.route('/films/:id')
     .get((req, res) => {
        film.findById(req.params.id)
         .then(data => {
             if (!data) return res.sendStatus(404);
             res.json(data);
         })
         .catch(err => res.status(500).json(err));
     })
     .put(async (req, res) => {
        try {
            let data = await film.findById(req.params.id);
            if (req.user.id.toString() !== data.user_id.toString()) {
                res.sendStatus(403);
            }
            else {
                await film.update(req.params.id, req.body.length, req.body.title, req.body.quality);
                res.sendStatus(204);
            }
         }
         catch (err) {
            res.status(500).json(err);}
         
     })
     .delete(async (req, res) => {
        try {
           let data = await film.findById(req.params.id);
           if(data){
           if (req.user.id.toString() !== data.user_id.toString()) {
               res.sendStatus(403);
           }
           else {
               await film.findByIdAndDelete(req.params.id);
               res.sendStatus(204);
           }
        }else{res.send("Nothing to delete")}}
        catch (err) {
           res.status(500).json(err);
        }
     });

     router.use('/collections', checkAuth);

    
     router.route('/collections')
     .get(async(req, res) => {         
         let page = req.query.page ? parseInt(req.query.page) : 1;
         if (page < 1) return res.sendStatus(400);
         const entitiesPerPage = 4;
         let search = req.query.search;
         let query = new RegExp(search, "i");
         try {
            let data = await collection.find({Name: default_collection_name, UserId: req.user.id})  
            let arr = await film.countDocuments({_id: {$in: data[0].FilmsId}, title: query});            
            let  pages = Math.ceil(arr/entitiesPerPage);
            if (page > pages && pages !== 0) return res.sendStatus(400);
            arr = await film.find({_id: {$in: data[0].FilmsId}, title: query}).skip((page - 1) * entitiesPerPage).limit(entitiesPerPage).exec()              
            res.json({items: arr, page: page, pages: pages});
        }
        catch(err) {
            res.status(500).json(err);
        }


     })
     .post((req, res) => {
             if (!req.body) return res.sendStatus(400);
             collection.insert(default_collection_name, req.user.id)
             .then(data => res.json(data))
             .catch(err => res.status(500).json(err));    
     });
     
     router.route('/collections/:id')
     .get(async (req, res) => {
        try {
            let data = await collection.findById(req.params.id);
            if (!data) return res.sendStatus(404);
            res.json(data);
        }
        catch(err) {
            res.status(500).json(err);
        }
     })
     .put(async (req, res) => {
        try {
            let data = await collection.findById(req.params.id);
            if (req.user.id.toString() !== data.UserId.toString()) {
                res.sendStatus(403);
            }
            else {
                await collection.update(data, req.body.Name, req.body.FilmsId);
                res.sendStatus(204);
            }
         }
         catch (err) {
            res.status(500).json(err);
         }
     })
     .delete(async (req, res) => {
        try {
            let data = await collection.findById(req.params.id);
            if (req.user.id.toString() !== data.UserId.toString()) {
                res.sendStatus(403);
            }
            else {
                await collection.findByIdAndDelete(req.params.id);
                res.sendStatus(204);
            }
        }
        catch(err) {
            res.status(500).send(err)
        }
     });

    return router
}

function checkAuth(req, res, next) {
    if (!req.user) return res.status(401).json();
    next();
}

function checkAdmin(req, res, next) {
    if (!req.user) res.sendStatus(401);
    else if (req.user.role !== 1) res.status(403).json();
    else next();
}