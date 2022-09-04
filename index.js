/**
 * @name left4bot
 * @author eartharoid, Captain_Sisko
 * @license MIT
 */

require('dotenv').config();
const fs = require('fs');
const emojis = require('./emojis.json');
const emoji = require('node-emoji');
const Discord = require('discord.js');
const client = new Discord.Client({
	autoReconnect: true,
	intents: [
		Discord.GatewayIntentBits.Guilds,
		Discord.GatewayIntentBits.DirectMessages,
		Discord.GatewayIntentBits.GuildMessages,
		Discord.GatewayIntentBits.GuildMembers,
		Discord.GatewayIntentBits.MessageContent
	],
	partials: [Discord.Partials.Channel]
});

const redis = require('redis');
const query = require('minecraft-server-util');

const config = require('./config.js');
const player_util = require('./util/player_util.js');
const sync = require('./util/sync.js');
const fetch = require('node-fetch');

const Logger = require('leekslazylogger');
const log = new Logger({
	name: config.name,
	maxAge: 3,
	debug: config.debug
});

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const chat_bridge = new Discord.WebhookClient({id: config.chat_webhook_id, token: process.env.CHAT_WEBHOOK_TOKEN});
const redis_client = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT
});
const redis_subscriber = redis.createClient({
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT
});


const mysql = require('mysql');
const sql_pool = mysql.createPool({
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME
});

// object that can be passed to various commands and subscribers so they don't need to be re-declared every time
const dependencies = {
	fs: fs,
	discord_client: client,
	discord_lib: Discord,
	log: log,
	config: config,
	chat_bridge: chat_bridge,
	redis_client: redis_client,
	sql_pool: sql_pool,
	player_util: player_util,
	fetch: fetch,
	minecraft_server_util: query,
	webhook: chat_bridge
};

redis_client.on('error', (error) => {
	log.error(error);
});

redis_subscriber.on('error', (error) => {
	log.error(error);
});

// async function connect_redis() {
// 	await redis_client.connect();
// 	await redis_subscriber.connect();

// 	if(process.env.REDIS_PASS) {
// 		redis_client.auth(process.env.REDIS_PASS);
// 		redis_subscriber.auth(process.env.REDIS_PASS);	
// 	}
// }

redis_client.auth(process.env.REDIS_PASS);
redis_subscriber.auth(process.env.REDIS_PASS);	

