# **ORGN BOT**: The Telegram Bot made for activists, community organizers and social movements. 

# Status
Under development!

# Philosophy

ORGN is a robot, tailored to assist activists, community organizers and social movements to organize in a networked world. It is designed to guide a group with a target in common, from planting a tree in the neighborhood to organizing an occupation or a demonstration. The group just need to invite the bot to the conversation, and let him organize the data.   
We want to organize the organizers!

## Instalation

You will need `npm` and thus Node v.7.x or greater installed. See instructions [here](http://nodejs.org/).

```
cd _cloned\_repository\_path_
sudo npm install
```

*sudo is not necessary on Windows.

## Setup

You should create a MySQL table named sessions in your database.

```SQL
CREATE TABLE `sessions` (
  `id` varchar(100) NOT NULL,
  `session` longtext NOT NULL,
  PRIMARY KEY (`id`))
```

Follow _config\_sample.js_ to set your MySQL and TelegramBot API data.


