# Online Cinema Service

This is movie application that provides the functionality of general cinema service, such as watching and collecting films, upload it, creating your own profile.

### Features
- 2 roles user and admin(can see other users and change their role)
- auth2 with Github
- cloudinary for user account photo
- jwt tokens as authorization system
- using Telegram for notifications

### API 
There is API documentation on this site on about page.

### Setup
Clone this repo to your desktop and run `npm install` to install all the dependencies. Create `.env` file in root directory with your properties. For developing comment `publicRoot` variable and `app.get("/", ...)` function in app.js. Then go to client/ folder and setup client side accordingly to the local README.
