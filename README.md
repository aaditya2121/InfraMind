# InfraMind – AI Infrastructure Intelligence for Smart Campuses

## Hackathon Project Document

### 1. Project Overview
InfraMind is an AI-powered infrastructure issue detection and maintenance management platform designed for campuses. 

Most colleges currently manage maintenance issues through WhatsApp groups, emails, and manual registers, which leads to lost complaints, delayed repairs, and poor infrastructure tracking. 

InfraMind solves this by creating a centralized AI-driven system that: 
- Captures infrastructure complaints 
- Automatically classifies issues using AI 
- Routes them to the correct maintenance team 
- Tracks resolution progress 
- Generates analytics for administrators 

For the hackathon MVP, the system will focus on hostel maintenance issues, while the architecture will be scalable to manage entire campus infrastructure. 

### 2. Problem Statement
Campus infrastructure issues occur daily: 
- Broken fans 
- Leaking taps 
- Damaged furniture 
- WiFi issues 
- Lighting failures 

Currently these problems are reported through: 
- WhatsApp groups 
- Emails 
- Verbal complaints 
- Informal forms 

This causes several operational problems: 
- Complaints get lost 
- No centralized tracking 
- Slow maintenance response 
- Lack of accountability 
- No data analytics on infrastructure issues 

Institutions therefore struggle to maintain infrastructure efficiently. 

### 3. Proposed Solution
InfraMind introduces an AI-powered maintenance management system where complaints are automatically categorized and routed. 

Students submit complaints using a simple web interface. 
Input provided by the user: 
- Photo of the issue 
- Short description 
- Room or location 

The system then uses AI to determine: 
- Issue category 
- Priority level 
- Responsible department 

A maintenance ticket is generated automatically and displayed on the admin dashboard. 

### 4. Example Use Case
**Student reports an issue:** 
- **Room Number:** Hostel A – Room 204 
- **Description:** "Fan not working" 
- **Photo:** Image of broken fan 

**AI processes the complaint and produces:** 
- **Category:** Electrical 
- **Priority:** Medium 
- **Department:** Electrical Maintenance 

**The system generates a ticket:** 
- **Ticket ID:** 1032 
- **Location:** Hostel A – Room 204 
- **Category:** Electrical 

The maintenance team sees the issue on the admin dashboard and resolves it. Students can track ticket progress. 

### 5. System Workflow
**Step 1 – Complaint Submission** 
Student opens the InfraMind web app and submits: 
- Image 
- Description 
- Location 

**Step 2 – AI Issue Classification** 
The AI analyzes the input and determines: 
- Category 
- Priority 
- Department 

**Step 3 – Ticket Generation** 
Backend generates a maintenance ticket and stores it in the database. 

**Step 4 – Admin Dashboard** 
Admins can: 
- View complaints 
- Assign staff 
- Update status 

**Step 5 – Notifications** 
Maintenance staff receive alerts when a new ticket is created. 

### 6. Key Features
**Student Interface** 
- Submit maintenance complaints 
- Upload issue images 
- Track complaint status 

**Admin Dashboard** 
- Centralized complaint management 
- Ticket assignment 
- Maintenance tracking 

**AI Classification** 
The AI automatically identifies the issue category. 
Example categories: 
- Electrical 
- Plumbing 
- Furniture 
- Cleaning 
- Internet 

**Infrastructure Analytics** 
Admins can view analytics such as: 
- Most common issues 
- Issue hotspots 
- Average resolution time 

### 7. Technology Stack
- **Frontend**: Next.js, TailwindCSS 
- **Backend**: Node.js, Express.js 
- **Database**: Firebase Firestore 
- **Authentication**: Firebase Authentication 
- **AI Integration**: OpenAI API or Gemini API 
- **Deployment**: Frontend → Vercel, Backend → Render 
- **Payments (for SaaS model)**: Razorpay 

### 8. AI Tools and Development Tools
**AI Coding Tools** 
- Antigravity 
- Cursor AI 
- GitHub Copilot 

These tools will accelerate development by helping generate: 
- UI components 
- API endpoints 
- Backend logic 

**AI Classification Engine** 
OpenAI API will classify complaints. 

*Example prompt:* 
`Classify the following maintenance issue into one category: Electrical, Plumbing, Furniture, Cleaning, Internet. Return response in JSON format.` 

*Example output:* 
```json
{ "category": "Electrical", "priority": "Medium", "department": "Maintenance" } 
```

### 9. Database Design

**Users Table** 
- `id`
- `name`
- `email`
- `role`

**Complaints Table** 
- `id`
- `user_id`
- `location`
- `description`
- `image_url`
- `category`
- `priority`
- `status`
- `created_at`

**Staff Table** 
- `id`
- `name`
- `department`
- `contact`

**Ticket Assignment Table** 
- `ticket_id`
- `staff_id`
- `status`

### 10. Scalable System Architecture
```text
Users (Students / Admins) 
       ↓ 
Frontend Web App (Next.js) 
       ↓ 
Backend API Layer (Node.js / Express) 
       ↓ 
AI Classification Service 
       ↓ 
Complaint Management Service 
       ↓ 
Database (Firebase) 
       ↓ 
Notification Service 
```
This modular architecture allows InfraMind to scale from hostel maintenance management to complete campus infrastructure intelligence. 

### 11. Business Model
InfraMind will operate as a SaaS platform for institutions. 

**Pricing example:** 
- **Free Plan**: 50 complaints per month 
- **Pro Plan**: ₹999 per month 
- **Enterprise Plan**: ₹4999 per month 

**Target customers:** 
- Universities 
- Colleges 
- Student housing 
- Corporate campuses 

### 12. Team Work Distribution
**Team Size:** 4 Members 

**Frontend Developer** 
Responsible for: 
- Student complaint interface 
- Admin dashboard 
- UI components 

**Backend Developer** 
Responsible for: 
- API development 
- Ticket generation system 
- Database integration 

**AI Engineer** 
Responsible for: 
- AI classification logic 
- Prompt design 
- Error handling 

**Infrastructure Engineer** 
Responsible for: 
- Authentication system 
- Deployment 
- Payment gateway 

### 13. 24-Hour Development Plan
- **Phase 1 – Project Setup (0–3 hours)**: Create frontend and backend structure, Setup Firebase database 
- **Phase 2 – Core Features (3–10 hours)**: Complaint submission, Image upload, Database storage 
- **Phase 3 – AI Integration (10–16 hours)**: AI complaint classification, Category generation 
- **Phase 4 – Admin Dashboard (16–20 hours)**: Ticket dashboard, Status updates 
- **Phase 5 – Deployment (20–24 hours)**: Deploy application, Test full workflow 

### 14. Expected Impact
InfraMind improves campus operations by: 
- Reducing complaint resolution time 
- Centralizing infrastructure management 
- Improving maintenance efficiency 
- Providing infrastructure analytics 

### 15. Long-Term Vision
InfraMind can evolve into a complete infrastructure intelligence platform for: 
- Universities 
- Corporate offices 
- Hospitals 
- Malls 
- Factories 

This creates a scalable solution with significant commercial potential. 
