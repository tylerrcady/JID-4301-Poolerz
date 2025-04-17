# 🚗 Poolerz – Smart Carpooling for Busy Parents

**Poolerz** is a web-based carpooling platform built to support busy professionals with children ages 7–15 who attend camps, schools, or extracurricular activities without reliable transportation options.

While carpooling is often the most practical solution, many parents face real barriers:
- They may not have a strong local network.
- They may not know other families with compatible schedules.
- Even when connections exist, organizing carpools is time-consuming and complex—requiring coordination of availability, seat capacity, routes, and more.

At **Poolerz**, we streamline the entire process—matching families, simplifying logistics, and making trusted ride-sharing effortless.

📍 **Live Site** → [https://jda-4301-poolerz.vercel.app](https://jda-4301-poolerz.vercel.app)


# 📦 Customer Delivery Documentation

- [**Installation Guide**](https://github.com/tylerrcady/JID-4301-Poolerz/blob/dev/installation-guide/InstallingGuide.md#-poolerz-installation-guide)  
- [**Detailed Design Document**](https://poolerz.mintlify.app/design/introduction)  
- [**Optimizer Information**](https://poolerz.mintlify.app/optimization)


# 📘 Poolerz v1.0.0 – Official Release Notes (2025‑04‑16)

 📄 **What’s inside:**  
 This consolidated changelog captures everything shipped during our pre‑release cycle (`v0.0.0` → `v0.5.0`).  
Use it as the definitive reference for what’s in (and not yet in) our first production build.

## Features
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

## Bug Fixes
- **Forms & validation** – squashed layout shifts when adding/removing children; added live checks for state (2 letters), ZIP (5 digits), phone (10 digits), and automatic capitalization of street/city.  
- **Remove‑button glitch** – now gives instant visual feedback before saving.  
- **Carpool‑info data/rendering** – consistently pulls riders *and* members, aligns with global header, and respects mobile breakpoints.  
- **UI alignment** – back‑button, background, and footer now render correctly across all screen sizes.  
- **Optimizer stability** – gracefully handles clustering failures by listing unassigned members. 

## Known Bugs / Missing Functionality
1. **Slow first load on *pool‑info*** – initial MongoDB query can take several seconds given current DB structure  
2. **Lenient address handling** – optimizer still trusts free‑form user addresses, leading to occasional mis‑clusters; stricter geocoding & validation should be implemented  
3. **Edge‑case regex gaps** – uncommon address/phone formats (e.g., international ZIPs) may still bypass onboarding checks.  

## Technology Tools & Platforms

### Frontend & Backend
- **Next.js** – Chosen for its built-in API support, server-side rendering, and intuitive file-based routing.
  - **React** – Powers our component-based architecture for dynamic, interactive UI.
  - **TypeScript** – Adds static typing to JavaScript, improving code quality and catching errors early.
  - **Tailwind CSS** – Enables rapid and responsive UI development through utility-first styling.
- **MongoDB** – A flexible, document-oriented database that integrates seamlessly with Next.js.
- **Material UI** – Provides a polished set of pre-built components to enhance visual consistency.

### Authentication
- **Auth.js** – Manages authentication in our Next.js app with secure session handling.
  - **Google OAuth** – Our primary authentication provider for seamless, trusted sign-in.

### Development & Deployment
- **Git / GitHub** – Enables version control and collaborative development.
- **Vercel** – Hosts our application with optimized performance for Next.js projects.
