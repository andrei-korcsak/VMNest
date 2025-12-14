# VMNest
VMNest is an application for managing virtual machines within a network. It provides dashboard visualizations of data collected from the machines to help monitor their performance and status.

# Table of Contents
* [Features](#features)
* [Screenshots](#screenshots)
* [Technologies Used](#technologies-used)
* [Running Application](#running-application)

# Features
## View Machines
 - Displays all active/inactive machines within the network where the application is running.
 - Shows key details like IP addresses, MAC addresses, DNS names, and machine status in a table.
 - Includes an option to delete entries. Addresses are stored in a MongoDB database and both active and inactive machines are retained. The delete function removes the selected entries from the database.
 - Features a search bar for quickly locating specific entries and a "Refresh" button to update the table and database.

## Dashboard (Not yet implemented)
 - This screen will provide a visual dashboard to track various metrics from the machines, such as memory usage, uptime, storage, etc.

## Settings (Not yet implemented)
 - This section will allow users to manage application settings.

## Log Off (Not yet implemented)
 - A login system is planned for future versions. This option will allow users to securely log off from the application.

# Screenshots
<img width="1916" alt="image" src="https://github.com/user-attachments/assets/a09bd396-75eb-4a33-bc17-17fb43c5ea2c" />

# Technologies Used
- ASP.NET Core
- C#
- ReactJS
- MongoDB
- Javascript
- HTML
- CSS

# Running Application
Open the command line at the preferred location to clone the repository by executing the command below:
- git clone https://github.com/andrei-korcsak/VMNest.git

Once the repository has been succesfully cloned, open the VMNest.sln in Visual Studio

Install the Node.js dependency in the root folder by running `npm install`

Navigate to VMNest.Client and run the command `npm run dev`
