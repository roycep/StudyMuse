'use strict';

var Alexa = require('alexa-sdk');
//var audioData = require('./audioAssets');
var constants = require('./constants');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1" // The endpoint is found automatically
});

var db = new AWS.DynamoDB({apiVersion: '2012-08-10'});


var welcomeStateHandler = Alexa.CreateStateHandler(constants.states.WELCOME_MODE, {

    'LaunchRequest' : function () {
        this.attributes.offsetInMilliseconds = 0;
        this.attributes.playbackIndexChanged = false;
        this.attributes.lectureurl = '';
        this.handler.state = constants.states.WELCOME_MODE;

        db.listTables((err, data) => {

            if (err) {
                console.error("Unable to list tables. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                    
                this.attributes.table_names = data.TableNames;

                var message = "Study Muse, how can I help you today? " +
                            "You can say flash cards, planner, or lectures.";
                var reprompt = "To create a deck or quiz yourself, say flash cards. " +
                                "To add or modify your to do list, say planner. " +
                                "To listen to recorded lectures and create checkpoints, say lectures.";

                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            }
        }); 
    },
    'LectureIntent' : function () {
        var intentObj = this.event.request.intent;
        var message, reprompt, queryParams, slotToConfirm, slotToElicit, newIntent;

        if (this.attributes.table_names.indexOf("LectureDatabase") === -1) {
            console.log("Lecture DB not found, initalizing in DynamoDB");

            queryParams = constants.lectureCreateTableQuery;

            db.createTable(queryParams, function(err, data) {
                if (err) {
                    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                }
            });
        
        }

        if (intentObj.slots.LectureName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.LectureName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'LectureName';
                message = 'You want to listen ' +
                            intentObj.slots.LectureName.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'LectureName';
                message = 'What lecture would you like to listen to?';
                reprompt = 'What is the lecture name?';
                
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
            
        } else if (!intentObj.slots.Action.value) {

            slotToElicit = 'Action';
            message = "This is your lecture player. " + 
                        "Please say one of the following actions." +
                        "Listen, add, or delete?";
            reprompt = "Please say listen, add, or delete.";
            this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
        } else {

            newIntent = constants.intentAlias[intentObj.slots.Action.value];
            intentObj.name = newIntent;
            this.handler.state = constants.states.PLANNER_MODE;
            this.emitWithState(newIntent);
        }

        /*
                queryParams = {
                    TableName:  "LectureDatabase",
                    KeyConditionExpression: "#ln = :lec_name",
                    ExpressionAttributeNames:{ "#yr": "lecture_name" },
                    ExpressionAttributeValues: { ":lec_name": intentObj.slots.Lecture.value}
                };

                docClient.query(queryParams, function(err, data) {
                    if (err) {
                        console.error("Unable to scan. Error JSON:", JSON.stringify(err, null, 2));

                        message = "There was an error with listing your assignments. Please try again.";
                        reprompt = message;

                        this.response.speak(message).listen(reprompt);
                        this.emit(':responseReady');
                    } else {
                        //console.log(data.Items);
                        if (data.Items.length === 0) {
                            //console.log("ZERO");
                            message = "That lecture doesn't exist. Please the correct lecture name.";
                        } else {
                            message = "When you are ready, say ready.";

                        }

                        this.session.attributes.lecture_url = data.Items;
                        this.response.speak(message).listen(reprompt);
                        this.emit(':responseReady');
                    }
                }); */

    },
    'PlannerIntent' : function () {
        var message, reprompt, slotToElicit, queryParams, newIntent;
        var intentObj = this.event.request.intent;

        if (this.attributes.table_names.indexOf("PlannerDatabase") === -1) {
            console.log("Planner DB not found, initalizing in DynamoDB");

            queryParams = constants.plannerCreateTableQuery;

            db.createTable(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
                    
                    message = "This is a planner where you can listen to pending tasks, create new tasks, " +
                                "modify task details, or delete a task altogether.";
                    reprompt = "Listen, create, modify, or delete tasks on youe planner here.";

                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            });
        } 

        if (!intentObj.slots.Action.value) {
            slotToElicit = 'Action';
            message = "This is your planner. " + 
                        "Please say one of the following actions." +
                        "Listen, add, modify, or delete?";
            reprompt = "Please say listen, add, modify, or delete.";
            this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
        } else {
            newIntent = constants.intentAlias[intentObj.slots.Action.value];
            intentObj.name = constants.states.PLANNER_MODE;
            this.handler.state = constants.states.PLANNER_MODE;
            this.emitWithState(newIntent);
        }

    },
    'FlashCardIntent' : function () {
        var message, reprompt, slotToElicit, slotToConfirm, queryParams, newIntent;
        var intentObj = this.event.request.intent;
        
        if (this.attributes.table_names.indexOf("FlashCardDatabase") === -1) {
            console.log("Planner DB not found, initalizing in DynamoDB");

            queryParams = constants.flashcardCreateTableQuery;

            db.createTable(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));

                    reprompt = "Please say listen, add, modify, or delete.";
                    message = "This is a flashcard tool where you can listen to old flashcards, create new cards, " +
                                "modify card details, or delete a card altogether. ";
                    message += reprompt;

                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            });
        } 

        if (!intentObj.slots.Action.value) {
            slotToElicit = 'Action';
            message = "This is your flashcard tool. " + 
                        "Please say one of the following actions." +
                        "Listen, add, modify, or delete?";
            reprompt = "Please say listen, add, modify, or delete.";
            this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
        } else if (intentObj.slots.DeckName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.DeckName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'DeckName';
                message = 'The name of the deck is ' +
                            intentObj.slots.Detail.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'DeckName';
                message = 'What deck of flashcards would you like to work on?';
                reprompt = message;
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        }  else {

            newIntent = constants.intentAlias[intentObj.slots.Action.value];
            intentObj.name = newIntent;
            this.handler.state = constants.states.FLASHCARD_MODE;
            this.emitWithState(newIntent);
        }

    },
    'AMAZON.HelpIntent' : function () {
        var message = "To create a deck or quiz yourself, say flash cards. " +
                        "To add or modify your to do list, say planner. " +
                        "To listen to your recorded lectures and create checkpoints, say lectures.";
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    },
    /*
    'AMAZON.RepeatIntent' : function () {
        // Should say the last prompt
        var message = this.attributes.message;
        var reprompt = this.attributes.reprompt;
        this.response.speak(message).listen(reprompt);
        this.emit(':responseReady');
    },
    */
    'AMAZON.StopIntent' : function () {
        var message = 'Good bye.';
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent' : function () {
        var message = 'Good bye.';
        this.response.speak(message);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function () {
        // No session ended logic
    },
    'Unhandled' : function () {
        var message = 'Sorry, I could not understand that. ' + 
                        'Please say, flash cards, planner, or lectures';
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    }
});

module.exports = welcomeStateHandler;