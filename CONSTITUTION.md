# iShootJpeg-Admin AI-Assisted Development Constitution

## Preamble

This constitution establishes immutable principles for AI-assisted agents collaborating on software development. These principles exist to ensure reliability, maintainability, and predictable behavior in code produced through human-AI collaboration. All agents working on this codebase **MUST** adhere to these principles without exception.

**Core Objective:** Produce working, maintainable software that can be understood, modified, and extended by future engineers or agents with minimal cognitive overhead.

---

## I. Foundation Principles

### 1.1 Spec-Driven Development

**Principle:** All features, changes, and refactorings MUST be implemented according to explicit, documented specifications.

**Requirements:**
- No feature implementation begins without a clear specification
- Specifications may come from formal documentation or direct user instructions
- When specifications are ambiguous, the agent MUST request clarification before proceeding
- The agent MUST NOT infer requirements, add "helpful" features, or make assumptions about desired behavior
- All deviations from specifications MUST be explicitly communicated and approved

**Rationale:** Prevents scope creep, hallucinated features, and wasted effort on unwanted functionality.

---

### 1.2 Test-Driven Development

**Principle:** Test cases MUST be created before implementation begins. Implementation is complete only when all tests pass.

**Requirements:**
- Write tests first that define expected behavior
- Tests must be executable, deterministic, and isolated
- Implementation proceeds only after test structure is established
- No code is considered "done" until all tests pass
- Tests must cover happy paths, edge cases, and expected error conditions
- When modifying existing code, update or add tests before changing implementation

**Rationale:** Ensures code works as intended and provides a safety net for future changes.

---

### 1.3 Fail-Fast Validation

**Principle:** Validate all inputs at system boundaries before processing begins. Reject invalid data immediately with actionable error messages.

**Requirements:**
- Validate structure, types, constraints, and business rules at entry points
- Validation failures MUST produce specific, actionable error messages
- Never begin expensive operations (database transactions, file processing, external API calls) with unvalidated data
- Provide clear feedback on what failed validation and how to correct it
- For batch operations, validate the entire batch structure before processing any records

**Rationale:** Prevents wasted processing cycles, expensive rollbacks, and debugging time. Failures should be obvious and immediately fixable.

---

## II. Code Architecture Principles

### 2.1 High Cohesion

**Principle:** Group together logic that belongs together. Each module, class, or function MUST have a clear, singular responsibility.

**Requirements:**
- One module/class/function = one well-defined purpose
- Related functionality lives together; unrelated functionality is separated
- Module names clearly indicate their purpose and scope
- If describing a module's purpose requires the word "and," it likely violates this principle

---

### 2.2 Clear Boundaries & Explicit Contracts

**Principle:** All interfaces, APIs, and function signatures MUST be explicit, minimal, stable, and thoroughly documented.

**Requirements:**
- Every public function, class, and module MUST have explicit JSDoc/TSDoc documentation
- Document parameters, return types, thrown exceptions, and side effects
- TypeScript types alone are insufficient—intent and usage patterns must be documented
- Interfaces expose only what consuming code truly needs
- Breaking changes to public interfaces require explicit approval
- Internal implementation details MUST NOT leak into public contracts

**Rationale:** Explicit contracts enable understanding without reading implementation details and preserve knowledge over time.

---

### 2.3 Minimize Coupling

**Principle:** Avoid hidden dependencies, cross-cutting concerns, and tightly interlocked components.

**Requirements:**
- Use dependency injection over global state or singletons
- Explicit imports only—no implicit dependencies
- Modules communicate through defined interfaces, not shared mutable state
- Changes to one module MUST NOT require changes to unrelated modules
- Third-party dependencies MUST be isolated behind abstraction layers

---

### 2.4 Favor Replaceability

**Principle:** Design each component so it can be swapped, modified, or extended without requiring major changes to other components.

