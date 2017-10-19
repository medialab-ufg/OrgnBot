const Telegraf = require('telegraf')
const MySQLSession = require('../lib/session')
const commandArgsMiddleware = require('../lib/commandArgs');
const config = require('./config');

// Global variables
const telegraf = new Telegraf(config.telegraf_token)

const session = new MySQLSession({
  host: config.database_host,
  user: config.database_user,
  password: config.database_password,
  database: config.database_name
})

// Telegraf MiddleWares
telegraf.use(session.middleware()) // For saving on database
telegraf.use(commandArgsMiddleware()); // For quering commands parameters.

// Bot logic goes above
//=======================================================================

// Starting the Bot
telegraf.command('start', (ctx) => ctx.reply('Bot started.'));

// ======================================================================
// Start Polling
telegraf.startPolling(30)
