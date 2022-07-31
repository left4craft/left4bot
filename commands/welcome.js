const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'welcome',
	description: 'Set up welcome message and button',
	usage: '',
	example: 'welcome',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description),
	args: false,
	guildOnly: true,
	adminOnly: true,
	async execute(interaction, depend) {
		const client = interaction.client;

		const {
			config,
			discord_lib: Discord,
		} = depend;

		const emoji = ['one', 'two', 'three', 'four'];
		const rules = [
			'Be respectful',
			'Don\'t spam or ping members excessively',
			'Don\'t send messages that include any violent, hateful, or explicit content',
			'Don\'t advertise'
		];
	
		await interaction.deferReply({ephemeral: true});


		const syncButton = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setCustomId('sync')
					.setLabel('Sync Minecraft Account')
					.setStyle(Discord.ButtonStyle.Success),
			);

		const topMessage = await interaction.channel.send({ embeds: [
			new Discord.EmbedBuilder()
				.setColor(0x4caf50)
				.setTitle('**__Welcome to Left4Craft\'s Discord server__**')
				.setDescription('Please read the information below.')
		]});

		await interaction.channel.send({ embeds: [
			new Discord.EmbedBuilder()
				.setColor(0x4caf50)
				.setTitle('Rules')
				.setDescription('Discord-specific rules:\n' + rules.map((r, i) => `> :${emoji[i]}: ${r}`).join('\n') + '\n\nView all of the rules at [l4c.link/rules](https://l4c.link/rules).'),

		]});
		await interaction.channel.send({ embeds: [
			new Discord.EmbedBuilder()
				.setColor(0x4caf50)
				.setTitle('Syncing Your Account')
				.setDescription('To fully access this Discord server, you must link your Discord and Minecraft account. This allows for synchronization of ranks, in-game chat, and other features.\
					\n\nClick the button below to get started:')
		], components: [syncButton] });

		await interaction.channel.send({ embeds: [
			new Discord.EmbedBuilder()
				.setColor(0x4caf50)
				.setDescription(`**[Click here to jump to the top.](${topMessage.url})**`)
		]});

		await interaction.editReply('Welcome message created');

		(await client.channels.fetch(config.log_chan_id)).send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('Welcome message regenerated')
				.setAuthor({name: interaction.member.displayName, iconURL: interaction.user.avatarURL()})
				.addFields({name: 'By', value: interaction.member.displayName, inline: true})
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}); // log channel message

	}
};