const axios = require('axios');
var CONSTANTS = require('./const')

function registerCLI(uuid){
    var URL = CONSTANTS.STAGING_URL + 'key/' + uuid
    console.log('Making a request to the URL', URL)
    return axios.get(URL)
}

module.exports = {
    registerCLI
}
