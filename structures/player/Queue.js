/**
* The Queue class.
* @extends {array}
*/
module.exports = class OfiraQueue extends Array {

	constructor(player) {
		super();
		this.player = player;
    this.current = null;
	}
	/** Returns the total duration of the queue including the current track. */
	get duration() {
    const current = this.current ? this.current.length : 0;
		return this.reduce((acc, cur) => acc + (cur.info.length || 0), current);
	}

  get size() {
    return this.length;
  }

  get totalSize () {
    return this.length + (this.current ? 1 : 0);
  }

	push(...args) {
		const result = super.push(...args);
		return result;
	}

	shift() {
		const result = super.shift();

		// this.player.emit('queueRemove', null);

		return result;
	}

	unshift(...args) {
		const result = super.unshift(...args);

		// this.player.emit('queueAdd', null);

		return result;
	}

	splice(...args) {
		const data = super.splice(...args);
		return data;
	}

	/**
	* Removes an amount of tracks using a start and end index.
	* @param start The start to remove from.
	* @param end The end to remove to.
	*/
	removeFrom(start, end) {
	   if (isNaN(start)) {
		   throw new RangeError(`Queue#removeFrom() Missing "start" parameter.`);
	   } else if (isNaN(end)) {
		   throw new RangeError(`Queue#removeFrom() Missing "end" parameter.`);
	   } else if (start >= end) {
		   throw new RangeError(`Queue#removeFrom() Start can not be bigger than end.`);
	   } else if (start >= this.length) {
		   throw new RangeError(`Queue#removeFrom() Start can not be bigger than ${this.length}.`);
	   }
	   return this.splice(start, end - start);
	}
	/**
	* Removes a track from the queue. Defaults to the first track.
	* @param [position=0] The track index to remove.
	* @returns The track that was removed, or null if the track does not exist.
	*/
	remove(position = 0) {
	   return this.splice(position, 1)[0];
	}
	/** Clears the queue. */
	clear() {
	   this.splice(0);
	}
	/** Shuffles the queue. */
	shuffle() {
	   for (let i = this.length - 1; i > 0; i--) {
		   const j = Math.floor(Math.random() * (i + 1));
		   [this[i], this[j]] = [this[j], this[i]];
	   }
	}
};
