# Global Rules for AI Coding Assistants

Global Rules are high-level directives that shape how AI coding assistants behave across entire projects. This directory contains a **universal framework** that works across all project types through modular, composable rule sets.

## 🎯 What Are Global Rules?

Global Rules are:

- **High-level behavioral guidelines** that apply across your entire codebase
- **Modular and composable** - mix and match based on your project needs
- **Technology-agnostic core** with framework-specific extensions
- **Context-aware patterns** that improve AI decision-making

## 📦 Directory Structure

```
global-rules/
├── README.md                           # This file
├── core/
│   └── universal-principles.md         # Core principles for ALL projects
├── workflows/
│   └── prp-methodology.md             # Universal PRP development workflow
├── archon/
│   └── CLAUDE.md                      # Archon MCP integration rules
├── pydantic-ai/
│   └── pydantic-ai-rules.md          # AI agent development with Pydantic AI
├── python/
│   └── rasmus--python-rules.md       # Python development standards
├── nextjs/
│   └── rasmus--nextjs-rules.md       # Next.js app development
├── react/
│   └── rasmus--react-rules.md        # React component development
├── node/
│   └── rasmus--node-rules.md         # Node.js backend development
└── astro/
    └── rasmus--astro-rules.md        # Astro static site generation
```

## 🌟 Universal Rules (Always Loaded)

### Core Principles (`core/universal-principles.md`)

Universal development principles that apply to **every project**:

- **KISS, YAGNI, DRY** - Fundamental design philosophies
- **Code Structure** - File/function limits, modularity patterns
- **Security** - Environment variable management, secret handling
- **Testing** - Coverage requirements, TDD practices
- **Task Management** - TodoWrite and Archon integration
- **Quality Standards** - Universal anti-patterns to avoid

### PRP Methodology (`workflows/prp-methodology.md`)

Structured development workflow for AI-assisted projects:

- **PRP Framework** - Product Requirements Prompt methodology
- **Universal Templates** - PRP structure for any project type
- **Research Guidelines** - Context gathering and planning
- **Validation Standards** - Progressive validation gates
- **Execution Patterns** - One-pass implementation approach

### Archon Integration (`archon/CLAUDE.md`)

MCP server integration for knowledge and task management:

- **Task Management** - Lifecycle and status tracking
- **RAG Capabilities** - Documentation search and retrieval
- **Project Organization** - Feature-level project management
- **Knowledge Base** - Centralized documentation access

## 🎨 Framework-Specific Rules (Conditionally Loaded)

### Pydantic AI (`pydantic-ai/pydantic-ai-rules.md`)

**Use when building AI agents with Pydantic AI:**

- Agent architecture patterns (agent.py, tools.py, models.py)
- Tool decorator standards (@agent.tool, @agent.tool_plain)
- Testing with TestModel and FunctionModel
- Model provider configuration
- Environment variable patterns for agents
- Agent-specific anti-patterns

### Python Development (`python/rasmus--python-rules.md`)

**Use for Python projects:**

- Python-specific code standards
- Package management and virtual environments
- Testing frameworks (pytest, unittest)
- Type hints and mypy
- Linting and formatting (ruff, black)

### Next.js Development (`nextjs/rasmus--nextjs-rules.md`)

**Use when building Next.js applications:**

- App Router patterns
- Server/Client Component architecture
- Routing and navigation
- Data fetching strategies
- Deployment and optimization

### React Development (`react/rasmus--react-rules.md`)

**Use when working with React:**

- Component architecture patterns
- Hooks best practices
- State management approaches
- Performance optimization
- Testing strategies

### Node.js Backend (`node/rasmus--node-rules.md`)

**Use for Node.js APIs and services:**

- Express patterns and middleware
- API design standards
- Error handling
- Database integration
- Authentication patterns

### Astro Sites (`astro/rasmus--astro-rules.md`)

**Use when building Astro websites:**

- Content collections
- Component patterns
- Static generation
- Deployment strategies

## 🚀 How to Use These Rules

### In This Project

The main `CLAUDE.md` file imports these rules using the `![[file.md]]` syntax:

```markdown
# Universal AI Coding Global Rules

## 🎯 Core Development Principles
![[global-rules/core/universal-principles.md]]

## 🔄 PRP Development Workflow
![[global-rules/workflows/prp-methodology.md]]

## 📚 Framework-Specific Rules
![[global-rules/pydantic-ai/pydantic-ai-rules.md]]
![[global-rules/nextjs/rasmus--nextjs-rules.md]]
# ... etc
```

Claude Code automatically loads all imported files into context.

### In Other Projects

