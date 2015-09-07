require('cloud/utils/configure')(this);

/** String -> String -> Parse.query -> Parse.query */
var filterBy = curry(3, function filterBy(column, value, query) {
    var q = query.equalTo(column, value);

    return column === 'uuid' ?
        q :
        q.greaterThan('expiresAt', Date.now()).include('note');
});

exports.filterBy = filterBy;
