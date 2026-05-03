# Flately Documentation Index

> **Complete documentation navigation for the Flately roommate matching platform**  
> **Last Updated**: 2026-05-03

---

## 🚀 Quick Start

New to the project? Start here:

1. **[Project Setup](./project-setup.md)** - Get the app running locally
2. **[Product User Flow](./product-user-flow.md)** - Understand the user journey
3. **[Architecture](./architecture.md)** - System overview and tech stack

---

## 📚 Documentation Categories

### 🎯 Getting Started

| Document | Description | Audience |
|----------|-------------|----------|
| [Project Setup](./project-setup.md) | Installation, configuration, and local development | All developers |
| [Product User Flow](./product-user-flow.md) | Canonical user journey and route contracts | Product + Dev |
| [Architecture](./architecture.md) | High-level system design and tech stack | All developers |

### 🏗️ Architecture & Design

| Document | Description | Audience |
|----------|-------------|----------|
| [Architecture](./architecture.md) | Complete system architecture with diagrams | All developers |
| [UML Diagrams](./UML_DIAGRAMS.md) | All 5 UML diagrams with sources | All developers |
| [Database Schema](./database-schema.md) | Prisma models and ER diagram | Backend devs |
| [Matching Algorithm](./matching-algorithm.md) | Compatibility scoring deep-dive | Backend devs |
| [Class-First System Design Study Guide](./class-first-system-design-study-guide.md) | Design patterns, SOLID principles, viva prep | Students/Reviewers |

### 💻 Implementation Guides

| Document | Description | Audience |
|----------|-------------|----------|
| [Backend Code Reference](./backend-code-reference.md) | Complete backend module reference | Backend devs |
| [Frontend Guide](./frontend-guide.md) | Frontend architecture and patterns | Frontend devs |
| [API Reference](./api-reference.md) | REST + Socket.IO API documentation | All developers |

### ✅ Testing & Verification

| Document | Description | Audience |
|----------|-------------|----------|
| [Manual Auth Verification](./manual-auth-end-to-end-verification.md) | Auth flow testing checklist | QA + Developers |

### 🔮 Planning & History

| Document | Description | Audience |
|----------|-------------|----------|
| [Future Plan](./future-plan.md) | Bug backlog and roadmap | All developers |
| [Historical Archive](./historical-archive.md) | Legacy documentation guide | Maintainers |

---

## 📊 UML Diagrams Quick Reference

All diagrams are source-verified and include both Mermaid (`.mmd`) and PNG (`.png`) formats.

| # | Diagram | Purpose | Files |
|---|---------|---------|-------|
| 1 | **Class Diagram** | 20 classes, design patterns | [.mmd](./svg/1_class_diagram.mmd) · [.png](./svg/1_class_diagram.png) |
| 2 | **Use Case Diagram** | 5 actors, 15 use cases | [.mmd](./svg/2_usecase_diagram.mmd) · [.png](./svg/2_usecase_diagram.png) |
| 3 | **ERD** | 7 database models | [.mmd](./svg/3_erd_diagram.mmd) · [.png](./svg/3_erd_diagram.png) |
| 4 | **Activity Diagram** | User journey flow | [.mmd](./svg/4_activity_diagram.mmd) · [.png](./svg/4_activity_diagram.png) |
| 5 | **Sequence Diagram** | Swipe & match process | [.mmd](./svg/5_sequence_diagram.mmd) · [.png](./svg/5_sequence_diagram.png) |

**Full documentation**: [UML_DIAGRAMS.md](./UML_DIAGRAMS.md)

---

## 🎓 Learning Paths

### For New Developers

1. Start: [Project Setup](./project-setup.md)
2. Understand: [Product User Flow](./product-user-flow.md)
3. Explore: [Architecture](./architecture.md)
4. Deep dive: [Backend Reference](./backend-code-reference.md) or [Frontend Guide](./frontend-guide.md)
5. Test: [Manual Auth Verification](./manual-auth-end-to-end-verification.md)

### For Backend Developers

