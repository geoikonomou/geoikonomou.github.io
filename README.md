# GraphQL Profile Dashboard

A lightweight frontend project that authenticates a user, queries personal school data through GraphQL, and turns that data into a clear, visual profile.

## What This Project Demonstrates

- Authentication with JWT (signin + logout)
- Authorized GraphQL data access (user-scoped)
- Data storytelling through SVG charts
- Practical UI/UX decisions for clarity, errors, and responsiveness

## Core Requirements Covered

- Login with username/password or email/password
- Proper invalid-credentials feedback
- Profile with 3 information sections
- Dedicated 4th section for statistics
- At least 2 different SVG graphs
- All required query styles:
  - Normal query
  - Nested query
  - Argument-based query
- Hosted deployment

## Technical Direction

- API access via GraphQL endpoint with `Bearer` token
- Section-oriented data model: identity, performance, and progress metrics
- Deterministic transformations before rendering:
  - aggregate totals
  - pass/fail counts
  - time-series progression
- SVG-first graph rendering for full control and audit transparency

## Why This Approach

The project is designed to validate data correctness before visual polish. Authentication and query reliability are treated as first priorities, then charts and UI refinement are layered on top. This reduces risk and keeps audit verification straightforward.

## Audit Readiness Checklist

- Invalid login shows a clear error
- Valid login reveals all required sections
- Section values match GraphiQL queries
- Graph values match source data
- Hosted URL is reachable
- Logout clears session correctly

## Status

Planning and audit criteria are documented in [PROJECT_PLAN.md](PROJECT_PLAN.md).
