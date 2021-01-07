Let's start! ;)

@ how to install project
- nodejs should be installed
- mysql should be installed and opened
- mysql configs are in /config/config.env
- open mysql and create empty database with name in config.env file, defaut it should be "test_platform_v2" 
- open cmd or powershell and then write: 
    - "cd <project_path>" it should be path to npm_app folder
    - "node .\seeders\syncAll.js" this command will insert tables to db
    - "npm run dev" if you want/need to run project
    - "node .\seeders\addSomeRows.js" if you need it will add some rows to some tables in db
- you can use postman to test project and postman file is located with ready apis .\docs\testPlatform.postman_collection.json

1'st bizde bar bolan modeller.


test solving-e degishli bolan modeller:
* [tests] - testlerin maglumatlary saklanylyar
* [questions] - testlerin questionleri saklanyar
* [solving_tests] - test invitation iberilende shu modele taze row goshulup invitationin maglumatlary shu yerde saklanyar
* [user_results] - testi ishlemage user giren yagdayynda shu modelde taze row doreyar
* [solving_questions] - userin ishlap duran questionlerinin netijelerinin her biri shu yerde saklanyar

Gerekli bolan triggerler:
+ [user_results] (insert) bolanda [questions] - daki hemme teste degishli bolanlarynyn {solve_count, empty_count} diyen columna +1 goshmaly
    we [solving_tests] - den {participant_count} - yny +1 kopeltmeli we {empty_answer_average} - inin valuesyny update etmeli, eger shu modelde bashga update etmeli columnlar bolsa olaram etmeli
    we [this] modeldaki {empty_answer_count} - yny hem testin questionlerinin sanyny dakmaly
+ [solving_questions] (insert, update, delete) [questions, user_results] modeldaki columnlary update etmeli