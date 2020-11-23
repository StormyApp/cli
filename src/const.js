const BASE_FOLDER = '.stormy'
const CONSTANTS = {
    SSH_FOLDER: BASE_FOLDER + '/.ssh',
    SSH_PUBLIC_KEY_FILE: BASE_FOLDER + '/.ssh/id_rsa.pub',
    SSH_PRIVATE_KEY_FILE: BASE_FOLDER + '/.ssh/id_rsa',
    SSH_CONFIG: BASE_FOLDER + '/.ssh/config',
    CONFIG_FILE: BASE_FOLDER  + '/config.json',
    RSYNC_COMMAND: ' rsync.exe  -zvrlt  -e "ssh -i .\buildexp_pair.pem" ./rsync-test-folder/ ubuntu@15.207.98.234:~/rsync-test-folder',
    SERVER_URL: process.env.REACT_APP_SERVER ? process.env.REACT_APP_SERVER: 'http://stormyserver20-env.eba-p6m3muhi.ap-south-1.elasticbeanstalk.com'
}

const RSYNC = {
    NAME: 'rsync',
    ARGS: '-zvrlt',
    SKIP_TIME: '--omit-dir-times',
    SPACE: ' ',
    PATH_TO_KEY: '/buildexp_pair.pem',
    EXCLUDED_FOLDERS: ['.stormy', '.git', 'node_modules', '.idea', 'app/build', '.next'],
    DEST_FOLDER_USERNAME: 'ubuntu',
    // IP: '3.6.95.176',
    // IP: '65.0.74.19',
    // IP: '15.206.117.201'
    IP: '13.127.110.225'
}

module.exports = {
    ...CONSTANTS,
    BASE_FOLDER,
    RSYNC
}
