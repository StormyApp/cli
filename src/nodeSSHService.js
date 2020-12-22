// var SSH2Promise = require('ssh2-promise');
var SSHConnection = require('node-ssh-forward')
var CONSTANTS = require('./const');
var fs = require('fs');
const { getDestinationIP } = require('./initService');
const { getUserKey } = require('./sshService');

async function portForward(username,localPort, remotePort) {
  var key = fs.readFileSync(getUserKey()).toString()
  const ip = await getDestinationIP()
  const sshConnection = new SSHConnection.SSHConnection({
      endHost: ip,
      username: username,
      privateKey : key,
    })

  sshConnection.forward({
    fromPort: localPort,
    toPort: remotePort,
    toHost: ip
  })

  return sshConnection;
}

module.exports = {
  portForward
}
