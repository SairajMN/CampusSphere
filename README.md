# CampusSphere

> **Next-Generation Campus Event Management Platform**
>
> A modern, full-stack event management system designed specifically for college campuses, enabling seamless event creation, approval workflows, attendee tracking, and real-time notifications.

---

## 📋 Project Overview

CampusSphere is a monorepo containing:
- ✅ Cross-platform mobile application (React Native / Expo)
- ✅ Backend REST API server (Node.js / Express)
- ✅ Shared type definitions & validation schemas
- ✅ Database layer with Drizzle ORM
- ✅ Auto-generated API clients
- ✅ UI component sandbox & design system

---

## 🏗️ System Architecture

```mermaid
graph TD
    A["Mobile App (React Native)"] --> B["API Gateway"]
    B --> C["Auth Middleware"]
    C --> D["Business Logic Layer"]
    D --> E["Database (SQLite / PostgreSQL)"]
    D --> F["Notification Service"]
    D --> G["Analytics Engine"]
    
    style A fill:#4ECDC4,color:white
    style B fill:#FF6B6B,color:white
    style C fill:#45B7D1,color:white
    style D fill:#96CEB4,color:white
    style E fill:#FFEAA7,color:black
    style F fill:#DDA0DD,color:white
    style G fill:#98D8C8,color:black
```

---

## 🚀 Core Features

| User Role         | Capabilities                                                                 |
|-------------------|-----------------------------------------------------------------------------|
| **Student**       | Browse events, register, view calendar, receive notifications, scan QR     |
| **Event Organizer**| Create events, manage attendees, view analytics, send updates              |
| **Admin**         | Approve events, manage users, platform analytics, system configuration     |
| **Guest**         | View public events, login / sign up                                         |

---

## 🔄 Workflow Diagrams

### Event Lifecycle Workflow

```mermaid
stateDiagram-v2
    [*] --> Draft: Organizer creates event
    Draft --> Submitted: Submit for approval
    Submitted --> PendingReview: Admin notified
    PendingReview --> Approved: Admin approves
    PendingReview --> Rejected: Admin rejects
    Rejected --> Draft: Organizer edits
    Approved --> Published: Event goes live
    Published --> Open: Registration opens
    Open --> Ongoing: Event starts
    Ongoing --> Completed: Event ends
    Completed --> Archived: After 30 days
    Archived --> [*]
```

### Approval Workflow

```mermaid
graph LR
    A[Event Created] --> B{Needs Approval?}
    B -->|Yes| C[Send to Admin Queue]
    B -->|No| D[Auto Publish]
    C --> E[Admin Notification]
    E --> F{Approve?}
    F -->|Yes| G[Publish Event]
    F -->|No| H[Send Feedback]
    H --> I[Organizer Updates Event]
    I --> C
    G --> J[Notify All Subscribers]
```

---

## 👤 User Flows

### Student User Flow

```mermaid
journey
    title Student Event Discovery Journey
    section Open App
      Login: 5: Student
      Home Dashboard: 4: Student
    section Discover Events
      Browse Events: 5: Student
      Filter / Search: 4: Student
      View Event Details: 5: Student
    section Participation
      Register for Event: 5: Student
      Receive Confirmation: 4: System
      Add to Calendar: 3: Student
      Get Reminders: 5: System
    section Attend Event
      Scan QR Code: 5: Student
      Check-in: 4: Organizer
      Provide Feedback: 3: Student
```

### Organizer Event Creation Flow

```mermaid
graph TD
    A[Login] --> B[Create New Event]
    B --> C[Enter Event Details]
    C --> D[Upload Banner / Media]
    D --> E[Set Registration Limits]
    E --> F[Configure Date & Time]
    F --> G[Add Location]
    G --> H[Preview Event]
    H --> I{Submit for Approval?}
    I -->|Yes| J[Submit]
    I -->|No| K[Save as Draft]
    J --> L[Wait for Approval]
    L --> M[Event Published]
    M --> N[View Registrations]
    N --> O[Manage Attendees]
```

### Admin Moderation Flow

