const { resolveCname } = require('dns');
const { write } = require('fs');
const { globalAgent } = require('http');
const { config } = require('process');
const { v4: uuidv4 } = require('uuid');
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
    console.log('The configLocation is', configLocation)
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

async function getUUID() {
    
    if (globalConfig && globalConfig['uuid']){
        console.log('Fetching the global value of the uuid', globalConfig['uuid'])
        return globalConfig['uuid']
    }

    var uud = uuidv4().split('-').join('')
    globalConfig['uuid'] = uud
    writeConfigJson(CONSTANTS.CONFIG_FILE, JSON.stringify(globalConfig))
    return uud;
}

const getGlobalConfig = () => {
    if ( Object.keys(globalConfig).length !== 0){
        return globalConfig
    }
    // Read the value from the user
}

function readConfigJson(configLocation){
    let result = fs.existsSync(configLocation);
    if (!result)
        return '{}'
    return new Promise((resolve, reject) => {
        fs.readFile(configLocation, 'utf8', (err, data) => {
            if(err){
                reject(err);
            }
            else {
                resolve(data);
            }
        })
    })
}

async function init(){
    try {
        var initFile = CONSTANTS.CONFIG_FILE;
        createDir(CONSTANTS.BASE_FOLDER);
        globalConfigFile = await readConfigJson(initFile);
        if (globalConfigFile !== "")
            globalConfig = JSON.parse(globalConfigFile)
        // console.log('The value of the globalConfig value', globalConfig)
        return globalConfig;
    } catch(e){
      console.log("Error initiating the build", e)
      globalConfig = {}
      return globalConfig
    }
}

module.exports = {
    readConfigJson,
    createDir,
    init,
    writeConfigJson,
    getUUID,
    globalConfig,
    addKey
}
