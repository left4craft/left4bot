module.exports = {
    name: 'reload',
    description: 'Clear cache and reload a command',
    usage: '<command>',
    aliases: ['none'],
    example: 'reload help',
    args: true,
    cooldown: config.cooldown,
    guildOnly: true,
    adminOnly: true,
    async execute(message, args) {
        const client = message.client;

        const config = depend.config;
        const Discord = depend.discord_lib;
        const log = depend.log;
        const fetch = depend.fetch;

        // command starts here
        // if (message.channel.permissionsFor(message.channel.guild.me).has('MANAGE_MESSAGES')) {
        //     message.delete()
        // };

        if (!args.length) return message.channel.send(`:x: **»** No command given`);

        const commandName = args[0].toLowerCase();
        const command = message.client.commands.get(commandName) ||
            message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return message.channel.send(
            new Discord.MessageEmbed()
            .setColor("#E74C3C")
            .setTitle(`Error`)
            .setDescription(`:x: **»** There is no command with the name or alias \`${commandName}\``)
        );


        delete require.cache[require.resolve(`./${command.name}.js`)];

        try {
            const newCommand = require(`./${command.name}.js`);
            message.client.commands.set(newCommand.name, newCommand);


            message.channel.send(
                new Discord.MessageEmbed()
                .setColor(config.colour)
                .setTitle(`Command reloaded`)
                .setDescription(`:white_check_mark: **»** Reloaded the \`${newCommand.name}\` command.`)
            );

            client.channels.cache.get(config.log_chan_id).send(
                new Discord.MessageEmbed()
                .setAuthor(message.author.username, message.author.avatarURL())
                .setColor(config.colour)
                .setTitle("Command reloaded")
                .addField("By", message.author, true)
                .addField("Command", `\`${newCommand.name}\``, true)
                .setFooter(config.name, client.user.avatarURL())
                .setTimestamp()
            );

            log.console(`[CMD] > Reloaded '${config.prefix}${command.name}' command (by ${message.author.tag})`);


        } catch (error) {
            console.log(error);
            message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
        }








    }
}