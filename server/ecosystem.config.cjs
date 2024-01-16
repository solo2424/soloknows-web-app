module.exports = {
    apps: [
        {
            name: 'ExpressServer',
            script: 'server/server.js',
            out_file: 'logs/es.log',
            error_file: 'logs/es-error.log',
            combine_logs: true,
            time: true,
        },

        {
            name: 'text_to_speech_server',
            script: 'server/text_to_speech_server.py',
            interpreter: 'C:\\Users\\jerem\\anaconda3\\envs\\soloknows\\python.exe',
            restart_delay: 10000,
            max_restarts: 5,
            out_file: 'logs/tts.log',
            error_file: 'logs/tts-error.log',
            combine_logs: true,
            time: true,
        }
    ],
};
