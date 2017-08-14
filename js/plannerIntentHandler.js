'use strict';

var Alexa = require('alexa-sdk');
var constants = require('./constants');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1" // The endpoint is found automatically
});

var docClient = new AWS.DynamoDB.DocumentClient();

var plannerStateHandler = Alexa.CreateStateHandler(constants.states.PLANNER_MODE, {
    
    'ListenIntent' : function() {

        var message, reprompt;
        var queryParams = constants.plannerListenQuery;

        docClient.scan(queryParams, (err, data) => {
            if (err) {
                console.error("Unable to scan. Error JSON:", JSON.stringify(err, null, 2));
                reprompt = "Please try again after a few moments.";
                message = "There was a problem with listing your assignments. " + reprompt;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
                message = "";
                if (data.Items.length === 0) {
                    message += "At this time you do not have any pending assignments."; // Redirect them out
                } else {
                    data.Items.forEach(function(assignment) {
                        message += "For " + assignment.subject + ", " + 
                                    assignment.assignment_name + " is due on " +
                                    assignment.assignment_date + ". The details are: " + 
                                    assignment.details + ".";
                    });
                }
                reprompt = message;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            }
        });
    },

    'CreateIntent': function() {

        var message, reprompt, slotToElicit, slotToConfirm, queryParams; 
        var intentObj = this.event.request.intent;

        if (intentObj.slots.AssignmentName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.AssignmentName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'AssignmentName';
                message = 'The assignment name is ' +
                            intentObj.slots.AssignmentName.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'AssignmentName';
                message = 'What is the name of the assignment?';
                reprompt = message;
                
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
            
        } else if (intentObj.slots.Subject.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Subject.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'Subject';
                message = 'The subject is ' +
                            intentObj.slots.Date.value +
                            ', is that correct?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'Subject';
                message = 'What is the subject of the assignment?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
                
        } else if (intentObj.slots.Date.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Date.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'Date';
                message = 'The date is ' +
                            intentObj.slots.Date.value +
                            ', is that correct?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'Date';
                message = 'What is the date of the assignment?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
                
        } else if (intentObj.slots.Details.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Details.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'Details';
                message = 'The detail of the assignment is ' +
                            intentObj.slots.Detail.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'Details';
                message = 'What are the assignment details?';
                reprompt = message;
                
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }

        } else {

            queryParams = constants.plannerPutQueryHelper(intentObj);
            docClient.put(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    
                    reprompt = "Please try again in a few moments.";
                    message = "There was a problem with changing your assignments. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');

                } else {
                    console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
                    
                    reprompt = "You can create, modify, delete, listen or move on to flash cards or lectures.";
                    message = "You assignment is saved. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            }); 
        }
    },
    'EditIntent' : function() {

        var intentObj = this.event.request.intent;
        var message, reprompt, slotToElicit, slotToConfirm, queryParams;

        if (intentObj.slots.AssignmentName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.AssignmentName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'AssignmentName';
                message = 'The name of the assignment to change is ' +
                            intentObj.slots.AssignmentField.value +
                            ', is that correct?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'AssignmentName';
                message = 'Which part of the assignment do you want to change?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        } else if (intentObj.slots.AssignmentField.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.AssignmentField.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'AssignmentField';
                message = 'The field to change is ' +
                            intentObj.slots.AssignmentField.value +
                            ', is that correct?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'AssignmentField';
                message = 'Which part of the assignment do you want to change?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        } else if (intentObj.slots.NewValue.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.NewValue.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'NewValue';
                message = 'The field to change is ' +
                            intentObj.slots.AssignmentField.value +
                            ', is that correct?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'NewValue';
                //message = 'What will be the new ' + intentObj.slots.AssignmentField.value +'?';
                message = 'What will be the new value?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        } else {

            queryParams = constants.plannerUpdateQueryHelper(intentObj);
            docClient.update(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    
                    reprompt = "Please try again in a few moments.";
                    message = "There was a problem with adding your assignment. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');

                } else {
                    console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
                    
                    reprompt = "You can create, modify, delete, listen or move on to flash cards or lectures.";
                    message = "You assignment has been updated. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            });
        }

    },
    'DeleteIntent' : function() {

        var intentObj = this.event.request.intent;
        var message, reprompt, slotToElicit, slotToConfirm, queryParams;
        
        if (intentObj.slots.AssignmentName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.AssignmentName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'AssignmentName';
                message = 'The name of the assignment to change is ' +
                            intentObj.slots.AssignmentField.value +
                            ', is that correct?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'AssignmentName';
                message = 'Which part of the assignment do you want to change?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        } else {

            queryParams = constants.plannerUpdateQueryHelper(intentObj);
            docClient.delete(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    
                    reprompt = "Please try again in a few moments.";
                    message = "There was a problem with deleting your assignment. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');

                } else {
                    console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
                    
                    reprompt = "You can create, modify, delete, listen or move on to flash cards or lectures.";
                    message = "You assignment has been updated. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            }); 

        }


    },

/*
    All of the actions to other components come here.
    Do any transitions over here

*/      
/*

    /* 
    'LectureIntent' : function() {

        var speechOutput = "Are you sure you want to quit planner?";
        var cardTitle = "Planner to Lecture";
        var cardContent = "";
        var updatedIntent = constants.LectureIntent;
        var imageObj = null;

        this.emit(':confirmIntentWithCard', speechOutput, speechOutput, cardTitle, cardContent, updatedIntent, imageObj);

    },

    'FlashCardIntent' : function() {
        var speechOutput = "Are you sure you want to quit planner?";
        var cardTitle = "Planner to FlashCard";
        var cardContent = "";
        var updatedIntent = constants.FlashCardIntent;
        var imageObj = null;

        this.emit(':confirmIntentWithCard', speechOutput, speechOutput, cardTitle, cardContent, updatedIntent, imageObj);

    },

    'QuizIntent' : function() {
        var speechOutput = "Are you sure you want to quit planner?";
        var cardTitle = "Planner to Quiz";
        var cardContent = "";
        var updatedIntent = constants.QuizIntent;
        var imageObj = null;

        this.emit(':confirmIntentWithCard', speechOutput, speechOutput, cardTitle, cardContent, updatedIntent, imageObj);

    }
    */
    /*==
     END OF Quit all intents with confirmation thru confirm intent w card
    ==*/

});

module.export = plannerStateHandler;