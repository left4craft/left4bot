require('dotenv').config();
const fs = require('fs');
const config = require('./config.js');

const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');

const commands = [];
const command_names = [];

const command_files = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of command_files) {
    const command = require(`./commands/${file}`);
    command_names.push(command.name);
    if(command.name !== 'help') commands.push(command.getSlashCommandBuilder().toJSON());
}

// register help command
commands.push(require('./commands/help').getSlashCommandBuilder(command_names));

// const commands = [
// 	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
// 	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
// 	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
// ]
// 	.map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(config.client_id, config.guild_id), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
