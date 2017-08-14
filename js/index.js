'use strict';

var Alexa = require('alexa-sdk');
var constants = require('./constants');
var plannerStateHandler = require('./plannerStateHandler');
var welcomeStateHandler = require('./welcomeStateHandler');
var lectureStateHandler = require('./lectureStateHandler');
var flashcardStateHandler = require('./flashcardStateHandler');

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.appId = constants.appId;
    alexa.dynamoDBTableName = constants.dynamoDBTableName;
    alexa.registerHandlers(
        welcomeStateHandler,
        plannerStateHandler,
        flashcardStateHandler,
        lectureStateHandler
	);
    alexa.execute();
};
