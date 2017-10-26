# **ORGN BOT**: a Telegram Bot made for activists, community organizers and social movements.

## Status
Under development!

## Philosophy
ORGN is a Telegram bot, tailored to assist activists, community organizers and social movements to organize in a networked world. It is designed to guide a group with a target in common, from planting a tree in the neighborhood to organizing an occupation or a demonstration. The group just need to invite the bot to the conversation, and let him organize the data.   
We want to organize the organizers!

## Instalation
You will need `npm` and thus Node v.7.x or greater installed. See instructions [here](http://nodejs.org/).

```
cd _cloned/repository/path_
npm install
```

## Setup
You should create a MySQL table named sessions in your database.

```SQL
CREATE TABLE `sessions` (
  `id` varchar(100) NOT NULL,
  `session` longtext NOT NULL,
  PRIMARY KEY (`id`))
```

Copy and edit _config\_sample.js_ to set up your MySQL and [TelegramBot API](https://core.telegram.org/bots/api#authorizing-your-bot) data (This is important, otherwise you won't be chating with a valid bot). Once you're done, rename it to _config.js_.

## Run server
```
cd _cloned/repository/path_
npm start
```
The start script simply executes the bot.js file inside src. You can change this initialization on _package.json_
