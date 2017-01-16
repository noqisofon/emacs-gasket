const path = require( 'path' );

module.exports = function (filepath) {
    if ( filepath[0] == '~' ) {
        return path.join( process.env.HOME, filepath.slice( 1 ) );
    }
    return filepath;
}
