const user = require('../models/user');
const collection = require('../models/collection');
const config = require('../config');

const express = require('express');
const router = express.Router();

const GitHubStrategy = require('passport-github').Strategy;



const gitHubAppInfo = {
    clientID: config.GITHUB_CLIENT_ID,
    clientSecret: config.GITHUB_CLIENT_SECRET,
    callbackURL: config.GITHUB_CALLBACK_URL,
};



module.exports = (passport) => {

    async function  findOrCreate (options, cb) {
        try {let data = await user.findOne({githubID: options.githubId});
                    console.log(data);
                    if (!data) {
                        data = await user.insert(options.login, options.username, "12nm1j1k2n12ln1k2j",options.githubId);
                        collection.insert('Favourite', data.id);                    
                        cb(null, data);
                    } else {
                        cb(null, data);
                    }
            }catch(error) {
                return Promise.reject(error);
            }
        console.log(`Find or create ${options.githubId}`);
        
    }
    
    async function getByGitHubId (_githubId, cb) {
        console.log(`Get by id ${githubId}`);
        let data = await user.findOne({githubI: _githubId});        
        cb(null, data);
    }

    passport.use(new GitHubStrategy(gitHubAppInfo, onGitHubOAuth2Complete));
    passport.serializeUser((user, cb) => cb(null, user.id));
    passport.deserializeUser((githubId, cb) => getByGitHubId(githubId, cb));

    router.get('/github',
    passport.authenticate('github'));

    router.get('/github/callback',
    passport.authenticate('github', {
        failureRedirect: '/',
        successRedirect: '/'
    }));

function onGitHubOAuth2Complete(accessToken, refreshToken, profile, cb) {
    findOrCreate(
        { githubId: profile.id,
          login: profile.login,
          username: profile.username        
        },
        (err, user) => cb(err, user));
}

    return router;
}

