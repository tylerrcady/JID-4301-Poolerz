# Poolerz - Carpooling Application
Poolerz is a web-based carpooling application designed to support busy professionals with children between the ages of 7 and 15 who attend camps, schools, or clubs with no transportation option. Carpooling among parents is the preferred solution, but some parents may not have a strong network or may not know any other parents and have a limited opportunity to connect. For parents who are connected, carpooling is complex and complicated and requires the exchange of a lot of information, such as capacity, availability, constraints, proximity, and more. It's a logistical challenge. At Poolerz, we strive to solve all of these problems.

# Poolerz v1.0 – Official Release Notes (2025‑04‑16)

Below is a consolidated changelog that captures everything shipped during our pre‑release cycle (v0.0.0 → v0.5.0).  
Use it as the definitive reference for what’s in (and not yet in) our first production build.

---
## ✨ Features
- **Secure Google authentication** with Auth.js
- **MongoDB integration** for all user, carpool & optimizer data    
- **End-to-end registration flow** – multi‑step registration with dynamic child management (≤ 5 children), inline address editing, real‑time field validation, and celebratory confetti on successful save
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

## 🐞 Bug Fixes

- **Forms & validation** – squashed layout shifts when adding/removing children; added live checks for state (2 letters), ZIP (5 digits), phone (10 digits), and automatic capitalization of street/city.  
- **Remove‑button glitch** – now gives instant visual feedback before saving.  
- **Carpool‑info data/rendering** – consistently pulls riders *and* members, aligns with global header, and respects mobile breakpoints.  
- **UI alignment** – back‑button, background, and footer now render correctly across all screen sizes.  
- **Optimizer stability** – gracefully handles clustering failures by listing unassigned members. 
---

## ⚠️ Known Bugs / Missing Functionality

1. **Slow first load on *pool‑info*** – initial MongoDB query can take several seconds given current DB structure  
2. **Lenient address handling** – optimizer still trusts free‑form user addresses, leading to occasional mis‑clusters; stricter geocoding & validation should be implemented  
3. **Edge‑case regex gaps** – uncommon address/phone formats (e.g., international ZIPs) may still bypass onboarding checks.  
