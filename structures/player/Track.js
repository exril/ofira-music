const { Collection } = require('discord.js');

const YOUTUBE_TRACK_FILTERS = [
	// Trim whitespaces
	{ source: /^\s+|\s+$/g, target: '' },
	// **NEW**
	{ source: /\s*\*+\s?\S+\s?\*+$/, target: '' },
	// [whatever]
	{ source: /\s*\[[^\]]+\]$/, target: '' },
	// (whatever version)
	{ source: /\s*\([^)]*version\)$/i, target: '' },
	// video extensions
	{ source: /\s*\.(avi|wmv|mpg|mpeg|flv)$/i, target: '' },
	// (LYRICs VIDEO)
	{ source: /\s*((with)?\s*lyrics?( video)?\s*)/i, target: '' },
	// (Official Track Stream)
	{ source: /\s*(Official Track Stream*)/i, target: '' },
	// (official)? (music)? video
	{ source: /\s*(of+icial\s*)?(music\s*)?video/i, target: '' },
	// (official)? (music)? audio
	{ source: /\s*(of+icial\s*)?(music\s*)?audio/i, target: '' },
	// (ALBUM TRACK)
	{ source: /\s*(ALBUM TRACK\s*)?(album track\s*)/i, target: '' },
	// (Cover Art)
	{ source: /\s*(COVER ART\s*)?(Cover Art\s*)/i, target: '' },
	// (official)
	{ source: /\s*\(\s*of+icial\s*\)/i, target: '' },
	// (1999)
	{ source: /\s*\(\s*[0-9]{4}\s*\)/i, target: '' },
	// HD (HQ)
	{ source: /\s+\(\s*(HD|HQ)\s*\)$/, target: '' },
	// HD (HQ)
	{ source: /\s+(HD|HQ)\s*$/, target: '' },
	// video clip officiel
	{ source: /\s*(vid[\u00E9e]o)?\s*clip officiel/i, target: '' },
	// offizielles
	{ source: /\s*of+iziel+es\s*/i, target: '' },
	// video clip
	{ source: /\s*(vid[\u00E9e]o)?\s*clip/i, target: '' },
	// Full Album
	{ source: /\s*full\s*album/i, target: '' },
	// live
	{ source: /\s+\(?live\)?$/i, target: '' },
	// Leftovers after e.g. (official video)
	{ source: /\(+\s*\)+/, target: '' },
	// Artist - The new "Track title" featuring someone
	{ source: /^(|.*\s)"(.{5,})"(\s.*|)$/, target: '$2' },
	// 'Track title'
	{ source: /^(|.*\s)'(.{5,})'(\s.*|)$/, target: '$2' },
	// (*01/01/1999*)
	{ source: /\s*\(.*[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}.*\)/i, target: '' },


	// labels
	{ source: /\|\sNapalm\sRecords$/, target: '' },

	// trim starting white chars and dash
	{ source: /^[/,:;~-\s"]+/, target: '' },
	// trim trailing white chars and dash
	{ source: /[/,:;~-\s"!]+$/, target: '' },
];

module.exports = class TuneTrack {
  constructor(track, user, playlist = false) {
    this.track = track.track;
    this.info = {
      author: track.info.author,
      identifier: track.info.identifier,
      isSeekable: track.info.isSeekable,
      isStream: track.info.isStream,
      length: track.info.length,
      position: track.info.position,
      title: this.filterTrackName(track.info.title),
      uri: track.info.uri,
      playlist
    };
    this.requestedBy = {
      id: user.id,
      tag: user.tag,
      name: user.username,
      avatarURL: user.displayAvatarURL({ dynamic: true, size: 4096 }),
      mention: user.toString(),
    };
  }
  filterTrackName(text) {
    for (const data of YOUTUBE_TRACK_FILTERS) {
      text = text.replace(data.source, data.target);
    }
    return text;
  }
};
