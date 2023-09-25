const { isMaster } = require('cluster');

module.exports = class Logger {
    get id() {
        return isMaster ? 'Parent' : process.env.CLUSTER_ID;
    }

    debug(title, message) {
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`);
    }

    log(title, message) {
        console.log(`[Process ${process.pid}] [Cluster ${this.id}] [${title}] ${message}`);
    }

    error(error) {
        console.trace(`[Process ${process.pid}] [Cluster ${this.id}] `, error);
    }
};