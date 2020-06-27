/**
 * Discord BOT and WEBHOOK tokens,
 * SQL database credentials,
 * and Redis credentials
 * are located in .env (copy env.txt)
 */

module.exports = {
	/**
	 * Logs
	 */
	name: 'Left4Craft',
	prefix: '!', // prefix commands with this
	colour: '#4CAF50', // for embeds
	ip: 'mc.left4craft.org',
	port: 25565,
	guild_id: '424571587413540874',
	activities: ['Minecraft', 'on mc.left4craft.org', 'with nuclear launch codes', 'Minecraft on mc.left4craft.org'],
	activity_type: 'PLAYING',
	cooldown: 3, // default (in seconds), can be different for each command

	/**
	 * Logs
	 */
	debug_level: 0,
	log_dm: false,
	log_general: true,
	log_chan_id: '425382138037403658',

	/**
	 * Basic bot features
	 */
	poll_chan_id: '697485686688710786',
	subscription_roles: {
		status: {
			title: 'Status notifications',
			description: 'Get mentioned when there is a status notification posted to <#701035082240229477>.\nTo prevent you from throwing your phone at a wall in the event that multiple servers go offline simultaneously, the notification service is limited to **1 ping per 5 minutes**.',
			role: '701904205144653886',
			id: 'status'
		}
	},

	/**
	 * Status
	 */
	status_update_interval: 60, // in seconds
	status_cat_id: '697518406013812837',
	status_page: 'https://status.left4craft.org',
	status_page_pretty: 'status.left4craft.org',

	/**
	 * Chat bridge
	 */
	chat_bridge_chan_id: '424870757860900865',
	chat_webhook_id: '602334307503177729', // webhook token is in ENV
	muted_channel_id: '587122816797769788',

	/**
	 * Role sync
	 */
	in_game_ranks: {
		'guest': '429026758692438038',
		'user': '424866580141441026',
		'user+': '424866910870437898',
		'donor': '424867041426538496',
		'patron': '426469168171319297',
		'patron+': '424867110041288716',
		'builder': '424867526481281024',
		'helper': '424867726511570955',
		'moderator': '424867915226021888',
		'admin': '424868133967364096',
		'owner': '424868296886583316'
	},
	admin_roles: ['admin', 'owner'], // due to lazy code, these MUST be the DISCORD role names (you'd think it'd get the Discord ID from the Minecraft rank name above but no)
	staff_ranks: ['helper', 'moderator', 'admin', 'owner'],
	special_ranks: {
		'staff': '424867647381831690',
		'muted': '587112191950585856',
		'status_subscriber': '701904205144653886'
	},

	// Links/websites
	links: [{
			name: 'Home / Forums',
			url: 'https://www.left4craft.org',
			pretty: 'www.left4craft.org'
		},
		{
			name: 'Discord Server',
			url: 'https://discord.left4craft.org',
			pretty: 'discord.left4craft.org'
		},
		{
			name: 'Shop / Donation Store',
			url: 'https://www.left4craft.org/shop',
			pretty: 'www.left4craft.org/shop'
		},
		{
			name: 'Punishments',
			url: 'https://www.left4craft.org/bans',
			pretty: 'www.left4craft.org/bans'
		},
		{
			name: 'Status',
			url: 'https://status.left4craft.org',
			pretty: 'status.left4craft.org'
		}
	]
};