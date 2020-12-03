#!/usr/bin/env node
const fs = require("fs");
const { globalAgent, get } = require("http");
const { domain } = require("process");
const util = require('util');
// const exec = util.promisify(require('child_process').exec);
var exec = require('child_process').exec;
require('dotenv').config({path: __dirname +'/' + 'local.env'});
var CONSTANTS = require('./src/const');
const { registerCLI } = require("./src/httpClient");
var initService = require('./src/initService');
var globalConfig = {}
var utilService = require('./src/utilService');
var sshService = require('./src/sshService')
var colors = require('colors');
var nodeSSHService = require('./src/nodeSSHService');
 
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

const SSH_KEY_GEN_COMMAND = "ssh-keygen -t rsa -b 4096 -N '1234534d' -f ./stormy/.ssh/id_rsa -C rabans"

function isSSHInitDone(){
  return fs.existsSync(CONSTANTS.SSH_PRIVATE_KEY_FILE);
}

async function initSSH(user) { 
  if (isSSHInitDone()){
    return 
  }
}

async function writeToFile(content, filePath){
  return fs.promises.writeFile(filePath, content)
}

// initService.init();

function getExcludedFolderString(excludedFolders){
  // var excludedFolders = CONSTANTS.EXCLUDED_FOLDERS;
  if (!excludedFolders.length) 
    return ''
  cmd_line = ""
  // = '--exclude {'
  for (const folder of excludedFolders){
    cmd_line = cmd_line + " --exclude " +  folder + CONSTANTS.RSYNC.SPACE
  }
  // cmd_line = cmd_line + "''}"
  return cmd_line
}

function getSSHCommandString(){
  return '-e \"' + getExecutablePath('ssh') + ' -i ' + getUserKey() + '\"'
}

function getSourceFolder(){
  return './'
}

function getCurrentFoder(){
  let splitter = '\\';
  if(process.platform != 'win32'){
    splitter = '/'
  }
  var dir =  process.cwd().split(splitter);
  return  dir[dir.length - 1];
}

function pathToRemoteFolder(folderName){
  return globalConfig['uuid'] + '@' + CONSTANTS.RSYNC.IP + ":~/" + folderName 
}

function generateRsyncCommandString(sourceDir, destDir){
  return getExecutablePath (CONSTANTS.RSYNC.NAME) + 
  //  CONSTANTS.RSYNC.SPACE  + CONSTANTS.RSYNC.SKIP_TIME 
  CONSTANTS.RSYNC.SPACE 
   + CONSTANTS.RSYNC.SPACE +
  CONSTANTS.RSYNC.ARGS + CONSTANTS.RSYNC.SPACE  +
  getExcludedFolderString(CONSTANTS.RSYNC.EXCLUDED_FOLDERS) + CONSTANTS.RSYNC.SPACE  +
  getSSHCommandString() + CONSTANTS.RSYNC.SPACE +
  sourceDir + CONSTANTS.RSYNC.SPACE  +
  destDir
}


function getCommandUtil(remoteCommand){
  // return 
  // " \" mkdir "+ getCurrentFoder()+";+ 
  return "\"" + "cd ~/" + getCurrentFoder() + " ; " + remoteCommand.join(' ') + "\"" 
}

function getRemoteCommandString(remoteCommand, globalConfig, getTerminal){
  var uuid = globalConfig.uuid;
  var command = getExecutablePath('ssh') ; 
  if ( getTerminal) {
    // command = command + ' -T '
  }
  command = command +' -i ' + getUserKey()+ ' ' +  uuid + '@' + CONSTANTS.RSYNC.IP + ' ' + getCommandUtil(remoteCommand)
  return command;
}

function getExecutablePath(name){
  if(process.platform != 'win32'){
    // set the permission to the key as chmod 400 
    excuteCommand('chmod 400 '+ getUserKey())
    return name;
  }
  switch(name){
    case 'ssh':
      return __dirname + '/DeltaCopy/ssh'
    case 'rsync':
      return __dirname + '/DeltaCopy/rsync'
  }
}

