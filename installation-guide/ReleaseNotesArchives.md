# Poolerz - Carpooling Application
Poolerz is a web-based carpooling application designed to support busy professionals with children between the ages of 7 and 15 who attend camps, schools, or clubs with no transportation option. Carpooling among parents is the preferred solution, but some parents may not have a strong network or may not know any other parents and have a limited opportunity to connect. For parents who are connected, carpooling is complex and complicated and requires the exchange of a lot of information, such as capacity, availability, constraints, proximity, and more. It's a logistical challenge. At Poolerz, we strive to solve all of these problems.


# 📘 Poolerz v1.0.0 – Official Release Notes (2025‑04‑16)

 📄 **What’s inside:**  
 This consolidated changelog captures everything shipped during our pre‑release cycle (`v0.0.0` → `v0.5.0`).  
Use it as the definitive reference for what’s in (and not yet in) our first production build.


## ✨ Features
- **Secure Google authentication** with Auth.js
- **MongoDB integration** for all user, carpool & optimizer data    
- **End-to-end registration flow** – multi‑step registration with dynamic child management (≤ 5 children), inline address editing, real‑time field validation, and celebratory confetti on successful save
- **User profile management**: view & edit personal data (children, availability, phone, etc.)
- **Complete carpool lifecycle**
  - **Create Carpool Flow**
      - Streamlined one-page form with instant confirmation
      - Carpools displayed in a dedicated **`Carpools`** collection, each identified by a 6‑character join code  
      - Start/End times saved and forwarded to the optimizer
  - **Join Carpool Flow**
     - Join any carpool via its 6-char join code  
     - New **`user‑carpool‑data`** collection records per‑user address, car capacity & driving availability
   - **Dynamic carpool info page**
     – real‑time roster, event details, and owner controls( tweak capacity, event details, driving days, and run the optimizer on demand) all in one place
     - Non-owners can leave carpool
     - Owners can **close** carpools to prevent future users from joining and **re-open** carpools on demand
- **Optimizer**
  - DBSCAN‑based clustering that factors geo-proximity, seat counts, and driver availability to auto‑generate balanced schedules
  - Outputs clear, easy-to-read schedule assignments that are displayed under the **dynamic carpool info page**, giving users instant access to who’s driving when   
- **Calendar dashboard** – personal month/week/day view plus 7‑day scrollable agenda, so drivers know exactly when they’re on duty    
- **Responsive, accessible UI** – Active‑state header navigation, hamburger navigation menu at small/middle breakpoints, global loading spinners for loading operations, hover/active button states, and reusable back-button component
- **Informative, welcoming home page** – Designed to engage users at first glance with polished visuals, refreshed typography, and a thoughtful layout that highlights key information, contact options, and mailing list sign-up—all in one place
---

## 🐞 Bug Fixes

- **Forms & validation** – squashed layout shifts when adding/removing children; added live checks for state (2 letters), ZIP (5 digits), phone (10 digits), and automatic capitalization of street/city.  
- **Remove‑button glitch** – now gives instant visual feedback before saving.  
- **Carpool‑info data/rendering** – consistently pulls riders *and* members, aligns with global header, and respects mobile breakpoints.  
- **UI alignment** – back‑button, background, and footer now render correctly across all screen sizes.  
- **Optimizer stability** – gracefully handles clustering failures by listing unassigned members. 
---

## ⚠️ Known Bugs / Missing Functionality

1. **Slow first load on *pool‑info*** – initial MongoDB query can take several seconds given current DB structure  
2. **Lenient address handling** – optimizer still trusts free‑form user addresses, leading to occasional mis‑clusters; stricter geocoding & validation should be implemented  
3. **Edge‑case regex gaps** – uncommon address/phone formats (e.g., international ZIPs) may still bypass onboarding checks.
   
# Poolerz Previous Release Notes Versions 0.0.0 - 0.5.0

## Version 0.5.0 <https://jda-4301-poolerz.vercel.app/>
### Features
- **Calendar dashboard**  
  A brand‑new **Dashboard** tab presents each user’s personal carpool schedule in a two‑pane layout—calendar on the left, scrollable agenda on the right—so drivers can see at a glance when they’re on duty.
- **Responsive header & navigation**  
  The top‑bar automatically collapses into a hamburger menu at medium and smaller breakpoints, giving quick access to every page section plus **Log Out**.
- **Home page refresh**  
  Updated typography, spacing, and illustrations for a more engaging first impression.
- **User profile improvements**  
  - Address can now be edited inline; changes persist to the database.  
  - Content is center‑aligned with a decorative profile‑picture component.  
  - Each child’s active carpools are listed directly beneath their name.  
  - A celebratory confetti animation plays after successful form submission
- **Global loading indicators**  
  Uniform, unobtrusive spinners have been added across all async operations.
- **User‑onboarding form overhaul**  
  - Cleaner layout and progress tracker
  - Dynamic child‑management section with smooth add/remove animations (maximum 5 children, with friendly feedback when the limit is reached).
- **Carpool lock‑down**  
  Owners can now **close** a carpool, preventing new members from joining until it is reopened.

### Bug Fixes
- **User‑onboarding form**
  - Fixed layout shifts that occurred when adding or removing children.  
  - Added real‑time validation:  
    - State abbreviations (2 letters)  
    - ZIP codes (5 digits)  
    - Phone numbers (10 digits)  
    - Automatic capitalization of street and city fields  
    - Consolidated, accessible error messages

### Known Issues
- Initial data fetch for the **pool‑info** page can be slow; query structure is being refactored.  
- Optimizer currently trusts user‑provided addresses; stricter location validation is planned.


## Version 0.4.0
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
  
## Version 0.3.0
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

## Version 0.2.0
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

## Version 0.1.0
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

## Version 0.0.0

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
