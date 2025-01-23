# Poolerz - Carpooling Application
Poolerz is a web-based carpooling application designed to support busy professionals with children between the ages of 7 and 15 who attend camps, schools, or clubs with no transportation option. Carpooling among parents is the preferred solution, but some parents may not have a strong network or may not know any other parents and have a limited opportunity to connect. For parents who are connected, carpooling is complex and complicated and requires the exchange of a lot of information, such as capacity, availability, constraints, proximity, and more. It's a logistical challenge. At Poolerz, we strive to solve all of these problems.

# Release Notes

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
