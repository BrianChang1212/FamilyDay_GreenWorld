@echo off
setlocal

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0convert-roster-dump-to-txt.ps1" %*
exit /b %ERRORLEVEL%
