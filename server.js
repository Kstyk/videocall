// var privateKey = fs.readFileSync("sslcert/server.key", "utf8");
// var certificate = fs.readFileSync("sslcert/server.crt", "utf8");

const { PeerServer } = require("peer");
const peerServer = PeerServer({
  port: 443,
  path: "/",
  // ssl: {
  //   key: privateKey,
  //   cert: certificate,
  // },
});
