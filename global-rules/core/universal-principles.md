# Universal Development Principles

This file contains core development principles that apply to **ALL projects**, regardless of technology stack, framework, or language.

## 🎯 Core Philosophy

### KISS (Keep It Simple, Stupid)
Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)
Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### DRY (Don't Repeat Yourself)
Every piece of knowledge should have a single, unambiguous, authoritative representation. Avoid code duplication through abstraction and reuse.

## 🧱 Code Structure & Modularity

### File and Function Limits
- **Never create a file longer than 500 lines of code**. If approaching this limit, refactor by splitting into modules.
- **Functions should be under 50 lines** with a single, clear responsibility.
- **Classes should be under 100 lines** and represent a single concept or entity.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.
- **Line length should be max 100 characters** for readability across different environments.

### Modularity Principles
- **Single Responsibility**: Each function, class, and module should have one clear purpose.
- **Separation of Concerns**: Keep different aspects of functionality (data, logic, presentation) separate.
- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.

### Project Organization
- Group related files by feature, not by file type (feature-based organization)
- Keep configuration files at the project root
- Separate source code, tests, and documentation
- Use clear, descriptive naming conventions

## 🔒 Security & Environment Management

### API Keys & Secrets
- **NEVER hardcode sensitive information** (API keys, passwords, tokens)
- **Always use environment variables** via `.env` files
- **Add `.env` to `.gitignore`** immediately when starting a project
- **Provide `.env.example`** with dummy values for documentation
- **Use environment-specific configs** (.env.development, .env.production)

### Best Practices
- **Input Validation**: Always validate and sanitize user inputs
- **Error Handling**: Never expose sensitive information in error messages
- **Rate Limiting**: Implement proper request throttling for external APIs
- **Authentication**: Follow framework-specific security best practices
- **Dependencies**: Regularly update and audit third-party packages

## 🛡️ File Operation Safety

### CRITICAL: Deletion Guardrails

**NEVER delete files or folders outside the current working project directory without EXPLICIT user permission.**

This is a non-negotiable safety rule. Before ANY deletion operation:

1. **Scope Restriction**: Only delete files within the project's working directory
2. **Explicit Confirmation Required**: For ANY deletion outside the project folder, MUST ask user for explicit permission first
3. **List Before Delete**: Always show the user exactly what files/folders will be deleted before executing
4. **No Silent Deletions**: Never delete files as a side effect of another operation without informing the user

### Deletion Safety Checklist

Before executing any delete operation:
- [ ] Is the file/folder WITHIN the current project directory?
- [ ] If outside project directory → **STOP and ask user for explicit permission**
- [ ] Have you listed all files that will be affected?
- [ ] Has the user confirmed they want this deletion?
- [ ] Is there a backup or can the deletion be undone?

### Safe File Operations

```bash
# ✅ SAFE: Deleting within project directory
rm src/components/OldComponent.tsx
rm -rf node_modules/  # Within project

# ⚠️ REQUIRES EXPLICIT PERMISSION: Outside project directory
# MUST ask user first before executing:
# "I need to delete files outside the project directory at [path].
#  Do you want me to proceed? (yes/no)"

# ❌ FORBIDDEN: Silent deletion outside project
rm -rf ~/some-other-folder  # NEVER do this without asking
rm /usr/local/something     # NEVER do this without asking
```

### Bulk Operations

For operations affecting multiple files:
- **Always list** the files that will be affected first
- **Ask for confirmation** before proceeding with bulk deletions
- **Provide count**: "This will delete X files. Proceed?"
- **Prefer selective deletion** over wildcard patterns when possible

## 🧪 Testing Standards

### Test Coverage
- **Minimum 80% code coverage** for production code
- **Test all critical paths** and business logic thoroughly
- **Include edge cases** and error scenarios
- **Test both happy paths and failure modes**

### Testing Principles
- **Test-Driven Development (TDD)**: Write tests before implementation when appropriate
- **Unit Tests**: Fast, isolated tests for individual functions/components
- **Integration Tests**: Test how components work together
- **End-to-End Tests**: Validate complete user workflows
- **Test Naming**: Use descriptive names that explain what is being tested

