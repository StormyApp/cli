#!/usr/bin/env node
var exec = require('child_process').exec;
const { isUserCreated, isInitDone, setUserCreated, setDefaultPort, globalConfig, getUUID } = require('./src/initService');

require('dotenv').config({path: __dirname +'/' + 'local.env'});
const CONSTANTS = require('./src/const');
const { registerCLI,executingCommand } = require("./src/httpClient");
const utilService = require('./src/utilService');
const sshService = require('./src/sshService')
const colors = require('colors');
const nodeSSHService = require('./src/nodeSSHService');
const { executeRemote } = require('./src/ssh2');
const { exit } = require('process');
const { generateRsyncCommandString } = require("./src/rsyncService");
const { getWorkingDirectory } = require('./src/utilService');
const { pathToRemoteFolder } = require('./src/sshService');
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

function getCommandUtil(commandPrefix ,remoteCommand){
  if (commandPrefix)
    return "cd ~/" + getWorkingDirectory() + " ; "+ commandPrefix + ';' + remoteCommand.join(' ')
  return "cd ~/" + getWorkingDirectory() + " ; " + remoteCommand.join(' ') 
}

function getRemoteCommandString(remoteCommand, commandPrefix, globalConfig, getTerminal){
  var uuid = globalConfig.uuid;
  var command = getExecutablePath('ssh') ; 
  if ( getTerminal) {
    // command = command + ' -T '
  }
  command = command +' -i ' + sshService.getUserKey()+ ' ' +  uuid + '@' + CONSTANTS.RSYNC.IP + ' ' + getCommandUtil(commandPrefix, remoteCommand)
  return command;
}

async function excuteCommand(command){
  // console.log(command)
  var executor = exec(command);

  // executor.stdout.on('data', function(data){
  //   // var p = data.replace('localhost', CONSTANTS.RSYNC.IP)
  //   process.stdout.write(p)
  // })
  // executor.stderr.on('data', function(data){
  //   const terminalLink = require('terminal-link');
  //   const link = terminalLink(data, 'https://www.google.com/search?q='+data);
  //   process.stderr.write(link)
  //   // console.log(link);
  // })
  executor.stdout.pipe(process.stdout);
  executor.stderr.pipe(process.stderr);
  executor.stdin.pipe(process.stdin);
}

async function parseArgs(){
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
      if (!isUserCreated()){
        try {
          const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          });
          var uuid =  await getUUID()
          var result = await registerCLI(uuid, sshService.readPublicKey());
          // setUserGUUID(resul.data['guuid'])
          setUserCreated(true)
          console.log(colors.info('....... INIT Done Successfully .........'))
          readline.question('What is the default port to run your application?', port => {
            console.log(`You have chosen the default port: ${port}`);
            setDefaultPort(port);
            console.log(colors.info('If you want to change it in future go to your config file'))
            console.log(colors.info(CONSTANTS.CONFIG_FILE))
            readline.close();
            // console.log(colors.info('Your configuration file is located in', CONSTANTS.CONFIG_FILE))
          });
        }
        catch(e){
          // console.log(colors.error('Getting some error initializing stormy'),e)
          setUserCreated(false)
          console.log(colors.info('Please contact us on'))
          console.log(colors.info('https://twitter.com/AppStormy'))
        }
      } else {
        console.log(colors.info('....... You have already completed INIT .........'))
      }
      break;
    default:
      if ( !isInitDone() )
        console.log('Please run the init method')
      else {
        // doMain();
      }
  }
}
globalConfig.then( () => parseArgs())
// parseArgs();

const doMain = async() => {
  const remoteFolder = await pathToRemoteFolder(globalConfig['uuid'], getWorkingDirectory())
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
      const portForwardConnection = nodeSSHService.portForward(globalConfig['uuid'], globalConfig['port'], globalConfig['port']);
      startChokidarProcess();
      executingCommand(globalConfig['uuid'], args,  '')
      executeRemote(
        getCommandUtil(undefined, args)
        , globalConfig['uuid'])
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

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    process.exit();
});

process.on('SIGHUP', function (){
  console.log('Exiting the terminal')
  process.exit();
})

process.on('SIGABRT', function(){
  console.log('SIGABRT ...')
  process.exit()
})

const startChokidarProcess = () => {
  console.log('Starting the Chokidar Process')
  const { fork } = require("child_process");
  var childProcess = fork(require.resolve("./src/chokidarService"));
  childProcess.on('close', () => {
    process.exit()
  })
}
// startChokidarProcess()
