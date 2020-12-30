#!/usr/bin/env node
var exec = require('child_process').exec;
const {isRemoteSetupDone, isInitDone, setUserCreated, setDefaultPort, globalConfig, getUUID, set } = require('./src/initService');

require('dotenv').config({path: __dirname +'/' + 'local.env'});
const CONSTANTS = require('./src/const');
const { registerCLI,executingCommand } = require("./src/httpClient");
const utilService = require('./src/utilService');
const sshService = require('./src/sshService')
const colors = require('colors');
const nodeSSHService = require('./src/nodeSSHService');
const { executeRemote, sshClient } = require('./src/ssh2');
const { exit } = require('process');
const { generateRsyncCommandString } = require("./src/rsyncService");
const { getWorkingDirectory } = require('./src/utilService');
const { pathToRemoteFolder, sshKeyGen } = require('./src/sshService');
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
  console.log('Starting the Chokidar Process')
  const { fork } = require("child_process");
  var childProcess = fork(require.resolve("./src/chokidarService"),{detached: false});
  childProcess.on('close', () => {
    process.exit()
  })
}

const setPermission = () => {
  if (process.platform != 'win32') {
      var command = "chmod 400 .stormy/.ssh/id_rsa"
      exec(command, (error, stdout, stderr) => {
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
  console.log("The Rsync string is",str)
  var rsyncPromise = utilService.executeCommandPromise(str);
    rsyncPromise.then(() => {
    console.log('Waiting for rsync to finish')
    console.log('The globalConfig', globalConfig)
    args = process.argv.slice(2)
    // var dos2UnixCommand = dos2unix(args[0]);
    console.log(args);
    if (args.length) {
      const portForwardConnection = nodeSSHService.portForward(uuid, port, port);
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
        if ( globalConfig['serverSetup'] === "stormy"){
          try {
            
            if (!globalConfig['keyCreated']){ 
              console.log('Generating SSH Keys')
              await sshKeyGen()
              setPermission();
              set('keyCreated', true)
              console.log('SSH Keys Generated Successfully')
            }
            const result = await registerCLI(uuid, sshService.readPublicKey());
            setUserCreated(true)
          } catch (e){
            setUserCreated(false)
            console.log(colors.info('Please contact us on'))
            console.log(colors.info('https://twitter.com/AppStormy'))
          }
        }

        console.log(colors.info('....... INIT Done Successfully .........'))
        const {port} = await prompts({
          type: 'number',
          name: 'port',
          message: 'What is the port to run your application?'
        })
        setDefaultPort(port || 3000)

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
  sshClient.end()
  process.exit();
})

process.on('SIGABRT', function(){
  console.log('SIGABRT ...')
  sshClient.end()
  process.exit()
})