### Test Organization
- Mirror source code structure in test directory
- Keep test files close to the code they test
- Use fixtures and factories to reduce test setup duplication
- Mock external dependencies for unit tests

## ✅ Task Management

### Development Workflow
- **Break work into clear steps** with specific completion criteria
- **Mark tasks complete immediately** after finishing
- **Update task status in real-time** as work progresses
- **Test functionality** before marking implementation tasks complete

### Using TodoWrite Tool
- Use for complex, multi-step tasks (3+ distinct steps)
- Create task lists at the start of significant work
- Mark tasks as in_progress before starting (only ONE at a time)
- Mark completed immediately after finishing
- Keep task descriptions clear and actionable

### Using Archon (when available)
- Check Archon for existing tasks before starting work
- Create project-specific tasks for feature tracking
- Use RAG capabilities for documentation lookup
- Update task status throughout development lifecycle

## 🔍 Research & Planning Methodology

### Before Writing Code
1. **Understand requirements** thoroughly
2. **Research existing patterns** in the codebase
3. **Search documentation** for best practices
4. **Plan architecture** before implementation
5. **Identify dependencies** and integration points

### Research Tools
- **Web search extensively** for documentation and examples
- **Study official documentation** as the authoritative source
- **Analyze existing codebase** for established patterns
- **Use MCP servers** (Archon, etc.) for RAG capabilities
- **Consult community resources** (GitHub, Stack Overflow, blogs)

### Pattern Extraction
- Identify reusable architectures and approaches
- Document gotchas and common pitfalls
- Note framework-specific considerations
- Extract integration patterns for external services

## 🎯 Implementation Standards

### Code Quality
- **Write self-documenting code** with clear naming
- **Add comments** for complex logic or non-obvious decisions
- **Follow framework conventions** and best practices
- **Use consistent formatting** throughout the codebase
- **Implement proper error handling** at all levels

### Progressive Development
- **Start simple** and iterate toward complexity
- **Validate early and often** with tests
- **Refactor continuously** as understanding grows
- **Keep commits small** and focused
- **Document decisions** in code comments or commit messages

## 🚫 Anti-Patterns to Always Avoid

- ❌ **Don't over-engineer** simple solutions
- ❌ **Don't skip validation and tests** - quality over speed
- ❌ **Don't create files over 500 lines** - split into modules
- ❌ **Don't mix concerns** in single modules
- ❌ **Don't hardcode configuration** - use environment variables
- ❌ **Don't commit secrets** to version control
- ❌ **Don't ignore errors** - handle them gracefully
- ❌ **Don't optimize prematurely** - make it work, then make it fast
- ❌ **Don't maintain backward compatibility** for new projects - remove dead code
- ❌ **Don't create complex dependency graphs** - keep dependencies simple and testable

## 🔧 Development Tools & Workflow

### Version Control
- Use Git for all projects
- Write clear, descriptive commit messages
- Create feature branches for new work
- Use pull requests for code review
- Keep main/master branch deployable

### Code Review
- Review for logic correctness and edge cases
- Check security implications
- Verify test coverage
- Ensure documentation is updated
- Validate performance considerations

### Continuous Integration
- Run tests automatically on commits
- Enforce linting and formatting checks
- Validate builds before merging
- Monitor code coverage trends

## 📚 Documentation

### Code Documentation
- Document public APIs and interfaces
- Explain complex algorithms or business logic
- Keep documentation close to code (inline comments, docstrings)
- Update docs when code changes

### Project Documentation
- **README.md**: Project overview, setup instructions, basic usage
- **PLANNING.md**: Architecture decisions and design rationale (when using PRPs)
- **TASK.md**: Current work and next steps (when using PRPs)
- **CHANGELOG.md**: Version history and notable changes

## 🎓 Fail Fast Philosophy

- **Check for errors early** in the execution flow
- **Raise exceptions immediately** when issues occur
- **Validate inputs** at system boundaries
- **Use assertions** for developer assumptions
- **Provide clear error messages** that help debugging

These universal principles ensure high-quality, maintainable code across all projects, regardless of specific technology choices.
