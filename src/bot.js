const Telegraf = require('telegraf')
const MySQLSession = require('../lib/session')
const commandArgsMiddleware = require('../lib/commandArgs');
const config = require('./config');

const telegraf = new Telegraf(config.telegraf_token)

const session = new MySQLSession({
  host: config.database_host,
  user: config.database_user,
  password: config.database_password,
  database: config.database_name
})

telegraf.use(session.middleware())
telegraf.use(commandArgsMiddleware());

telegraf.command('start', (ctx) => ctx.reply('Bot started.'));

telegraf.on('text', (ctx, next) => {
  ctx.session.counter = ctx.session.counter || 0
  ctx.session.counter++
  return next()
})

telegraf.hears('banana', (ctx) => {
  ctx.session.bananas = ctx.session.bananas || 0
  ctx.session.bananas++
  return ctx.reply('🙊')
})

telegraf.hears('a', (ctx) => {
  return ctx.reply('⚫️⚪️\n⚪️⚪️\n⚪️⚪️')
})

telegraf.hears('b', (ctx) => {
  return ctx.reply('⚫️⚪️\n⚫️⚪️\n⚪️⚪️')
})

telegraf.hears('c', (ctx) => {
  return ctx.reply('⚫️⚫️\n⚪️⚪️\n⚪️⚪️')
})

telegraf.command('/stats', (ctx) => {
  return ctx.reply(`${ctx.session.counter} messages from ${ctx.from.username} and ${ctx.session.bananas} bananas from ${ctx.from.username}`)
})

telegraf.command('/new', (ctx) => {
  console.log(ctx);
  console.log(ctx.state.command);
  return ctx.reply('New list of ' + ctx.state.command.args[0] + 's')
})

telegraf.startPolling(30)
