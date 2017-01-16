const path = require( 'path' );

function resolveTilda(filepath) {
    if ( filepath[0] == '~' ) {
        return path.join( process.env.HOME, filepath.slice( 1 ) );
    }
    return filepath;
}

const archives = require( resolveTilda( '~/.gasket/archive.json' ) );
const recipes = require( resolveTilda( '~/.gasket/recipes.json' ) );

function createPackageInfo(pkg_name, archive) {
    let version = '';

    if ( archive.ver ) {
        version = archive.ver.join( '.' );
    }

    let pkg = {
        name: pkg_name,
        version: version,
        description: archive.desc
    };

    return pkg;
}

function searchPackage(phrase) {
    let pkgs = []
    
    for ( let key in archives ) {
        if ( key.search( phrase ) != -1 ) {
            let archive = archives[key];

            let pkg = createPackageInfo( key, archive );
            
            pkgs.push( pkg );
        }
    }

    return pkgs;
}

let found_pkgs;
if ( process.argv.length > 2 ) {
    let phrase = process.argv[2];

    found_pkgs = searchPackage( phrase );
    
} else {
    found_pkgs = [];
    for ( let key in archives ) {
        let archive = archives[key];

        let pkg = createPackageInfo( key, archive );

        found_pkgs.push( pkg );
    }
}

for ( let pkg of found_pkgs ) {
    console.log( `${pkg.name} ${pkg.version}` );
    console.log( `    ${pkg.description}` );
}