function getUserKey(uid){
  const key =  process.cwd() + '/'+ CONSTANTS.SSH_PRIVATE_KEY_FILE
  // Path to the global private key file
  // __dirname + CONSTANTS.RSYNC.PATH_TO_KEY
  // console.log("Trying to fetch the user key", key)
  return key
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

async function init(){
  globalConfig = await initService.init()
  if ( globalConfig && !globalConfig['keyCreated']){
    await sshService.sshKeyGen()
    globalConfig['keyCreated'] = true
    
  }
  return globalConfig
}

async function parseArgs(){
  globalConfig = await init()
  var args = process.argv.slice(2);
  // console.log(args[0])
  switch(args[0]){
    case 'login':
      console.log("Inside the login Method")
      var open = require('open')
      // var uud =  await initService.getUUID()
      // In the future redirect the user to the github
      // open('http://api.stormyapp.com/login/cli/' + uud)

      // Make an API call today to fetch the details from the body
      break;
    case 'init':
      // make a rquest to server
      // console.log('Inside the init')
      var uuid =  await initService.getUUID()
      if ( globalConfig && !globalConfig['userCreated']){
        try {
          const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
          });
          var result = await registerCLI(uuid, sshService.readPublicKey());
          globalConfig['guuid'] = result.data['guuid']
          globalConfig['userCreated'] = true
          console.log(colors.info('....... INIT Done Successfully .........'))
          readline.question('What is the default port to run your application?', port => {
            console.log(`You have chosen the default port: ${port}`);
            globalConfig['port'] = port
            console.log(colors.info('If you want to change it in future go to your config file'))
            console.log(colors.info(CONSTANTS.CONFIG_FILE))
            readline.close();
            initService.writeConfigJson(CONSTANTS.CONFIG_FILE, JSON.stringify(globalConfig))
            // console.log(colors.info('Your configuration file is located in', CONSTANTS.CONFIG_FILE))
          });
        }
        catch(e){
          console.log(colors.error('Getting some error initializing stormy'),e)
          console.log(colors.info('Please contact us on'))
          console.log(colors.info('https://twitter.com/AppStormy'))
        }
      } else {
        console.log(colors.info('....... You have already completed INIT .........'))
      }
      initService.writeConfigJson(CONSTANTS.CONFIG_FILE, JSON.stringify(globalConfig))
      break;
    default:
      if ( !isInitComplete(globalConfig) )
        console.log('Please run the init method')
      else {
        // console.log('Inside the doMain ')
        doMain(globalConfig);
      }
  }
}

const isInitComplete = (globalConfig) => {
  // console.log('The values of the globalConfig values are', globalConfig)
  if ( !globalConfig )
    return false
  if ( !globalConfig['uuid'])
    return false
  if (!globalConfig['keyCreated'])
    return false
  if (!globalConfig['guuid']){
    return false
  }
  return true
}

const getEmail = () => {
  console.log('Please enter your email to continue')
}

parseArgs();

function doMain(globalConfig) {
  nodeSSHService.portForward(globalConfig['uuid'], globalConfig['port'], globalConfig['port']);
  var str = generateRsyncCommandString('./', pathToRemoteFolder(getCurrentFoder()))
  console.log("The Rsync string is",str)
  var rsyncPromise = utilService.executeCommandPromise(str);
    rsyncPromise.then(() => {
    console.log('Waiting for rsync to finish')
    console.log('The globalConfig', globalConfig)
    args = process.argv.slice(2)
    console.log(args);
    if (args.length) {
      const remoteCommand = getRemoteCommandString(args, globalConfig, true);
      // console.log("The remote command is ", remoteCommand)
      excuteCommand(remoteCommand)
      // var syncBuildToLocal = generateRsyncCommandString(pathToRemoteFolder(getCurrentFoder()+'/build'), getSourceFolder());
      // console.log(syncBuildToLocal)
      // excuteCommand(syncBuildToLocal)
    }

  }).catch( (error) => {
    console.log('There is an error in executing the rsync command', error)
  })
}

