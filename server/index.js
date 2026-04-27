'use strict';

var path = require('path');
var http = require('http');

var oas3Tools = require('openbackhaul-oas3-tools');
var appCommons = require('onf-core-model-ap/applicationPattern/commons/AppCommons');
const { recoverAtStartup } = require('./service/individualServices/StartupRecovery')
var serverPort = 4054;
const ElasticsearchPreparation = require('./service/individualServices/ElasticsearchPreparation');
const { runBackupCleanupJob } = require('./service/individualServices/BackupCleanupService')

// uncomment if you do not want to validate security e.g. operation-key, basic auth, etc
 //appCommons.openApiValidatorOptions.validateSecurity = false;

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
    openApiValidator: appCommons.openApiValidatorOptions
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();
appCommons.setupExpressApp(app);

// Outer Express wrapper: serves static files and GUI routes BEFORE the OpenAPI app,
var express = require('express');
var outerApp = express();
outerApp.use(express.static(path.join(__dirname, '../client/dist')));
outerApp.get('/v1/start-device-backup-restore-gui', function (req, res) {
   res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
});

// Fallback: MUST come before OpenAPI app
var clientDistIndex = path.resolve(__dirname, '../client/dist', 'index.html');
outerApp.use(function (req, res, next) {
    if (req.method === 'GET' && req.accepts('html') && !req.path.startsWith('/v1/') && !req.path.startsWith('/docs') && !req.path.startsWith('/api-docs') && !req.path.startsWith('/core-model')) {
        res.sendFile(clientDistIndex);
    } else {
        next();
    }
});

// OpenAPI app handles /v1/*, /docs, /core-model/*
outerApp.use(app);



//setting the path to the database 
global.databasePath = path.resolve(__dirname, 'database', 'config.json');


// --- Helper to start HTTP server ---
function startServer() {
    http.createServer(outerApp).listen(serverPort, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
        console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
    });
   // appCommons.performApplicationRegistration();
}


(async function bootstrap() {
    try {
        console.log('[bootstrap] Preparing Elasticsearch ...');
       await ElasticsearchPreparation.prepareElasticsearch();
        console.log('[bootstrap] Elasticsearch ready');

        console.log('[bootstrap] Running crash recovery ...');
        await recoverAtStartup();
        console.log('[bootstrap] Crash recovery completed');

        startServer();
    } catch (err) {
        console.error('[bootstrap] Fatal startup error:', err);
        // Safe choice: fail fast so the orchestrator can restart the pod/process
        process.exit(1);
    }
})();

global.applicationDataPath = './application-data/';

runBackupCleanupJob();

