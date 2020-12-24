const chokidar = require('chokidar');
const {generateRsyncCommandString} = require('./rsyncService')
const {pathToRemoteFolder} = require('./sshService');
const { globalConfig} = require('./initService')
const { getWorkingDirectory,executeCommandPromise } = require('./utilService');
const path = require('path')
var watcher = undefined;

startListeningForChange = async (dir, cb) => { 
    watcher = chokidar.watch(dir, { persistent: true, ignoreInitial:true, ignored:['.git','node_modules'] });
    watcher.on('change', async filePath => cb(filePath))
    watcher.on('add', async filePath => cb(filePath))
}

stopListeningForChange = () => {
    watcher = undefined;
}

// startListeningForChange('.', console.log)
process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
  }
);

const getThePath = (filePath)  => {
    const p = path.join('.', filePath)
    console.log('The Path is ',p)
    return p
 }

const syncLocalChange = async (filePath) => {
    console.log('Syncing the change')
    const {uuid} = await globalConfig
    const remoteFolder = await pathToRemoteFolder(uuid, getWorkingDirectory())
    var rsyncString = generateRsyncCommandString('./', remoteFolder)
    console.log(rsyncString)
    executeCommandPromise(rsyncString).then(() => console.log('Rsync Done Second Time'))
}
startListeningForChange('.', syncLocalChange)

module.exports = {
    startListeningForChange,
    stopListeningForChange
}
