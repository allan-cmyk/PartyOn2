# PRP (Product Requirements Prompt) Methodology

The PRP framework is a universal structured methodology for AI-assisted development that works across **all project types**: web applications, APIs, AI agents, scripts, mobile apps, and more.

## 🎯 What is PRP?

**PRP = PRD (Product Requirements Document) + Curated Context + Implementation Blueprint**

A PRP provides everything an AI coding assistant needs to deliver production-ready software in a single pass:
- **Business Context**: What needs to be built and why
- **Technical Context**: File paths, patterns, architecture, gotchas
- **Implementation Blueprint**: Step-by-step development approach
- **Validation Framework**: Testing strategy and acceptance criteria

## 🔄 The PRP Workflow

### Universal Pattern (All Projects)

```
1. Define Requirements → PRPs/INITIAL.md
2. Generate PRP → /generate-prp PRPs/INITIAL.md
3. Review & Refine → Validate PRP completeness
4. Execute PRP → /execute-prp PRPs/generated-prp.md
5. Validate → Run validation gates and tests
```

### Two Approaches Based on Project State

#### **For New Projects / Greenfield Development**

1. **Create INITIAL.md** with your requirements:
   ```markdown
   # INITIAL.md

   ## FEATURE
   [What needs to be built]

   ## EXAMPLES
   [Reference implementations, similar projects]

   ## DOCUMENTATION
   [Links to framework docs, APIs, libraries]

   ## OTHER CONSIDERATIONS
   [Gotchas, constraints, performance requirements]
   ```

2. **Run /generate-prp** to research and create comprehensive PRP
3. **Review generated PRP** for completeness and accuracy
4. **Execute with /execute-prp** for implementation

#### **For Existing Codebases**

1. **Codebase Investigation**:
   - AI analyzes existing architecture and patterns
   - Identifies relevant components and dependencies
   - Documents current implementation approaches
   - Run `/primer` or tell AI to explore specific areas

2. **Research & Planning Phase**:
   - Collaborate with AI: "Investigate X, think about options, write a report"
   - Generate investigation reports documenting findings
   - Web search + MCP for best practices
   - Back-and-forth discussions to refine approach

3. **PRP Creation for Features**:
   - Once confident: `/generate-prp "create PRP following findings report"`
   - Create smaller, focused PRPs for individual features
   - Each PRP targets specific functionality

## 📋 PRP Structure (Universal Template)

```markdown
## Goal
[What needs to be built - specific end state]

## Why
[Business justification and user value]

## What
[Detailed feature specification with success criteria]

## All Needed Context

### Documentation
- [Framework docs with specific URLs]
- [API documentation]
- [Library references]

### File Paths & Existing Patterns
- Relevant files: [list with paths]
- Existing patterns to follow: [examples from codebase]
- Architecture constraints: [project-specific]

### Library Versions & Gotchas
- [Package versions and compatibility notes]
- [Known issues and workarounds]
- [Performance considerations]

## Implementation Blueprint

### Step-by-Step Approach
1. [First implementation step]
2. [Second implementation step]
3. [Continue until complete]

### Architecture Decisions
- [Key architectural choices]
- [Integration patterns]
- [Error handling strategy]

## Validation Loop

### Validation Gates (Must be Executable)
```bash
# Example for different project types:

# Python projects
ruff check --fix && mypy . && pytest tests/ -v

# Next.js projects
npm run lint && npm run type-check && npm run test && npm run build

# Node.js API
npm run lint && npm test && npm run build
```

### Acceptance Criteria
- [ ] [Specific feature requirement 1]
- [ ] [Specific feature requirement 2]
- [ ] [Performance benchmark met]
- [ ] [Security requirements satisfied]
- [ ] [Tests passing with >80% coverage]
```

## 🎨 Project-Specific PRP Templates

### Web Application PRP (Next.js, React, Astro)
**Additional Sections:**
- **UI/UX Requirements**: Component specs, responsive behavior
- **State Management**: Global vs local state patterns
- **Routing**: Page structure and navigation
- **API Integration**: Endpoint usage and data flow
- **Performance**: Loading states, optimization requirements

### Backend API PRP (Node.js, Python FastAPI)
**Additional Sections:**
- **API Endpoints**: Routes, methods, request/response schemas
- **Data Models**: Database schema, validation rules
- **Authentication**: Auth strategy and implementation
- **Error Handling**: Standard error responses
- **Performance**: Rate limiting, caching strategy

