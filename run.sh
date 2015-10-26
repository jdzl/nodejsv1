#!/bin/bash

echo "Running"
echo "Add all files"
git add .
git commit -m $1
git remote set-url  origin https://github.com/unionsoftware/nodejsv1
git push -f origin master

echo "Finished."
