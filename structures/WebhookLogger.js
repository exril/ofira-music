const { WebhookClient } = require('discord.js');

const errorLogs = new WebhookClient("857942379171676160","qyv8k3w3b3RlfDvT0BUAX1QabOeREEwHoSacA0DzY_fXaheCVUp23neB42nHAv0ydNyb");

const guildLogs = new WebhookClient("857942565923979294","fyU6O1nghW2OAO-dS37uCrtSno4cjBVAnyU12Faug7h1MTkNky0qgI7nmssw7gtUU5qB");

class WebhookLogger {
    constructor(client) {
        this.client = client;
    }

    guild(data) {
        guildLogs.send(typeof data === 'string' ? data : '\u200B', {
            embeds: typeof data === 'object' ? [data] : []
        });
      return true;
    };

    error(data) {
        errorLogs.send(typeof data === 'string' ? data : '\u200B', {
            embeds: typeof data === 'object' ? [data] : []
        });
      return true
    };

};

module.exports = WebhookLogger;