@echo off
chcp 65001 2>nul >nul
java -jar -Duser.language=en -Dfile.encoding=UTF8 "%~dp0\apktool.jar" %*
