const { ShardingManager } = require('kurasuta');
const { Constants, Intents, Util } = require('discord.js');
const { GUILDS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS } = Intents.FLAGS;

const { token, prefix } = require('./config');
const Client = require('./structures/Client.js');

/* Load discord.js extensions */
require('./extensions/Guild');

const clientOptions = {
  disableMentions: 'everyone',
  messageCacheMaxSize: 1,
  messageCacheLifetime: 1800,
  restRequestTimeout: 30000,
  partials: [
    'MESSAGE',
    'USER',
    'GUILD_MEMBER',
    'REACTION',
    'CHANNEL'
  ],
  intents: [ GUILDS, GUILD_VOICE_STATES, GUILD_MESSAGES, GUILD_MESSAGE_REACTIONS ],
  presence: {
    activity: {
      type: "LISTENING",
      name: "@Ofira"
    },
    status: "idle",
  }
}

const sharder = new ShardingManager(__dirname + '/app.js', {
	token: token,
	client: Client,
	respawn: true,
	retry: true,
	ipcSocket: 9999,
	clusterCount: 6,
	guildsPerShard: 1000,
	timeout: 30000,
    clientOptions
});

sharder.spawn();

sharder.on('message', message => {
	if (message.type === 'shutdown') {
		if (message.shard === 'all')
			return sharder.clusters.forEach(shard => {
				console.warn('[Kurasuta] [Shutdown] Destroying shard ' + shard.id);
				shard.kill();

				process.exit();
			});

		console.warn('[Kurasuta] [Shutdown] Destroying shard ' + message.shard);
		return sharder.clusters.get(message.shard).kill();
	}

	if (message.type === 'reboot') {
		if (message.shard === 'all') {
			console.warn('[Kurasuta] [Shutdown] Rebooting all shards.');

			sharder.clusters.forEach(s => s.kill());
			return sharder.spawn();
		}

		console.warn('[Kurasuta] [Shutdown] Rebooting shard ' + message.shard);
		try {
			sharder.clusters.get(message.shard).respawn();
		} catch {
			sharder.restartAll();
		}
	}
});

sharder.on('debug', message => console.log('[Kurasuta] [Debug] ' + message));
sharder.on('ready', () =>
	console.info('[Kurasuta] [Cluster] Kurasuta Cluster ready!')
);

process.on('SIGINT', signal => {
	sharder.clusters.forEach(shard => {
		console.warn('[Kurasuta] [Shutdown] Destroying shard ' + shard.id);
		shard.kill();
	});
	process.exit();
});

module.exports = sharder;
