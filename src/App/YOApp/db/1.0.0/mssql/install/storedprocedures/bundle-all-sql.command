#!/bin/bash
# Bundle all .sql files in this directory into final.all.sql
# Double-click this file in Finder to run.

cd "$(dirname "$0")" || exit 1

outputFile="final.all.sql"
tempFile=".final.all.sql.tmp"

rm -f "$tempFile"

count=0
for f in *.sql; do
  [ -f "$f" ] || continue
  [ "$f" = "$outputFile" ] && continue
  cat "$f" >> "$tempFile"
  echo "" >> "$tempFile"
  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  rm -f "$tempFile"
  echo "No SQL files found."
  exit 1
fi

mv "$tempFile" "$outputFile"
echo "Done — created $outputFile from $count SQL files."
echo "Press Enter to close."
read -r
