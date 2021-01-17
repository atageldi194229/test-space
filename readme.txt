@ how to install project
- nodejs should be installed
- mysql should be installed and opened
- mysql configs are in .\config\config.env
- open mysql and create empty database with name in config.env file, defaut it should be "test_platform_v2" 
- open cmd or powershell and then write: 
    - "cd <project_path>" it should be path to npm_app folder
    - "node .\seeders\syncAll.js" this command will insert tables to db
    - "node .\seeders\init.js" it will add triggers to db
    - "npm run dev" if you want/need to run project
    - "node .\seeders\addSomeRows.js" if you need it will add some rows to some tables in db
- you can use postman to test project and postman file is located with ready apis .\docs\testPlatform.postman_collection.json

echo "# test-space" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/atageldi194229/test-space.git
git push -u origin main