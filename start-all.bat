@echo off
setlocal enabledelayedexpansion
title Hotel Management - Start All

echo.
echo ==============================================
echo   Hotel Management System - Starting...
echo ==============================================
echo.

echo [1/4] Checking MySQL service...
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
)
echo        MySQL service is running.

echo.
echo [2/4] Waiting for MySQL to be ready...
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
echo [3/4] Starting backend on port 8088...

set "PROJECT_DIR=%~dp0"
set "JAVA_HOME=%PROJECT_DIR%jdk"
set "BACKEND_DIR=%PROJECT_DIR%hotel-backend"

start "Hotel-Backend" cmd /c "cd /d %BACKEND_DIR% && %JAVA_HOME%\bin\java.exe -classpath .mvn\wrapper\maven-wrapper.jar -Dmaven.multiModuleProjectDirectory=%BACKEND_DIR% -Dmaven.wrapper.properties=.mvn\wrapper\maven-wrapper.properties org.apache.maven.wrapper.MavenWrapperMain spring-boot:run -Dspring-boot.run.jvmArguments=-Dfile.encoding=UTF-8"

echo        Waiting for backend to start...
set /a WAIT_COUNT=0
:check_backend
timeout /t 3 /nobreak >nul
set /a WAIT_COUNT+=1
curl -s http://localhost:8088/api/user/login >nul 2>&1
if %errorlevel% equ 0 (
    echo        Backend started successfully!
    goto :backend_ok
)
if %WAIT_COUNT% leq 20 goto :check_backend
echo        [WARN] Backend still starting, check the backend window...
:backend_ok

echo.
echo [4/4] Starting frontend on port 3000...

set "FRONTEND_DIR=%PROJECT_DIR%hotel-frontend"
start "Hotel-Frontend" cmd /c "cd /d %FRONTEND_DIR% && npx vite --host"

echo        Frontend starting...
timeout /t 6 /nobreak >nul

echo.
echo ==============================================
echo   All services started!
echo.
echo   Backend:  http://localhost:8088
echo   Frontend: http://localhost:3000
echo.
echo   Login: admin / 123456
echo ==============================================
echo.
echo Close this window, services keep running.
echo To stop, close "Hotel-Backend" and "Hotel-Frontend" windows.
echo.

pause
endlocal
