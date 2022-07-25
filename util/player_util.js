exports.get_uuid = (input, sql_pool, log, callback) => {
	// step 1: check for exact username match
	sql_pool.query('SELECT uuid FROM litebans_history WHERE name = ?', input, (err, res) => {
		input = input.trim();

		if(err) log.error(err);

		if(res[0] !== undefined) {
			callback(res[0]['uuid']);
		} else {
			// step 2: check for exact discord id match
			// eslint-disable-next-line no-undef
			sql_pool.query('SELECT HEX(uuid) FROM discord_users WHERE discordID = ?', [isNaN(input) ? 0 : BigInt(input)], (err, res) => {
				if(err) log.error(err);
				if(res[0] !== undefined) {
					let uuid = res[0]['HEX(uuid)'].toLowerCase();
					uuid = uuid.slice(0,8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20);
					callback(uuid);
				} else {
					// step 3: check for exact uuid match
					sql_pool.query('SELECT uuid FROM litebans_history WHERE uuid = ?', input, (err, res) => {
						if(err) log.error(err);
						if(res[0] !== undefined) {
							callback(res[0]['uuid']);
						} else {
							// step 4: check for discord tag match
							input = input.slice(2, -1);
							if(input.startsWith('!')) input = input.slice(1);
    
							// eslint-disable-next-line no-undef
							sql_pool.query('SELECT HEX(uuid) FROM discord_users WHERE discordID = ?', [isNaN(input) ? 0 : BigInt(input)], (err, res) => {
								if(err) log.error(err);
								if(res[0] !== undefined) {
									let uuid = res[0]['HEX(uuid)'].toLowerCase();
									uuid = uuid.slice(0,8) + '-' + uuid.slice(8, 12) + '-' + uuid.slice(12, 16) + '-' + uuid.slice(16, 20) + '-' + uuid.slice(20);
									callback(uuid);
									return;
								} else {
									callback(null);
								}
							});
						}
					});
				} 
			});
		}
	});
};
/*
Returns the user's info in an object with the following format:

{
    username: string
    online: boolean
    muted: boolean
    banned: boolean
    history_url: string
}

if user not found, returns null
*/
exports.get_player_info = (uuid, sql_pool, redis_client, log, callback) => {
	// step 1: get most recent username
	sql_pool.query('SELECT name FROM litebans_history WHERE uuid = ? ORDER BY date DESC LIMIT 1 ', [uuid], (err, res) => {
		if(err) log.error(err);
		if(res[0] === undefined) {
			callback(null);
		} else {

			// setp 2: get online status
			const user = res[0]['name'];
			redis_client.get('minecraft.players', (err, response) => {
				let online = false;
				if(response === null) response = '[]';
				let players = JSON.parse(response);
				for(let player of players) {
					if(player['uuid'] === uuid) online = true;
				}
                
				// step 3: get muted / banned status
				sql_pool.query('SELECT reason FROM litebans_mutes WHERE uuid = ? AND (until < 1 OR until > unix_timestamp()*1000) AND active = 1', uuid, (err, res) => {
					if(err) log.error(err);
					const muted = res[0] !== undefined;
					sql_pool.query('SELECT reason FROM litebans_bans WHERE uuid = ? AND (until < 1 OR until > unix_timestamp()*1000) AND active = 1', uuid, (err, res) => {
						if(err) log.error(err);
						const banned = res[0] !== undefined;
						sql_pool.query('SELECT nick FROM nicky WHERE uuid = ?', uuid, (err, res) => {
							if(err) log.error(err);

							callback({
								username: user,
								online: online,
								muted: muted,
								banned: banned,
								history_url: require('../config.js').litebans_base_url + uuid,
								nick: res[0] === undefined ? null : res[0]['nick'].replace(/§[0-9A-FK-ORa-fk-or]/g, '').replace(/&[0-9A-FK-ORa-fk-or]/g, '') // strip color codes
							});
    
						});
					});
				});
			});
		}
	});
};