```mermaid
sequenceDiagram
    participant O as Organizer
    participant S as System
    participant A as Admin

    O->>S: Submit Event
    S->>A: Push Notification
    A->>S: Open Approval Queue
    A->>S: Review Event Details
    alt Approved
        A->>S: Approve Event
        S->>O: Event Approved Notification
        S->>S: Publish Event
        S->>S: Notify Interested Users
    else Rejected
        A->>S: Reject with Feedback
        S->>O: Rejection Notification + Comments
        O->>S: Edit & Resubmit
    end
```

---

## 🛠️ Technology Stack

| Layer               | Technologies                                                                 |
|---------------------|-----------------------------------------------------------------------------|
| **Mobile Frontend** | React Native, Expo Router, TypeScript, Tamagui, React Query                 |
| **Backend**         | Node.js, Express.js, Zod, Winston Logger                                    |
| **Database**        | Drizzle ORM, SQLite (dev) / PostgreSQL (prod)                               |
| **API**             | OpenAPI 3.0, Orval Code Generation, tRPC patterns                           |
| **Tooling**         | PNPM Workspaces, Turborepo, ESLint, Prettier, TypeScript                    |
| **Dev Tools**       | Mockup Sandbox, Storybook, Hot Reload                                       |

---

## 📦 Repository Structure

```
CampusSphere/
├── artifacts/
│   ├── api-server/              # Backend API Server
│   ├── campus-events/           # React Native Mobile App
│   └── mockup-sandbox/          # UI Component Playground
├── lib/
│   ├── api-spec/                # OpenAPI Specification
│   ├── api-client-react/        # Generated React API Client
│   ├── api-zod/                 # Zod Validation Schemas
│   └── db/                      # Database Schema & Client
├── scripts/                      # Utility Scripts
└── package.json
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 20+
- PNPM 8+
- Expo CLI
- iOS Simulator / Android Emulator (for mobile development)

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/SairajMN/CampusSphere.git
cd CampusSphere

# 2. Install dependencies
pnpm install

# 3. Build all packages
pnpm build

# 4. Start development servers
pnpm dev
```

### Individual Workspaces

```bash
# Start API Server
pnpm dev:api

# Start Mobile App
pnpm dev:app

# Start Component Sandbox
pnpm dev:sandbox
```

---

## 🧪 Development Workflow

```mermaid
graph TD
    A[Create Feature Branch] --> B[Implement Changes]
    B --> C[Run Type Checks]
    C --> D[Run Linting]
    D --> E[Test Changes]
    E --> F[Commit Changes]
    F --> G[Open Pull Request]
    G --> H[CI Checks Run]
    H --> I[Code Review]
    I --> J[Merge to Main]
    J --> K[Auto Deploy]
```

---

## 📊 Database Schema Overview

```mermaid
erDiagram
    USERS ||--o{ EVENTS : creates
    USERS ||--o{ EVENT_REGISTRATIONS : registers
    EVENTS ||--o{ EVENT_REGISTRATIONS : has
    EVENTS ||--o{ NOTIFICATIONS : triggers

    USERS {
        int id PK
        string email
        string name
        enum role
        datetime created_at
    }

    EVENTS {
        int id PK
        string title
        text description
        datetime start_time
        datetime end_time
        string location
        enum status
        int organizer_id FK
    }

    EVENT_REGISTRATIONS {
        int id PK
        int event_id FK
        int user_id FK
        boolean checked_in
        datetime registered_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        string body
        boolean read
        datetime created_at
    }
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant S as Server

    U->>A: Enter Credentials
    A->>S: POST /api/auth/login
    S->>S: Validate Credentials
    S-->>A: JWT Token + Refresh Token
    A->>A: Store Tokens Securely
    A->>U: Redirect to Dashboard

    Note over A,S: Subsequent Requests
    A->>S: Request with Authorization Header
    S->>S: Verify JWT Signature
    S-->>A: Response Data
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## ⭐ Support

For support, email campussphere@example.com or open an issue in the repository.

---

<div align="center">
<sub>Built with ❤️ by MCA Devs Team</sub>
</div>