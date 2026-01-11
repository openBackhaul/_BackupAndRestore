'use strict';

var path = require('path');
var http = require('http');

var oas3Tools = require('openbackhaul-oas3-tools');
var appCommons = require('onf-core-model-ap/applicationPattern/commons/AppCommons');
var serverPort = 8080;

const ElasticsearchPreparation = require('./service/individualServices/ElasticsearchPreparation');

// swaggerRouter configuration
var options = {
    routing: {
        controllers: path.join(__dirname, './controllers')
    },
};

var expressAppConfig = oas3Tools.expressAppConfig(path.join(__dirname, 'api/openapi.yaml'), options);
var app = expressAppConfig.getApp();

//setting the path to the database
global.databasePath = path.resolve(__dirname, 'database', 'config.json');

ElasticsearchPreparation.prepareElasticsearch().catch(err => {
    console.error(`Error preparing Elasticsearch : ${err}`);
}).finally(
    () => {
        // Initialize the Swagger middleware
        http.createServer(app).listen(serverPort, function () {
        console.log('Your server is listening on port %d (http://localhost:%d)', serverPort, serverPort);
        console.log('Swagger-ui is available on http://localhost:%d/docs', serverPort);
        });
        appCommons.performApplicationRegistration();
   }
);