const { resolveCname } = require('dns');
const { config } = require('process');
const { v4: uuidv4 } = require('uuid');
fs = require('fs')
CONSTANTS = require('./const')

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
    var uuid = await readConfigJson(CONSTANTS.CONFIG_FILE);
    console.log(uuid)
    if (uuid){
        return uuid
    } else {
        var uud = uuidv4()
        writeConfigJson(CONSTANTS.CONFIG_FILE, uud)
        return uud;
    }
}

function readConfigJson(configLocation){
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
        var configJson = await readConfigJson(initFile);
        return configJson
    } catch(e){
      console.log("Error initiating the build", e)
    }
}

module.exports = {
    readConfigJson,
    createDir,
    init,
    writeConfigJson,
    getUUID
}
