'use strict';

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1" // The endpoint is found automatically
});

var db = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var docClient = new AWS.DynamoDB.DocumentClient();

var lectureStateHandler = Alexa.CreateStateHandler(constants.states.LECTURE_MODE, {
    /*
     *  All Intent Handlers for state : PLAY_MODE
     */
    'LaunchRequest' : function () {
        //SO THIS ONLY HAPPENS IF YOU SAVE STATE
        /*
         *  Session resumed in PLAY_MODE STATE.
         *  If playback had finished during last session :
         *      Give welcome message.
         *      Change state to START_STATE to restrict user inputs.
         *  Else :
         *      Ask user if he/she wants to resume from last position.
         *      Change state to RESUME_DECISION_MODE
         */
        var message;
        var reprompt;
        
        if (this.attributes['playbackFinished']) {
            this.handler.state = constants.states.START_MODE;
            message = 'Welcome to the AWS Podcast. You can say, play the audio to begin the podcast.';
            reprompt = 'You can say, play the audio, to begin.';
        } else {
            this.handler.state = constants.states.RESUME_DECISION_MODE;
            message = 'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                ' Would you like to resume?';
            reprompt = 'You can say yes to resume or no to play from the top.';
        }
        

        if (this.attributes['playbackFinished']) {
            //this.handler.state = constants.states.START_LECTURE_MODE;
            message = 'If you want to listen to another lecture' +
                        'You can say, listen to blank, where blank is the lecture name';
            reprompt = 'You can say, play the audio, to begin.';
        } else {
            //this.handler.state = constants.states.RESUME_LECTURE_STATE;
            message = 'You were listening to ' + +
                ' Would you like to resume?';
            reprompt = 'You can say yes to resume or no to play from the top.';
        }

        this.response.speak(message).listen(reprompt);
        this.emit(':responseReady');

    },
    'LectureIntent' : function () {
        console.log("WelcomeState, LectureIntent");
        // No session ended logic

        /*
        this.handler.state = constants.states.LECTURE_MODE;
        var message = 'What recording would you like to listen to' +
                        'You can say, listen to blank, where blank is the lecture name';

        var reprompt = 'You can say, listen to blank, where blank is the lecture name';

        this.response.speak(message).listen(reprompt);
        this.emit(':responseReady');
        

        if (!this.attributes.playOrder) {
            // Initialize Attributes if undefined.
            //this.attributes.playOrder = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            //this.attributes.index = 0;
            this.attributes.offsetInMilliseconds = 0;
            //this.attributes.loop = true;
            //this.attributes.shuffle = false;
            this.attributes.playbackIndexChanged = true;
            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;
        }
        controller.play.call(this);
        */
        var intent = this.event.request.intent;

        if (!intent.slots.Lecture.value) {
            var slotToElicit = 'PlannerState';
            var speechOutput = "You are now at your to do list. " + 
                        "Would you like to listen to your pending assignments " +
                        "or would you like to add, modify, or delete an assignment?";
            var repromptSpeech = "please say listen, add, modify, or delete assignment";
            //this.session.attributes = 

            this.response.speak(message).listen(reprompt);
            this.emit(':elicitSlot', slotToElicit, speechOutput, repromptSpeech);
        } else {
/*
            this.handler.state = constants.states.PLAY_MODE;

            if (this.attributes['playbackFinished']) {
                // Reset to top of the playlist when reached end.
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                //this.attributes['playbackIndexChanged'] = true;
                this.attributes['playbackFinished'] = false;
            }
*/
            //var token = String(this.attributes['playOrder'][this.attributes['index']]);
            var token = 0;
            var playBehavior = 'REPLACE_ALL'; // Correct
            // find url or somethingelse
            //var podcast = audioData[this.attributes['playOrder'][this.attributes['index']]];
            //var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];
            // Since play behavior is REPLACE_ALL, enqueuedToken attribute need to be set to null.
            this.attributes['enqueuedToken'] = null;

            /*
            if (canThrowCard.call(this)) {
                var cardTitle = 'Playing ' + podcast.title;
                var cardContent = 'Playing ' + podcast.title;
                this.response.cardRenderer(cardTitle, cardContent, null);
            }
            */

            this.response.audioPlayerPlay(playBehavior, podcast.url, token, null, offsetInMilliseconds);
            this.emit(':responseReady');

        }

        if (!this.attributes.currLecture) {
            // Initialize Attributes if undefined.
            //this.attributes.playOrder = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            //this.attributes.index = 0;
            this.attributes.offsetInMilliseconds = 0;
            //this.attributes.loop = true;
            //this.attributes.shuffle = false;
            this.attributes.playbackIndexChanged = true;
            //  Change state to START_MODE
            this.handler.state = constants.states.START_MODE;

            var message = 'What ecture would you like to listen to' +
                        'You can say, listen to blank, where blank is the lecture name';

            var reprompt = 'You can say, listen to blank, where blank is the lecture name';

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');

            //Ask for lecture url
        } 
        //controller.play.call(this);

        
    },
    /*'PlayAudio' : function () { controller.play.call(this) },
    //'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
    //'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
    'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
    'AMAZON.StopIntent' : function () { controller.stop.call(this) },
    'AMAZON.CancelIntent' : function () { controller.stop.call(this) },
    'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
    //'AMAZON.LoopOnIntent' : function () { controller.loopOn.call(this) },
    //'AMAZON.LoopOffIntent' : function () { controller.loopOff.call(this) },
    //'AMAZON.ShuffleOnIntent' : function () { controller.shuffleOn.call(this) }, //
    //'AMAZON.ShuffleOffIntent' : function () { controller.shuffleOff.call(this) }, //
    'AMAZON.StartOverIntent' : function () { controller.startOver.call(this) },
    'AMAZON.HelpIntent' : function () {
        // This will called while audio is playing and a user says "ask <invocation_name> for help"
        var message = 'You are currently listening to lectures. You can say,' +
                        'listen to blank, where blank is the lecture name ' +
                        'say, checkpoint, blank, where blank is the name of the checkpoint';
        var reprompt = 'You can say,' +
                        'listen to blank, where blank is the lecture name ' +
                        'say, checkpoint, blank, where blank is the name of the checkpoint';
        
        //'At any time, you can say Pause to pause the audio and Resume to resume.';
        this.response.speak(message).listen(reprompt);
        this.emit(':responseReady');
    },
    'SessionEndedRequest' : function () {
        // No session ended logic
    }*/
    /*
    'Unhandled' : function () {
        var message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
        this.response.speak(message).listen(message);
        this.emit(':responseReady');
    }
    */
});


module.exports = lectureStateHandler;