#!/bin/bash
# muestra_param.sh

echo "Running"
echo "Add all files"
git add .
git commit -m $1
git remote set-url  origin https://github.com/unionsoftware/nodejsv1.gi
git push -f origin master

