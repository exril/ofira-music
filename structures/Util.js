const suffixes = ["Bytes", "KB", "MB", "GB"];

const moment = require("moment-timezone");
require("moment");

module.exports = class Util {
  constructor(client) {
    this.client = client;
  }

  get hexColor() {
    let color = Math.floor(Math.random()*16777215).toString(16);
    return `#${color}`;
  }

  get assets() {
    return {
      clientPicture: this.client.user.displayAvatarURL()
    }
  }
  
  get color() {
    return {
      error: 0xff0051,
      success: 0x00FF61,
      warning: 0xFFDC00,
      primary: 0xFF0000 //
    }
  }
  
  get emoji() {
    return {
      success: "<a:ofira_check_mark:855170405514215445>",
      error: "<a:ofira_x_mark:855171119006744637>",
      search: "🔍",
      rewind: "↩️",
      warning: "⚠️",
      tunes: "🎶",
      loop: "🔁",
      shuffle: "🔀",
      skip: "⏭️",
      eject: "⏏️",
      moe: "💬",
      seek: "⏩",
      remind: "⏪",
      lyrics: "🎹",
      vote: "🗳️",
      volume: "🔊",
      play: "▶",
      pause: "⏸️",
      stop: "🟥",
      prog_blue: "🔵",
      prog_red: "🔴",
      online: "🔵",
      offline: "⚫"
    }
  }

  get intColor() {
    let color = Math.floor(Math.random()*16777215).toString(16);
    return `${parseInt(color, 16)}`;
  }

  get getTime() {
    return moment(new Date()).tz('Asia/Kolkata').format('dddd MMMM Do h:mm A');
  }
  
  toProperCase(str) {
    return str.replace(/([^\W_]+[^\s-]*) */g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  shuffle(array) {
    let tmp;
    let current;
    let top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }
    return array;
}

  random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  
  getBytes(bytes) {
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (!bytes && "0 Bytes") || `${(bytes / Math.pow(1024, i)).toFixed(2)} ${suffixes[i]}`;
  }

  truncate(str, maxLen, maxLines) {
    let finalStr = str.length > maxLen ? str.substr(0, maxLen) + "..." : str;
    finalStr = finalStr.split("\n").length > maxLines ? finalStr.split("\n").slice(0, maxLines).join("\n") + "..." : finalStr;
    return finalStr;
  }
  
  codeBlock(string, code) {
    if(code) return `\`\`\`${code}\n${string}\`\`\``;
    return `\`\`\`${string}\`\`\``;
  };
  
  async haste(text) {
     const req = await this.client.snek.post("https://haste.ntmnathan.com/documents", { text });
     return `https://haste.ntmnathan.com/${req.data.key}`   
  };
  
  escapeRegex(str) {
    return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  }
  
  // Convert milliseconds into human readable string.
  getDuration(time) {
    const seconds = Math.floor(time / 1000) % 60 ;
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const days = Math.floor((time / (1000 * 60 * 60 * 24)) % 7);
    return [`${days} Days`, `${hours} Hours`, `${minutes} Minutes`,
      `${seconds} Seconds`].filter((time) => !time.startsWith("0")).join(", ");
  }

  formatSeconds (time, yt = false) {
    let days = Math.floor(time % 31536000 / 86400);
    let hours = Math.floor(time % 31536000 % 86400 / 3600);
    let minutes = Math.floor(time % 31536000 % 86400 % 3600 / 60);
    let seconds = Math.round(time % 31536000 % 86400 % 3600 % 60);days = days > 9  ? days : `0${  days}`;
    hours = hours > 9 ? hours : `0${  hours}`;
    minutes = minutes > 9 ? minutes : `0${  minutes}`;
    seconds = seconds > 9 ? seconds : `0${  seconds}`;
    if (yt === true && time > 3600000000) return 'Live';
    else return `${(parseInt(days) > 0 ? `${days  }:` : '') + (parseInt(hours) === 0 && parseInt(days) === 0 ? '' : `${hours  }:`) + minutes  }:${  seconds}`;
  }

  formatDuration(duration) {
    if (isNaN(duration) || typeof duration === 'undefined') return '00:00';
        if(duration > 3600000000) return 'Live';
        return this.formatTime(duration, true);
  };
  
  formatTime(milliseconds, minimal = false) {
    if (typeof milliseconds === "undefined" || isNaN(milliseconds)) throw new RangeError("Utils#formatTime() Milliseconds must be a number");

    if (typeof minimal !== "boolean") throw new RangeError("Utils#formatTime() Minimal must be a boolean");

    if (milliseconds === 0) return minimal ? "00:00" : "N/A";

    const times = {
      years: 0,
      months: 0,
      weeks: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    while (milliseconds > 0) {
      if (milliseconds - 31557600000 >= 0) {
        milliseconds -= 31557600000;
        times.years++;
      } else if (milliseconds - 2628000000 >= 0) {
        milliseconds -= 2628000000;
        times.months++;
      } else if (milliseconds - 604800000 >= 0) {
        milliseconds -= 604800000;
        times.weeks += 7;
      } else if (milliseconds - 86400000 >= 0) {
        milliseconds -= 86400000;
        times.days++;
      } else if (milliseconds - 3600000 >= 0) {
        milliseconds -= 3600000;
        times.hours++;
      } else if (milliseconds - 60000 >= 0) {
        milliseconds -= 60000;
        times.minutes++;
      } else {
        times.seconds = Math.round(milliseconds / 1000);
        milliseconds = 0;
      }
    }

    const finalTime = [];
    let first = false;

    for (const [k, v] of Object.entries(times)) {
      if (minimal) {
        if (v === 0 && !first) continue;
        finalTime.push(v < 10 ? `0${v}` : `${v}`);
        first = true;
        continue;
      }
      if (v > 0) finalTime.push(`${v} ${v > 1 ? k : k.slice(0, -1)}`);
    }

    if (minimal && finalTime.length === 1) finalTime.unshift("00");

    let time = finalTime.join(minimal ? ":" : ", ");

    if (time.includes(",")) {
      const pos = time.lastIndexOf(",");
      time = `${time.slice(0, pos)} and ${time.slice(pos + 1)}`;
    }
    return time;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(1024));
		return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
	}
  
  delay(ms) {
		return new Promise(res => setTimeout(res, ms));
	}

  validateSoundcloud(link) {
    if (typeof link !== "string") return false;
    return /^https?:\/\/(soundcloud\.com|snd\.sc)\/(.*)$/.test(link);
  }

  validateURL(str) {
    const pattern = new RegExp("^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
    "(\\#[-a-z\\d_]*)?$", "i"); // fragment locator
    return !!pattern.test(str);
  }
  
  randomNum(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  async fetchChannel(channelID) {
    return await this.client.channels.fetch(channelID).catch(() => false);
  }

    // This function is used to resolve a user from a string
	async resolveUser(search){
		let user = null;
		if (!search || typeof search !== "string") return;
		// Try ID search
		if (search.match(/^<@!?(\d+)>$/)){
			const id = search.match(/^<@!?(\d+)>$/)[1];
			user = this.client.users.fetch(id).catch(() => {});
			if(user) return user;
		}
		// Try username search
		if (search.match(/^!?(\w+)#(\d+)$/)){
			const username = search.match(/^!?(\w+)#(\d+)$/)[0];
			const discriminator = search.match(/^!?(\w+)#(\d+)$/)[1];
			user = this.client.users.find((u) => u.username === username && u.discriminator === discriminator);
			if(user) return user;
		}
		user = await this.client.users.fetch(search).catch(() => {});
		return user;
	}

	async resolveMember(search, guild){
		let member = null;
		if (!search || typeof search !== "string") return;
		// Try ID search
		if (search.match(/^<@!?(\d+)>$/)){
			const id = search.match(/^<@!?(\d+)>$/)[1];
			member = await guild.members.fetch(id).catch(() => {});
			if (member) return member;
		}
		// Try username search
		if (search.match(/^!?(\w+)#(\d+)$/)){
			guild = await guild.fetch();
			member = guild.members.cache.find((m) => m.user.tag === search);
			if (member) return member;
		}
		member = await guild.members.fetch(search).catch(() => {});
		return member;
	}

  async resolveRole(search, guild){
		let role = null;
		if (!search || typeof search !== "string") return;
		// Try ID search
		if (search.match(/^<@&!?(\d+)>$/)){
			const id = search.match(/^<@&!?(\d+)>$/)[1];
			role = guild.roles.cache.get(id);
			if (role) return role;
		}
		// Try name search
		role = guild.roles.cache.find((r) => search === r.name);
		if (role) return role;
		role = guild.roles.cache.get(search);
		return role;
	}

  async resolveChannel(search, guild) {
    let channel = null;
    if (!search || typeof search !== 'string') return;
    // Try ID search
    if (search.match(/^<#?(\d+)>$/)) {
      const id = search.match(/^<#?(\d+)>$/)[1];
      channel = guild.channels.cache.get(id);
      if (channel) return channel;
    }

    channel = await guild.channels.cache.get(search);
    return channel;
  }

};