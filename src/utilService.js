var exec = require('child_process').exec;
const colors = require('colors');

function executeCommandPromise(command){
    // console.log('In the Promise Function of execute Command', command)
    return new Promise((resolve, reject) => {
      exec(command,{maxBuffer: 1024 * 500} ,(error, stdout, stderr) => {
         if (error) {
             console.log('There is an error executing the command', error)
            reject(error)  
          } else {
              // console.log("There is no errror", stdout)
              resolve(stdout? stdout : stderr);
          }
      });
    });
}

function logError(message) {
  // console.log(colors.red(message))
}

function logInput(message){
  // console.log(colors.setTheme(message))
}

function logSuccess(message){
  // console.log(colors.green(message));
}

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

function isWindows(){
  if (process.platform === 'win32')
    return true;
  return false;
}

function isShellScript(filePath){
  let result = fs.existsSync(filePath);
  if (!result)
    return false
  if (filePath.endsWith('.sh')){
    return true
  } 
  return false
}

module.exports = {
    executeCommandPromise,
    createDir,
    logSuccess,
    logError,
    logInput,
    isShellScript,
    isWindows
}

  