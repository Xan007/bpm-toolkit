# BPM Toolkit

An interactive web application designed to identify, map, prioritize, and document organizational processes. The platform implements the standard methods and formal templates defined in *Fundamentals of Business Process Management* (Marlon Dumas, Marcello La Rosa, Jan Mendling, Hajo A. Reijers).

---

## Overview

### What is Business Process Management (BPM)?
Business Process Management (BPM) is a systematic discipline that combines principles, methods, and tools to identify, discover, analyze, redesign, execute, and monitor business processes. A business process is a chain of related events, activities, and decision points that involve multiple actors and resources to deliver an outcome of value to a customer.

This toolkit focuses on the **Process Identification** phase of the BPM lifecycle, addressing two critical steps:
1. **Process Architecture (Designation):** Enumerating the organization's processes, categorizing them into Management, Core, and Support, and defining their horizontal sequence and vertical hierarchy.
2. **Process Selection (Prioritization):** Assessing processes across strategic importance, operational health, and feasibility to prioritize improvement initiatives.

---

## Key Modules

### 1. Company & Process Inventory (`/inventory`)
* Interactive Kanban-style board for structuring processes into Management, Core (Value Chain), and Support categories.
* Sequential ordering and sub-group grouping for end-to-end core processes.
* Organizational context management and pre-configured reference datasets (Higher Education, Retail & Logistics, Engineering & Consulting, Public Transport).

### 2. Process Portfolio Matrix (`/portfolio`)
* Interactive 2x2 matrix plotting **Health** (1-5) against **Strategic Importance** (1-5), with **Feasibility** represented as bubble gradients.
* Automated label conflict resolution and guide lines for multi-process clusters.
* Real-time drag-and-drop node placement with coordinate-to-rating synchronization.
* Multi-format export: Draw.io (`.drawio`), PNG, SVG, JPEG, PDF, and clean Word/Docs tables.

### 3. Process Architecture (`/architecture`)
* Automated generation of standard three-tier process landscape maps (Management at the top, sequential Core chevron value chains in the middle, Support at the bottom).
* Integrated Draw.io visual editor embedding with bidirectional XML sync.
* Multi-format export: Draw.io XML, PNG, SVG, JPEG, and PDF.

### 4. Process Profile (`/profile`)
* Standardized process specification sheets following the formal framework from Chapter 2 (Figure 2.7 / 2.15).
* Structured fields: Process Owner, Vision, Customer, Customer Expectation, Outcome, Trigger, First/Last Activity, Inbound/Outbound Interfaces, Required Resources (Human, Information, Work Environment), and Key Performance Measures.
* Built-in interactive guidance with theoretical foundations, identification criteria, and reference examples.
* One-click 10pt clean table clipboard copy (for Word/Docs) and PDF export.

---

## Tech Stack

* **Framework:** React 19 + TypeScript
* **Build Tool:** Vite 8
* **Styling:** Tailwind CSS 4
* **Diagramming Engine:** Draw.io Embed API + SVG Manipulation
* **PDF Export:** jsPDF
* **Drag and Drop:** @hello-pangea/dnd

---

## Getting Started

### Prerequisites
* Node.js 18.0 or higher
* npm 9.0 or higher

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Xan007/bpm-toolkit.git
cd bpm-toolkit
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

---

## Project Structure

```
src/
├── components/            # UI components and modals
│   ├── modals/            # Process creation, deletion, assignment modals
│   ├── CompanyProfileSection.tsx
│   ├── Header.tsx
│   ├── LoadExampleSection.tsx
│   ├── ProcessBoard.tsx
│   └── ProcessCard.tsx
├── hooks/                 # Custom React hooks (useBPMState)
├── apqc.ts                # APQC PCF taxonomy definitions
├── ArchitectureView.tsx   # Process Architecture map and Draw.io integration
├── PortfolioView.tsx      # 2x2 Process Portfolio Matrix
├── ProcessProfileView.tsx # Standardized Process Profile sheet
├── drawio.ts              # Draw.io XML generators and parsers
├── examples.ts            # Pre-configured industry datasets
├── portfolioLayout.ts     # Label layout and cluster collision resolution
└── types.ts               # Core TypeScript definitions
```

---

## References

* Dumas, M., La Rosa, M., Mendling, J., & Reijers, H. A. (2018). *Fundamentals of Business Process Management* (2nd ed.). Springer.

---

## License

This project is licensed under the MIT License.

