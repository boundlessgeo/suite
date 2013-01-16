:: skeleton.bat
:: 
:: Creates an application skeleton from the provided
:: Titanium application.
::
:: Usage:
:: skeleton "My App"
::
@ECHO OFF

:: should be extracted from timanifest
SET runtime=1.0.0

:: this may not always be true
SET titanium=\Documents and Settings\All Users\Application Data\Titanium

:: create directory for application
SET dir=dashboard-%runtime%-win32
IF EXIST %dir% (ECHO Y | RD %dir% /S)
MD %dir%

:: package application
python "%titanium%\sdk\win32\%runtime%\tibuild.py" -d %dir% -v -t bundle -a "%titanium%\sdk\win32\%runtime%" -n -s "%titanium%" %1

:: remove all resources except icon
SET tmpdir=.tmp
IF EXIST %tmpdir% (ECHO Y | RD %tmpdir% /S)
MD %tmpdir%
SET resdir="%dir%\%1\Resources"
MOVE "%resdir%\_converted_icon.ico" %tmpdir%
ECHO Y | RD "%resdir%" /S
MD "%resdir%"
MOVE %tmpdir%\_converted_icon.ico "%resdir%"
RD %tmpdir%

:: zip up skeleton (assumes you have zip.exe on your path)
SET zip=%dir%.zip
IF EXIST %zip% DEL %zip%
zip -r %zip% %dir%

:: clean up
ECHO Y | RD %dir% /S

ECHO. 
ECHO Application skeleton archived in "%zip%".
