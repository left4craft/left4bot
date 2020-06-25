const config = require('../config.js');
const log = require("leekslazylogger");

module.exports = {
    channels: ['discord.botcommands'],

    execute(discord_client, webhook, channel, message) {
        log.basic('[BOT CMD] ' + message);

        try {
            commandObj = JSON.parse(message);

			if(commandObj['command'] === 'setuser') {
                discord_client.guilds.get(config.guild_id).members.fetch(commandObj['id']).then((member) => {
                    member.setNickname(commandObj['nick']);
                });

            } else if (commandObj['command'] === 'setgroup') {
                const role_ids = config.in_game_ranks;

                discord_client.guilds.get(config.guild_id).members.fetch(commandObj['id']).then((member) => {

                    // step 1: add new role
                    member.roles.add(role_ids[commandObj['group']]).then((newMember) => {
                        // step 2: remove all other in game roles
                        for(in_game_id of role_ids) {
                            if(in_game_id !== commandObj['id']) {
                                member.roles.remove(in_game_id);
                            }
                        }
                        // step 3: add staff role if applicable
                        if(config.staff_ranks.includes(commandObj['group'])) {
                            member.roles.add(special_ranks['staff']);
                        } else {
                            member.roles.remove(special_ranks['staff']);
                        }
                    });
                });

            } else {
                log.error('[BOT CMD] Recieved invalid command!');
                log.error(commandObj['command']);
            }

        } catch (e) { // when not a json object, message is supposed to be directly sent
            log.error('[BOT CMD] Error executing bot command:');
            log.error(message);
            log.error(new Error("Invalid Command").stack)
        }
    }
};