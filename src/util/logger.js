const { createLogger, format, transports, level } = require('winston');
const { combine, timestamp, label, printf, splat } = format;
const path = require('path');


function ifObjectIsEmpty(object){
  var isEmpty=true;
  if(JSON.stringify(object)==JSON.stringify({})){
    // Object is Empty
    isEmpty = true;
  }
  else{
    //Object is Not Empty
    isEmpty = false;
  }
  return isEmpty;
}

const logFormat = format.printf(info => { 
  const metadata = info.metadata
  if (!ifObjectIsEmpty(metadata))
    return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}: ${JSON.stringify(info.metadata)}`
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`
})


// const myFormat = printf(({ level, message, timestamp, ...output }) => {
//     return `${timestamp}: ${level} : ${message} : ${output}`;
// });


const logger = createLogger({
  level: 'info',
  format: combine(
    format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Format the metadata object
    format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    format.colorize(),
    logFormat,
    // splat(),
    // timestamp(),
    // myFormat
    ),
  exitOnError: false,
  transports: [
    new transports.File({ filename: './.stormy/logs/application.logs'}),
  ],
});


// if (process.env.NODE_ENV !== 'production') {
//   logger.add(new transports.Console({
//     format: format.simple(),
//   }));
// }

module.exports = {
    logger
}