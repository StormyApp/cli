#!/usr/bin/env node
var exec = require('child_process').exec;
const {isRemoteSetupDone, setUserCreated, setDefaultPort, globalConfig, getUUID, set } = require('./src/initService');
const {logger} = require('./src/util/logger')

require('dotenv').config({path: __dirname +'/' + 'local.env'});
const CONSTANTS = require('./src/const');
const { registerCLI } = require("./src/httpClient");
const utilService = require('./src/utilService');
const sshService = require('./src/sshService')
const colors = require('colors');
const nodeSSHService = require('./src/nodeSSHService');
const { executeRemote, sshClient } = require('./src/ssh2');
const { exit } = require('process');
const { generateRsyncCommandString } = require("./src/rsyncService");
const { getWorkingDirectory } = require('./src/utilService');
const { pathToRemoteFolder, sshKeyGen } = require('./src/sshService');
var chokidarProcess = undefined;
// console.log('After the require index') 
colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red',
  success: 'pink',
});
const prompts = require('prompts');
const startChokidarProcess = () => {
  const { fork } = require("child_process");
  chokidarProcess = fork(require.resolve("./src/chokidarService"),{detached: false});
  chokidarProcess.on('close', () => {
    console.log('Exiting the Chokidar Process')
    logger.info('Closing the chokidar Process')
    process.exit()
  })
  chokidarProcess.on('disconnect', () => {
    logger.info('Disconnecting the chokidar Processs')
  })
  chokidarProcess.on('exit', () => {
    logger.info('Exiting the chokidar Process')
  })
  chokidarProcess.on('error', (err) => {
    logger.error('Chokidar Process Errored', err)
  })
}

const setPermission = () => {
  if (process.platform != 'win32') {
      var command = "chmod 400 .stormy/.ssh/id_rsa"
      exec(command, (error) => {
          if (error) {
              console.log('Unable to set the 400 permission to the keys', error)
          } else {
              console.log("Keys are set with the 400 permission")
          }
      });
  }
}

function getCommandUtil(commandPrefix ,remoteCommand){
  if (commandPrefix)
    return "cd ~/" + getWorkingDirectory() + " ; "+ commandPrefix + ';' + remoteCommand.join(' ')
  return "cd ~/" + getWorkingDirectory() + " ; " + remoteCommand.join(' ') 
}

const doMain = async () => {
  const {uuid, port} = await globalConfig
  const remoteFolder = await pathToRemoteFolder(uuid, getWorkingDirectory())
  var str = generateRsyncCommandString('./', remoteFolder)
  logger.info('Pushing doMain Changes: ' + str)
  console.log('Syncing File Changes')

  var rsyncPromise = utilService.executeCommandPromise(str);
    rsyncPromise.then(() => {
    console.log('Changes Sync Successfully')
    logger.info('The Global Config is', globalConfig)
    args = process.argv.slice(2)
    // var dos2UnixCommand = dos2unix(args[0]);
    console.log(args);
    if (args.length) {
      startChokidarProcess();
      // executingCommand(uuid , args,  '')
      executeRemote(
        getCommandUtil(undefined, args)
        , uuid)
      .then( () => { console.log('Pass'); })
      .catch( (e) => { console.log('Fail',e)})
      .finally( () => {
        exit(0);
      })
    }

  }).catch( (error) => {
    console.log('There is an error in executing the rsync command', error)
  })
}

async function parseArgs() {
  var args = process.argv.slice(2);
  switch(args[0]){
    case 'login':
      console.log("Inside the login Method")
      // var open = require('open')
      // var uud =  await initService.getUUID()
      // In the future redirect the user to the github
      // open('http://api.stormyapp.com/login/cli/' + uud)

      // Make an API call today to fetch the details from the body
      break;

    case 'init':
      // make a rquest to server
      console.log('Setting up your High Speed Environment ...')
      if (isRemoteSetupDone()){
        console.log(colors.info('....... You have already completed INIT .........'))
        break;
      }
      // 
        if ( !globalConfig['serverSetup'] ) {
          const {serverSetup} = await prompts({
            type: 'select',
            name: 'serverSetup',
            message: 'Where to do you want to setup build server?',
            choices: [
              { title: 'Stormy Server', description: 'Code will be sent to Stormy Server', value: 'stormy', selected: true},
              { title: 'On Premise Server', description: 'Code will be sent to your server', value: 'onPremise', selected: false },
            ],
            initial: 1
          });
          console.log('You have selected configuration to be ', serverSetup)
          globalConfig['serverSetup'] = serverSetup || "stormy"
          set('serverSetup', serverSetup || 'stormy')
        }
        
        if ( !globalConfig['hostname'] && globalConfig['serverSetup'] === "onPremise" ){
          const {hostname} = await prompts({
            type: 'text',
            name: 'hostname',
            message: 'What is the IP address/hostname of your build server?'
          })
          // console.log("Your hostnae",hostname)
          set('hostname',hostname)
        }

        if( !globalConfig['username'] &&  globalConfig['serverSetup'] === "onPremise"){
          const {username} = await prompts({
            type: 'text',
            name: 'username',
            message: 'What is the username of your account on your build server?'
          })
          // console.log('The username is', username)
          set('uuid', username)
        } 

        var uuid =  await getUUID()
        if (!globalConfig['port']){
          const {port} = await prompts({
            type: 'number',
            name: 'port',
            message: 'What is the port to run your application?'
          })
          setDefaultPort(port || 3000)
        }

        if (globalConfig['serverSetup'] === "stormy"){
          // console.log(colors.info('We only support onPremise as of now. Please add your self to waitlist.'))
          // console.log(colors.info('https://appstormy.typeform.com/to/wVoiY0ok'))
          try {
              if (!globalConfig['keyCreated']){ 
                console.log('Generating SSH Keys')
                await sshKeyGen()
                setPermission();
                set('keyCreated', true)
                console.log('SSH Keys Generated Successfully')
              }
            } catch(err){
              console.log(colors.error('Failed to generate Keys'));
            }

          try {
            if(!globalConfig['userCreated']){
              const result = await registerCLI(uuid, sshService.readPublicKey());
              setUserCreated(true)
              console.log(colors.info('....... INIT Done Successfully .........'))
            }
          } catch (e){
            setUserCreated(false)
            console.log(colors.error('Error Setting up the Env. Please contact us on'))
            console.log(colors.error('https://twitter.com/AppStormy'))
          }
        }
        console.log(colors.info('If you want to change configurations in future go to your config file'))
        console.log(colors.info(CONSTANTS.CONFIG_FILE))

      break;
    default:
      if ( !isRemoteSetupDone() )
        console.log('Please run the init method')
      else {
        doMain();
      }
  }
}
parseArgs();

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    sshClient.end()
    process.exit();
});

process.on('SIGHUP', function (){
  console.log('Exiting the terminal')
  if (chokidarProcess)
    chokidarProcess.kill('SIGTERM')
  sshClient.end()
  process.exit();
})

process.on('SIGABRT', function(){
  console.log('SIGABRT ...')
  if (chokidarProcess)
    chokidarProcess.kill('SIGTERM')
  sshClient.end()
  process.exit()
})



