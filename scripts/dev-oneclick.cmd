@echo off
setlocal
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0dev-oneclick.ps1" %*
