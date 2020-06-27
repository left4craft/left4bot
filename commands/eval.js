module.exports = {
    name: 'eval',
    description: 'Evaluate javascript code',
    usage: '<statement>',
    aliases: ['none'],
    example: 'eval 5 + 5',
    args: true,
    cooldown: require("../config.js").cooldown,
    guildOnly: true,
    adminOnly: true,
    async execute(message, args, depend) {
        const client = message.client;
        const Discord = depend.discord_lib;
        const config = depend.config;
        const log = depend.log;


        // command starts here
        if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
            message.delete()
        };

        const clean = (text) => text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

        const code = args.join(" ");
        let res;
        try {
            res = eval(code);
            if (typeof res !== "string") res = require("util").inspect(res);

        } catch (err) {
            if(err.toString().length > 1000) return message.channel.send(`:x: **»** An error occured and the output is too big.`);
            return message.channel.send(
                new Discord.MessageEmbed()
                .setColor("#E74C3C")
                .setTitle(`Evaluation Error`)
                .setAuthor(message.author.username, message.author.avatarURL())
                .addField(":keyboard: Input", `\`\`\`js\n${code}\`\`\``)
                .addField(":desktop: Output", `\`\`\`js\n${err}\`\`\``)
                .setFooter(config.name, client.user.avatarURL())
                .setTimestamp()
            );
        }

        if(res.toString().length > 1000) return message.channel.send(`:x: **»** Output is too big.`);

        message.channel.send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle(`Evaluation`)
            .setAuthor(message.author.username, message.author.avatarURL())
            .addField(":keyboard: Input", `\`\`\`js\n${code}\`\`\``)
            .addField(":desktop: Output", `\`\`\`js\n${res}\`\`\``)
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp()
        );

        client.channels.cache.get(config.log_chan_id).send(
            new Discord.MessageEmbed()
            .setColor(config.colour)
            .setTitle(`${message.author.username} evaluated a statement`)
            .setAuthor(message.author.username, message.author.avatarURL())
            .addField(":keyboard: Input", `\`\`\`${code}\`\`\``)
            .addField(":desktop: Output", `\`\`\`${res}\`\`\``)
            .setFooter(config.name, client.user.avatarURL())
            .setTimestamp()
        ); // log channel message

        log.info(`${message.author.username} evaluated a statement`);


    }
}