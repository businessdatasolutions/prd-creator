# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PRD-Builder is a web-based application for creating and managing Product Requirements Documents (PRDs). It features guided content creation, multi-document support, file attachments, and optimized exports for collaborative review workflows.

## Repository Status

- **Current State**: Active development - Core features implemented
- **License**: MIT License (Copyright (c) 2025 businessdatasolutions)
- **Git**: Repository is initialized with main branch
- **Technology Stack**: Vanilla JavaScript, Bootstrap 5, localStorage API
- **Architecture**: Client-side only (no backend required)

## Project Structure

```
prd-creator/
├── index.html           # Main application
├── css/
│   └── styles.css      # Custom styles (apple green theme #52C41A)
├── js/
│   ├── app.js          # Main application logic
│   ├── storage.js      # localStorage management
│   ├── attachments.js  # File upload/attachment handling
│   └── export.js       # Export functionality (pending)
├── tasks/              # PRDs and task lists
├── issues/             # Issue tracking documents
├── tests/              # Unit and integration tests
└── assets/             # Images and icons
```

## Completed Features

- ✅ **Multi-document management** with localStorage persistence
- ✅ **Collapsible form sections** for all PRD components
- ✅ **Auto-save functionality** with visual indicators
- ✅ **File attachment system** with drag-and-drop upload
- ✅ **Storage management** with usage monitoring and warnings
- ✅ **Section completion tracking** with visual progress indicators
- ✅ **Document switching** and management UI

## Known Issues

- **ISSUE-001**: Users cannot edit PRD titles after creation (see `/issues/ISSUE-001-editable-prd-title.md`)

## Development Notes

When implementing new features:
1. Check `/tasks/tasks-prd-prd-builder.md` for the implementation roadmap
2. Create issue documents in `/issues/` for bugs or enhancements
3. Follow existing code patterns in app.js and storage.js
4. Maintain the apple green theme (#52C41A) for consistency
5. Test localStorage limits (5-10MB typical browser limit)
6. Ensure all features work without a backend server

## PRD Creation Guidelines

### Creating a Product Requirements Document (PRD)

When asked to create a PRD:

1. **Ask Clarifying Questions:** Before writing the PRD, ask clarifying questions to gather sufficient detail. Provide options in letter/number lists for easy response. Common areas to explore:
   - Problem/Goal: What problem does this feature solve?
   - Target User: Who is the primary user?
   - Core Functionality: Key actions users should perform
   - User Stories: As a [user], I want to [action] so that [benefit]
   - Acceptance Criteria: Success criteria for implementation
   - Scope/Boundaries: What the feature should NOT do
   - Data Requirements: Data to display or manipulate
   - Design/UI: Mockups or UI guidelines
   - Edge Cases: Potential error conditions

2. **Generate PRD with Required Structure:**
   - Introduction/Overview
   - Goals (specific, measurable objectives)
   - User Stories
   - Functional Requirements (numbered, explicit)
   - Non-Goals (Out of Scope)
   - Design Considerations (Optional)
   - Technical Considerations (Optional)
   - Success Metrics
   - Open Questions

3. **Save PRD:** Save as `prd-[feature-name].md` in `/tasks/` directory

4. **Do NOT start implementing** - only create the PRD document

Target audience: Junior developers (use explicit, unambiguous language)

### Generating Task Lists from PRDs

When asked to generate tasks from a PRD:

1. **Phase 1 - Generate Parent Tasks:**
   - Analyze the PRD and existing codebase
   - Create ~5 high-level parent tasks
   - Present tasks and wait for user confirmation ("Go")

2. **Phase 2 - Generate Sub-Tasks:**
   - After user confirms, break down parent tasks into actionable sub-tasks
   - Follow existing codebase patterns where relevant

3. **Output Format:**
   ```markdown
   ## Relevant Files
   - `path/to/file.ts` - Description
   - `path/to/file.test.ts` - Unit tests
   
   ### Notes
   - Test placement and execution notes
   
   ## Tasks
   - [ ] 1.0 Parent Task Title
     - [ ] 1.1 Sub-task description
     - [ ] 1.2 Sub-task description
   - [ ] 2.0 Parent Task Title
     - [ ] 2.1 Sub-task description
   ```

4. **Save:** As `tasks-[prd-file-name].md` in `/tasks/`

### Processing Task Lists

When implementing tasks:

1. **One sub-task at a time** - Do NOT start next sub-task until user says "yes" or "y"

2. **Completion Protocol:**
   - Mark completed sub-tasks with `[x]`
   - When all sub-tasks under a parent are complete:
     1. Run full test suite
     2. If tests pass, stage changes (`git add .`)
     3. Remove temporary files/code
     4. Commit with descriptive message using conventional format:
        ```
        git commit -m "feat: add payment validation" -m "- Validates card type" -m "Related to T123"
        ```
     5. Mark parent task as `[x]`

3. **Maintain task list:**
   - Update file after significant work
   - Add new tasks as discovered
   - Keep "Relevant Files" section current

4. **Stop after each sub-task** and wait for user approval