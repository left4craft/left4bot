const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'say',
	description: 'Make the bot say something',
	usage: '<message>',
	example: 'say ok',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => 
			option.setName('message')
				.setDescription('Enter a message for the bot to say')
				.setRequired(true)),
	args: true,
    
	guildOnly: true,
	adminOnly: true,
	async execute(message, args, depend) {
		const client = message.client;
		const {
			config,
			discord_lib: Discord,
		} = depend;

		// command starts here
		const guild_self = await message.guild.members.fetch(client.user.id);
		if (message.channel.permissionsFor(guild_self).has(Discord.PermissionsBitField.ManageMessages)) {
			message.delete();
		}

		const text = args.join(' '); 

		message.channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
				.setDescription(text)
		]});

		(await client.channels.fetch(config.log_chan_id)).send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(`${message.author.username} said`)
				.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
				.setDescription(text)
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}); // log channel message

       
	}
};