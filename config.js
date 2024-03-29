exports.APPLICATION_ID = Parse.applicationId;
exports.JAVASCRIPT_KEY = Parse.javaScriptKey;

exports.SYNC_CODE_LIFETIME = 30;
exports.SYNC_CODE_DELAY = 5;

exports.ENTITIES = ['Note', 'Sync'];

exports.CODES = {
    INTERNAL_ERROR: 500,
    ENTITY_NOT_FOUND: 550,
    MISSING_KEY: 551,
    WRONG_DATA_FORMAT: 552,
    VALIDATION_FAILED: 553,
    INVALID_API_KEY: 554,
    INVALID_REQUEST: 555
};

exports.ERRORS = {
    INTERNAL_ERROR: function (error) {
        return "internal server error: " + JSON.stringify(error).replace(/"/g, "");
    },
    WRONG_DATA_FORMAT: function (key, expected) {
        return "invalid type for key " + key + (expected && (", expected " + expected) || "");
    },
    MISSING_KEY: function (key) {
        return "missing mandatory key " + key + " in input data";
    },
    INVALID_API_KEY: function (key) {
        return "the following key isn't reckognized " + key;
    },
    MISSING_API_KEY: "at least one api key is missing",
    ENTITY_NOT_FOUND: "unable to find the requested entity",
    INVALID_REQUEST: "invalid request. API does not exist",
    INVALID_CONTENT: "content is invalid"
};

exports.JOBS = {
    SUCCESS: "useless syncs flushed",
    ERROR: "error trying to flush syncs"
};
