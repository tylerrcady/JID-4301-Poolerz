# Poolerz - Carpooling Application
Poolerz is a web-based carpooling application designed to support busy professionals with children between the ages of 7 and 15 who attend camps, schools, or clubs with no transportation option. Carpooling among parents is the preferred solution, but some parents may not have a strong network or may not know any other parents and have a limited opportunity to connect. For parents who are connected, carpooling is complex and complicated and requires the exchange of a lot of information, such as capacity, availability, constraints, proximity, and more. It's a logistical challenge. At Poolerz, we strive to solve all of these problems.

# Release Notes
## Version 0.4.0: https://jda-4301-poolerz.vercel.app/
### Features
- List of Carpools now includes both created and joined carpools, with an _Owner_ tag to distinguish created carpools.
- Users can now leave carpools if they are not the owner.
- Dynamic Carpool Information Page:
    - Users can now edit their carpool information (e.g., driving availability, car capacity, etc.).
    - Carpool owners can edit the carpool event information.
    - Carpool owners can run the optimizer as many times as they’d like. Optimizer results are displayed on the dynamic pool-info page.
- The User Form now collects phone numbers so that users can access contact information for other users in their carpool group.
- When users create a carpool, it is now added to their list of joined carpools in the user-carpool-data
- Start and End times of a carpool are stored in database and passed through the optimizer
  
### Bug Fixes
- The Carpool-info Page now dynamically renders the correct carpool information and pulls both riders and members for a pool.
- "Remove" button now visually removes elements before saving
- UI fix: All components are properly aligned with header in join-carpool
 
### Known Issues
- Fetching information for the pool-info page occasionally lags due to database organization.
- Validation should be added for checking inputted locations/addresses.
- Registration Form UI's input fields still needs to be fully checked for regex edge cases
  
## Version 0.3.0: https://jda-4301-poolerz.vercel.app/
### Features
- Join Carpool Flow & Implementation
    - Users can now join carpools by inputting the 6-character join code
    - Carpools database is updated when a user joins a carpool
    - User carpool data, including their personal address, car capacity, driving availability, etc., is now stored in a new database called 'user-carpool-data'
    - Updated profile page so that it doesn't render driving availability or car capacity until join-carpool form is completed
- Carpool Information Display
    - When displaying a user's list of carpools, each carpool dynamically links to page that displays the respective carpool and user-carpool-data information
- UI Enhancement:
    - Header buttons (Carpools, Profile) now change from gray to blue on hover and remain blue when on their respective pages for better navigation clarity.
    - Added a back button component with a back arrow icon for improved usability.
- Optimization Algorithm Refinement:
    - Implemented a useable schedule-oriented output of the optimizer that can be used to later display carpool assignments   
### Bug Fixes
- UI Fixes:
  - Aligned the back button with the header for create-carpool
  - Background and footer are now properly rendered on all screens
- Optimizer is now handling failed clustering scenarios by implementing additional validation checks AND looking into cluster and unclustered user corrections
### Known Issues
- Carpool Information page's UI still needs to be fixed and mobile responsive
- In the carpool-info page, the list of riders AND members for a pool is currently hardcoded and needs to be dynamically rendered
- Join-carpool uses the backbutton component but is not aligned with the header due to the positioning of the content.
- The "Remove" button doesn't visually remove elements before saving
- Registration Form UI's input fields still needs to be fully checked for regex edge cases

## Version 0.2.0: https://jda-4301-poolerz.vercel.app/
### Features
- Create Carpool Form UI:
  - Users can now create carpools using the create-carpool form
  - Added a confirmation page once user completes the create-carpool form
  - User can view their list of created carpools
- Creating Carpool Flow:
  - Each carpool is now stored in a separate collection, called 'Carpools', uniquely identified by a 6-digit alphanumeric carpoolId
  - Implemented GET/POST functions to retrieve and store carpool data in the database.
  - Connected Create-Carpool Form to the database with unique join code generation.
- Optimization Algorithm for Grouping People into Carpools
  - Uses DBSCAN to group users into clusters by geographic proximity
  - Validates clusters based on capacity and driving day availability
### Bug Fixes
- Fixed UI layout issues for adding driver availability to improve user experience
- Users now input driving availability under the create-carpool form rather than registration to simplify registration process
### Known Issues
- Given the current data layout, optimizer isn't fully handling errors for failed clustering scenarios
- The "Remove" button still doesn't visually remove elements before saving
- Registration Form UI still needs to be fixed and fully checked for regex edge cases
- Background and footer is improperly rendered on certain screens

## Version 0.1.0: https://jda-4301-poolerz.vercel.app/
### Features
- Registration Flow:
  - New users are prompted to complete a registration form immediately upon signing in.
  - Once the form is submitted, the user data gets updated to their profile and Poolerz database, and users gain full access to the application
- Main Carpool Page: Introduced refined Poolerz landing pages for three user states:
    1. Not logged in
    2. Logged in but registration form not completed
    3. Fully logged in with registration completed
- Create & Join Carpool Page: Implemented landing pages for users creating a new carpool or joining an existing one
- Poolerz home page:
    - Upgraded the Poolerz home page layout
    - Added fields for contacting Poolerz organizers and subscribing to the mailing list
 - User Profile:
    - Enhanced the design and usability of the profile editing experience
### Bug Fixes
-  Improved mobile responsiveness for the registration form, user profile, and overall application layout (header/footer).
### Known Issues
- The "Remove" button does not visually remove elements before saving. Elements should be removed immediately upon clicking the button, rather than after the database save operation.
- Form UI still needs to be fixed, especially regarding availability
- Form needs to be fully checked for edge cases, including fixing regex checks

## Version 0.0.0: https://jda-4301-poolerz.vercel.app/

### Features
- User Authentication: implemented secure authentication backed by Google with Auth.js
- User Profile Management:
  - Created an initial user form to retrieve relevant personalized data (e.g. children information, availability, etc.) about the user
  - Created a dashboard that allows users to view and edit their personalized data
- Responsive Design: implemented a mobile and web-friendly interface using Tailwind CSS
- Database Integration: connected a secure database with MongoDB to store & retrieve user information

### Bug Fixes
- Since this is our initial version, there are no bug fixes to report

### Known Issues
- Form UI needs to be refined, especially regarding availability
- Form needs to be fully checked for edge cases, including fixing regex checks

# Rationale for v0.0.0 Feature Choices:
- User Authentication: essential for the foundation of our application to establish identity, and further, to allow for a backbone to support session management
- User Profile Management: essential for our next core step of optimizing carpool groups, allowing users and our developers to store, edit, and retrieve relevant data on an as-needed basis
- Responsive Design: essential for the user, as the most common medium of this application will likely be via mobile devices
- Database Integration: essential for supporting user profile management, as well as all of our future user-related data

# Technology Tools and Platforms:

### Frontend and Backend
- Next.js: selected for its many pros including server-side rendering, built-in API functionality, and file-based routing
  - React: serves as our core framework/library, allowing for a component-based interactive application
  - TypeScript: allows for static typing on top of JavaScript to improve code quality and to help catch errors
  - Tailwind CSS: allows for inline UI development to increase efficiency and responsiveness
- MongoDB: selected as our database for its flexible document-based structure and simplistic integration with Next.js
- Material UI: used to enhance UI elements with pre-built components

### Authentication
- Auth.js: used to implement secure authentication with Next.js
  - Google OAuth: our provider of choice for authentication

### Development Tools
- Git/GitHub: used for our version control and collaboration
- Vercel: used to host our application
