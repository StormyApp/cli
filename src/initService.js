const {readConfigJson} = require('./utilService')
fs = require('fs')
CONSTANTS = require('./const')

var globalConfig = {}

function createDir(targetDir) {
    try {
      let result = fs.existsSync(targetDir);
      if (!result){
        return fs.promises.mkdir(targetDir, { recursive: true });
      }
    } catch(e){
      console.log("Error creating the folder/file", e)
    }
}

function addKey(key, value) {
    globalConfig[key] = value;
    return writeConfigJson(CONSTANTS.CONFIG_FILE, JSON.stringify(globalConfig))
}

function writeConfigJson(configLocation, configJson){
    // console.log('\n\nThe configLocation is', configLocation)
    // console.log('\n\n')
    return new Promise((resolve, reject) =>{
        fs.writeFile(configLocation, configJson, function(err){
            if (err){
                reject(err)
            }
            else {
                resolve()
            }
        })
    });
}


function makeid(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return 'a' + result;
 }
 
async function getUUID() {
    
    if (globalConfig && globalConfig['uuid']){
        // console.log('Fetching the global value of the uuid', globalConfig['uuid'])
        return globalConfig['uuid']
    }

    var uud = makeid(30);
    // 'd'+uuidv4().split('-').join('')
    globalConfig['uuid'] = uud
    writeConfigJson(CONSTANTS.CONFIG_FILE, JSON.stringify(globalConfig))
    return uud;
}

const init = () => {
    try {
        var initFile = CONSTANTS.CONFIG_FILE;
        createDir(CONSTANTS.BASE_FOLDER);
        globalConfig = readConfigJson(initFile);
        return globalConfig;
    } catch(e){
      console.log("Error initiating the build", e)
      globalConfig = {}
      return globalConfig
    }
}

globalConfig = init();

const isUserCreated = () => {
    return globalConfig && globalConfig['userCreated'];
}

const isRemoteSetupDone = () => {
    if (globalConfig['serverSetup'] === 'stormy'){
        return isUserCreated()
    } else {
        return globalConfig['hostname'] && globalConfig['uuid']
    }
}

const setUserCreated = (status) => {
    set('userCreated', status)
}

const setDefaultPort = (port) => {
    set("port", port)
}

const set = (key, value) => {
    if (globalConfig){
        globalConfig[key] = value
        writeConfigJson(CONSTANTS.CONFIG_FILE, JSON.stringify(globalConfig, null, '\t')).then( (result) => {
            // console.info('Global configuration Updated', globalConfig);
        }).catch( (err) => {
            console.error('Error updating Global configuration', err)
        })
    }
}

const isInitDone = () => {
    // console.log("The globalConfig is", globalConfig)
    if ( !globalConfig )
      return false
    if ( !globalConfig['uuid'])
      return false
    if (!globalConfig['keyCreated'])
      return false
    // if (!globalConfig['guuid']){
    //   return false
    return true
}

const getDestinationIP = async () =>{
    return globalConfig['hostname'] || CONSTANTS.RSYNC.IP
}

const isServerOnPremise = () => {
    return globalConfig['serverSetup'] === "onPremise"
}

const getUsername = () => {
    // if ( isServerOnPremise())
    //     return globalConfig['username']
    return globalConfig['uuid']
}

module.exports = {
    readConfigJson,
    createDir,
    init,
    writeConfigJson,
    getUUID,
    globalConfig,
    addKey,
    isUserCreated,
    isInitDone,
    setUserCreated,
    setDefaultPort,
    getDestinationIP,
    isRemoteSetupDone,
    set,
    isServerOnPremise,
    getUsername
}
