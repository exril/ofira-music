module.exports = {
  token: "BOT TOKEN",
  prefix: "PREFIX",
  mongoURI: "MONGO-URI",
  dbl: "",
  BFD: "",
  owners: [
    {
      name: "OWNER-NAME",
      id: "OWNER-USER-ID"
    },
    {
      name: "OWNER-NAME",
      id: "OWNER-USER-ID"
    }
  ],
  supportServer: (code) => `https://discord.gg/${code}`,
  inviteURL: (id) => `https://discord.com/api/oauth2/authorize?client_id=${id}&permissions=8&scope=bot`,
  credentials: {
    spotify: {
      clientID: "SPOTIFY ID",
      clientSecret: "SPOTIFY SECRET"
    }
  },
  timers: {
    playerDeployer: 10000,
    checkQueueDelay: 20000,
    memorySweeper: 60000 * 15,
  },
  regex: {
    spotify: /^(?:https:\/\/open\.spotify\.com\/(?:user\/[A-Za-z0-9]+\/)?|spotify:)(album|playlist|track)(?:[/:])([A-Za-z0-9]+).*$/,
    youtube: /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/,
    channel: /<#(\d{17,19})>/
  }
}
