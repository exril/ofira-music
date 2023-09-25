const { BaseCluster } = require('kurasuta');

module.exports = class extends BaseCluster {
	launch() {
		this.client.login();

   /* this.client.on('debug', d => {
      if (typeof d === "string" && d.includes("Failed to find guild, or unknown type for channel")) return;
     this.client.logger.debug(`Discord WS`, d)
    });
    */
	}
};

process.on('uncaughtException', err => console.error(err.stack));
process.on('unhandledRejection', err => console.error(err.stack));