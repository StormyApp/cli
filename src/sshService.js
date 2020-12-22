var CONSTANTS = require('./const');
var {createDir, executeCommandPromise} = require('./utilService')
const path = require('path')
const homedir = require('os')
const { getDestinationIP, isServerOnPremise } = require('./initService')

const sshKeyGen = async () => {
    if (isKeyPresent()){
        return
    } else {
        createDir(CONSTANTS.BASE_FOLDER + '/.ssh')
    }
    let command = getSSHGenCommand();
    return executeCommandPromise(command);
}

const isKeyPresent = () => {
    let result = fs.existsSync(getUserKey());
    return result?true:false
}

const readPublicKey = () => {
    return fs.readFileSync(CONSTANTS.SSH_PUBLIC_KEY_FILE, 'utf8').replace(/\r?\n|\r/g, " ");
}

const getSSHGenCommand = () => {
    let command = 'ssh-keygen -t rsa -f ' + getUserKey() + ' -q '
    if (process.platform == 'win32'){
        console.log('Please press Enter for default passphrase.')
        // Put the command for the windows
        // command = ''
    } else {
        command = command +' -P "" '
    }
    return command;
}

const getSSHConnectionObj = async (username) => {
    const ip = await getDestinationIP()
    return {
        host: ip,
        port:22,
        username: username,
        privateKey: fs.readFileSync(getUserKey()),
    }
}

const getUserKey = (uid) => {
    if (isServerOnPremise()){
        return path.join(homedir.homedir() ,'.ssh','id_rsa')
    }
    return process.cwd() + '/'+ CONSTANTS.SSH_PRIVATE_KEY_FILE
}

const pathToRemoteFolder = async (uuid, folderName) => {
    const ip = await getDestinationIP()
    return uuid + '@' + ip + ":~/" + folderName 
}

module.exports = {
    sshKeyGen,
    readPublicKey,
    getSSHConnectionObj,
    getUserKey,
    pathToRemoteFolder
}