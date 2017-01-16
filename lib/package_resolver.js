const expandPath = require( './expand_path' );

const archives = require( expandPath( '~/.gasket/archive.json' ) );
const recipes = require( expandPath( '~/.gasket/recipes.json' ) );

const packageCache = {};

const domainTable = {
    'github': 'github.com',
    'gitlab': 'gitlab.com',
    'bitbucket': 'bitbucket.com'
};

function getRepositoryUrl(pkg_name, recipe) {
    let url = '';
    switch ( recipe.fetcher ) {
    case 'wiki':
        url = `https://www.emacswiki.org/emacs/download/${pkg_name}.el`;
        break;

    case 'git':
        url = recipe.url;
        break;

    default:
        var hostname = domainTable[recipe.fetcher];

        url = `https://${hostname}/${recipe.repo}.git`;
    }
    return url;
}

function createPackageInfo(pkg_name, archive) {
    if ( archive === null || archive === undefined ) {

        return null;
    }
    // console.log( '# --' );
    // console.log( '#  pkg_name: %j, archive.ver: %j', pkg_name, archive.ver );

    let found = packageCache[pkg_name];

    if ( found ) {
        return found;
    }

    let version = '';
    if ( archive.ver ) {
        version = archive.ver.join( '.' );
    }
    
    let pkg = {
        name: pkg_name,
        version: version,
        description: archive.desc
    };

    pkg.url = getRepositoryUrl( pkg_name, recipes[pkg_name] );
    // console.log( '#  pkg.url: %s', pkg.url );

    pkg.depends = [];
    if ( archive.deps ) {
        for ( let key in archive.deps ) {
            if ( key != 'emacs' ) {
                let depend_pkg = namedAtPackage( key );

                if ( depend_pkg !== null ) {
                    pkg.depends.push( depend_pkg );
                }
            }
        }
    }

    // console.log( '' );

    return pkg;
}

exports.namedAtPackage = namedAtPackage = function (phrase) {
    return createPackageInfo( phrase, archives[phrase] );
};

exports.findPackage = findPackage = function (phrase) {
    for ( let key in archives ) {
        if ( key.search( phrase ) != -1 ) {
            let archive = archives[key];

            let pkg = createPackageInfo( key, archive );

            return pkg;
        }
    }
    return null
};

exports.searchPackage = function (phrase) {
    let pkgs = []
    
    for ( let key in archives ) {
        if ( key.search( phrase ) != -1 ) {
            let archive = archives[key];

            let pkg = createPackageInfo( key, archive );
            
            pkgs.push( pkg );
        }
    }

    return pkgs;
};

exports.allPackage = function () {
    let found_pkgs = [];
    for ( let key in archives ) {
        let archive = archives[key];

        let pkg = createPackageInfo( key, archive );

        found_pkgs.push( pkg );
    }
    return found_pkgs;
};
