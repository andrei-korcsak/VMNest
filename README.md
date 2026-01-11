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

<img width="1918" height="955" alt="{85695A6E-25B1-4196-B3BD-83D9259323C2}" src="https://github.com/user-attachments/assets/8cbe6b57-4a64-479a-97c0-90d0e846e5d8" />

## Dashboard
 - This screen will provide a visual dashboard to track various metrics from the machines, such as memory usage, uptime, memory, CPU usage, Network data such as download speed and upload speed, and number of processes currently running
 - It provides the number of machines, number of machines running, machines that are off, and displays their averages for the machines which metrics are collected. Only machines that are currently running will be displayed on the dashboard.
 - The "Metrics Not Obtained" message indicates that even though the machine is running, the Agent was not deployed on the machine to collect the metrics from the machine

<img width="1919" height="954" alt="{721063CD-CFF8-4B6D-9282-951FAACC2006}" src="https://github.com/user-attachments/assets/72322636-a36f-4653-adf4-22dfac5cb7de" />

## Settings (Coming soon)
 - This section will enable users to configure application settings.
 - Auto-refresh Interval: Determines the frequency at which dashboards refresh.
 - Default Landing Page: Allows users to choose the page that will appear by default when they open the application.
 - Items Per Page: Lets users specify the number of entries displayed on each page of the "View Machines" table.
 - Agent Polling Interval: Sets the frequency at which machine metrics are gathered and sent to the API for VMNest to display on the dashboard.

Note: While the UI for the settings section is already designed, the functionality is still under development.

<img width="1919" height="952" alt="{059C490C-A855-44B1-8528-E8CEE09E8AEA}" src="https://github.com/user-attachments/assets/f10a9cac-d82b-45b9-9544-be843db545db" />

## Log Off (Coming soon)
 - A login system is planned for future versions. Once implemented, this option will allow users to securely log off from the application.

## Agent
 - The Agent is a separate component within the solution that is deployed on Virtual Machines. It runs in the background, collecting metrics from the machine.
 - These metrics are periodically sent to the API, from which the VMNest application retrieves the data for display.

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

`cd C:\Users\Andrei\source\repos\VMNest\VMNest.Agent`

`dotnet publish -c Release -r win-x64 --self-contained -o C:\VMNestAgent`

This will create a self-contained executable in the specified output folder (C:\VMNestAgent in this case). Copy the contents of this folder to each machine in the network where you want to collect data.

To ensure that the agent runs even while the user is not logged in, set up a Windows Task Scheduler task to run the agent executable at startup. Setting it up as a service is also an option, but using Task Scheduler is simpler for most users.

VMNest Agent will start collecting data and sending it to the server once it is running on the machines. VMNest application will then be able to display the collected data on the "Dashboard" screen.

# Connection String Configuration
The user will need to setup the connection string to their MongoDB database in the appsettings.json file located in the VMNest.Server project folder. The connection string is place in the secrets folder for development purposes.