**Option 1: Copy the entire global-rules directory**

```bash
cp -r /path/to/this-project/global-rules /path/to/your-project/
```

Then create your CLAUDE.md importing the rules you need.

**Option 2: Copy specific rule files**

```bash
# For a Next.js project
cp global-rules/core/universal-principles.md /your-project/
cp global-rules/workflows/prp-methodology.md /your-project/
cp global-rules/nextjs/rasmus--nextjs-rules.md /your-project/

# Then import in CLAUDE.md
```

**Option 3: Home directory for cross-project rules**

```bash
# Copy to ~/.claude/ for ALL projects
cp -r global-rules ~/.claude/global-rules/

# In ~/.claude/CLAUDE.md
![[global-rules/core/universal-principles.md]]
![[global-rules/workflows/prp-methodology.md]]
```

### For Different AI Assistants

- **Claude Code**: Use `CLAUDE.md`
- **Cursor**: Rename to `.cursorrules`
- **Windsurf**: Rename to `.windsurfrules`
- **Other AI assistants**: Check their configuration format

## 🎯 Project Type Recommendations

### AI Agent Project (Pydantic AI)
```markdown
![[global-rules/core/universal-principles.md]]
![[global-rules/workflows/prp-methodology.md]]
![[global-rules/archon/CLAUDE.md]]
![[global-rules/python/rasmus--python-rules.md]]
![[global-rules/pydantic-ai/pydantic-ai-rules.md]]
```

### Next.js Web Application
```markdown
![[global-rules/core/universal-principles.md]]
![[global-rules/workflows/prp-methodology.md]]
![[global-rules/archon/CLAUDE.md]]
![[global-rules/nextjs/rasmus--nextjs-rules.md]]
![[global-rules/react/rasmus--react-rules.md]]
```

### Python Backend API
```markdown
![[global-rules/core/universal-principles.md]]
![[global-rules/workflows/prp-methodology.md]]
![[global-rules/archon/CLAUDE.md]]
![[global-rules/python/rasmus--python-rules.md]]
```

### Full-Stack Application (Next.js + Node.js)
```markdown
![[global-rules/core/universal-principles.md]]
![[global-rules/workflows/prp-methodology.md]]
![[global-rules/archon/CLAUDE.md]]
![[global-rules/nextjs/rasmus--nextjs-rules.md]]
![[global-rules/react/rasmus--react-rules.md]]
![[global-rules/node/rasmus--node-rules.md]]
```

## ✅ Benefits of This Structure

1. **Universal Core** - Same principles apply across all projects
2. **Modular Loading** - Import only what you need
3. **Easy Maintenance** - Update individual rule files independently
4. **Framework Agnostic** - Add new frameworks easily
5. **Consistent Workflows** - PRP methodology works everywhere
6. **Portable** - Move rules between projects easily
7. **Scalable** - Add more specialized rules as needed

## 🔄 Compatibility

These global rules are designed to be:

- **Non-destructive** - Won't break existing workflows
- **Complementary** - Enhance rather than override
- **Flexible** - Can be selectively applied
- **Composable** - Mix and match as needed
- **Extensible** - Add custom rules for your specific needs

## 📝 Creating Custom Rules

When adding new framework-specific rules:

1. Create a new directory: `global-rules/your-framework/`
2. Add your rules file: `your-framework-rules.md`
3. Focus on framework-specific patterns, not universal principles
4. Document when rules should/shouldn't be used
5. Include code examples showing best practices
6. Test compatibility with the universal core

## 🤝 Contributing

To add new global rules to this collection:

1. Create a new directory under `global-rules/`
2. Include comprehensive rule documentation
3. Ensure compatibility with universal core
4. Update this README with usage guidelines
5. Add examples showing when to use the rules

## 📚 Best Practices

- **Start minimal** - Begin with core + workflow + your main framework
- **Monitor behavior** - Ensure rules improve rather than hinder
- **Iterate gradually** - Refine rules based on actual usage
- **Document conflicts** - Note any incompatibilities discovered
- **Share learnings** - Update rules based on team experience
- **Keep rules focused** - Each file should have a clear, single purpose

## 🎓 Philosophy

This framework is built on these principles:

1. **Universal Foundation** - Core principles transcend technology choices
2. **Structured Workflows** - PRP methodology enables consistent quality
3. **Context Engineering** - Comprehensive context yields better results
4. **Progressive Enhancement** - Add complexity only when needed
5. **Continuous Learning** - Refine patterns based on experience

---

**Welcome to universal AI-assisted development!** These modular global rules enable you to build anything with consistent quality and structured workflows, regardless of technology stack.