1. [Architecture](./architecture.md) - System overview
2. [Backend Code Reference](./backend-code-reference.md) - Module details
3. [API Reference](./api-reference.md) - Endpoint contracts
4. [Database Schema](./database-schema.md) - Data models
5. [Matching Algorithm](./matching-algorithm.md) - Core algorithm

### For Frontend Developers

1. [Architecture](./architecture.md) - System overview
2. [Frontend Guide](./frontend-guide.md) - React architecture
3. [API Reference](./api-reference.md) - Backend contracts
4. [Product User Flow](./product-user-flow.md) - Route behavior

### For System Design Review

1. [Class-First System Design Study Guide](./class-first-system-design-study-guide.md) - Patterns & SOLID
2. [UML Diagrams](./UML_DIAGRAMS.md) - Visual architecture
3. [Architecture](./architecture.md) - Technical decisions
4. [Future Plan](./future-plan.md) - Known trade-offs

---

## 🔍 Find Documentation By Topic

### Authentication

- **Overview**: [Architecture § Authentication Flow](./architecture.md#3-authentication-flow-jwt--google-oauth)
- **Backend**: [Backend Reference § Authentication Module](./backend-code-reference.md#authentication-module)
- **Frontend**: [Frontend Guide § Auth Lifecycle](./frontend-guide.md#7-auth-lifecycle)
- **API**: [API Reference § Authentication](./api-reference.md#authentication)
- **Testing**: [Manual Auth Verification](./manual-auth-end-to-end-verification.md)

### Matching & Discovery

- **Algorithm**: [Matching Algorithm](./matching-algorithm.md)
- **Backend**: [Backend Reference § Matching Module](./backend-code-reference.md#matching-module)
- **Backend**: [Backend Reference § Discovery Module](./backend-code-reference.md#discovery-module)
- **API**: [API Reference § Matching Module](./api-reference.md#5-matching-module)
- **API**: [API Reference § Discovery Module](./api-reference.md#6-discovery-module)

### Real-Time Chat

- **Backend**: [Backend Reference § Chat Module](./backend-code-reference.md#chat-module)
- **Frontend**: [Frontend Guide § Chat](./frontend-guide.md#104-chat)
- **API**: [API Reference § Chat Module](./api-reference.md#8-chat-module)
- **API**: [API Reference § Socket.IO Events](./api-reference.md#9-socketio-events-real-time-chat)

### Database

- **Schema**: [Database Schema](./database-schema.md)
- **ERD**: [UML Diagrams § ERD](./UML_DIAGRAMS.md#3-entity-relationship-diagram-erd)
- **Prisma**: [Backend Reference § Configuration](./backend-code-reference.md#configuration)

### Design Patterns

- **Study Guide**: [Class-First System Design Study Guide](./class-first-system-design-study-guide.md)
- **Class Diagram**: [UML Diagrams § Class Diagram](./UML_DIAGRAMS.md#1-class-diagram--architecture--design-patterns)
- **Backend Patterns**: [Backend Reference § Common Patterns](./backend-code-reference.md#common-patterns)

### Deployment & Production

- **Setup**: [Project Setup](./project-setup.md)
- **Environment**: [Architecture § Environment Configuration](./architecture.md#6-environment-configuration)
- **Known Issues**: [Future Plan § Bug Backlog](./future-plan.md#1-confirmed-bug-backlog-prioritized)

---

## 📝 Documentation Standards

### File Naming

- Use kebab-case: `my-document.md`
- Be descriptive: `manual-auth-end-to-end-verification.md` not `auth-test.md`
- Place in `docs/` folder

### Document Structure

All documentation should include:

1. **Title** - Clear, descriptive
2. **Metadata** - Last updated date, purpose, audience
3. **Table of Contents** - For documents > 200 lines
4. **Sections** - Logical hierarchy with headers
5. **Code Examples** - When applicable
6. **Related Links** - Cross-references to other docs

### Diagram Standards

- **Source**: Mermaid `.mmd` files in `docs/svg/`
- **Rendered**: PNG files in `docs/svg/`
- **Naming**: `{number}_{name}_diagram.{mmd|png}`
- **Regenerate**: `npx -y @mermaid-js/mermaid-cli -i <file>.mmd -o <file>.png -b white -s 2`

---

## 🔄 Keeping Documentation Updated

### When to Update

- **Architecture changes** → Update [Architecture](./architecture.md)
- **New API endpoints** → Update [API Reference](./api-reference.md)
- **Database schema changes** → Update [Database Schema](./database-schema.md)
- **New features** → Update [Product User Flow](./product-user-flow.md)
- **Bug fixes** → Update [Future Plan](./future-plan.md)

### Update Checklist

When making significant changes:

- [ ] Update relevant documentation files
- [ ] Update diagrams if architecture changed
- [ ] Update README.md if needed
- [ ] Update this index if new docs added
- [ ] Update "Last Updated" dates
- [ ] Cross-check related documentation links

---

## 🆘 Getting Help

### Documentation Issues

If you find:
- **Broken links** → Check [Historical Archive](./historical-archive.md) for moved content
- **Outdated information** → Check "Last Updated" date and file git history
- **Missing documentation** → Check this index for related topics

### Technical Issues

- **Setup problems** → [Project Setup § Troubleshooting](./project-setup.md)
- **Auth issues** → [Manual Auth Verification § Troubleshooting](./manual-auth-end-to-end-verification.md#troubleshooting)
- **API errors** → [API Reference § Error Response Format](./api-reference.md#10-error-response-format)

---

## 📦 Documentation Assets

### Diagrams

- **Location**: `docs/svg/`
- **Format**: Mermaid (`.mmd`) + PNG (`.png`)
- **Count**: 5 UML diagrams

### Images

- **Location**: `docs/assets/`
- **Files**:
  - `flately-logo.svg` - Logo vector
  - `logo.png` - Logo raster

---

## 🎯 Documentation Goals

This documentation aims to:

1. **Enable rapid onboarding** - New developers productive in < 1 day
2. **Provide single source of truth** - No conflicting information
3. **Support all audiences** - Developers, QA, reviewers, students
4. **Maintain accuracy** - Source-verified, regularly updated
5. **Enable self-service** - Answer questions without asking team

---

## 📊 Documentation Coverage

| Area | Coverage | Key Documents |
|------|----------|---------------|
| **Setup** | ✅ Complete | project-setup.md |
| **Architecture** | ✅ Complete | architecture.md, UML_DIAGRAMS.md |
| **Backend** | ✅ Complete | backend-code-reference.md, api-reference.md |
| **Frontend** | ✅ Complete | frontend-guide.md |
| **Database** | ✅ Complete | database-schema.md |
| **Testing** | ✅ Complete | manual-auth-end-to-end-verification.md |
| **Deployment** | ⚠️ Partial | See future-plan.md FP-003 |
| **Monitoring** | ❌ Missing | Planned for future |

---

## 🔗 External Resources

- **Live Demo**: [https://frontend-roan-one-suwo5dr71s.vercel.app/](https://frontend-roan-one-suwo5dr71s.vercel.app/)
- **Architecture Report**: [Overleaf](https://www.overleaf.com/read/vmcwbjywptnd#2012eb)
- **Project Report**: [Google Drive PDF](https://drive.google.com/file/d/1UGyUvb7UpbkWTcGGqjuzGQ480eA0b9Iz/view?usp=sharing)
- **GitHub Repository**: (Add your repo URL here)

---

## 📞 Contact & Contribution

### The Team

- **Mitul Bhatia** - Team Lead
- **Hardik Maheshwari** - Deployment & User Flow Lead
- **Ajeesh Amreet** - Recommendation & Chat Engineer
- **Akshat Chauhan** - Database Lead
- **Suryansh Singh** - Strategic Lead, UI & Documentation Manager

### Contributing to Documentation

1. Follow documentation standards above
2. Update "Last Updated" dates
3. Cross-reference related documents
4. Test all code examples
5. Verify all links work

---

**Documentation Version**: 2.0  
**Last Updated**: 2026-05-03  
**Total Documents**: 12 core + 5 diagrams
