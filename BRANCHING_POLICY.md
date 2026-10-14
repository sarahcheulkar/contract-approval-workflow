# Branching Strategy & Git Collaboration Policy
**Project:** Dockerized Contract Approval Workflow  
**Lead Developer:** Shruti Gupta (Roll No: 23102C0051)  

---

## 1. Branch Hierarchy

```
  main (Production Releases, Tagged v1.0.0)
   ▲
   │  (Release Merge via PR)
   │
  develop (Active Integration Baseline)
   ▲
   ├── feature/contract-submission (Feature 1: Request & Validation)
   └── feature/approval-decision (Feature 2: Reviewer Actions & Conflict Resolution)
```

### Branch Rules
* `main`: Contains only production-ready, release-tagged code (`v1.0.0`). Direct commits are forbidden.
* `develop`: Integration branch. All features must be merged here through reviewed Pull Requests.
* `feature/<feature-name>`: Short-lived feature branches branched off `develop`.

---

## 2. Commit Message Convention
All commits follow Conventional Commits:
* `feat:` A new user-facing feature (e.g. `feat: implement contract approval rest endpoint`)
* `fix:` A bug fix (e.g. `fix: prevent submission with zero contract amount`)
* `test:` Adding or refactoring tests (e.g. `test: add selenium e2e journey for approval`)
* `ci:` CI/CD pipeline changes (e.g. `ci: add quality gate and screenshot archive in Jenkinsfile`)
* `docs:` Documentation updates (e.g. `docs: update readme with milestone 14 results`)

---

## 3. Pull Request & Code Review Checklist
Before any PR is merged into `develop`:
1. Clean compilation with zero build errors (`mvn compile`).
2. All unit and context tests pass (`mvn test`).
3. Meaningful PR description referencing the Jira / Backlog task ID.
4. At least one peer review approval.
