var CONSTANTS = require('./const');
const {getUserKey} = require('./sshService')
const path = require('path');

function getExecutablePath(name){
  if(process.platform != 'win32'){
    // set the permission to the key as chmod 400 
    // excuteCommand('chmod 400 '+ getUserKey())
    return name;
  }
  switch(name){
    case 'ssh':
      return path.join(__dirname , 'DeltaCopy','ssh')
    case 'rsync':
      return path.join(__dirname , 'DeltaCopy','rsync')
    default:
      return name;
  }
}

function getSSHCommandString(){
  return '-e \"' + getExecutablePath('ssh') + ' -i ' + getUserKey() + '\"'
}

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
  return cmd_line + "  --filter=':- .gitignore'"
}

function generateRsyncCommandString(sourceDir, destDir) {
  return getExecutablePath(CONSTANTS.RSYNC.NAME) +
    //  CONSTANTS.RSYNC.SPACE  + CONSTANTS.RSYNC.SKIP_TIME 
    CONSTANTS.RSYNC.SPACE
    + CONSTANTS.RSYNC.SPACE +
    CONSTANTS.RSYNC.ARGS + CONSTANTS.RSYNC.SPACE +
    getExcludedFolderString(CONSTANTS.RSYNC.EXCLUDED_FOLDERS) + CONSTANTS.RSYNC.SPACE +
    getSSHCommandString() + CONSTANTS.RSYNC.SPACE +
    sourceDir + CONSTANTS.RSYNC.SPACE +
    destDir;
}
exports.generateRsyncCommandString = generateRsyncCommandString;
