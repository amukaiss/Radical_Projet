const { spawn } = require('node:child_process');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FS = process.env.FS;
const FormData = require('form-data');

module.exports = {
    pythonRes: async function (req) {
        return new Promise((resolve, reject) => {
            let success = true;
            let errorSet = [];
            let result = {};
            const { resultLink, pythonScript, environmentName, nameProject, id_project, id_user } =
                req;
            const command = `conda run -n ${environmentName} python ./ps2f/visualize/${pythonScript} ${nameProject} ${resultLink} ${id_project}`;
            console.log(command);
            if (process.platform === 'win32') {
                console.log('win32');
                // Spawn a new child process to call the python script
                const pythonProcess = spawn(command, { shell: 'powershell.exe' });
                // Collect data from python
                pythonProcess.stdin.on('data', (data) => console.log('stdin : ', data.toString()));
                pythonProcess.stderr.on('data', (data) =>
                    console.error('error : ', data.toString())
                );
                // pythonProcess.on('exit', (code, signal) => {
                //     if (code) {
                //         console.error('Child exited with code', code);
                //     } else if (signal) {
                //         console.error('Child was killed with signal', signal);
                //     } else {
                //         console.log('Child exited okay');
                //     }
                // });
                // Check if the stream from child process is closed
                pythonProcess.on('exit', function () {
                    // 0 means successful response
                    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);

                    let dest = path.join(newFilePath, './' + nameProject + '_converted.geojson');
                    let formData = new FormData();

                    formData.append('file', fs.createReadStream(dest));
                    formData.append('id_user', id_user);
                    formData.append('id_project', id_project);

                    axios.post(FS + '/single', formData).then((resp) => {
                        if (!resp.data.success) {
                            result = {
                                status: 200,
                                success: false,
                                errorSet: ['ERROR UPLOAD SERVER']
                            };
                            reject(result);
                        }
                    });
                    result = {
                        success: success,
                        errorSet: errorSet,
                        data: dest
                    };
                    resolve(result);
                });
            } else if (process.platform === 'linux') {
                console.log('linux');
                const pythonProcess = spawn(command, { shell: '/bin/bash' });
                // Collect data from python
                pythonProcess.stdin.on('data', (data) => console.log('stdin : ', data.toString()));
                pythonProcess.stderr.on('data', (data) =>
                    console.error('error : ', data.toString())
                );
                // pythonProcess.on('exit', (code, signal) => {
                //     if (code) {
                //         console.error('Child exited with code', code);
                //     } else if (signal) {
                //         console.error('Child was killed with signal', signal);
                //     } else {
                //         console.log('Child exited okay');
                //     }
                // });
                // Check if the stream from child process is closed
                pythonProcess.on('exit', function () {
                    let newFilePath = path.join(__dirname, `../../../files/tmp/${id_project}`);

                    let dest = path.join(newFilePath, './' + nameProject + '_converted.geojson');
                    let formData = new FormData();

                    formData.append('file', fs.createReadStream(dest));
                    formData.append('id_user', id_user);
                    formData.append('id_project', id_project);

                    axios.post(FS + '/single', formData).then((resp) => {
                        if (!resp.data.success) {
                            result = {
                                status: 200,
                                success: false,
                                errorSet: ['ERROR UPLOAD SERVER']
                            };
                            reject(result);
                        }
                    });
                    result = {
                        success: success,
                        errorSet: errorSet,
                        data: dest
                    };
                    resolve(result);
                });
            }
        });
    },

    getVisualizationWithArgument: async function (req) {
        let success = true;
        let errorSet = [];
        let result = {};
        let { nameProject, id_user, id_project } = req;
        // Python file to execute
        const pythonScript = 'convertGeoJson.py';
        // Python environment
        const environmentName = 'ps2f';
        // Get resultat file
        let resp = await axios.post(FS + '/getByFilename', {
            filename: nameProject + '_resultat.json',
            id_user: id_user,
            id_project: id_project
        });
        if (!resp.data.success) {
            result = {
                status: 200,
                success: false,
                errorSet: [`CANNOT GET ${nameProject}_resultat.json`]
            };
            return result;
        }
        let resultLink = resp.data.data.destination;

        // Pass argument in command line
        const request = {
            resultLink,
            pythonScript,
            environmentName,
            nameProject,
            id_project,
            id_user
        };
        result = await this.pythonRes(request);
        console.log(result);
        if (!result.success) {
            result = {
                status: 200,
                success: false,
                errorSet: result.errorSet
            };
            return result;
        }
        fs.unlinkSync(result.data);
        result = {
            status: 200,
            success: success,
            errorSet: errorSet
        };
        return result;
    }
};
