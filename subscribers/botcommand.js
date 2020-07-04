module.exports = {
    channels: ['discord.botcommands'],

    execute(channel, message, depend) {
        const log = depend['log'];
        const config = depend['config'];
        const discord_client = depend['discord_client'];

        log.basic('[BOT CMD] ' + message);

        // try {
            commandObj = JSON.parse(message);

			if(commandObj.command === 'setuser') {
                discord_client.guilds.cache.get(config.guild_id).members.fetch(commandObj.id).then((member) => {
                    member.setNickname(commandObj.nick);
                });

            } else if (commandObj.command === 'setgroup') {
                const role_ids = config.in_game_ranks;

                discord_client.guilds.cache.get(config.guild_id).members.fetch(commandObj.id).then((member) => {

                    // step 0: don't promote a muted player
                    if(member.roles.cache.get(config.special_ranks['muted']) !== undefined) {
                        return;
                    }

                    // step 1: add new role
                    member.roles.add(role_ids[commandObj.group]).then((newMember) => {
                        // step 2: remove all other in game roles
                        for(const in_game_role in role_ids) {
                            if(in_game_role !== commandObj.group) {
                                member.roles.remove(role_ids[in_game_role]);
                            }
                        }
                        // step 3: add staff role if applicable
                        if(config.staff_ranks.includes(commandObj.group)) {
                            member.roles.add(config.special_ranks.staff);
                        } else {
                            member.roles.remove(config.special_ranks.staff);
                        }
                    });
                });
            } else if (commandObj.command === 'unlink') {
                const oldId = commandObj.oldId;
                const newId = commandObj.newId;

                if(oldId === newId) {
                    discord_client.users.fetch(newId).then((user) => {
                        user.createDM().then((dm) => {
                            dm.send('This Discord account has already been linked to your in-game account.');
                        }).catch((reason) => {
							log.warn('[BOT CMD] Failed to send message user');
						});
                    });
                } else {
                    discord_client.users.fetch(oldId).then((user) => {
                        user.createDM().then((dm) => {
                            dm.send('Your account has been demoted on Discord because you linked another account from in game.\n'
                            + 'If this was not you, your Minecraft account may have been compromised.\n'
                            + 'New account: `' + user.tag + '`');
                        });
                        // remove all roles from old account
                        discord_client.guilds.cache.get(config.guild_id).members.fetch(oldId).then((member) => {
                            member.roles.set([]);
                        });

                    }).catch((reason) => {
                        log.warn('[BOT CMD] Failed to send message to old account, they probably left the server.')
                    });
                }
            } else {
                log.error('[BOT CMD] Recieved invalid command!');
                log.error(commandObj['command']);
            }

        // } catch (e) { // when not a json object, message is supposed to be directly sent
        //     log.error('[BOT CMD] Error executing bot command:');
        //     log.error(message);
        //        log.error(e);
        // }
    }
};