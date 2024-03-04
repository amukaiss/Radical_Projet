const fs = require('fs');
const request = require('request');
const logger = require('../server_config/logger');
const fileServer = process.env.FS;
const upload_url = fileServer + '/file-management/file';
const delete_url = fileServer + '/file-management/remove';

module.exports.upload_file = upload_file;
module.exports.downloadFile = downloadFile;
module.exports.deleteFile = deleteFile;
module.exports.getHeader = getHeader;

function deleteFile(idFile) {
    return new Promise((resolve, reject) => {
        request(
            {
                url: delete_url,
                method: 'POST',
                json: { id_file: idFile }
            },
            function (error, response, body) {
                if (error) {
                    console.log('Cannot delete file', idFile);
                    resolve();
                }
                resolve();
            }
        );
    });
}

function downloadFile(idFile, pathToDownload) {
    return new Promise((resolve, reject) => {
        request(`${fileServer}/${idFile}`)
            .pipe(fs.createWriteStream(pathToDownload))
            .on('close', function () {
                resolve();
            })
            .on('error', function (error) {
                logger.log({
                    level: 'error',
                    label: 'APP',
                    message: `Cannot download file at ${fileServer}/${idFile}`
                });
                reject(error);
            });
    });
}

function upload_file(path, params) {
    return new Promise(function (resolve, reject) {
        const stream = fs.createReadStream(path);

        let formData = {
            app_key: params.app_key,
            id_owner: params.id_owner,
            owner_type: params.owner_type || 'FROM API',
            role: params.role,
            file: stream
        };

        if (params.extract) {
            formData.extract = '';
        }

        request(
            {
                url: upload_url,
                method: 'POST',
                rejectUnauthorized: false,
                formData: formData
            },
            function (err, resp) {
                if (err) {
                    return reject(err);
                }
                return resolve(resp.body);
            }
        );
    });
}

// function getHeader(idFile) {
//     return new Promise((resolve, reject) => {
//         request
//             .head(`${fileServer}/${idFile}`)
//             .on('response', function (response) {
//                 resolve(response.headers);
//             })
//             .on('error', function (error) {
//                 logger.log({
//                     level: 'error',
//                     label: 'APP',
//                     message: `Cannot download file at ${fileServer}/${idFile}`
//                 });
//                 reject(error);
//             });
//     });
// }
