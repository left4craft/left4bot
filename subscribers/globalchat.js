module.exports = {
    channels: ['minecraft.chat.global.out'],

    execute(channel, message) {
        console.log('Got message: ' + message);
    }
};