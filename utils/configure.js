const CONFIG = require('cloud/config.js');

module.exports = function (context) {
    CONFIG.ENTITIES.forEach(function (entity) {
        context[entity] = entity === "User" ? Parse.User : Parse.Object.extend(entity);
        context[entity].entityName = entity;
        context[entity].keyId = entity.toLowerCase() + 'Id';
    });
    require('cloud/lib/bringPureFunctional').into(context);
};
