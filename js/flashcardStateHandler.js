'use strict';

var Alexa = require('alexa-sdk');
var constants = require('./constants');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1" // The endpoint is found automatically
});

// This is only for
//var dynamoDB = new AWS.DynamoDB({apiVersion: '2012-08-10'}); 

var docClient = new AWS.DynamoDB.DocumentClient();

var flashcardStateHandler = Alexa.CreateStateHandler(constants.states.FLASHCARD_MODE, {

	'ListenIntent' : function() {

        var message, reprompt;
        var queryParams = constants.plannerListenQuery;

        docClient.scan(queryParams, (err, data) => {
            if (err) {
                console.error("Unable to scan. Error JSON:", JSON.stringify(err, null, 2));
                reprompt = "Please try again after a few moments.";
                message = "There was a problem with listing your flashcards. " + reprompt;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            } else {
            	this.attributes.flashcardArray = data.Items;
                message = "";
                if (data.Items.length === 0) {
                    message += "You do not have any flash cards for this deck. " + 
                    			"Create some by saying create flashcards."; 
                } else {
                	message += "When you are ready to hear the next flashcard, say next.";
                }

                reprompt = message;
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');
            }
        });
    },

	'CreateIntent' : function() {

		var message, reprompt, slotToElicit, slotToConfirm, queryParams; 
        var intentObj = this.event.request.intent;

        if (intentObj.slots.FlashcardName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.FlashcardName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'FlashcardName';
                message = 'The flash card name is ' +
                            intentObj.slots.FlashcardName.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'FlashcardName';
                message = 'What is the flash card name?';
                reprompt = message;
                
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
            
        } else if (intentObj.slots.DeckName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.DeckName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'DeckName';
                message = 'The deck name is ' +
                            intentObj.slots.DeckName.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'DeckName';
                message = 'What is the deck name?';
                reprompt = message;
                
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
            
        } else if (intentObj.slots.Definition.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.Definition.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'Definition';
                message = 'The definition is ' +
                            intentObj.slots.Definition.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'Definition';
                message = 'What is the definition?';
                reprompt = message;
                
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }

        } else {

            queryParams = constants.flashcardPutQueryHelper(intentObj);
            docClient.put(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    
                    reprompt = "Please try again in a few moments.";
                    message = "There was a problem with creating your flash card. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');

                } else {
                    console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
                    
                    reprompt = "You can create, modify, delete, listen or move on to our planner or lectures.";
                    message = "You flash card is saved. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            }); 
        }
	},

	'EditIntent' : function() {

        var intentObj = this.event.request.intent;
        var message, reprompt, slotToElicit, slotToConfirm, queryParams;

        if (intentObj.slots.FlashcardName.confirmationStatus !== 'CONFIRMED') {
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
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'AssignmentField';
                message = 'Which part of the assignment do you want to change?';
                reprompt = message;
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        } else if (intentObj.slots.NewValue.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.NewValue.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'NewValue';
                message = 'The field to change is ' +
                            intentObj.slots.AssignmentField.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'NewValue';
                message = 'What will be the new ' + intentObj.slots.AssignmentField.value +'?';
                //message = 'What will be the new value?';
                reprompt = message;
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        } else {

            queryParams = constants.plannerUpdateQueryHelper(intentObj);
            docClient.update(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    
                    reprompt = "Please try again in a few moments.";
                    message = "There was a problem with editing your flashcard. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');

                } else {
                    console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
                    
                    reprompt = "You can create, modify, delete, listen or move on to your planner or lectures.";
                    message = "You flash card has been updated. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            });
        }

    },

    'DeleteIntent' : function() {

        var intentObj = this.event.request.intent;
        var message, reprompt, slotToElicit, slotToConfirm, queryParams;
        
        if (intentObj.slots.FlashcardName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.FlashcardName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'FlashcardName';
                message = 'The name of the flash card to delete is ' +
                            intentObj.slots.FlashcardName.value +
                            ', is that correct?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':confirmSlot', slotToConfirm, message, reprompt, intentObj);
            } else {
                slotToElicit = 'FlashcardName';
                message = 'Which flash card do you want to delete?';
                reprompt = message;
                console.log(intentObj);
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
        } else if (intentObj.slots.DeckName.confirmationStatus !== 'CONFIRMED') {
            if (intentObj.slots.DeckName.confirmationStatus !== 'DENIED') {
                slotToConfirm = 'DeckName';
                message = 'The deck name is ' +
                            intentObj.slots.DeckName.value +
                            ', is that correct?';
                reprompt = message;
                this.emit(':confirmSlot', slotToConfirm, message, reprompt);
            } else {
                slotToElicit = 'DeckName';
                message = 'What is the deck name?';
                reprompt = message;
                
                this.emit(':elicitSlot', slotToElicit, message, reprompt, intentObj);
            }
            
        } else {

            queryParams = constants.plannerUpdateQueryHelper(intentObj);
            docClient.delete(queryParams, (err, data) => {
                if (err) {
                    console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                    
                    reprompt = "Please try again in a few moments.";
                    message = "There was a problem with deleting your flashcard. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');

                } else {
                    console.log("Put Item succeeded:", JSON.stringify(data, null, 2));
                    
                    reprompt = "You can create, modify, delete, listen or move on to your planner or lectures.";
                    message = "You flash card has been deleted. " + reprompt;
                    this.response.speak(message).listen(reprompt);
                    this.emit(':responseReady');
                }
            }); 
        }
    }
});

module.export = flashcardStateHandler;