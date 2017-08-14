'use strict';

/**
    attributes = { 
        playOrder:

        index:
        offsetInMilliseconds
        loop
        shuffle
        playbackIndexChanged
    }
**/

/*

Semantical differences

    StartOver is for audio only

To Do

    Should state save from where last left

    Do git bullshit last
*/

var Alexa = require('alexa-sdk');
var audioData = require('./audioAssets');
var constants = require('./constants');

var AWS = require("aws-sdk");
AWS.config.update({
    region: "us-east-1" // The endpoint is found automatically
});


var db = new AWS.DynamoDB({apiVersion: '2012-08-10'});
var docClient = new AWS.DynamoDB.DocumentClient();

var stateHandlers = { 

    lectureModeIntentHandlers : Alexa.CreateStateHandler(constants.states.LECTURE_MODE, {
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
            /*
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
            */

            if (this.attributes['playbackFinished']) {
                this.handler.state = constants.states.START_LECTURE_MODE;
                message = 'If you want to listen to another lecture' +
                            'You can say, listen to blank, where blank is the lecture name';
                reprompt = 'You can say, play the audio, to begin.';
            } else {
                this.handler.state = constants.states.RESUME_LECTURE_STATE;
                message = 'You were listening to ' + audioTitle+
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
            } else if () {

            }
            controller.play.call(this);

            
        },
        'PlayAudio' : function () { controller.play.call(this) },
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
        }
        /*
        'Unhandled' : function () {
            var message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
        */
    }),


    playModeIntentHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Intent Handlers for state : PLAY_MODE
         */
        'LaunchRequest' : function () {
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
                this.handler.state = constants.states.START_LECTURE_MODE;
                message = 'If you want to listen to another lecture' +
                            'You can say, listen to blank, where blank is the lecture name';
                reprompt = 'You can say, play the audio, to begin.';
            } else {
                this.handler.state = constants.states.RESUME_LECTURE_STATE;
                message = 'You were listening to ' + audioTitle+
                    ' Would you like to resume?';
                reprompt = 'You can say yes to resume or no to play from the top.';
            }

            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'PlayAudio' : function () { controller.play.call(this) },
        //'AMAZON.NextIntent' : function () { controller.playNext.call(this) },
        //'AMAZON.PreviousIntent' : function () { controller.playPrevious.call(this) },
        'AMAZON.PauseIntent' : function () { controller.stop.call(this) },
        'AMAZON.StopIntent' : function () { controller.stop.call(this) },
        'AMAZON.CancelIntent' : function () { controller.stop.call(this) },
        'AMAZON.ResumeIntent' : function () { controller.play.call(this) },
        //'AMAZON.LoopOnIntent' : function () { controller.loopOn.call(this) },
        //'AMAZON.LoopOffIntent' : function () { controller.loopOff.call(this) },
        //'AMAZON.ShuffleOnIntent' : function () { controller.shuffleOn.call(this) },
        //'AMAZON.ShuffleOffIntent' : function () { controller.shuffleOff.call(this) },
        'AMAZON.StartOverIntent' : function () { controller.startOver.call(this) },
        'AMAZON.HelpIntent' : function () {
            // This will called while audio is playing and a user says "ask <invocation_name> for help"
            var message = 'You are listening to the AWS Podcast. You can say, Next or Previous to navigate through the playlist. ' +
                'At any time, you can say Pause to pause the audio and Resume to resume.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        },
        'SessionEndedRequest' : function () {
            // No session ended logic
        },
        'Unhandled' : function () {
            var message = 'Sorry, I could not understand. You can say, Next or Previous to navigate through the playlist.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    /** Not necessary*/
    remoteControllerHandlers : Alexa.CreateStateHandler(constants.states.PLAY_MODE, {
        /*
         *  All Requests are received using a Remote Control. Calling corresponding handlers for each of them.
         */
        'PlayCommandIssued' : function () { controller.play.call(this) },
        'PauseCommandIssued' : function () { controller.stop.call(this) },
        'NextCommandIssued' : function () { controller.playNext.call(this) },
        'PreviousCommandIssued' : function () { controller.playPrevious.call(this) }
    }),
    resumeDecisionModeIntentHandlers : Alexa.CreateStateHandler(constants.states.RESUME_DECISION_MODE, {
        /*
         *  All Intent Handlers for state : RESUME_DECISION_MODE
         */
        'LaunchRequest' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                ' Would you like to resume?';
            var reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function () { controller.play.call(this) },
        'AMAZON.NoIntent' : function () { controller.reset.call(this) },
        'AMAZON.HelpIntent' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['index']].title +
                ' Would you like to resume?';
            var reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
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
            var message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    }),
    
    audioReviewHandlers : Alexa.CreateStateHandler(constants.states.AUDIO_REVIEW_STATE, {
        /*
         *  All Intent Handlers for state : AUDIO_REVIEW_STATE
         */
         
        'LaunchRequest' : function () {
            /*
            if (not listening) {
                var message = 'What recording would you like to listen to'

                'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                    ' Would you like to resume?';
                var reprompt = 'You can say yes to resume or no to play from the top.';
                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');


            } else {

                var message = 'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                    ' Would you like to resume?';

                var reprompt = 'You can say yes to resume or no restart.';

                this.response

                this.response.speak(message).listen(reprompt);
                this.emit(':responseReady');

            }
            */


            var message = 'What recording would you like to listen to'

            'You were listening to ' + audioData[this.attributes['playOrder'][this.attributes['index']]].title +
                ' Would you like to resume?';
            var reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
        'AMAZON.YesIntent' : function () { 

            controller.play.call(this) 
            /*
            if (user flag) {


            } else {

            }
            */

        },


        'AMAZON.NoIntent' : function () { controller.reset.call(this) },
        'AMAZON.HelpIntent' : function () {
            var message = 'You were listening to ' + audioData[this.attributes['index']].title +
                ' Would you like to resume?';
            var reprompt = 'You can say yes to resume or no to play from the top.';
            this.response.speak(message).listen(reprompt);
            this.emit(':responseReady');
        },
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
            var message = 'Sorry, this is not a valid command. Please say help to hear what you can say.';
            this.response.speak(message).listen(message);
            this.emit(':responseReady');
        }
    })
    
};

