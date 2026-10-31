@echo off
setlocal enabledelayedexpansion
title Hotel Management - Backend

echo.
echo [1/3] Checking MySQL service...
sc query MySQL80 | findstr "RUNNING" >nul
if %errorlevel% neq 0 (
    echo        Starting MySQL service...
    net start MySQL80 >nul 2>&1
    if !errorlevel! neq 0 (
        echo        [ERROR] Failed to start MySQL!
        echo        Please run this script as Administrator.
        pause
        exit /b 1
    )
    echo        MySQL service started.
) else (
    echo        MySQL service is already running.
)

echo.
echo [2/3] Waiting for MySQL to be ready...
set "MYSQL_EXE=C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
set MYSQL_READY=0
for /L %%i in (1,1,30) do (
    "%MYSQL_EXE%" -u root -p123456 -e "SELECT 1" >nul 2>&1
    if !errorlevel! equ 0 set MYSQL_READY=1
    if !MYSQL_READY! equ 1 goto :mysql_ok
    timeout /t 2 /nobreak >nul
)
echo        [WARN] MySQL connection timeout, continuing...
:mysql_ok
echo        MySQL is ready!

echo.
echo [3/3] Starting backend on port 8088...
echo        First run may take time to download dependencies...

cd /d "%~dp0hotel-backend"
set JAVA_HOME=%~dp0jdk

"%JAVA_HOME%\bin\java.exe" -classpath ".mvn\wrapper\maven-wrapper.jar" "-Dmaven.multiModuleProjectDirectory=%cd%" "-Dmaven.wrapper.properties=.mvn\wrapper\maven-wrapper.properties" org.apache.maven.wrapper.MavenWrapperMain spring-boot:run "-Dspring-boot.run.jvmArguments=-Dfile.encoding=UTF-8"

echo.
echo Backend stopped.
pause
endlocal