client.once('ready', async () => {
	log.success('Connected to Discord API');
	log.success(`Logged in as ${client.user.tag}`);

	const commands = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

	for (const file of commands) {
		const command = require(`./commands/${file}`);
		client.commands.set(command.name, command);
		log.console(`[CMD] > Loaded '/${command.name}' command`);
	}

	log.info(`Finished loading ${commands.length} commands`);

	const subscriber_files = fs.readdirSync('./subscribers').filter(file => file.endsWith('.js'));
	var subscribe_channels = [];
	var subscribers = [];

	for (const file of subscriber_files) {
		const sub = require(`./subscribers/${file}`);
		subscribers.push(sub);
		log.console(`[SUB] > Loaded '${sub.channels}' subscriber`);
	}
	log.info(`Finished loading ${subscriber_files.length} subscribers`);

	redis_subscriber.on('message', (channel, message) => {
		for (const subscriber of subscribers) {
			if (subscriber.channels.includes(channel)) {
				subscriber.execute(channel, message, dependencies);
			}
		}
	});

	for (const subscriber of subscribers) {
		for (const channel of subscriber.channels) {
			subscribe_channels.push(channel);
		}
	}

	let channels_set = new Set(subscribe_channels);

	for (let channel of channels_set) {
		redis_subscriber.subscribe(channel);
	}

	log.console(log.f(`[SUB] > Subscribed to ${subscribe_channels.length} channels: &9${subscribe_channels.join(', ')}`));

	if (config.log_general) {
		const chan = await client.channels.fetch(config.log_chan_id);
		chan.send({embeds: [
			new Discord.EmbedBuilder()
				.setColor(config.color.success)
				.setTitle('Started')
				.setDescription(`✅ **»** Started successfully with **${commands.length} commands** and **${subscribe_channels.length} subscribers** loaded.`)
				.setFooter({text: config.name, iconURL: client.user.avatarURL()})
				.setTimestamp()
		]}
		);
	}

	const updatePresence = () => {
		let num = Math.floor(Math.random() * config.activities.length);
		client.user.setActivity(config.activities[num]);
		// "type" option broke the bot presence for some reason, so just leaving it at "PLAYING" for now
		// client.user.setPresence({
		// 	activities: [{
		// 		name: config.activities[num] + `  |  /help`,
		// 		type: config.activity_types[num]
		// 	}]
		// });
	};

	updatePresence();
	setInterval(() => {
		updatePresence();
	}, 15000);

	const updateStatusInfo = async () => {
		log.info(`Pinging ${config.ip}`);
		const cat = await client.channels.fetch(config.status_cat_id);
		query(config.ip, config.port)
			.then((res) => {
				const status = `online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? 'player' : 'players'}`;
				log.console(log.f(`${config.name} is &a${status}`)); // log status - online

				if (cat.name !== status) { // only if it is different
					cat.setName(status);
					log.info('Status has changed, updating status category');
					client.user.setStatus('online'); // green status
				}
			})
			.catch(() => {
				log.console(`${config.name} is &coffline`);

				cat.setName('server is offline (!status)'); // cat name
				client.user.setStatus('dnd'); // red status
			});

	};

	updateStatusInfo();
	setInterval(() => {
		updateStatusInfo();
	}, config.status_update_interval * 1000);

	redis_client.publish('minecraft.punish', 'update');
	setInterval(() => {
		redis_client.publish('minecraft.punish', 'update');
	}, config.update_punishment_interval * 1000);

	sync.expire_tokens(redis_client);
	setInterval(() => {
		sync.expire_tokens(redis_client);
	}, config.code_expire_interval * 1000);

});

client.on('interactionCreate', async interaction => {
	// handle button inputs
	if(interaction.isButton()) {
		if(interaction.customId === 'sync') {
			await sync.sync_message(redis_client, interaction);
		}
		return;
	}

	// handle chat inputs
	if (!interaction.isChatInputCommand()) return;
	const command = client.commands.get(interaction.commandName);
	if(!command) {
		await interaction.reply('Error: Command not found.');
		return;
	}

	if(command.guildOnly && interaction.guild === null) {
		await interaction.reply('Sorry, this command can only be used in a server.');
		return;
	}

	// @TODO improve permissions
	if ((command.permission && !interaction.member.hasPermission(command.permission)) || (command.staffOnly === true && !interaction.member.roles.cache.some(r => config.staff_ranks.includes(r.name.toLowerCase()))) || (command.adminOnly === true && !interaction.member.roles.cache.some(r => config.admin_roles.includes(r.name.toLowerCase())))) {
		await interaction.reply({
			embeds: [new Discord.EmbedBuilder()
				.setColor(config.color.fail)
				.setDescription(`\n❌ **You do not have permission to use the \`${command.name}\` command.**`)]
		});
		return;
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || config.cooldown) * 1000;

	if (timestamps.has(interaction.member.id)) {
		const expirationTime = timestamps.get(interaction.member.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			log.console(`${interaction.member.displayName} attempted to use the '${command.name}' command before the cooldown was over`);
			await interaction.reply({
				embeds: [new Discord.EmbedBuilder()
					.setColor(config.color.fail)
					.setDescription(`❌ **Please do not spam commands.**\nWait ${timeLeft.toFixed(1)} second(s) before reusing the \`${command.name}\` command.`)]
			});
			return;
		}
	}

	timestamps.set(interaction.member.id, now);
	setTimeout(() => timestamps.delete(interaction.member.id), cooldownAmount);

	try {
		log.console(`${interaction.member.displayName} used the '${command.name}' command`);
		await command.execute(interaction, dependencies);
	} catch (error) {
		log.error(`An error occurred whilst executing the '${command.name}' command`);
		log.error(error);
		if(interaction.replied) {
			await interaction.followUp(`❌ An error occurred whilst executing the \`${command.name}\` command.\nThis issue has been reported.`);
		} else {
			await interaction.reply(`❌ An error occurred whilst executing the \`${command.name}\` command.\nThis issue has been reported.`);
		}
	}

});