module.exports = stateHandlers;

var controller = function () {
    return {
        play: function () {
            /*
             *  Using the function to begin playing audio when:
             *      Play Audio intent invoked.
             *      Resuming audio when stopped/paused.
             *      Next/Previous commands issued.
             */
            this.handler.state = constants.states.PLAY_MODE;

            if (this.attributes['playbackFinished']) {
                // Reset to top of the playlist when reached end.
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                //this.attributes['playbackIndexChanged'] = true;
                this.attributes['playbackFinished'] = false;
            }

            var token = String(this.attributes['playOrder'][this.attributes['index']]);
            var playBehavior = 'REPLACE_ALL'; // Correct
            // find url or somethingelse
            //var podcast = audioData[this.attributes['playOrder'][this.attributes['index']]];
            var offsetInMilliseconds = this.attributes['offsetInMilliseconds'];
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
        },
        stop: function () {
            /*
             *  Issuing AudioPlayer.Stop directive to stop the audio.
             *  Attributes already stored when AudioPlayer.Stopped request received.
             */
            this.response.audioPlayerStop();
            this.emit(':responseReady');
        },
        playNext: function () {
            /*
             *  Called when AMAZON.NextIntent or PlaybackController.NextCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index += 1;
            // Check for last audio file.
            if (index === audioData.length) {
                if (this.attributes['loop']) {
                    index = 0;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;

                    var message = 'You have reached at the end of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        playPrevious: function () {
            /*
             *  Called when AMAZON.PreviousIntent or PlaybackController.PreviousCommandIssued is invoked.
             *  Index is computed using token stored when AudioPlayer.PlaybackStopped command is received.
             *  If reached at the end of the playlist, choose behavior based on "loop" flag.
             */
            var index = this.attributes['index'];
            index -= 1;
            // Check for last audio file.
            if (index === -1) {
                if (this.attributes['loop']) {
                    index = audioData.length - 1;
                } else {
                    // Reached at the end. Thus reset state to start mode and stop playing.
                    this.handler.state = constants.states.START_MODE;

                    var message = 'You have reached at the start of the playlist.';
                    this.response.speak(message).audioPlayerStop();
                    return this.emit(':responseReady');
                }
            }
            // Set values to attributes.
            this.attributes['index'] = index;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;

            controller.play.call(this);
        },
        loopOn: function () {
            // Turn on loop play.
            this.attributes['loop'] = true;
            var message = 'Loop turned on.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        loopOff: function () {
            // Turn off looping
            this.attributes['loop'] = false;
            var message = 'Loop turned off.';
            this.response.speak(message);
            this.emit(':responseReady');
        },
        shuffleOn: function () {
            // Turn on shuffle play.
            this.attributes['shuffle'] = true;
            shuffleOrder((newOrder) => {
                // Play order have been shuffled. Re-initializing indices and playing first song in shuffled order.
                this.attributes['playOrder'] = newOrder;
                this.attributes['index'] = 0;
                this.attributes['offsetInMilliseconds'] = 0;
                this.attributes['playbackIndexChanged'] = true;
                controller.play.call(this);
            });
        },
        shuffleOff: function () {
            // Turn off shuffle play. 
            if (this.attributes['shuffle']) {
                this.attributes['shuffle'] = false;
                // Although changing index, no change in audio file being played as the change is to account for reordering playOrder
                this.attributes['index'] = this.attributes['playOrder'][this.attributes['index']];
                this.attributes['playOrder'] = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
            }
            controller.play.call(this);
        },
        startOver: function () {
            // Start over the current audio file.
            this.attributes['offsetInMilliseconds'] = 0;
            controller.play.call(this);
        },
        reset: function () {
            // Reset to top of the playlist.
            this.attributes['index'] = 0;
            this.attributes['offsetInMilliseconds'] = 0;
            this.attributes['playbackIndexChanged'] = true;
            controller.play.call(this);
        }
    }
}();

function canThrowCard() {
    /*
     * To determine when can a card should be inserted in the response.
     * In response to a PlaybackController Request (remote control events) we cannot issue a card,
     * Thus adding restriction of request type being "IntentRequest".
     */
    if (this.event.request.type === 'IntentRequest' && this.attributes['playbackIndexChanged']) {
        this.attributes['playbackIndexChanged'] = false;
        return true;
    } else {
        return false;
    }
}

function shuffleOrder(callback) {
    // Algorithm : Fisher-Yates shuffle
    var array = Array.apply(null, {length: audioData.length}).map(Number.call, Number);
    var currentIndex = array.length;
    var temp, randomIndex;

    while (currentIndex >= 1) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temp = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temp;
    }
    callback(array);
}