#!/usr/bin/env node
const fs = require("fs");
var keypair = require('keypair');
const util = require('util');
// const exec = util.promisify(require('child_process').exec);
var exec = require('child_process').exec;
// 
var forge = require('node-forge');
var CONSTANTS = require('./const');

const SSH_KEY_GEN_COMMAND = "ssh-keygen -t rsa -b 4096 -N '1234534d' -f ./stormy/.ssh/id_rsa -C rabans"

function isSSHInitDone(){
  return fs.existsSync(CONSTANTS.SSH_PRIVATE_KEY_FILE);
}

async function initSSH(user) { 
  if (isSSHInitDone()){
    return 
  }
  console.log("Doing the init for SSH");
  var pair = keypair();
  var publicKey = forge.pki.publicKeyFromPem(pair.public);
  var privateKey = forge.pki.privateKeyFromPem(pair.private)
  var sshPublicKey = forge.ssh.publicKeyToOpenSSH(publicKey, );
  var sshPrivateKey = forge.ssh.privateKeyToOpenSSH(privateKey,'');
  console.log(sshPublicKey)
  console.log(sshPrivateKey)
  writeToFile(sshPublicKey, CONSTANTS.SSH_PUBLIC_KEY_FILE)
  writeToFile(sshPrivateKey, CONSTANTS.SSH_PRIVATE_KEY_FILE)
  writeToFile(sshPrivateKey, CONSTANTS.SSH_PRIVATE_KEY_FILE)
  // return x
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

async function executeArgumentsOnRemote(args){
  console.log("Executing arguments on remote", args)
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
  return '-e \"' + getExecutablePath('ssh') + ' -i ' + CONSTANTS.RSYNC.PATH_TO_KEY + '\"'
}

function getSourceFolder(){
  return './'
}

function getCurrentFoder(){
  var dir =  process.cwd().split('\\');
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
  return './DeltaCopy/ssh -i ' + 
  CONSTANTS.RSYNC.PATH_TO_KEY + ' ' + 
  CONSTANTS.RSYNC.DEST_FOLDER_USERNAME + 
  '@' + CONSTANTS.RSYNC.IP + ' ' + getCommandUtil(remoteCommand)
}

function getExecutablePath(name){
  // Tells the path of the package where package is instaleld
  switch(name){
    case 'ssh':
      return __dirname + '/DeltaCopy/ssh'
    case 'rsync':
      return __dirname + '/DeltaCopy/rsync'
  }
}

async function excuteCommand(command){
  console.log(command)
  var executor = exec(command);

  executor.stdout.on('data', function(data){
    var p = data.replace('localhost', CONSTANTS.RSYNC.IP)
    process.stdout.write(p)
  })
  
  executor.stderr.pipe(process.stderr);
  executor.stdin.pipe(process.stdin)
  // const execution = spawn("ls")
  // execution.stdout.pipe(process.stdout)
  // ,command)
  // execution.stdout.on('data', function (data) {
  //   console.log('stdout: ' + data.toString());
  // });
  
  // execution.stderr.on('data', function (data) {
  //   console.log('stderr: ' + data.toString());
  // });
  
  // execution.on('exit', function (code) {
  //   console.log('child process exited with code ' + code.toString());
  // });
  // try{
  //   const { stdout, stderr } = await exec(command);
  //   console.log('stdout:', stdout);
  //   console.error('stderr:', stderr);
  // } catch(e){
  //   console.log("There was an error processing the execute ccommand", e)
  // }
}

var str = generateRsyncCommandString('./', pathToRemoteFolder(getCurrentFoder()))
console.log(str)
excuteCommand(str);

var syncBuildToLocal = generateRsyncCommandString(pathToRemoteFolder(getCurrentFoder()+'/build'), getSourceFolder());
console.log(syncBuildToLocal)
excuteCommand(syncBuildToLocal)

args = process.argv.slice(2)
console.log(args);
if (args.length) {
  executeArgumentsOnRemote(args)
  excuteCommand(getRemoteCommandString(args))
}
