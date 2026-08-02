# MISSION: PROACTIVE FRONT-END RESEARCH & INTEGRATION

This is an **ongoing, per-task protocol**. Run this file's steps every time a non-trivial frontend UI/UX feature, complex animation, WebGPU canvas, or styling decision comes up. It must contain no hardcoded project name — always resolve `{{PROJECT_NAME}}` from the actual current repository.

**Reminder: This protocol exists to make the ONE existing OpenCode agent a World-Class Front-End Architect. Every finding here should sharpen the same agent's judgment regarding UI components, animations, and aesthetic design, not add a second personality.**

## MANDATORY PROTOCOL

BEFORE suggesting frontend code, designing components, or building animations, you MUST execute the following sequence:

1. **CONSULT (Local Memory)**
   - Read relevant docs already in `.ai/docs/` and existing frontend skills in `.opencode/skills/`.
   - Use **[codebase-memory-mcp]** to check if a similar component or animation hook already exists in the project.

2. **THINK (Logic Structuring)**
   - Trigger **[sequential-thinking]** if the requested UI involves complex state changes, GSAP timelines interacting with React state, or WebGPU render passes. Map out the logic before writing code.

3. **SEARCH & SCRAPE (Deep Research)**
   - Use **[scrapling]** or **[firecrawl]** to actively scrape the latest best practices for the required feature from our core design references.
   - **Primary UI/UX Targets:** 
     - *Impeccable Design System:* `https://github.com/pbakaus/impeccable` & `https://impeccable.style/docs/`
     - *Premium Aesthetics:* `https://github.com/Leonxlnx/taste-skill` and `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
   - **Component & Architecture Targets:** 
     - *SkillUI:* `https://github.com/amaancoderx/npxskillui`
     - *Awesome Design Tokens:* `https://github.com/VoltAgent/awesome-design-md`
   - **Animation & Performance Targets:** 
     - *WebGPU Integration:* `https://github.com/dgreenheck/webgpu-claude-skill`
     - *GSAP/Framer:* Search for `"Best practice GSAP timeline React [year]"` or `"Framer Motion complex orchestrations"`.

4. **VERIFY (UI Testing Awareness)**
   - Plan how the generated component will be tested. Keep **[playwright]** in mind for visual regression and animation testing.

5. **INTEGRATE**
   - Read the actual extracted implementation docs.
   - Apply the exact styling principles (e.g., Brutalism, Minimalist, Impeccable utility classes) requested by the reference skills.
   - Ensure shadcn UI components are extended cleanly using `cva` and `cn()` utilities.

## OUTPUT DIRECTIVE

If frontend research changes your approach or provides a new architectural pattern, start your response with:
`🔍 FRONT-END RESEARCH FINDING: [Summary of Impeccable/Taste/WebGPU/GSAP best practice] — Extracted via [Scrapling/Firecrawl] from [Source Link].`

Do not guess frontend syntax. Always scrape, think, and execute with absolute precision.