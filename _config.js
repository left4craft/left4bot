module.exports = {
	name: 'Left4Craft', // your server's name
	token: '...............................', // do NOT share
	prefix: '!', // prefix commands with this
	colour: '#4CAF50', // for embeds
	ip: 'mc.left4craft.org',
	port: 25565,
	admin_roles: ['424868133967364096', '424868296886583316'],
	activities: ['Minecraft', 'on mc.left4craft.org', 'with nuclear launch codes', 'Minecraft on mc.left4craft.org'],
	activity_type: 'PLAYING',
	cooldown: 3, // default (in seconds), can be different for each command
	debug_level: 0,
	log_dm: true,
	log_general: true,
	log_chan_id: '425382138037403658',
	status_cat_id: '697518406013812837',
	poll_chan_id: '697485686688710786',
	chat_bridge_chan_id: '424870757860900865',
	chat_webhook_id: '602334307503177729',
	chat_webhook_token: '..................................', // do NOT share
	status_update_interval: 60, // in seconds
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
	],
	status_page: 'https://status.left4craft.org',
	status_page_pretty: 'status.left4craft.org',
	subscription_roles: {
		status: {
			title: 'Status notifications',
			description: 'Get mentioned when there is a status notification posted to <#701035082240229477>.\nTo prevent you from throwing your phone at a wall in the event that multiple servers go offline simultaneously, the notification service is limited to **1 ping per 5 minutes**.',
			role: '701904205144653886',
			id: 'status'
		}
	},
	redis: {
		host: '127.0.0.1',
		port: 6379,
		pass: 'supersecretpass'
	},
	guild_id: '424571587413540874',
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
	staff_ranks: ['helper', 'moderator', 'admin', 'owner'],
	special_ranks: {
		'staff': '424867647381831690',
		'status_subscriber': '701904205144653886'
	}
};