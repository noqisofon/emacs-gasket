#!/usr/bin/bash

if [ ! -d ~/.gasket ]; then
    mkdir -p ~/.gasket
fi

if [ ! -f ~/.gasket/recipes.json ]; then
    curl http://melpa.milkbox.net/recipes.json -o ~/.gasket/recipes.json
fi

if [ ! -f ~/.gasket/archive.json ]; then
    curl http://melpa.milkbox.net/archive.json -o ~/.gasket/archive.json
fi
