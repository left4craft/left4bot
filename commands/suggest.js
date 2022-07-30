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
	async execute(interaction, depend) {
		const client = interaction.client;

		const {
			config,
			discord_lib: Discord,
			log,
		} = depend;

		let suggestion = interaction.options.getString('suggestion');


		await interaction.deferReply();
		const channel = await client.channels.fetch(config.suggestion_chan_id);

 
		// basic with thumbs up and down
		log.info(`${interaction.member.displayName} submitted a suggestion`);

		const poll = await channel.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle(suggestion)
				.setAuthor({name: interaction.member.displayName + '\'s suggestion', iconURL: interaction.user.avatarURL()})
				.setDescription('Do you like this idea? \n\n:thumbsup: Yes\n\n:thumbsdown: No')
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]});

		await poll.react('👍');
		await poll.react('👎');


		await interaction.editReply({embeds: [
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
				.setAuthor({name: interaction.member.displayName, iconURL: interaction.user.avatarURL()})
				.addFields({name: 'By', value: interaction.member.displayName, inline: true})
				.addFields({name: 'Suggestion', value: suggestion, inline: false})
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}); // log channel message

	}
};