**Requirements:**
- Components depend on abstractions, not concrete implementations
- Business logic is decoupled from infrastructure concerns (databases, APIs, frameworks)
- Replacing a component's internals MUST NOT break its consumers
- Each component has a defined, stable interface that hides implementation details

---

### 2.5 Interface-Agnostic Business Logic

**Principle:** Core business logic MUST be completely decoupled from interface layers (CLI, Web, API).

**Requirements:**
- Business rules, data transformations, and workflows exist in pure functions or modules
- Business logic MUST NOT import or depend on CLI frameworks, web frameworks, or HTTP libraries
- The same business logic module can be called from any interface without modification
- Interface layers are thin adapters that translate requests/responses to/from business logic
- Business logic returns data structures, not formatted output or interface-specific responses

**Rationale:** Prevents rewriting logic when switching or adding interfaces. Enables testing business rules without interface concerns.

---

### 2.6 Promote Reusability Without Overgeneralization

**Principle:** Components should be reusable when appropriate, but not abstracted prematurely.

**Requirements:**
- Build for current, concrete use cases—not hypothetical future scenarios
- Abstract only when duplication becomes painful or error-prone
- No "framework" code or speculative architectures
- Three strikes rule: Extract reusable components only after the third similar implementation
- When in doubt, prefer simple duplication over clever abstraction

---

### 2.7 Preserve Legibility & Predictability

**Principle:** Structure code so behavior can be predicted from structure alone, without diving into internals.

**Requirements:**
- Clear, descriptive naming for all functions, variables, and types
- Consistent patterns throughout the codebase
- Control flow should be obvious from reading function signatures and structure
- Avoid clever tricks, obscure language features, or "magic"
- Code reads like well-structured prose—top to bottom, general to specific

---

### 2.8 Encapsulate Complexity

**Principle:** Hide internal mechanisms. Provide clean, documented surfaces. Unavoidable complexity lives in the smallest possible area.

**Requirements:**
- Complex logic is isolated within single modules or functions
- Public interfaces are simple, even if internals are complex
- Complexity never leaks across module boundaries
- When complexity cannot be avoided, document why it exists and how it works
- Prefer 10 simple modules over 1 complex module

---

## III. Operational Principles

### 3.1 Idempotent Operations

**Principle:** Design all operations to be safely repeatable without unintended side effects.

**Requirements:**
- Running the same operation multiple times produces the same result
- Operations check current state before making changes
- Use upsert patterns instead of insert-only patterns
- File operations check for existence before creating
- Database operations use conflict resolution strategies (ON CONFLICT, IF NOT EXISTS)
- External API calls use idempotency keys where supported
- Provide clear operation IDs or correlation IDs for tracking retries

**Rationale:** Enables safe retry logic for failed operations without data duplication or corruption.

---

### 3.2 Structured Logging & Traceability

**Principle:** All operations MUST produce structured, searchable logs that enable rapid debugging and operational visibility.

**Requirements:**
- Use structured logging libraries (JSON output) with consistent field names
- Every log entry includes: timestamp, severity level, correlation ID, module/function name
- Log all: operation starts, completions, failures, and key decision points
- Include relevant context: user IDs, record counts, file names, external request IDs
- Errors include: stack traces, input parameters, and current state
- For batch operations, log progress at reasonable intervals
- Never log sensitive data (passwords, tokens, PII without redaction)
- Log levels follow consistent semantics: DEBUG, INFO, WARN, ERROR, FATAL

**Rationale:** When operations fail, administrators need to quickly identify what failed, where, and why—enabling fast retries or corrections.

---

### 3.3 Explicit Resource Limits & Capacity Boundaries

**Principle:** Define and enforce explicit limits for resource-intensive operations. Document limits in code and expose them in error messages.

**Requirements:**
- Set maximum batch sizes (CSV rows, concurrent operations, file sizes)
- Configure timeout values for all external calls and long-running operations
- Define database connection pool sizes and query timeouts
- Enforce memory limits for in-memory operations
- Document all limits in code comments and error messages
- When limits are exceeded, error messages MUST state the limit and current value
- Limits should be configurable but have safe, documented defaults

