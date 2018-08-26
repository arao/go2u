let shell  = require('shelljs');
module.exports = async (url)=>{
    url = url.replace(/^http(s)?:\/\//, '');
    let command = '';
    if(process.platform === 'win32'){
        command = 'ping -n 1 ';
    }else{
        command = 'ping -c 1 ';
    }
    return Promise.resolve(shell.exec(command+url).code);
};