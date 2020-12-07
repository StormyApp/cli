const { readFileSync } = require('fs');

const { Client } = require('ssh2');
const { getSSHConnectionObj } = require('./sshService')
const conn = new Client();

const testConnection = {
  host: '13.127.110.225',
  port: 22,
  username: 'a3052st2wlfjtacfdwgru3u7melltc8',
  privateKey: readFileSync('C:/Users/rabans/Polymesh/.stormy/.ssh/id_rsa')
}

const executeRemote = (cmd, uuid, outputCb) => {
  return new Promise( (resolve, reject) => {

    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(cmd, { pty: true}, (err, stream) => {
        if (err) throw err;
        
        const stdinListener = (data) => {
          skipNext = true;
          stream.stdin.write(data);
        }

        stream.on('close', (code, signal) => {
          if (code === 0){
            resolve(code)
          } else {
            reject(code)
          }
          conn.end();
          process.stdin.removeListener("data", stdinListener)
          return;
        })
        
        let skipNext = false;
        stream.stdout.on('data', (data) => {
          if (skipNext) { return skipNext = false; }
          process.stdout.write(data);
        })

        // Possibility to add different colors plus linking to google search
        stream.stderr.on('data', (data) => {
          console.log('Error ' + data)
          reject(data);
        })

        process.stdin.on('data', stdinListener)

      })
    }).connect(
      getSSHConnectionObj(uuid)
      )
  });
}

module.exports = {
  executeRemote
}