### AI Agent PRP (Pydantic AI, LangChain)
**Additional Sections:**
- **Tools**: Required functionality and interfaces
- **Dependencies**: External services and configurations
- **System Prompts**: Instructions for agent behavior
- **Testing Strategy**: TestModel/FunctionModel usage
- **Model Configuration**: Provider setup and fallbacks

### Script/Utility PRP (Python, Node)
**Additional Sections:**
- **CLI Interface**: Arguments, flags, help text
- **Input/Output**: File formats, data sources
- **Error Handling**: User-facing error messages
- **Configuration**: Environment variables, config files

## ✅ PRP Best Practices

### Context Engineering Principles
1. **Be Comprehensive**: Include ALL necessary context upfront
2. **Reference Examples**: Point to actual code patterns to follow
3. **Document Gotchas**: Call out known issues and workarounds
4. **Specify Versions**: Library versions prevent compatibility issues
5. **Include Validation**: Executable commands the AI can run

### Writing Effective PRPs
- **Use specific file paths** instead of general descriptions
- **Include code snippets** showing patterns to follow
- **Link to documentation** with exact URLs
- **Define success metrics** quantitatively
- **Plan for errors** with explicit handling strategy

### Validation Gates
- **Must be executable** by the AI coding assistant
- **Should be progressive**: syntax → types → tests → integration
- **Include coverage requirements**: min 80% for production code
- **Check security**: linting, dependency audits
- **Verify deployment**: build succeeds, no warnings

## 🔍 Research Phase Guidelines

### Before Writing a PRP

1. **Understand the Domain**
   - Research the problem space thoroughly
   - Study existing solutions and approaches
   - Identify common patterns and best practices

2. **Analyze the Codebase** (for existing projects)
   - Find similar features already implemented
   - Identify conventions and patterns to follow
   - Locate files that will need changes

3. **Gather External Resources**
   - Framework documentation (official sources)
   - Library APIs and examples
   - Blog posts and tutorials
   - GitHub repositories with similar features

4. **Document Gotchas**
   - Framework version issues
   - Library compatibility problems
   - Performance considerations
   - Security implications

### Research Tools
- **Web Search**: Official docs, tutorials, Stack Overflow
- **Archon MCP**: RAG queries for indexed documentation
- **Codebase Analysis**: Glob, Grep, Read tools
- **Example Projects**: GitHub, CodeSandbox, official examples

## 🎯 Quality Checklist

Before executing a PRP, verify:

- [ ] **Goal is specific** and measurable
- [ ] **Why provides clear value** to users/business
- [ ] **What includes success criteria** that are testable
- [ ] **All needed context included**: docs, paths, patterns, versions
- [ ] **Implementation blueprint is step-by-step** and actionable
- [ ] **Validation gates are executable** commands
- [ ] **Acceptance criteria are specific** and verifiable
- [ ] **References existing patterns** from codebase (if applicable)
- [ ] **Error handling is documented**
- [ ] **Performance requirements are defined**

## 🚀 Execution Guidelines

### During PRP Execution
1. **Follow the blueprint sequentially** - don't skip steps
2. **Run validation gates progressively** - catch issues early
3. **Test continuously** - validate each component as built
4. **Handle errors gracefully** - implement as specified in PRP
5. **Document decisions** - note any deviations from plan

### After PRP Execution
1. **Run all validation gates** - ensure everything passes
2. **Review acceptance criteria** - confirm all are met
3. **Update documentation** - reflect implementation changes
4. **Create follow-up PRPs** - for discovered improvements

## 🔄 Iterative Refinement

### When a PRP Fails
- **Analyze the gap**: What context was missing?
- **Update the PRP**: Add missing information
- **Re-execute**: Try again with improved context
- **Document learnings**: Update PRP template for future use

### Continuous Improvement
- Track PRP success rates by project type
- Build library of successful PRP patterns
- Refine templates based on experience
- Share effective PRPs across team

## 💡 Benefits of PRP Methodology

✅ **One-Pass Implementation** - Comprehensive context enables success on first try
✅ **Reduced Iterations** - Minimal back-and-forth clarifications
✅ **Production Ready** - Testing and validation built-in
✅ **Reproducible** - Same PRP produces consistent results
✅ **Knowledge Capture** - PRPs document decisions and rationale
✅ **Team Alignment** - Clear requirements visible to all
✅ **AI Optimized** - Structured for LLM understanding

The PRP methodology transforms AI coding from exploratory conversations into structured, repeatable engineering workflows that deliver high-quality results across any project type.
