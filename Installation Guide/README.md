# Poolerz - Carpooling Application
Poolerz is a web-based carpooling application designed to support busy professionals with children between the ages of 7 and 15 who attend camps, schools, or clubs with no transportation option. Carpooling among parents is the preferred solution, but some parents may not have a strong network or may not know any other parents and have a limited opportunity to connect. For parents who are connected, carpooling is complex and complicated and requires the exchange of a lot of information, such as capacity, availability, constraints, proximity, and more. It's a logistical challenge. At Poolerz, we strive to solve all of these problems.

# Poolerz v1.0 – Official Release Notes (2025‑04‑16)

Below is a consolidated changelog that captures everything shipped during our pre‑release cycle (v0.0.0 → v0.4.0).  
Use it as the definitive reference for what’s in (and not yet in) our first production build.

---

## ✨ Features

- **Secure Google authentication** with Auth.js.  
- **Responsive UI** for mobile & desktop built with Tailwind CSS.  
- **End‑to‑end registration flow** that gates the app until the user profile is complete.  
- **User profile management**: view & edit personal data (children, availability, phone, etc.).  
- **Create Carpool flow**  
  - Wizard‑style form with confirmation screen.  
  - Carpools persisted in a dedicated **`Carpools`** collection, each identified by a 6‑character join code.  
  - Start/End times saved and forwarded to the optimizer.  
- **Join Carpool flow**  
  - Join any carpool via its join code.  
  - New **`user‑carpool‑data`** collection records per‑user address, car capacity & driving availability.  
  - Members can now **leave** a carpool if they are not the owner.  
- **Dynamic Carpool dashboard**  
  - Single list shows both *created* and *joined* carpools with an **Owner** tag.  
  - Each card links to a **Carpool Information** page that merges carpool data with user‑specific data.  
- **Carpool Information page**  
  - All members can edit their own availability, car capacity, etc.  
  - Owners can edit global event settings and **run the optimizer on‑demand** (unlimited runs).  
  - Optimizer results are displayed inline.  
- **DBSCAN‑based optimization algorithm**  
  - Clusters passengers by geo‑proximity, honors capacity & day‑availability.  
  - Outputs schedule‑oriented assignments ready for calendar display.  
- **UI/UX enhancements**  
  - Active‑state header navigation, hover feedback & reusable back‑button component.  
  - Redesigned home page with contact form & mailing‑list signup.  
  - Refined profile editor and improved form layout/spacing throughout.  
- **MongoDB integration** for all user, carpool & optimizer data.  

---

## 🐞 Bug Fixes

- Global mobile‑responsiveness improvements (registration, profile, layout).  
- Fixed layout of the driver‑availability component and moved it from registration to create‑carpool.  
- Corrected header/back‑button alignment across create‑carpool and join‑carpool pages.  
- Resolved background & footer rendering issues on all screens.  
- Optimizer now validates clusters and gracefully handles clustering failures.  
- **Carpool‑info page** now pulls the correct riders & members dynamically.  
- **“Remove” button** now updates the UI immediately instead of after save.  
- All components in join‑carpool are properly aligned with the header.  

---

## ⚠️ Known Bugs / Missing Functionality

1. **Intermittent lag** when fetching data for the pool‑info page (root cause: current DB structure).  
2. **Location/address validation** is incomplete; invalid or misspelled addresses may be accepted.  
3. **Registration form input validation** still lacks full regex coverage for edge cases.  
4. **Carpool‑info page** is not yet fully mobile‑responsive.  

We’re tracking these issues for a prompt 1.0.x patch series.
