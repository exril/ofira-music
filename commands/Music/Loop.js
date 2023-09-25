const Command = require("../../abstract/Command.js");

module.exports = class Loop extends Command {
  constructor(client) {
    super(client, {
      name: "loop",
      description: "Loops the queue or a track",
      category: 'Music',
      example: ["queue", "track", "off"],
      voteLock: true
    });
  }

  async run(msg, args) {
    if(!this.playerPerms.canStopCurrent(msg)) return;

    let dispatcher = this.client.players.get(msg.guild.id);

    const type = this.getRepeatType(args[0] ? args[0].toLowerCase(): "", dispatcher);

    this.setRepeat(dispatcher, type);

    return this.client.send(msg.channel.id, {
      embed: {
        color: this.client.util.color.primary,
        description: `${this.client.util.emoji.loop} | Repeat Mode: ${dispatcher.trackRepeat ? "Current" : dispatcher.queueRepeat ? "Queue" : "None"}`
      }
    });
  }

  	// eslint-disable-next-line complexity
	getRepeatType(input, dispatcher) {
		if (!input) {
			if (!dispatcher.trackRepeat && !dispatcher.queueRepeat) return 'track';
			if (dispatcher.trackRepeat) return 'queue';
			if (dispatcher.queueRepeat) return 'none';
		} else if (input === 'queue' || input === 'all') {
			return 'queue';
		} else if (input === 'track' || input === 'single' || input === "current") {
			return 'track';
		} else if (input === 'none' || input === 'nothing') {
			return 'none';
		}

		if (!dispatcher.trackRepeat && !dispatcher.queueRepeat) return 'queue';
		if (dispatcher.queueRepeat) return 'track';

		return 'none';
	}

	setRepeat(dispatcher, type) {
		if (dispatcher.trackRepeat && type === 'track') return true;
		if (dispatcher.queueRepeat && type === 'queue') return true;
		if (!dispatcher.trackRepeat && !dispatcher.queueRepeat && type === 'none') return true;

		if (type === 'queue') {
			dispatcher.setQueueRepeat(true);
			return true;
		} else if (type === 'track') {
			dispatcher.setTrackRepeat(true);
			return true;
		} else if (type === 'none') {
			dispatcher.setTrackRepeat(false);
      dispatcher.setQueueRepeat(false);
			return true;
		}

		return false;
	}
}