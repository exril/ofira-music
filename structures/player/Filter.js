module.exports = class OfiraFiters {
  constructor (player) {
    this.speed = 1;
    this.rate = 1;
    this.pitch = 1;
    this.eqLevels = {
      none: 0.0,
      low: 0.12,
      medium: 0.17,
      high: 0.27,
    };
    this.bassboost = false;
    this.nightcore = false;
    this.daycore = false;
    this.vaporwave = false;
    this._8d = false;
    this.player = player;
  }

  setSpeed(speed) {
    if (isNaN(speed)) throw new RangeError('<Filter>#setSpeed() must be a number.')
    this.speed = Math.max(Math.min(speed, 5), 0.05)
    this.setTimescale(speed, this.pitch, this.rate)
    return this;
  }

  setPitch(pitch) {
    if (isNaN(pitch)) throw new RangeError("<Filter>#setPitch() must be a number.");
    this.pitch = Math.max(Math.min(pitch, 5), 0.05);
    this.setTimescale(this.speed, pitch, this.rate)
    return this;
  }

  setNightcore(nc) {
    if (typeof nc != "boolean") throw new RangeError('<Filter>#setNighcore() must be a boolean.');
    
    if (nc) {
      this.bassboost = false;
      this.distortion = false;
      this.vaporwave = false;
      this.daycore = false;
      this.setDaycore(false);
      this.setVaporwave(false);
      this.setBassboost(false);
      this.setDistortion(false);
      this.setTimescale(1.1999999523162842, 1.2999999523162842, 1);
      this.nightcore = nc;
    } else this.setTimescale(1, 1, 1);
      this.nightcore = nc;
      return this;
  }
  //1.2999999523162842, speed: 1.1999999523162842

  setDaycore(nc) {
    if (typeof nc != "boolean") throw new RangeError('<Filter>#Daycore() must be a boolean.');

    if (nc) {
      this.bassboost = false;
      this.distortion = false;
      this.vaporwave = false;
      this.nightcore = false;
      this.setDaycore(false);
      this.setVaporwave(false);
      this.setBassboost(false);
      this.setDistortion(false);
      this.setNightcore(false)
      this.setTimescale(0.9999999523162842, 0.8999999523162842, 1);
      this.daycore = nc;
    } else this.setTimescale(1, 1, 1);
      this.daycore = nc;
      return this;
  }

  setVaporwave(vaporwave) {
    if (typeof vaporwave != "boolean") throw new RangeError('<Player>#setVaporwave() must be a boolean.');
      
    if (vaporwave) {
      this.bassboost = false;
      this.distortion = false;
      this.vaporwave = false;
      this.daycore = false;
      this.setDaycore(false);
      this.setBassboost(false);
      this.setDistortion(false);
      this.setNightcore(false);
      this.setTimescale(0.8500000238418579, 0.800000011920929, 1);
      this.vaporwave = vaporwave;
    } else this.setTimescale(1, 1, 1);
      this.vaporwave = vaporwave;
      return this;
  }

  setDistortion(distortion) {
    if (typeof distortion != "boolean") throw new RangeError('<Player>#setDistortion() must be a boolean.');
        
    if (distortion) {
      this.bassboost = false;
      this.vaporwave = false;
      this.daycore = false;
      this.setDaycore(false);
      this.setBassboost(false);
      this.setNightcore(false);
      this.setDistort(0.5)
      this.distortion = distortion;
    } else this.clearEffects();
      this.distortion = distortion;
      return this;
  }

  setBassboost(bassboost, level) {
    if (bassboost) {
      this.vaporwave = false;
      this.daycore = false;
      this.setDaycore(false);
      this.setVaporwave(false);
      this.setBassboost(false);
      this.setNightcore(false);

      const bands = new Array(3)
      .fill(null)
      .map((_, i) => ({ band: i, gain: this.eqLevels[level] }));

      this.player.setGroupedFilters({
        volume: this.player.filters.volume,
        equalizer: [...bands]
      });
      this.bassboost = bassboost;
    } else this.clearEffects();
      this.bassboost = bassboost;
      return this;
  }

  set8D(sd) {
    if (typeof sd != 'boolean') throw new RangeError('<Filter>#set8D() must be a boolean.')
      
    if (sd) {
      this.bassboost = false;
      this.distortion = false;
      this.vaporwave = false;
      this.daycore = false;
      this.setDaycore(false);
      this.setBassboost(false);
      this.setDistortion(false);
      this.setNightcore(false);
      this.player.setGroupedFilters({
        volume: this.player.filters.volume,
        rotation: {
          rotationHz: 2.4,
        },
      })
      this._8d = sd
    } else this.clearEffects()
    this._8d = sd;
    return this
  }

  setDistort(value) {
    this.value = value || this.value;
    this.player.setGroupedFilters({
      volume: this.player.filters.volume,
      distortion: {
        distortion: this.value
      }
    });
    return this
  }

  setTimescale(speed, pitch, rate) {
    this.speed = speed || this.speed;
    this.pitch = pitch || this.pitch;
    this.rate = rate || this.rate;

    this.player.setGroupedFilters({
      volume: this.player.filters.volume,
      timescale: {
        speed: this.speed,
        pitch: this.pitch,
        rate: this.rate
      },
    });
    return this;
  }

  clearEffects() {
    this.speed = 1;
    this.pitch = 1;
    this.rate = 1;
    this._8d = false;
    this.daycore = false;
    this.bassboost = false;
    this.nightcore = false;
    this.vaporwave = false;
    this.distortion = false;

    this.player.clearFilters()
    return this;
  }
}
