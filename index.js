// om namah shivay

const start = (req, res) => {
    let html;
    if (!global.config) {
        loadConfig()
        .then(result => {
            global.config = result;
            html = 'config absent in global cache<br>';
            html += 'successfully loaded config in global cache<br>';
            html += `config: ${JSON.stringify(global.config)}`;
            res.send(html);
        })
        .catch(err => {
            html = 'config absent in global cache<br>';
            html += 'error loading config in global cache<br>';
            html += `error: ${err}`;
            res.send(html);
        });
    } else {
        html = 'config already present in global cache<br>';
        html += `config: ${JSON.stringify(global.config)}`;
        res.send(html);
    }
};

const loadConfig = () => {

    const google = require('googleapis');
    const key = require('./runtime-configurator-credentials');
    
    const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        ['https://www.googleapis.com/auth/cloudruntimeconfig'], // an array of auth scopes
        null
    );

    const runtimeConfig = google.runtimeconfig('v1beta1');
    const projectId = 'replace-with-your-project-id'; // replace with your project id
    const configName = 'replace-with-your-config-name'; // replace with your config name

    return new Promise((resolve, reject) => {

        jwtClient.authorize(function (err, tokens) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log('jwt authorization successful');
            }

            runtimeConfig.projects.configs.variables.list({
                auth: jwtClient,
                parent: `projects/${projectId}/configs/${configName}`,
                returnValues: true
            },
            function (err, response) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(`response: ${JSON.stringify(response.data)}`);
                    resolve(response.data);
                }
            });
          
        });

    });
    
};

module.exports = {
    start
};