client.on('messageCreate', async message => {
	if (message.author.bot && (message.author.id !== '836714577474617346')) return;

	// console.log(JSON.stringify(message));

	// check if message is dm
	// if (message.guild === null) {
	// 	// console.log('dm');
	// 	if (message.author.id === client.user.id) return;
	// 	if (config.log_dm) {
	// 		if (config.log_general) {
	// 			(await client.channels.fetch(config.log_chan_id)).send({
	// 				embeds: [new Discord.EmbedBuilder()
	// 					.setAuthor({name: message.author.username, iconURL: message.author.avatarURL()})
	// 					.setTitle('DM Logger')
	// 					.addFields({name: 'Username', value: message.author.tag, inline: true})
	// 					.addFields({name: 'Message', value: message.content, inline: true})
	// 					.setFooter({text: config.name, iconURL: client.user.avatarURL()})
	// 					.setTimestamp()]
	// 			});
	// 		}
	// 	}

	// 	sync.sync_message(redis_client, message.channel, message.author.id);

	// 	return;
	// }

	const is_linked_channel = message.channel.id === config.chat_bridge_chan_id || message.channel.id === config.admin_chan_id;
	if (is_linked_channel) {
		if (message.content.length > 256) {
			message.reply('your chat message was not sent because the length is >256');
		} else if (message.content.toLowerCase() === 'list') {
			log.console(`${message.author.tag} listed online players`);

			redis_client.get('minecraft.players', (err, response) => {
				let text = '';

				if (err) {
					log.error(err);
					text = 'Failed to parse minecraft.players';
				}

				try {
					let players = JSON.parse(response);
					let player_count = Object.keys(players).length;
					let player_names = players.map(player => player.username);

					switch (player_count) {
					case 0:
						text = 'No players online';
						break;
					case 1:
						text = `There is **${player_count}** player online: \`${player_names.join(', ')}\``;
						break;
					default:
						text = `There are **${player_count}** players online: \`${player_names.join(', ')}\``;
						break;
					}

				} catch (e) {
					log.warn('Could not parse minecraft.players!');
					log.error(e);
					text = 'Failed to parse minecraft.players';
				}

				message.channel.send(text);
				message.delete();
			});
		} else {
			const role = message.member.roles.highest.name;
			const name = message.member.displayName;
			// let content = yourls.conditionalReplace(message.cleanContent, dependencies);
			let content = emoji
				.unemojify(message.cleanContent) // replace standard/unicode emojis
				.replace(/<a?(:\S*:)\d{18}>/gm, '$1') // replace custom emoji with their names
				.replace(/:([_a-zA-Z0-9]*):/gm, ($_, $1) => emojis[$1] || $_); // replace some emoji names with other text

			redis_client.publish('minecraft.chat', JSON.stringify({
				type: 'discord_chat',
				discord_username: message.author.tag,
				timestamp: new Date().getTime(),
				discord_prefix: `&#7289DA[Discord${config.rank_colors[role.toLowerCase()]}${role}&#7289DA]&r ${name} &#7289DA&l»&r `,
				discord_id: message.member.id,
				content: content,
				attachments: message.attachments,

				// @TODO Check if rank sufficient to use color and format
				color: true,
				format: true
			}));

			log.console(`[CHAT OUT] [${role}] ${name}: ${content}`);

			if (message.channel.id === config.admin_chan_id) {
				chat_bridge.send(content, {
					avatarURL: message.author.displayAvatarURL(),
					username: name
				});
			} else {
				const admin = await client.channels.fetch(config.admin_chan_id);
				admin.send(`[DSC] **${name}** said: \`${content.replace(/`/g, '\\`')}\``);
			}
			
		}
	} else if (message.channel.id === config.count_chan_id && message.author.id !== client.user.id) {
		if (
			/^\d+!$/.test(message.content.trim()) && // match "123!"
			interaction.member.roles.cache.some(r => config.admin_roles.includes(r.name.toLowerCase())) // is admin
		) {
			let this_num = parseInt(message.content.split(' ')[0]);
			redis_client.set('minecraft.countinggame', JSON.stringify({ 'last_num': this_num, 'last_author': message.author.id }));
			return;
		}
		redis_client.get('minecraft.countinggame', (err, response) => {
			let last_num = 0;
			let last_author = 0;

			if (err) {
				log.error(err);
			}

			try {
				response = JSON.parse(response);
				last_num = response['last_num'];
				last_author = response['last_author'];
			} catch (e) {
				log.warn('Could not parse minecraft.countinggame');
				log.error(e);
			}

			let this_num = parseInt(message.content.split(' ')[0]);
			if(isNaN(this_num) || this_num !== last_num + 1 || last_author === message.author.id) {
				message.delete();
				return;
			} else {
				redis_client.set('minecraft.countinggame', JSON.stringify({'last_num': this_num, 'last_author': message.author.id}));

				if(Math.random() < 0.08) {
					message.reply('You just won $25 in game for counting ' + String(this_num));
					player_util.get_uuid(message.author.id, sql_pool, log, (uuid) => {
						if(uuid != null) {
							redis_client.publish('minecraft.console.survival.in', `eco give ${uuid} 25`);
						}
					});
				} else if (Math.random() < 0.02) {
					message.reply('You just won $50 in game for counting ' + String(this_num));
					player_util.get_uuid(message.author.id, sql_pool, log, (uuid) => {
						if(uuid != null) {
							redis_client.publish('minecraft.console.survival.in', `eco give ${uuid} 50`);
						}
					});
				} else if (Math.random() < 0.01) {
					message.reply('You just won a normal crate key in game for counting ' + String(this_num));
					player_util.get_uuid(message.author.id, sql_pool, log, (uuid) => {
						if (uuid != null) {
							redis_client.publish('minecraft.console.hub.in', `givecosmetic ${message.member.displayName} 1 0`);
						}
					});
					
				}
			}
		});
	}
});

