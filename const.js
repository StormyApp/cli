const BASE_FOLDER = '.stormy'
const CONSTANTS = {
    SSH_FOLDER: BASE_FOLDER + '/.ssh',
    SSH_PUBLIC_KEY_FILE: BASE_FOLDER + '/.ssh/id_rsa.pub',
    SSH_PRIVATE_KEY_FILE: BASE_FOLDER + '/.ssh/id_rsa',
    SSH_CONFIG: BASE_FOLDER + '/.ssh/config',
    REMOTE_MACHINE_IP_OR_HOSTNAME: '',
    REMOTE_MACHINE_SSH_PORT: '',
    REMOTE_MACHINE_USERNAME: '',
    REMOTE_MACHINE_SSH_ALIAS: '',
    RSYNC_COMMAND: ' rsync.exe  -zvrlt  -e "ssh -i .\buildexp_pair.pem" ./rsync-test-folder/ ubuntu@15.207.98.234:~/rsync-test-folder'
}

const RSYNC = {
    NAME: 'rsync',
    ARGS: '-zvrlt',
    SPACE: ' ',
    PATH_TO_KEY: '/buildexp_pair.pem',
    EXCLUDED_FOLDERS: ['.stormy', '.git', 'node_modules', '.idea', 'app/build', '.next'],
    DEST_FOLDER_USERNAME: 'ubuntu',
    IP: '3.6.95.176'
}

module.exports = {
    ...CONSTANTS,
    BASE_FOLDER,
    RSYNC
}
