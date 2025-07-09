# chai aur backend series

This is a video series on backend with javascript
- [Model link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj?origin=share)


Discussion about one bad practice:



Info. about all packages we are installing for Backend
# Use 'Git Bash' as terminal

# 1. npm i init = initialise folder/file
#    it's a utility which will walk you through creating paclage.jsoon file
# 2. npm i init -y = initialise folder/file set everything to default

# 3. npm i express = install express

# 4. npm create vite@latest = to create react application and create all files and folder in new folder
# 5. npm create vite@latest . = to create react application in current folder
# more steps to create react application npm i and then npm run dev. If you close the vs code before completion of project then run command npm run dev at same directory to rerender it again in browser.

# 6. npm i axios = popular javascript library to make HTTP requests and axios also convert json response(generally  get response in json) to javascript

# 7. npm i nodemon = when a file is saved nodemon restarts the server. this install as 'dependencies'
# 8. npm i -D nodemon = install as 'devDependencies', we can see in package.json file
# devDependencies - we use this package only for development purposes not for production
# I have used the nodemon with 'npm run dev' command for file src/index.js

# 9. npm i prettier = for setting specific format for writting code(like 'tabWidth = 2' means two spaces for one tab)
# 10. npm i -D prettier = install as devDependencies
# in a team there are many developers writting code, hence there will be difference in format of in writting for each developer so when the code will merge, there will be a lot of error, so to solve it prettier is used to set standard format writting.

# 11. npm i mongoose = elegent mongodb object modeling for node.js

# 12. npm i dotenv = Dotenv is a zero-dependency module that loads environment variables from a .env file into process.env. Storing configuration in the environment separate from code is based on The Twelve-Factor App methodology.

# 13. npm i cors = CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS(error) with various options.

# 14. npm i cookie-parser = Parse Cookie header and populate req.cookies with an object keyed by the cookie names. Optionally you may enable signed cookie support by passing a secret string, which assigns req.secret so it may be used by other middleware.

# 15. npm i bcrypt = A library to help you hash passwords. For safely storing your passwords.

# 16. npm i jsonwebtoken = an implementation of JSON Web Token. It makes use of node-jws. (Bearer token)

# 17. npm install cloudinary = 3rd party service to upload files, videos

# 18. npm i multer = multer is a Node.js middleware for handling multipart/form-data (primarily used for file uploads) in web applications built with Express or similar frameworks.

Info. about folder we used in this backend project
# Since git don't track folders so to track folders we need to add '.gitkeep' file in that folder which we want to push in github.

#  app.on() -
#  app.listen() -
#  app.use() -
#  app.post() -

# JPG file are not supported by cloudinary passing them through postman will give error whereas JPEG and PNG will not give error

How user uploaded file is saved in server?
# firstly, we will store user uploaded file in localstorage(temporary) through multer then we will send file to server through third party serices(like cloudinary, AWS). (multer -> localstorage -> cloudinary -> server)
# we can also send file directly to server without storing at localstorage (like this multer -> cloudinary -> server) but by storing file at localstorage we can able to reattempt for reuploading file if in case any need(problem) happens. That's why we use above method for uploading file

Statuscode :
# Informational reponses (100 - 199)
# Successful reponses (200 - 299)
# Redirection messages (300 - 399)
# Client error reponses (400 - 499)
# Server error reponses (500 - 599)

Instructions to avoid errors:
# Don't use special character for writting MONGODB_URI in .env file and remove / from last

# Always write code in try-catch or pass through promises and use async-await when doing operations like connect, save data, others through Databases(MongoDB) because chance of problems are very high or ot may take time to do operations because database is on 