**Rationale:** Prevents resource exhaustion, unpredictable failures, and production surprises. Makes system behavior predictable.

---

### 3.4 Environment-Based Configuration

**Principle:** All configuration MUST be externalized through environment variables. No secrets or environment-specific values in code.

**Requirements:**
- Use environment variables exclusively for configuration
- Provide a documented template (.env.example) listing all required variables
- Validate required environment variables at application startup
- Fail immediately with clear messages if required configuration is missing
- Use environment variables for: database URLs, API keys, feature flags, resource limits
- No default values for secrets or credentials
- Environment variables should have consistent naming conventions (SCREAMING_SNAKE_CASE)

**Rationale:** Simplifies deployment, enhances security, enables environment portability without code changes.

---

## IV. Version Control & Evolution

### 4.1 Versioned Evolution Through Branch Discipline

**Principle:** All code changes MUST flow through version control with deliberate branching that protects stability, supports experimentation, and preserves complete history.

**Requirements:**
- Never commit directly to main/production branches
- Use feature branches for all changes: `feature/description`, `fix/description`
- Branch names must be descriptive and indicate purpose
- Commits must have clear, descriptive messages explaining what and why
- Each commit should be atomic—represents one logical change
- Pull requests/merge requests are required for code review (even in AI-assisted work)
- Tag releases with semantic versioning
- Preserve full git history—no force pushes to shared branches

**Rationale:** Protects stability, enables rollback, maintains audit trail, supports parallel development efforts.

---

## V. Quality Gates

### 5.1 Definition of Done

Code is not complete until ALL of the following are true:

- [ ] Specification exists and is understood
- [ ] Tests are written and passing (unit, integration as appropriate)
- [ ] Code follows all architecture principles in Section II
- [ ] All public interfaces have explicit documentation (JSDoc/TSDoc)
- [ ] Structured logging is in place for key operations
- [ ] Error handling is complete with actionable error messages
- [ ] Configuration is externalized to environment variables
- [ ] Resource limits are defined and enforced
- [ ] Code is committed to a feature branch with clear messages
- [ ] No warnings or linting errors
- [ ] Idempotency is verified for data operations

---

### 5.2 Agent Self-Check Protocol

Before presenting any code, the agent MUST verify:

1. **Specification Alignment:** Does this code implement exactly what was specified?
2. **Test Coverage:** Are there passing tests for this code?
3. **Boundary Clarity:** Are interfaces explicit and documented?
4. **Coupling Assessment:** Does this introduce unnecessary dependencies?
5. **Logging Presence:** Will operators be able to debug this?
6. **Resource Safety:** Are limits enforced? Is idempotency ensured?
7. **Configuration Externalization:** Are there any hardcoded values that should be environment variables?

If any check fails, the agent MUST revise before presenting the code.

---

## VI. Enforcement

### 6.1 Non-Negotiable Requirements

These principles are **NOT suggestions**. They are requirements. When conflicts arise between speed and adherence to this constitution, adherence wins.

### 6.2 Clarification Protocol

When the agent encounters ambiguity or conflict between principles and instructions:
1. **STOP** implementation immediately
2. **COMMUNICATE** the specific conflict or ambiguity
3. **AWAIT** explicit guidance before proceeding
4. **NEVER** guess, assume, or "do what seems best"

### 6.3 Continuous Improvement

This constitution may evolve, but only through explicit agreement. Suggested improvements should be documented and discussed, not unilaterally implemented.

---

## Conclusion

This constitution exists to enable successful collaboration between human developers and AI agents. By following these principles, we ensure that code is reliable, maintainable, and behaves predictably—even when the original author is unavailable or when future agents interact with the codebase.

**Every line of code is a commitment. Make it count.**


