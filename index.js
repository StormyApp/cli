#!/usr/bin/env node
const fs = require("fs");
const util = require('util');
// const exec = util.promisify(require('child_process').exec);
var exec = require('child_process').exec;
// 
var CONSTANTS = require('./const');

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

async function init(){
  try {
    createDir(CONSTANTS.BASE_FOLDER);
    // initSSH();
  } catch(e){
    console.log("Error initiating the build", e)
  }
}

async function createDir(targetDir) {
  try {
    let result = fs.existsSync(targetDir);
    if (!result){
      return fs.promises.mkdir(targetDir, { recursive: true });
    }
  } catch(e){
    console.log("Error creating the folder/file", e)
  }
}

init();

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
  return CONSTANTS.RSYNC.DEST_FOLDER_USERNAME + '@' + CONSTANTS.RSYNC.IP  + ":~/" + folderName 
}

function generateRsyncCommandString(sourceDir, destDir){
  return getExecutablePath (CONSTANTS.RSYNC.NAME) + 
   CONSTANTS.RSYNC.SPACE  +
  CONSTANTS.RSYNC.ARGS + CONSTANTS.RSYNC.SPACE  +
  getExcludedFolderString(CONSTANTS.RSYNC.EXCLUDED_FOLDERS) + CONSTANTS.RSYNC.SPACE  +
  getSSHCommandString() + CONSTANTS.RSYNC.SPACE +
  sourceDir + CONSTANTS.RSYNC.SPACE  +
  destDir + CONSTANTS.RSYNC.SPACE
}


function getCommandUtil(remoteCommand){
  return " \" mkdir "+ getCurrentFoder()+";cd ~/" + getCurrentFoder() + " ; " + remoteCommand.join(' ') + "\""
}

function getRemoteCommandString(remoteCommand){
  return getExecutablePath('ssh') +' -i ' + getUserKey()+ ' ' + 
  CONSTANTS.RSYNC.DEST_FOLDER_USERNAME + 
  '@' + CONSTANTS.RSYNC.IP + ' ' + getCommandUtil(remoteCommand)
}

function getExecutablePath(name){
  if(process.platform != 'win32'){
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
  const key =  __dirname + CONSTANTS.RSYNC.PATH_TO_KEY
  // console.log("Trying to fetch the user key", key)
  return key
}

async function excuteCommand(command){
  // console.log(command)
  var executor = exec(command);

  executor.stdout.on('data', function(data){
    var p = data.replace('localhost', CONSTANTS.RSYNC.IP)
    process.stdout.write(p)
  })
  
  executor.stderr.pipe(process.stderr);
  executor.stdin.pipe(process.stdin);
}

var str = generateRsyncCommandString('./', pathToRemoteFolder(getCurrentFoder()))
// console.log(str)
excuteCommand(str);


args = process.argv.slice(2)
console.log(args);
if (args.length) {
  const remoteCommand = getRemoteCommandString(args);
  // console.log("The remote command is ", remoteCommand)
  excuteCommand(remoteCommand)
  var syncBuildToLocal = generateRsyncCommandString(pathToRemoteFolder(getCurrentFoder()+'/build'), getSourceFolder());
  // console.log(syncBuildToLocal)
  excuteCommand(syncBuildToLocal)
}
