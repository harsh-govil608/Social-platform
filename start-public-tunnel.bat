@echo off
echo ================================================
echo Starting public tunnel for your app...
echo ================================================
echo.
echo This will create a public URL that you can share.
echo.
echo After running, look for a line that says:
echo "https://xxxxxx.localhost.run"
echo.
echo Share that URL with your mom!
echo ================================================
echo.
ssh -R 80:localhost:5175 nokey@localhost.run
pause