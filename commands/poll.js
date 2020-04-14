const Discord = require("discord.js");
const config = require("../config.js");
const log = require("leekslazylogger");
module.exports = {
    name: 'poll',
    description: 'Create a poll',
    usage: '<question> |OR| <question>; <option1;option2;etc>',
    aliases: ['newPoll', 'createPoll', 'ask'],
    example: 'poll Which colour? Blue; Orange; Red',
    args: true,
    cooldown: config.cooldown,
    guildOnly: true,
    adminOnly: true,
    async execute(message, args) {
        const client = message.client;
        // command starts here
        // if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
        //     message.delete()
        // };

        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        // const unicode = "🇦🇧🇨🇩🇪🇫🇬🇭🇮🇯🇰🇱🇲🇳🇴🇵🇶🇷🇸🇹🇺🇻🇼🇽🇾🇿";
        const unicode = '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(' ')

        let joined = args.join(" ") // make it a string again

        let split = joined.trim().split(";"); // arrary of question and options, no type, split at the ;


        for (i = 0; i < split.length; i++) {
            let newStr = split[i].trim(); // remove whitespace
            if (newStr[newStr.length - 1] == ";") newStr = newStr.substring(0, newStr.length - 1); // remove semicolons
            split[i] = newStr;
            if (newStr.length < 1) split.pop();
        }

        let question = split.shift(); // this is the question
        let options = split; // array of the options

        const channel = client.channels.cache.get(config.poll_chan_id);

        if (options.length > 26) {
            return message.channel.send(
                new Discord.MessageEmbed()
                .setTitle("Error")
                .setColor("#E74C3C")
                .addField("Too many options", `Polls are limited to maximum of 26 options`)
                .addField("Information", `\`${config.prefix}help ${this.name}\` for more information`)
            );
        }


        if (options.length < 1) {
            // basic with thumbs up and down
            log.info(`${message.author.username} created a basic poll`);

            const poll = await channel.send(
                new Discord.MessageEmbed()
                .setColor(config.colour)
                .setTitle(question)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setDescription(`Please react with your choice: \n\n:thumbsup: Yes\n\n:thumbsdown: No\n\nPlease only react once.`)
                // .addField("Options", `\n\n:thumbsup: Yes\n\n:thumbsdown: No\n\n`, true)
                .setFooter(config.name, client.user.avatarURL())
                .setTimestamp()
            );

            await poll.react('👍');
            await poll.react('👎');



        } else {
            // advanced with A-Z (26 max options) 
            log.info(`${message.author.username} created an advanced poll with ${options.length} options`);

            let options_string = "";
            for (i = 0; i < options.length; i++) {
                options_string += `:regional_indicator_${alphabet[i]}: ${options[i]}\n\n`;
            }

            const poll = await channel.send(
                new Discord.MessageEmbed()
                .setColor(config.colour)
                .setTitle(question)
                .setAuthor(message.author.username, message.author.avatarURL())
                .setDescription(`Please react with your choice: \n\n${options_string}Unless otherwise specified, please only vote for 1 option.`)
                .setFooter(config.name, client.user.avatarURL())
                .setTimestamp()
            );

            for (i = 0; i < options.length; i++) {
                try {
                    await poll.react(unicode[i]);
                } catch (e) {
                    log.warn(`Failed to react to poll with ${unicode[i]} (${alphabet[i]})`);
                } 
            }


        };

        message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle("Poll created")
            .setDescription(`**»** Go to <#${config.poll_chan_id}> to view`)
            .addField("Question", question, false)
        ); // success message


        client.channels.cache.get(config.log_chan_id).send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle("Poll created")
            .setAuthor(message.author.username, message.author.avatarURL())
            .addField("By", message.author.tag, true)
            .addField("Question", question, false)
            .addField("Options", options.length, true)
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp()
        ); // log channel message

    }
}