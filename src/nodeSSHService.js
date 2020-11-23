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
}

module.exports = {
  portForward
}

// nodeSetup()

// var sshconfig = {
//   host: CONSTANTS.RSYNC.IP,
//   username: 'alxyfhehxtnwdl91z4omkg29to6zl8i',
//   identity: CONSTANTS.SSH_PRIVATE_KEY_FILE
// }

// console.log('Using the new authentication methd')
// var ssh = new SSH2Promise(sshconfig);
// ssh.connect().then(() => {
//   console.log("Connection established") 
// });

// ssh.shell().then((socket) => {
//   socket.on('data', (data) => {
//     //shell content will be available here
//     console.log(data)
//   })
//   //Can write to socket 
//   socket.write("")
// });
 