module.exports = {

    ServerPort: process.env["PORT"] || 3000,
    DataBaseUrl: process.env["DATABASE_URL"] || 'mongodb://herokuuser:wertyQ123@ds255728.mlab.com:55728/heroku_59p6hq2f',
    Cloud_Name: 'hcq41cdtr',
    Api_Key:  837584226184313,
    Api_Secret: process.env["API_SECRET"] ,
    bot_token: process.env['TELEGRAM_BOT_TOKEN'] || '962777234:AAF3ITMN-cpGAAfH12KP6JuZWDQQ4vT9ohY',
    GITHUB_CLIENT_ID: process.env['GITHUB_CLIENT_ID'] || '7eff5da04752a9526238' ,
    GITHUB_CLIENT_SECRET: process.env['GITHUB_CLIENT_SECRET'] || 'b179b5ca4b03ec15489ac758a7a922356545a632',
    GITHUB_CALLBACK_URL: 'https://cinemated.herokuapp.com/auth/github/callback',
    sessionSecret: 'sess1onSecrrret',
};



