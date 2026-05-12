@echo off
REM One-click production deploy wrapper. Same as: powershell -ExecutionPolicy Bypass -File "%~dp0deploy-production.ps1"
setlocal
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0deploy-production.ps1" %*
exit /b %ERRORLEVEL%
