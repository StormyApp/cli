const chokidar = require('chokidar');
const {generateRsyncCommandString} = require('./rsyncService')
const {pathToRemoteFolder} = require('./sshService');
const { globalConfig} = require('./initService')
const { getWorkingDirectory,executeCommandPromise } = require('./utilService');
const path = require('path');
const { logger } = require('./util/logger');
var watcher = undefined;

startListeningForChange = async (dir, cb) => { 
    watcher = chokidar.watch(dir, { persistent: true, ignoreInitial:true, ignored:['.git','node_modules'] });
    watcher.on('change', async filePath => cb(filePath))
    watcher.on('add', async filePath => cb(filePath))
    logger.info('Chokidar Process Listening For the Change')
}

stopListeningForChange = () => {
    watcher = undefined;
}

// startListeningForChange('.', console.log)

process.on('exit', function() {
    logger.info('Exiting')
})

process.on('beforeExit', function(){
    logger.info('About to Exit')
})

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    logger.info('Caught SIGINT')
    process.exit();
  }
);

process.on('SIGTERM', function(){
    logger.info('Caught SIGTERM')
    process.exit()
})

process.on('SIGABRT', function() {
    console.log("Caught Abort Signal")
    logger.info('Caught Abort Signal')
    process.exit();
})

const getThePath = (filePath)  => {
    const p = path.join('.', filePath)
    // console.log('The Path is ',p)
    return p
 }

const syncLocalChange = async (filePath) => {
    console.log('Syncing the change')
    const {uuid} = await globalConfig
    const remoteFolder = await pathToRemoteFolder(uuid, getWorkingDirectory())
    var rsyncString = generateRsyncCommandString('./', remoteFolder)
    // console.log(rsyncString)
    logger.info('File Changed using command: '+ filePath)
    logger.info('Syncing the Changes using command: '+ rsyncString)
    executeCommandPromise(rsyncString)
    .then(() => {
        logger.info('Synced the Changes to the server')
    })
    .catch( er => {
        logger.error('Unable to sync the changes to Remote Server', er)
    })
}
startListeningForChange('.', syncLocalChange)

module.exports = {
    startListeningForChange,
    stopListeningForChange
}
