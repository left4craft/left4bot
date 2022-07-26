const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'suggest',
	description: 'Make a suggestion',
	usage: '<suggestion>',
	example: 'suggest add this feature',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description)
		.addStringOption(option => 
			option.setName('suggestion')
				.setDescription('Enter your suggestion')
				.setRequired(true)),
	args: true,
	guildOnly: true,
	adminOnly: false,
	async execute(message, args, depend) {
		const client = message.client;

		const {
			config,
			discord_lib: Discord,
			log,
		} = depend;

		let suggestion = args.join(' '); // make it a string again

		const channel = await client.channels.fetch(config.suggestion_chan_id);

 
		// basic with thumbs up and down
		log.info(`${message.author.username} submitted a suggestion`);

		const poll = await channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(suggestion)
				.setAuthor({name: message.author.username + '\'s suggestion', iconURL: message.author.avatarURL()})
				.setDescription('Do you like this idea? \n\n:thumbsup: Yes\n\n:thumbsdown: No')
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]});

		await poll.react('👍');
		await poll.react('👎');


		message.channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(':thumbsup: Suggestion submitted')
				.setDescription(`**»** Go to <#${config.suggestion_chan_id}> to view`)
				.addFields({name: 'Suggestion', value: suggestion, inline: false})
		]}); // success message


		(await client.channels.fetch(config.log_chan_id)).send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('Suggestion submitted')
				.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
				.addFields({name: 'By', value: message.author.tag, inline: true})
				.addFields({name: 'Suggestion', value: suggestion, inline: false})
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}); // log channel message

	}
};