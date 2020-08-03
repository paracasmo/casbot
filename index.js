'use strict';

const config = require('./config');
const path = require('path');
const winston = require('winston');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const passport = require('passport');
const TwitchStrategy = require('@d-fischer/passport-twitch').Strategy;
const socketIo = require('socket.io');

const authCallback = '/auth/twitch/callback';
const authLoginPage = '/auth/twitch';
const authFailPage = '/oops';
const noAuthPaths = [authLoginPage, authCallback, authFailPage];

const logger = initLogger();
initPassport();
initIo(socketIo(initExpress()));

logger.info('Application started!');

function initLogger() {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.cli(),
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
            winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
        ),
        transports: [new winston.transports.Console()],
    });
}

function initPassport() {
    const strategyConfig = {
        clientID: config.twitch.clientID,
        clientSecret: config.twitch.clientSecret,
        callbackURL: `${config.baseUrl}:${config.port + authCallback}`,
        scope: 'user_read',
    };

    passport.use(new TwitchStrategy(strategyConfig, authorizer()));
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
}

function initExpress() {
    const app = express();

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieSession({ secret: 'casbotCoolSessionToken' }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use((req, res, next) => noAuthPaths.includes(req.path) || req.user ? next() : res.redirect(authLoginPage));
    app.use(express.static(path.join(__dirname, 'web')));

    app.get(authLoginPage, passport.authenticate('twitch'));
    app.get(authCallback, passport.authenticate('twitch', { failureRedirect: authFailPage }),
        (req, res) => res.redirect('/'));
    app.get(authFailPage, (req, res) => res.send('Auth failed.'));

    return app.listen(config.port, () => logger.info(`Listening on ${config.baseUrl}:${config.port}`));
}

function initIo(io) {
    io.on('connection', (socket) => {
        console.log('Socket connection established.');

        socket.on('disconnect', () => console.log('Socket connection closed.'));
        socket.on('frontend.greeting', (greeting) => {
            logger.info(`Greeting from frontend: ${greeting}`);
            socket.emit('backend.greeting', 'Y helo thar ;)');
        });
    });

    logger.info('Socket IO initalized.');
}

function authorizer() {
    return function(accessToken, refreshToken, profile, done) {
        if (config.admins.includes(profile.id)) {
            logger.info(`Twitch user authorization successful: ${profile.login}`);
            done(null, { twitchId: profile.id });
        } else {
            logger.warn(`Twitch user authorization NOT successful: ${profile.login}`);
            done(null, false);
        }
    };
}