// client.on('guildMemberAdd', member => {
// 	member.createDM(dm => {
// 		dm.send(`Welcome to ${config.name}. Please read the information in <#${config.welcome_chan_id}> *(scroll up!).*`);
// 		sync.sync_message(redis_client, dm, member.id);
// 	});
// });

client.on('rateLimit', limit => {
	log.warn('Rate-limited!');
	log.debug(limit);
});

client.on('error', error => {
	log.warn('Potential error detected\n(likely Discord API connection issue)\n');
	log.error(`Client error:\n${error}`);
});
client.on('warn', (e) => log.warn(e));

client.on('debug', (e) => log.debug(e));

process.on('unhandledRejection', error => {
	log.warn('An error was not caught');
	log.error(`Uncaught error: \n${error.stack}`);
});
process.on('beforeExit', (code) => {
	log.console(log.f('&6Disconnected from Discord API'));
	log.console(`Exiting (${code})`);
});

// module.exports.conditionalReplace = (str, depend) => new Promise(resolve => resolve(str.replace(regex, async url => {
//     if (url.length < depend.config.yourls.max_length) return url;
//     else return await module.exports.shorten(url, false, depend);
// })));

// module.exports.conditionalReplace = async (str, depend) => new Promise(resolve => {
// 	let urls = str.match(regex);
// 	let strArr = str.split(regex);
// 	for (const i in urls) {
// 		if (urls[i].length > depend.config.yourls.max_length) {
// 			urls[i] = await module.exports.shorten(url, false, depend);
// 		}
// 	}
// 	let finalStr = ''
// 	for(const i in strArr) {
// 		finalStr += strArr[i];
// 		if (urls[i] !== undefined) finalStr += urls[i];
// 	}
// 	resolve(finalStr);
// });

client.login(process.env.DISCORD_BOT_TOKEN);
