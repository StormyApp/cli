var exec = require('child_process').exec;

function executeCommandPromise(command){
    console.log('In the Promise Function of execute Command', command)
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
         if (error) {
             console.log('There is an error executing the command', error)
            reject(error)  
          } else {
              console.log("There is no errror", stdout)
              resolve(stdout? stdout : stderr);
          }
      });
    });
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

module.exports = {
    executeCommandPromise,
    createDir
}

  