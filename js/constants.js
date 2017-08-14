"use strict";

module.exports = Object.freeze({
    
    // App-ID. TODO: set to your own Skill App ID from the developer portal.
    appId : 'amzn1.ask.skill.433d9e4e-0b3b-44c1-8468-248bc86dd933',
    //  DynamoDB Table name
    dynamoDBAudioTableName : '',
    dynamoDBFlashcardTableName : '',
    
    /*
     *  States:
     *  START_MODE : Welcome state when the audio list has not begun.
     *  PLAY_MODE :  When a playlist is being played. Does not imply only active play.
     *               It remains in the state as long as the playlist is not finished.
     *  RESUME_DECISION_MODE : When a user invokes the skill in PLAY_MODE with a LaunchRequest,
     *                         the skill provides an option to resume from last position, or to start over the playlist.
     
     *  WELCOME_MODE : Welcome state; Does not .
     *  FLASHCARD_MODE :  When a playlist is being played. Does not imply only active play.
     *               It remains in the state as long as the playlist is not finished.
     *  QUIZ_MODE : When a user invokes the skill in PLAY_MODE with a LaunchRequest,
     *                         the skill provides an option to resume from last position, or to start over the playlist.
     *  CREATEFLASHCARD_MODE : Welcome state when the audio list has not begun.
     *  

     *  PLAY_MODE :  When a playlist is being played. Does not imply only active play.
     *               It remains in the state as long as the playlist is not finished.
     *  RESUME_DECISION_MODE : When a user invokes the skill in PLAY_MODE with a LaunchRequest,
     *                         the skill provides an option to resume from last position, or to start over the playlist.
     */
    states : {
        START_MODE : '',
        PLAY_MODE : 'play',
        RESUME_DECISION_MODE : 'resume',
        LECTURE_MODE : 'lecture',
        PLANNER_MODE : 'planner',
        FLASHCARD_MODE : 'flashcard'
    },

    intentAlias : {
        'add' : 'CreateIntent',
        'modify' : 'ModifyIntent',
        'delete' : 'DeleteIntent',
        'listen' : 'ListenIntent'
    },

    plannerListenQuery : {
        TableName:  "PlannerDatabase",
        ProjectionExpression: "assignment_name, assignment_date, details"
    },

    plannerPutQueryHelper : function(intentObj) {
        return {
            TableName: "PlannerDatabase",
            Item: {
                "assignment_name": intentObj.slots.AssignmentName.value,
                "assignment_date": intentObj.slots.Date.value,
                "details": intentObj.slots.Details.value
            }
        };
    },

    plannerModifyQueryHelper : function(intentObj) {
        return {
            TableName: "PlannerDatabase",
            Key: {
                "assignment_name": intentObj.slots.AssignmentName.value
            },
            UpdateExpression: "set " + intentObj.slots.AssignmentField + " = :new_val",
            ExpressionAttributeValues: {
                ":new_val" : intentObj.slots.NewValue
            }
        };
    },

    plannerDeleteQueryHelper : function(intentObj) {
        return {
            TableName:"PlannerDatabase",
            Key:{
                "assignment_name": intentObj.slots.AssignmentName.value
            }
        };
    },

    plannerCreateTableQuery : {
        TableName : "PlannerDatabase",
        KeySchema: [       
            { AttributeName: "lecture_url", KeyType: "HASH"},  
            { AttributeName: "lecture_name", KeyType: "RANGE" }  
        ],
        AttributeDefinitions: [       
            { AttributeName: "lecture_name", AttributeType: "S" },
            { AttributeName: "lecture_url", AttributeType: "S" }
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 5, 
            WriteCapacityUnits: 5
        }
    },

    flashcardCreateTableQuery : {
        TableName : "FlashcardDatabase",
        KeySchema: [       
            { AttributeName: "flashcard_name", KeyType: "HASH"},  
            { AttributeName: "deck_name", KeyType: "RANGE" }  
        ],
        AttributeDefinitions: [       
            { AttributeName: "definiton", AttributeType: "S" },
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 5, 
            WriteCapacityUnits: 5
        }
    },

    lectureCreateTableQuery : {
        TableName : "LectureDatabase",
        KeySchema: [       
            { AttributeName: "lecture_url", KeyType: "HASH"},  //Partition key
            { AttributeName: "lecture_name", KeyType: "RANGE" }  //Sort key
        ],
        AttributeDefinitions: [       
            { AttributeName: "lecture_name", AttributeType: "S" },
            { AttributeName: "lecture_url", AttributeType: "S" },
            { AttributeName: "checkpoints", AttributeType: "L"}
        ],
        ProvisionedThroughput: {       
            ReadCapacityUnits: 10, 
            WriteCapacityUnits: 10
        }
    }


});