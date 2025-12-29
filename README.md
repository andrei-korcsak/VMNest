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

Once the repository has been successfully cloned, open the VMNest.sln in Visual Studio

Install the Node.js dependency in the root folder by running `npm install`

Navigate to VMNest.Server and run the command `dotnet run`, this will start both the backend server and Client application. Or select VMNEst.Server as the startup project and run it from Visual Studio.

# Running the Agent on Machines
To collect data from machines in the network, an agent needs to be run on each machine.

Navigate to the VMNest.Agent folder and run the following command to publish the agent:
`cd C:\Users\Andrei\source\repos\VMNest\VMNest.Agent
dotnet publish -c Release -r win-x64 --self-contained -o C:\VMNestAgent`

This will create a self-contained executable in the specified output folder (C:\VMNestAgent in this case). Copy the contents of this folder to each machine in the network where you want to collect data.

To ensure that the agent runs even while the user is not logged in, set up a Windows Task Scheduler task to run the agent executable at startup. Setting it up as a service is also an option, but using Task Scheduler is simpler for most users.

VMNest Agent will start collecting data and sending it to the server once it is running on the machines. VMNest application will then be able to display the collected data on the "Dashboard" screen.