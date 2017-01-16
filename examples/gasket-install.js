const child_process   = require( 'child_process' );
const spawn           = child_process.spawn;
const fs              = require( 'fs' );
const path            = require( 'path' );
const url             = require( 'url' );

const find            = require( 'find' );
const mkdirp          = require( 'mkdirp' );

const expandPath      = require( '../lib/expand_path' );
const PackageResolver = require( '../lib/package_resolver' );

const gasketConfig    = require( expandPath( '~/.gasket.json' ) );

function performCurl(command, args, closeAfter) {
    const curl = spawn( command, args );

    // curl.stdout.on( 'data', (data) => { process.stdout.write( `${data}\n` ); } );
    // curl.stderr.on( 'data', (data) => { process.stderr.write( `${data}\n` ); } );

    curl.on( 'close', closeAfter );
}

function performGitClone(command, args, closeAfter) {
    const git = spawn( command, args );

    // git.stdout.on( 'data', (data) => { process.stdout.write( `${data}\n` ); } );
    // git.stderr.on( 'data', (data) => { process.stderr.write( `${data}\n` ); } );

    git.on( 'close', closeAfter );
}

function clone(base_path, pkg) {
    console.log( '#  base_path: %s, pkg: %j', base_path, pkg );
    
    let target_path = path.join( base_path, pkg.name );

    function closeAfter(code) {
        console.log( `# => ${code}` );

        let emacs_lisp_package_base_path = expandPath( gasketConfig.emacs_lisp_package_path );
        let to_package_path = path.join( emacs_lisp_package_base_path, pkg.name );

        console.log( '' );
        console.log( `### copy into ${to_package_path}` );

        if ( !fs.existsSync( to_package_path ) ) {
            mkdirp.sync( to_package_path );
            console.log( `mkdir -p ${to_package_path}` );
        }
        console.log( '' );

        if ( fs.existsSync( target_path ) ) {
            find.file( /\.el$/, target_path, (files) => {
                files.forEach( (filepath) => {
                    let filename = path.basename( filepath );
                    let to_filepath = path.join( to_package_path, filename );

                    fs.renameSync( filepath, to_filepath );
                    console.log( `mv ${filepath}, ${to_filepath}` );
                } );
            } );
        }
    }

    if ( pkg.url !== null || pkg.url !== undefined ) {
        let a_url = url.parse( pkg.url );

        let command = '';
        let args    = null;

        if ( a_url.path.endsWith( '.git' ) ) {
            command = 'git';
            args    = [ 'clone', pkg.url, target_path ];
        } else {
            let package_to_path = path.join( target_path, path.basename( a_url.path ) );

            if ( !fs.existsSync( target_path ) ) {
                mkdirp.sync( target_path );
                console.log( `mkdir -p ${target_path}` );
            }
            
            command = 'curl';
            args    = [ pkg.url, '-#', '-o', package_to_path ];
        }

        console.log( '# ' );
        console.log( '%s %s', command, args.join( ' ' ) );

        if ( command == 'git' ) {
            // const git = spawn( command, args );

            // git.stdout.on( 'data', (data) => { process.stdout.write( `${data}\n` ); } );
            // git.stderr.on( 'data', (data) => { process.stderr.write( `${data}\n` ); } );
            // git.on( 'close', closeAfter );
            performGitClone( command, args, closeAfter );
        } else {
            performCurl( command, args, closeAfter );
        }
    }
}

console.log( '# process.argv: %j', process.argv );

if ( process.argv.length > 2 ) {
    let package_name = process.argv[2];

    console.log( '# package_name: %j', package_name );

    let base_path = expandPath( '~/.gasket/packages/' );
    if ( !fs.existsSync( base_path ) ) {
        fs.mkdirSync( base_path );
    }

    console.log( '# ' );

    let pkg = PackageResolver.namedAtPackage( package_name );
    if ( pkg ) {
        console.log( '# ' );
        console.log( '# ---' );

        clone( base_path, pkg );

        pkg.depends.forEach( (depend) => {
            console.log( '# ---' );

            clone( base_path, depend );

            console.log( '#' );
        } );

    } else {
        console.log( `# ${package_name} not found` );
    }
}
