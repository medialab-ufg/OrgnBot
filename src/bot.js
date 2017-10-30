const Telegraf = require('telegraf')
const { Extra, Markup } = Telegraf
const I18n = require('telegraf-i18n')
const { match } = require('telegraf-i18n')
const path = require('path')
const MySQLSession = require('../lib/session')
const commandArgsMiddleware = require('../lib/commandArgs')
const TelegrafFlow = require('telegraf-flow')
const { Scene, enter, leave } = TelegrafFlow
const config = require('./config')

// Global variables
const bot = new Telegraf(config.telegraf_token)

// Local database setting
const session = new MySQLSession({
	host: config.database_host,
	user: config.database_user,
	password: config.database_password,
	database: config.database_name
})

// Language settings
const i18n = new I18n({
  defaultLanguage: 'en',
  allowMissing: true,
	useSession: true,
  directory: path.resolve(__dirname, 'locales')
})

// Scene flows
const listCreationScene = new Scene('listCreationScene')
listCreationScene.enter((ctx) => ctx.reply(ctx.i18n.t('createListInstr'), Extra.markup(Markup.forceReply())))
listCreationScene.leave((ctx) => ctx.reply(ctx.i18n.t('cancelMessage')))
listCreationScene.hears(match('cancel'), leave())
listCreationScene.on('message', (ctx) => {

	const name = ctx.message.text

	// Checks if lists already exists
	if (ctx.session.lists[name] != undefined && ctx.session.lists[name] != null) {
		return ctx.reply(ctx.i18n.t('listExistsAlert'))
	} else {
		ctx.session.lists[name] = []
		return ctx.reply(ctx.i18n.t('createListSuccess') + name + '.')
	}
})
const showListScene = new Scene('showListScene')
showListScene.enter((ctx) => {

	const existingListMenu = Extra
			.markdown()
			.markup((m) => {
				var existingLists = [];
				for (list in ctx.session.lists) {
					console.log(list)
					existingLists.push(m.callbackButton(list))
				}
				existingLists.push(m.callbackButton(ctx.i18n.t('cancel')))
				return m.keyboard(existingLists).oneTime().resize()
			})

	return ctx.reply(ctx.i18n.t('showListInstr'), existingListMenu, Extra.markup(Markup.forceReply()))
})
showListScene.leave((ctx) => ctx.reply(ctx.i18n.t('cancelMessage')))
showListScene.hears(match('cancel'), leave())
showListScene.on('message', (ctx) => {

	const name = ctx.message.text

	var listContent = ctx.i18n.t('showListSuccess') + name + ':'
	for (listItem in ctx.session.lists[name]) {
		listContent = listContent.concat('\n - ' + ctx.session.lists[name][listItem])
	}
	return ctx.replyWithMarkdown(listContent)
})

const flow = new TelegrafFlow(
	[listCreationScene, showListScene],
	{ ttl: 10 } // Time before ignore the message.
)

// Bot MiddleWares
bot.use(session.middleware())  // For saving on database
bot.use(commandArgsMiddleware())  // For quering commands parameters.
bot.use(i18n.middleware())  // For locale language settings
bot.use(flow.middleware())

// Gets and sets bot's name for being able to call it from groups.
bot.telegram.getMe().then((botInfo) => {
  bot.options.username = botInfo.username
})


// Bot logic goes above
//=======================================================================

// Basic commands------------------------------------------------------
// Starting the Bot
bot.command('start', (ctx) => {
	ctx.reply('Bot started.')
})

// Say hello
bot.hears(match('hi'), (ctx) => {
	return ctx.reply(ctx.i18n.t('helloHuman'))
})

// Settings commands-----------------------------------------------------
// Changing the language
bot.command('/language', (ctx) => {

	const languageMenu = Extra
		  .markdown()
		  .markup((m) => m.inlineKeyboard([
		    m.callbackButton('🇺🇸 ' + ctx.i18n.t('english'), 'en'),
				m.callbackButton('🇧🇷' + ctx.i18n.t('portuguese'), 'pt')
		  ]))

  ctx.reply(ctx.i18n.t('languageInstr'), languageMenu)
})

bot.action('pt', (ctx) => {
	ctx.i18n.defaultLanguage = 'pt'
	ctx.i18n.locale('pt')
  ctx.reply(ctx.i18n.t('localeGreeting'))
})

bot.action('en', (ctx) => {
	ctx.i18n.defaultLanguage = 'en'
	ctx.i18n.locale('en')
	ctx.reply(ctx.i18n.t('localeGreeting'))
})

// List options
bot.command('/list', (ctx) => {

	// Checks if working on step-by-step mode or command mode
	if (ctx.state.command.args.length > 0) {

		const name = ctx.state.command.args[0]

		// Makes sure to create lists array on database
		if (ctx.session.lists == undefined || ctx.session.lists.length == 0) {
				ctx.session.lists = {}
		}

		// Checks if the seconds parameter if available
		if (ctx.state.command.args.length > 1) {

			for (i = 1; i < ctx.state.command.args.length; i++) {
				const item = ctx.state.command.args[i]

				// Checks if lists already exists
				if (ctx.session.lists[name] != undefined && ctx.session.lists[name] != null) {
					ctx.session.lists[name].push(item)
					ctx.replyWithMarkdown(item + ctx.i18n.t('addItemSuccess'))
				} else {
					ctx.session.lists[name] = []
					ctx.session.lists[name].push(item)
					ctx.reply(ctx.i18n.t('createListSuccess') + name + '. ' + item + ctx.i18n.t('addItemSuccess'))
				}
			}

		} else {
			// Checks if lists already exists
			if (ctx.session.lists[name] != undefined && ctx.session.lists[name] != null) {

				var listContent = ctx.i18n.t('showListSuccess') + name + ':'
				for (listItem in ctx.session.lists[name]) {
					listContent = listContent.concat('\n - ' + ctx.session.lists[name][listItem])
				}
				return ctx.replyWithMarkdown(listContent)
			} else {
				ctx.session.lists[name] = []
				return ctx.reply(ctx.i18n.t('createListSuccess') + name + '.')
			}
		}

	// Step-by-step mode
	} else {

		const listOptionsMenu = Extra
			  .markdown()
			  .markup((m) => m.keyboard([[
					m.callbackButton(ctx.i18n.t('createList'), 'createList'),
					m.callbackButton(ctx.i18n.t('showList'), 'showList')],
				[
					m.callbackButton(ctx.i18n.t('addItem'), 'addItemToList'),
					m.callbackButton(ctx.i18n.t('removeItem'), 'removeItemFromList')
			  ]]).oneTime().resize())

		return ctx.reply(ctx.i18n.t('listInstr'), listOptionsMenu)

	}

})

bot.hears(match('createList'), (ctx) => ctx.flow.enter('listCreationScene'))
bot.hears(match('showList'), (ctx) => ctx.flow.enter('showListScene'))

// Prints about
bot.command('/about', (ctx) => {
	ctx.reply(ctx.i18n.t('aboutMessage'))
})
// Create list
/*bot.command('/new', (ctx) => {

}) */

// ======================================================================

// Error handling
bot.catch((err) => {
  console.log('Ooops ', err)
})

// Start Polling
bot.startPolling(30)
