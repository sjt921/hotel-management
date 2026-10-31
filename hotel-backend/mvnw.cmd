@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup script for Windows
@REM ----------------------------------------------------------------------------
@echo off
setlocal enabledelayedexpansion

set "MAVEN_PROJECTBASEDIR=%cd%"
set "MAVEN_WRAPPER_DIR=%MAVEN_PROJECTBASEDIR%\.mvn\wrapper"
set "MAVEN_WRAPPER_JAR=%MAVEN_WRAPPER_DIR%\maven-wrapper.jar"
set "MAVEN_WRAPPER_PROPERTIES=%MAVEN_WRAPPER_DIR%\maven-wrapper.properties"
set "MAVEN_USER_HOME=%USERPROFILE%\.m2"

REM Check if wrapper jar exists, download if not
if not exist "%MAVEN_WRAPPER_JAR%" (
    echo Downloading Maven Wrapper...
    set "WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.3.2/maven-wrapper-3.3.2.jar"
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '!WRAPPER_URL!' -OutFile '%MAVEN_WRAPPER_JAR%'}"
    if not exist "%MAVEN_WRAPPER_JAR%" (
        echo ERROR: Failed to download Maven Wrapper jar.
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
    echo Maven Wrapper downloaded successfully.
)

REM Find Java
if defined JAVA_HOME (
    set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
    set "JAVA_EXE=java"
)

REM Set MAVEN_OPTS if not set
if not defined MAVEN_OPTS (
    set "MAVEN_OPTS=-Xmx1024m -XX:MaxMetaspaceSize=512m"
)

REM Run Maven Wrapper
"%JAVA_EXE%" ^
  %MAVEN_OPTS% ^
  -classpath "%MAVEN_WRAPPER_JAR%" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_PROJECTBASEDIR%" ^
  "-Dmaven.wrapper.properties=%MAVEN_WRAPPER_PROPERTIES%" ^
  org.apache.maven.wrapper.MavenWrapperMain ^
  %*

endlocal
