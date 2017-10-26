const Telegraf = require('telegraf');
const I18n = require('telegraf-i18n');
const { match } = require('telegraf-i18n')
const path = require('path');
const MySQLSession = require('../lib/session');
const commandArgsMiddleware = require('../lib/commandArgs');
const config = require('./config');

// Global variables
const bot = new Telegraf(config.telegraf_token);

const session = new MySQLSession({
	host: config.database_host,
	user: config.database_user,
	password: config.database_password,
	database: config.database_name
});

const i18n = new I18n({
  defaultLanguage: 'en',
  allowMissing: true,
	useSession: true,
  directory: path.resolve(__dirname, 'locales')
});

// Bot MiddleWares
bot.use(session.middleware()); // For saving on database
bot.use(commandArgsMiddleware()); // For quering commands parameters.
bot.use(i18n.middleware()); // For locale language settings

// Bot logic goes above
//=======================================================================

// Basic commands------------------------------------------------------
// Starting the Bot
bot.command('start', (ctx) => {
	ctx.reply('Bot started.');
});

// Say hello
bot.hears(match('hi'), (ctx) => {
	return ctx.reply(ctx.i18n.t('helloHuman'))
});

// Settings commands-----------------------------------------------------
// Call menu for changing the language
bot.hears(match('language'), (ctx) => {
  ctx.reply(ctx.i18n.t('languageInstr'), languageMenu);
});

// Create list
/*bot.command('/new', (ctx) => {
	const type = ctx.state.command.args[0];
	const name = ctx.state.command.args[1];
	console.log(ctx)
  return ctx.reply('New ' + type + ' of ' + name)
});*/

// MENUS ------------------------------------------------------------------
const languageMenu = Telegraf.Extra
	  .markdown()
	  .markup((m) => m.inlineKeyboard([
	    m.callbackButton('🇺🇸 English', 'en'),
			m.callbackButton('🇧🇷 Portuguese', 'pt')
	  ]));

bot.action('pt', (ctx) => {
	ctx.i18n.defaultLanguage = 'pt';
	ctx.i18n.locale('pt');
  ctx.reply(ctx.i18n.t('localeGreeting'))
});

bot.action('en', (ctx) => {
	ctx.i18n.defaultLanguage = 'en';
	ctx.i18n.locale('en');
	ctx.reply(ctx.i18n.t('localeGreeting'))
});

// ======================================================================

// Error handling
bot.catch((err) => {
  console.log('Ooops ', err)
});

// Start Polling
bot.startPolling(30);
