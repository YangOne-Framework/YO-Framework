@echo off
setlocal EnableExtensions DisableDelayedExpansion

pushd "%~dp0" || exit /b 1

set "outputFile=final.all.sql"
set "tempFile=.final.all.sql.tmp"
set /a fileCount=0

if exist "%tempFile%" del /q "%tempFile%"

for /f "delims=" %%F in ('dir /b /a-d /on "*.sql" 2^>nul') do (
    if /i not "%%F"=="%outputFile%" (
        type "%%F" >> "%tempFile%"
        echo(>> "%tempFile%"
        set /a fileCount+=1
    )
)

if %fileCount% equ 0 (
    if exist "%tempFile%" del /q "%tempFile%"
    echo No SQL files were found in "%CD%".
    popd
    exit /b 1
)

move /y "%tempFile%" "%outputFile%" >nul
if errorlevel 1 (
    echo Failed to create "%outputFile%".
    popd
    exit /b 1
)

echo Created "%CD%\%outputFile%" from %fileCount% SQL files.
popd
exit /b 0
