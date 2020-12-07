// var SSH2Promise = require('ssh2-promise');
var SSHConnection = require('node-ssh-forward')
var CONSTANTS = require('./const');
var fs = require('fs')

async function portForward(username,localPort, remotePort) {
  var key = fs.readFileSync(CONSTANTS.SSH_PRIVATE_KEY_FILE).toString()
  const sshConnection = new SSHConnection.SSHConnection({
      endHost: CONSTANTS.RSYNC.IP,
      username: username,
      privateKey : key,
    })

  sshConnection.forward({
    fromPort: localPort,
    toPort: remotePort,
    toHost: CONSTANTS.RSYNC.IP
  })

  return sshConnection;
}

module.exports = {
  portForward
}
