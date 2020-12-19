var CONSTANTS = require('./const');
var {readConfigJson, createDir, executeCommandPromise} = require('./utilService')

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
    let result = fs.existsSync(CONSTANTS.SSH_PRIVATE_KEY_FILE);
    return result?true:false
}

const readPublicKey = () => {
    return fs.readFileSync(CONSTANTS.SSH_PUBLIC_KEY_FILE, 'utf8').replace(/\r?\n|\r/g, " ");
}

const getSSHGenCommand = () => {
    let command = 'ssh-keygen -t rsa -f ' + CONSTANTS.SSH_PRIVATE_KEY_FILE + ' -q '
    if (process.platform == 'win32'){
        console.log('Please press Enter for default passphrase.')
        // Put the command for the windows
        // command = ''
    } else {
        command = command +' -P "" '
    }
    return command;
}

const getSSHConnectionObj = (username) => {
    return {
        host: CONSTANTS.RSYNC.IP,
        port:22,
        username: username,
        privateKey: fs.readFileSync(CONSTANTS.SSH_PRIVATE_KEY_FILE),
    }
}

const getUserProvidedSSHConfig = async () => {
    const sshConfig = await readConfigJson(CONSTANTS.SSH_CONFIG)
    return {
        host: sshConfig.host,
        port: 22,
        username: sshConfig.username,
        privateKey: sshConfig.privateKey
    }
}

const  getUserKey =(uid) => {
    const key =  process.cwd() + '/'+ CONSTANTS.SSH_PRIVATE_KEY_FILE
    // Path to the global private key file
    // __dirname + CONSTANTS.RSYNC.PATH_TO_KEY
    // console.log("Trying to fetch the user key", key)
    return key
}

const pathToRemoteFolder =  (uuid, folderName) => {
    // const config = await globalConfig;
    return uuid + '@' + CONSTANTS.RSYNC.IP + ":~/" + folderName 
}

module.exports = {
    sshKeyGen,
    readPublicKey,
    getSSHConnectionObj,
    getUserKey,
    pathToRemoteFolder
}