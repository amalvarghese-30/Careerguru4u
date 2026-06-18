@echo off
echo ========================================
echo  Scraping missing Maharashtra Class 10 subjects
echo ========================================
echo.

echo [1/6] English...
node scripts/scrape-shaalaa.mjs --board=maharashtra --class=10 --subject=english
if %ERRORLEVEL% NEQ 0 echo WARNING: English scrape failed

echo.
echo [2/6] Geography...
node scripts/scrape-shaalaa.mjs --board=maharashtra --class=10 --subject=geography
if %ERRORLEVEL% NEQ 0 echo WARNING: Geography scrape failed

echo.
echo [3/6] History...
node scripts/scrape-shaalaa.mjs --board=maharashtra --class=10 --subject=history
if %ERRORLEVEL% NEQ 0 echo WARNING: History scrape failed

echo.
echo [4/6] Hindi...
node scripts/scrape-shaalaa.mjs --board=maharashtra --class=10 --subject=hindi
if %ERRORLEVEL% NEQ 0 echo WARNING: Hindi scrape failed

echo.
echo [5/6] Marathi...
node scripts/scrape-shaalaa.mjs --board=maharashtra --class=10 --subject=marathi
if %ERRORLEVEL% NEQ 0 echo WARNING: Marathi scrape failed

echo.
echo [6/6] Sanskrit...
node scripts/scrape-shaalaa.mjs --board=maharashtra --class=10 --subject=sanskrit
if %ERRORLEVEL% NEQ 0 echo WARNING: Sanskrit scrape failed

echo.
echo ========================================
echo  All done! Now import into MongoDB:
echo ========================================
echo.

echo npx tsx scripts/import-solutions.ts scraped-data/maharashtra/10/english/solutions.json
echo npx tsx scripts/import-solutions.ts scraped-data/maharashtra/10/geography/solutions.json
echo npx tsx scripts/import-solutions.ts scraped-data/maharashtra/10/history/solutions.json
echo npx tsx scripts/import-solutions.ts scraped-data/maharashtra/10/hindi/solutions.json
echo npx tsx scripts/import-solutions.ts scraped-data/maharashtra/10/marathi/solutions.json
echo npx tsx scripts/import-solutions.ts scraped-data/maharashtra/10/sanskrit/solutions.json

pause
