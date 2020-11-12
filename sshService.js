var CONSTANTS = require('./const');
var utilService = require('./utilService')

const sshKeyGen = async () => {
    if (isKeyPresent()){
        return
    } else {
        utilService.createDir(CONSTANTS.BASE_FOLDER + '/.ssh')
    }
    let command = getSSHGenCommand();
    return utilService.executeCommandPromise(command);
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
        console.log('We are going to generate SSH Keys for you.')
        console.log('Please choose the default options.')
        // Put the command for the windows
        // command = ''
    } else {
        command = command +' -P "" '
    }
    return command;
}

const getKeyPath = () => {

}

// const 


module.exports = {
    sshKeyGen,
    readPublicKey
}