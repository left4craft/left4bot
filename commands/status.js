const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	name: 'status',
	description: 'Get server status information',
	usage: '',
	example: 'status',
	getSlashCommandBuilder: () => new SlashCommandBuilder()
		.setName(module.exports.name)
		.setDescription(module.exports.description),
	args: false,
	cooldown: 60,
	guildOnly: true,
	adminOnly: false,
	async execute(interaction, depend) {
		const client = interaction.client;

		const {
			config,
			discord_lib: Discord,
			log,
			fetch,
			minecraft_server_util: query,
		} = depend;

		await interaction.deferReply();

		// query bungee to update the status category        
		query(config.ip, config.port)
			.then(async (res) => {
				log.console(log.f(`${config.name} is &aonline with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? 'player' : 'players'}&f, updating status category`)); // log status - online

				(await client.channels.fetch(config.status_cat_id)).setName(`online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? 'player' : 'players'}`); // cat name

				client.user.setStatus('online'); // green status
			})
			.catch(async () => {
				log.console(log.f(`${config.name} is &coffline`)); // log status - offline

				(await client.channels.fetch(config.status_cat_id)).setName('server is offline (!status)'); // cat name

				client.user.setStatus('dnd'); // red status

				// throw err;
			});



		// get data from api for embed
		fetch('https://statusapi.l4c.link/status')
			.then(res => res.json())
			.then(json => {

				let servers = Object.keys(json);
				let players = json.bungee?.status?.players || 0;
				// Type \`list\` in <#${config.chat_bridge_chan_id}> for a list of online players.
				// let player_list = json.services.minecraft.proxy.players.replace(/,/g, ', ').trim();

				let description = [
					`**${players}** ${players === 1 ? 'person' : 'people'} ${players === 1 ? 'is' : 'are'} currently playing on **${config.ip}**.`,
					`\nCommunicate with these players in <#${config.chat_bridge_chan_id}>.`,
					'\nYou can subscribe to status update notifications by using `/subscribe status`.',
					`View full system status at [${config.status_page_pretty}](${config.status_page}).`
				];

				let embed = new Discord.EmbedBuilder()
					.setAuthor({name: 'Status', iconURL: 'https://status.left4craft.org/icons/online.png', url: config.status_page})
					.setColor(config.color.success)
					.setTitle(`${config.name} is ${json.bungee?.status?.online ? 'online' : 'offline'}`, config.status_page)
					.setDescription(description[0] + '\n' + description[1] + '\n' + description[2] + '\n' + description[3])
					.setFooter({text: `${config.name} | Data could be up to 5 minutes old`, iconURL: client.user.avatarURL()})
					.setTimestamp();


				for (let server of servers) {
					if(server.startsWith('cached') || json[server].type === 'website') continue;

					let colour = json[server].status?.online ? 'green' : 'red';
					let status = json[server].status?.online ? 'online' : 'offline';
					let tps = '';
					if (json[server].status?.tps) tps = `**TPS:** \`${json[server].status.tps}\`\n`;
					let info = `**Status:** \`${status}\`\n${tps}**Players:** \`${json[server].status?.players || 0}\``;
					embed.addFields({name: `:${colour}_square: **${json[server].display_name}**`, value: info, inline: true});
				}

				interaction.editReply({embeds: [embed]});
			});

	}
};