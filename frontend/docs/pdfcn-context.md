# Introduction

Copy-paste PDF components for React. Built on Takumi and Forme, works with the shadcn CLI.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



**pdfcn** provides beautifully designed, accessible, and customizable PDF components. Built on [Takumi](https://takumi.kane.tw/docs/pdf) and [Forme](https://docs.formepdf.com), and designed to work seamlessly with the [shadcn CLI](https://ui.shadcn.com).

## Philosophy [#philosophy]

pdfcn follows the shadcn model for document generation: copy-paste components you can own, with zero lock-in and sensible defaults that work immediately.

PDF layouts are often treated as one-off templates — assembled with renderer-specific primitives, duplicated styling, and brittle page-break logic. pdfcn takes a different approach. It stays close to each renderer's primitives, keeps the API familiar across Takumi and Forme, and lets you drop down to the underlying renderer whenever you need more control.

The goal is simple: make generated PDFs feel like the rest of your stack — composable, themeable, accessible, and easy to customize.

## Why pdfcn? [#why-pdfcn]

Most PDF component setups are either too opinionated or too scattered. pdfcn is built for teams that want to ship quickly without giving up control:

* **Own Your Code:** Copy the components into your project and customize everything.
* **Start Fast:** Run one command and render your first document with production-ready defaults.
* **Choose Your Engine:** Use the same component API with Takumi or Forme, then drop to raw renderer APIs when needed.

## Features [#features]

<div className="not-prose grid gap-4 sm:grid-cols-2 mt-4">
  <FeatureCard icon="ZapIcon" title="Zero Config" description="Works out of the box with sensible defaults and renderer-aware installation." />

  <FeatureCard icon="SunMoonIcon" title="Theme Aware" description="Share a consistent PDF theme across components, blocks, and both rendering bases." />

  <FeatureCard icon="LayoutGridIcon" title="Composable" description="Build invoices, reports, forms, and tables from small declarative components." />

  <FeatureCard icon="Code2Icon" title="TypeScript" description="Full type safety with matching public props across Takumi and Forme." />

  <FeatureCard icon="ClipboardCopyIcon" title="Copy & Paste" description="Own your PDF code. Install it into your project and customize every detail." />

  <FeatureCard icon="BlocksIcon" title="shadcn Compatible" description="Uses the shadcn registry format — add components and blocks with one command." />
</div>



# Installation

Install PDF components, blocks, and themes from the registry.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



## Prerequisites [#prerequisites]

A React project that can run either [Takumi](https://takumi.kane.tw/docs/pdf) or [Forme](https://docs.formepdf.com).

## Installation [#installation]

Run the following command to add a Takumi component:

```bash
npx shadcn@latest add @pdfcn/takumi/text
```

Forme components use the `forme/` namespace:

```bash
npx shadcn@latest add @pdfcn/forme/text
```

The registry installs the matching renderer dependencies and the shared theme utilities required by the selected component.

## Usage [#usage]

Import the installed component and use it inside your renderer's document primitives:

```tsx
import { Document, Page } from "@/components/pdf/pdf-primitives";
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { Text } from "@/components/pdf/text";

export function Invoice() {
  return (
    <Document>
      <Page size="A4">
        <PdfcnThemeProvider>
          <Text variant="xl">Invoice</Text>
        </PdfcnThemeProvider>
      </Page>
    </Document>
  );
}
```

For Forme, use `Document` and `Page` from `@formepdf/react`; the installed pdfcn component API stays the same.

## Install a Block [#install-a-block]

Blocks are complete document templates composed from registry components:

```bash
npx shadcn@latest add @pdfcn/takumi/invoice-minimal
```

Use the `forme/` namespace for the equivalent Forme document:

```bash
npx shadcn@latest add @pdfcn/forme/invoice-minimal
```

## Install a Theme [#install-a-theme]

pdfcn ships theme presets that integrate with `PdfcnThemeProvider`:

```bash
npx shadcn@latest add @pdfcn/takumi/theme-minimal
```

For Forme:

```bash
npx shadcn@latest add @pdfcn/theme-minimal
```


# MCP

Learn how to use the shadcn MCP (Model Context Protocol) server with pdfcn.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



[MCP](https://modelcontextprotocol.io/) is an open protocol that standardizes how applications provide context to LLMs. The shadcn CLI can register an MCP server so your editor can discover registry components—including items you install from **pdfcn** via the same CLI.

## Configure MCP [#configure-mcp]

Run:

```bash
npx shadcn@latest mcp init
```

Choose your MCP client when prompted, then enable the MCP server in that client to finish setup.

## Usage [#usage]

With MCP enabled, you can ask your IDE to work with **Takumi** and **Forme** patterns and pdfcn registry components. Example prompts:

* Build an invoice layout with **Table**, **Heading**, **Text**, and **KeyValue**.
* Add a **QRCode** and **Signature** to a PDF document.
* Create a report with **Graph**, **DataTable**, and **PageHeader**.
* Lay out a PDF using **Section**, **Stack**, **Divider**, and **KeepTogether**.
* Implement a multi-page flow with **PageBreak**, **PageNumber**, and **PageFooter**.

Install components from this registry with `npx shadcn@latest add` and the JSON URL from each docs page. Components work with sensible defaults.


# Registry

Learn how to use the pdfcn registry with the shadcn CLI.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



The **pdfcn** registry ships Takumi and Forme components, blocks, and themes in the [shadcn registry format](https://ui.shadcn.com/docs/registry). Register the namespace once in `components.json`, then pull items by name with the CLI.

## Setup [#setup]

Add a **registries** entry for this site. See the [shadcn registry documentation](https://ui.shadcn.com/docs/registry) for all `components.json` fields and behaviors.

```json
{
  "registries": {
    "@pdfcn": "https://pdfcn.dev/r/{name}.json"
  }
}
```

You can replace `@pdfcn` with another namespace; it only needs to match what you pass to `shadcn add`.

## Usage [#usage]

Items are namespaced by base: `takumi/` for Takumi and `forme/` for Forme.

Registry files follow these destinations:

* Components install into `components/ui/`.
* Blocks install into the configured blocks directory.

Components declare their dependencies, so installing a component does not require additional setup.

### Takumi [#takumi]

Install a component:

```bash
npx shadcn@latest add @pdfcn/takumi/text
```

Install a block:

```bash
npx shadcn@latest add @pdfcn/takumi/invoice-minimal
```

Without a registry alias, use the full URL (as on each docs page):

```bash
npx shadcn@latest add https://pdfcn.dev/r/takumi/text.json
```

### Forme [#forme]

Install a component:

```bash
npx shadcn@latest add @pdfcn/forme/text
```

Install a block:

```bash
npx shadcn@latest add @pdfcn/forme/invoice-minimal
```

Without a registry alias, use the full URL (as on each docs page):

```bash
npx shadcn@latest add https://pdfcn.dev/r/forme/text.json
```


# Blocks

Pre-built invoices and reports composed from pdfcn components.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentsList folderName="Blocks" />


# Components

Here you can find all the PDF components available in the library.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentsList />


# Blueprint

Dark slate with cyan accent, monospace headings, technical precision.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-classic" theme="blueprintTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-blueprint
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/blueprint.ts" title="lib/themes/blueprint.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { blueprintTheme } from "@/lib/pdf-themes/blueprint";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={blueprintTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Corporate

Blue-gray palette, Lato sans-serif, structured and dependable.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-corporate" theme="corporateTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-corporate
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/corporate.ts" title="lib/themes/corporate.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { corporateTheme } from "@/lib/pdf-themes/corporate";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={corporateTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Elegant

Warm cream whites, amber/gold accent, classic editorial combination.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-creative" theme="elegantTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-elegant
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/elegant.ts" title="lib/themes/elegant.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { elegantTheme } from "@/lib/pdf-themes/elegant";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={elegantTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Executive

Deep navy palette, Merriweather serif headings, premium boardroom aesthetic.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-corporate" theme="executiveTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-executive
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/executive.ts" title="lib/themes/executive.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { executiveTheme } from "@/lib/pdf-themes/executive";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={executiveTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Forest

Natural deep greens, Merriweather headings, earthy and trustworthy.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-classic" theme="forestTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-forest
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/forest.ts" title="lib/themes/forest.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { forestTheme } from "@/lib/pdf-themes/forest";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={forestTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Themes

Pre-built theme presets for styling your PDF components.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentsList folderName="Themes" />


# Minimal

Courier headings, zinc neutrals, maximum whitespace.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-minimal" theme="minimalTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-minimal
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/minimal.ts" title="lib/themes/minimal.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { minimalTheme } from "@/lib/pdf-themes/minimal";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={minimalTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Modern

All-Helvetica typography, slate-cool neutrals with subtle violet accent.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-modern" theme="modernTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-modern
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/modern.ts" title="lib/themes/modern.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { modernTheme } from "@/lib/pdf-themes/modern";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={modernTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Professional

Serif headings, refined zinc/slate palette, formal document feel.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-classic" theme="professionalTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-professional
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/professional.ts" title="lib/themes/professional.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { professionalTheme } from "@/lib/pdf-themes/professional";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={professionalTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# Vivid

Deep violet palette, Nunito rounded sans-serif, playful but professional.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ComponentPreview base="forme" name="invoice-creative" theme="vividTheme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/theme-vivid
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/themes/vivid.ts" title="lib/themes/vivid.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { vividTheme } from "@/lib/pdf-themes/vivid";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={vividTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```


# August 13, 2026 - Initial Release

PDF components for React PDF, React PDF Renderer, and JSX PDF.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





We shipped the initial release of pdfcn with ready-to-use PDF components for Takumi PDF and Forme PDF.

<div className="mt-6 flex w-full items-center justify-center gap-4 rounded-lg border bg-muted/50 py-32">
  <TakumiIcon className="size-12" />

  <PlusIcon className="size-8 text-muted-foreground" />

  <FormeIcon className="size-12" />
</div>


# August 30, 2026 - Theme Builder

Visual theme customization with live PDF preview, undo/redo, code export, and shareable URLs.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



We shipped the Theme Builder — a visual editor for customizing PDF themes with live preview, instant feedback, and one-click code export.

### What's new [#whats-new]

* **Live PDF Preview** — See your theme applied in real time as you adjust colors, typography, spacing, and page settings
* **Theme Picker** — Browse and switch between 9 built-in [presets](/docs/themes) (Professional, Modern, Minimal, Executive, Corporate, Elegant, Vivid, Forest, Blueprint)
* **Undo / Redo** — Full history with keyboard shortcuts (⌘Z / ⌘⇧Z)
* **Code Export** — Copy the theme config as a JSON object or TypeScript preset to drop into your project
* **Shareable URLs** — Theme state is encoded in the URL hash so you can share an exact configuration with anyone
* **Base-specific routing** — Separate theme builders for [Takumi PDF](/theme-builder/takumi) and [Forme PDF](/theme-builder/forme)
* **Font preview** — See how your chosen body and heading fonts look at actual size before generating a PDF


# Changelog

Latest updates and announcements for pdfcn.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



## August 2026 - Initial Release [#august-2026---initial-release]

We shipped the initial release of pdfcn with ready-to-use PDF components for Takumi PDF and Forme PDF.


# Forme

Invoice and report templates for the Forme base.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentsList folderName="Blocks" base="forme" />


# Invoice Classic

Classic invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="invoice-classic" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/invoice-classic
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/invoice-classic/invoice-classic.tsx" base="forme" title="components/pdf/blocks/invoice-classic/invoice-classic.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceClassicDocument } from "@/components/pdf/invoice-classic";
```

```tsx
<InvoiceClassicDocument />
```


# Invoice Consultant

Consultant-style invoice template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="invoice-consultant" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/invoice-consultant
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/invoice-consultant/invoice-consultant.tsx" base="forme" title="components/pdf/blocks/invoice-consultant/invoice-consultant.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceConsultantDocument } from "@/components/pdf/invoice-consultant";
```

```tsx
<InvoiceConsultantDocument />
```


# Invoice Corporate

Corporate invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="invoice-corporate" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/invoice-corporate
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/invoice-corporate/invoice-corporate.tsx" base="forme" title="components/pdf/blocks/invoice-corporate/invoice-corporate.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceCorporateDocument } from "@/components/pdf/invoice-corporate";
```

```tsx
<InvoiceCorporateDocument />
```


# Invoice Creative

Creative invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="invoice-creative" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/invoice-creative
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/invoice-creative/invoice-creative.tsx" base="forme" title="components/pdf/blocks/invoice-creative/invoice-creative.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceCreativeDocument } from "@/components/pdf/invoice-creative";
```

```tsx
<InvoiceCreativeDocument />
```


# Invoice Minimal

Minimal invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="invoice-minimal" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/invoice-minimal
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/invoice-minimal/invoice-minimal.tsx" base="forme" title="components/pdf/blocks/invoice-minimal/invoice-minimal.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceMinimalDocument } from "@/components/pdf/invoice-minimal";
```

```tsx
<InvoiceMinimalDocument />
```


# Invoice Modern

Modern invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="invoice-modern" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/invoice-modern
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/invoice-modern/invoice-modern.tsx" base="forme" title="components/pdf/blocks/invoice-modern/invoice-modern.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceModernDocument } from "@/components/pdf/invoice-modern";
```

```tsx
<InvoiceModernDocument />
```


# Report Financial

Financial report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="report-financial" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/report-financial
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/report-financial/report-financial.tsx" base="forme" title="components/pdf/blocks/report-financial/report-financial.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { FinancialReportDocument } from "@/components/pdf/report-financial";
```

```tsx
<FinancialReportDocument />
```


# Report Marketing

Marketing report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="report-marketing" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/report-marketing
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/report-marketing/report-marketing.tsx" base="forme" title="components/pdf/blocks/report-marketing/report-marketing.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { MarketingReportDocument } from "@/components/pdf/report-marketing";
```

```tsx
<MarketingReportDocument />
```


# Report Operations

Operations report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="report-operations" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/report-operations
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/report-operations/report-operations.tsx" base="forme" title="components/pdf/blocks/report-operations/report-operations.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { OperationsReportDocument } from "@/components/pdf/report-operations";
```

```tsx
<OperationsReportDocument />
```


# Report Security

Security report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="report-security" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/report-security
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/blocks/report-security/report-security.tsx" base="forme" title="components/pdf/blocks/report-security/report-security.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { SecurityReportDocument } from "@/components/pdf/report-security";
```

```tsx
<SecurityReportDocument />
```


# Takumi

Invoice and report templates for the Takumi base.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentsList folderName="Blocks" base="takumi" />


# Invoice Classic

Classic invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="invoice-classic" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/invoice-classic
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/invoice-classic/invoice-classic.tsx" base="takumi" title="components/pdf/blocks/invoice-classic/invoice-classic.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceClassicDocument } from "@/components/pdf/invoice-classic";
```

```tsx
<InvoiceClassicDocument />
```


# Invoice Consultant

Consultant-style invoice template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="invoice-consultant" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/invoice-consultant
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/invoice-consultant/invoice-consultant.tsx" base="takumi" title="components/pdf/blocks/invoice-consultant/invoice-consultant.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceConsultantDocument } from "@/components/pdf/invoice-consultant";
```

```tsx
<InvoiceConsultantDocument />
```


# Invoice Corporate

Corporate invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="invoice-corporate" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/invoice-corporate
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/invoice-corporate/invoice-corporate.tsx" base="takumi" title="components/pdf/blocks/invoice-corporate/invoice-corporate.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceCorporateDocument } from "@/components/pdf/invoice-corporate";
```

```tsx
<InvoiceCorporateDocument />
```


# Invoice Creative

Creative invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="invoice-creative" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/invoice-creative
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/invoice-creative/invoice-creative.tsx" base="takumi" title="components/pdf/blocks/invoice-creative/invoice-creative.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceCreativeDocument } from "@/components/pdf/invoice-creative";
```

```tsx
<InvoiceCreativeDocument />
```


# Invoice Minimal

Minimal invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="invoice-minimal" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/invoice-minimal
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/invoice-minimal/invoice-minimal.tsx" base="takumi" title="components/pdf/blocks/invoice-minimal/invoice-minimal.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceMinimalDocument } from "@/components/pdf/invoice-minimal";
```

```tsx
<InvoiceMinimalDocument />
```


# Invoice Modern

Modern invoice document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="invoice-modern" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/invoice-modern
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/invoice-modern/invoice-modern.tsx" base="takumi" title="components/pdf/blocks/invoice-modern/invoice-modern.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { InvoiceModernDocument } from "@/components/pdf/invoice-modern";
```

```tsx
<InvoiceModernDocument />
```


# Report Financial

Financial report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="report-financial" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/report-financial
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/report-financial/report-financial.tsx" base="takumi" title="components/pdf/blocks/report-financial/report-financial.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { FinancialReportDocument } from "@/components/pdf/report-financial";
```

```tsx
<FinancialReportDocument />
```


# Report Marketing

Marketing report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="report-marketing" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/report-marketing
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/report-marketing/report-marketing.tsx" base="takumi" title="components/pdf/blocks/report-marketing/report-marketing.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { MarketingReportDocument } from "@/components/pdf/report-marketing";
```

```tsx
<MarketingReportDocument />
```


# Report Operations

Operations report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="report-operations" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/report-operations
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/report-operations/report-operations.tsx" base="takumi" title="components/pdf/blocks/report-operations/report-operations.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { OperationsReportDocument } from "@/components/pdf/report-operations";
```

```tsx
<OperationsReportDocument />
```


# Report Security

Security report document template.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="report-security" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/report-security
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/blocks/report-security/report-security.tsx" base="takumi" title="components/pdf/blocks/report-security/report-security.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { SecurityReportDocument } from "@/components/pdf/report-security";
```

```tsx
<SecurityReportDocument />
```


# Alert

Alert box with info, success, warning, and error variants.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="alert" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/alert
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/alert/alert.tsx" base="forme" title="components/pdf/alert/alert.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfAlert } from "@/components/pdf/alert";
```

```tsx
<PdfAlert variant="info" title="Info">
  Alert body
</PdfAlert>
```

## API Reference [#api-reference]

### PdfAlert [#pdfalert]

| Prop         | Type                                          | Default |
| ------------ | --------------------------------------------- | ------- |
| `variant`    | `'info' \| 'success' \| 'warning' \| 'error'` | 'info'  |
| `title`      | `string`                                      | -       |
| `children`   | `ReactNode`                                   | -       |
| `showIcon`   | `boolean`                                     | true    |
| `showBorder` | `boolean`                                     | true    |


# Badge

Compact status badge for labels and tags.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="badge" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/badge
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/badge/badge.tsx" base="forme" title="components/pdf/badge/badge.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Badge } from "@/components/pdf/badge";
```

```tsx
<Badge>Badge</Badge>
```

## API Reference [#api-reference]

### Badge [#badge]

| Prop         | Type                                                                                       | Default   |
| ------------ | ------------------------------------------------------------------------------------------ | --------- |
| `label`      | `string`                                                                                   | -         |
| `children`   | `string`                                                                                   | -         |
| `variant`    | `'default' \| 'primary' \| 'success' \| 'warning' \| 'destructive' \| 'info' \| 'outline'` | 'default' |
| `size`       | `'sm' \| 'md' \| 'lg'`                                                                     | 'md'      |
| `background` | `string`                                                                                   | -         |
| `color`      | `string`                                                                                   | -         |


# Card

Bordered content card with title and body.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="card" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/card
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/card/card.tsx" base="forme" title="components/pdf/card/card.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfCard } from "@/components/pdf/card";
```

```tsx
<PdfCard title="Card">Card body</PdfCard>
```

## API Reference [#api-reference]

### PdfCard [#pdfcard]

| Prop       | Type                                 | Default     |
| ---------- | ------------------------------------ | ----------- |
| `title`    | `string`                             | -           |
| `children` | `ReactNode`                          | -           |
| `variant`  | `'default' \| 'bordered' \| 'muted'` | `'default'` |
| `padding`  | `'sm' \| 'md' \| 'lg'`               | `'md'`      |
| `wrap`     | `boolean`                            | `false`     |


# Data Table

Tabular data with columns and rows.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="data-table" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/data-table
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/data-table/data-table.tsx" base="forme" title="components/pdf/data-table/data-table.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { DataTable } from "@/components/pdf/data-table";
```

```tsx
<DataTable
  columns={[{ key: "name", header: "Name" }]}
  data={[{ name: "Widget" }]}
/>
```

### Variants [#variants]

Use any `TableVariant` for the table treatment and `size="compact"` for denser reports.

```tsx
<DataTable columns={columns} data={rows} variant="striped" size="compact" />
```

## API Reference [#api-reference]

### DataTable [#datatable]

| Prop      | Type                                                                                        | Default     |
| --------- | ------------------------------------------------------------------------------------------- | ----------- |
| `columns` | `DataTableColumn<T>[]`                                                                      | -           |
| `data`    | `T[]`                                                                                       | -           |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | `'grid'`    |
| `footer`  | `Partial<Record<keyof T, string \| number>>`                                                | -           |
| `stripe`  | `boolean`                                                                                   | `false`     |
| `size`    | `'default' \| 'compact'`                                                                    | `'default'` |
| `noWrap`  | `boolean`                                                                                   | `false`     |
| `style`   | `Style`                                                                                     | -           |

### DataTableColumn [#datatablecolumn]

`key` is the row-field accessor—for example, `key: "name"` reads `row.name`. It is not React's reserved `key` prop.

| Prop           | Type                            | Default  |
| -------------- | ------------------------------- | -------- |
| `key`          | `keyof T & string`              | -        |
| `header`       | `string`                        | -        |
| `align`        | `'left' \| 'center' \| 'right'` | `'left'` |
| `width`        | `string \| number`              | -        |
| `render`       | `(value, row) => ReactNode`     | -        |
| `renderFooter` | `(value) => ReactNode`          | -        |


# Divider

Horizontal rule to separate sections.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="divider" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/divider
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/divider/divider.tsx" base="forme" title="components/pdf/divider/divider.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Divider } from "@/components/pdf/divider";
```

```tsx
<Divider />
```

## API Reference [#api-reference]

### Divider [#divider]

| Prop        | Type                              | Default   |
| ----------- | --------------------------------- | --------- |
| `spacing`   | `'none' \| 'sm' \| 'md' \| 'lg'`  | `'md'`    |
| `variant`   | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` |
| `color`     | `string`                          | -         |
| `thickness` | `'thin' \| 'medium' \| 'thick'`   | `'thin'`  |
| `label`     | `string`                          | -         |
| `width`     | `string \| number`                | -         |


# Form

Labeled form groups for PDF inputs.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="form" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/form
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/form/form.tsx" base="forme" title="components/pdf/form/form.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfForm } from "@/components/pdf/form";
```

```tsx
<PdfForm title="Contact" groups={[{ fields: [{ label: "Email" }] }]} />
```

### Variants [#variants]

```tsx
<PdfForm
  variant="outlined"
  labelPosition="left"
  groups={[{ title: "Contact", layout: "two-column", fields }]}
/>
```

## API Reference [#api-reference]

### PdfForm [#pdfform]

| Prop            | Type                                            | Default       |
| --------------- | ----------------------------------------------- | ------------- |
| `title`         | `string`                                        | -             |
| `subtitle`      | `string`                                        | -             |
| `groups`        | `PdfFormGroup[]`                                | -             |
| `variant`       | `'underline' \| 'box' \| 'outlined' \| 'ghost'` | `'underline'` |
| `labelPosition` | `'above' \| 'left'`                             | `'above'`     |
| `noWrap`        | `boolean`                                       | `false`       |
| `style`         | `Style`                                         | -             |

Groups support `single`, `two-column`, and `three-column` layouts.


# Graph

Bar, line, and area charts drawn with SVG.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="graph" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/graph
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/graph/graph.tsx" base="forme" title="components/pdf/graph/graph.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfGraph } from "@/components/pdf/graph";
```

```tsx
<PdfGraph variant="bar" data={[{ label: "Q1", value: 30 }]} />
```

### Variants [#variants]

```tsx
<PdfGraph variant="line" data={series} showDots smooth />
<PdfGraph variant="donut" data={totals} centerLabel="$48k" />
```

## API Reference [#api-reference]

### PdfGraph [#pdfgraph]

| Prop          | Type                                                                | Default    |
| ------------- | ------------------------------------------------------------------- | ---------- |
| `variant`     | `'bar' \| 'horizontal-bar' \| 'line' \| 'area' \| 'pie' \| 'donut'` | `'bar'`    |
| `data`        | `GraphDataPoint[] \| GraphSeries[]`                                 | -          |
| `title`       | `string`                                                            | -          |
| `subtitle`    | `string`                                                            | -          |
| `xLabel`      | `string`                                                            | -          |
| `yLabel`      | `string`                                                            | -          |
| `width`       | `number`                                                            | `420`      |
| `height`      | `number`                                                            | `260`      |
| `fullWidth`   | `boolean`                                                           | `false`    |
| `colors`      | `string[]`                                                          | theme      |
| `showValues`  | `boolean`                                                           | `false`    |
| `showGrid`    | `boolean`                                                           | `true`     |
| `legend`      | `'bottom' \| 'right' \| 'none'`                                     | `'bottom'` |
| `centerLabel` | `string`                                                            | -          |
| `showDots`    | `boolean`                                                           | `true`     |
| `smooth`      | `boolean`                                                           | `false`    |
| `yTicks`      | `number`                                                            | `5`        |
| `noWrap`      | `boolean`                                                           | `true`     |
| `style`       | `Style`                                                             | -          |


# Heading

Document headings with typographic scale.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="heading" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/heading
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/heading/heading.tsx" base="forme" title="components/pdf/heading/heading.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Heading } from "@/components/pdf/heading";
```

```tsx
<Heading level={1}>Heading</Heading>
```

## API Reference [#api-reference]

### Heading [#heading]

| Prop           | Type                                                    | Default    |
| -------------- | ------------------------------------------------------- | ---------- |
| `level`        | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                            | `1`        |
| `align`        | `'left' \| 'center' \| 'right'`                         | `'left'`   |
| `color`        | `string`                                                | -          |
| `transform`    | `'uppercase' \| 'lowercase' \| 'capitalize'`            | -          |
| `weight`       | `'normal' \| 'medium' \| 'semibold' \| 'bold'`          | `'bold'`   |
| `tracking`     | `'tighter' \| 'tight' \| 'normal' \| 'wide' \| 'wider'` | `'normal'` |
| `noMargin`     | `boolean`                                               | `false`    |
| `keepWithNext` | `boolean`                                               | -          |


# Forme

PDF UI primitives for the Forme base.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentsList folderName="Components" base="forme" />


# Keep Together

Keeps children on the same PDF page.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="keep-together" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/keep-together
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/keep-together/keep-together.tsx" base="forme" title="components/pdf/keep-together/keep-together.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { KeepTogether } from "@/components/pdf/keep-together";
import { Text } from "@/components/pdf/text";
```

```tsx
<KeepTogether>
  <Text>Keep these lines together.</Text>
</KeepTogether>
```

## API Reference [#api-reference]

### KeepTogether [#keeptogether]

| Prop               | Type        | Default |
| ------------------ | ----------- | ------- |
| `children`         | `ReactNode` | -       |
| `minPresenceAhead` | `number`    | -       |
| `style`            | `Style`     | -       |


# Key Value

Definition list of keys and values.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="key-value" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/key-value
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/key-value/key-value.tsx" base="forme" title="components/pdf/key-value/key-value.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { KeyValue } from "@/components/pdf/key-value";
```

```tsx
<KeyValue items={[{ key: "Name", value: "Ada" }]} />
```

## API Reference [#api-reference]

### KeyValue [#keyvalue]

| Prop               | Type                         | Default      |
| ------------------ | ---------------------------- | ------------ |
| `items`            | `KeyValueEntry[]`            | -            |
| `direction`        | `'horizontal' \| 'vertical'` | 'horizontal' |
| `divided`          | `boolean`                    | false        |
| `size`             | `'sm' \| 'md' \| 'lg'`       | 'md'         |
| `labelFlex`        | `number`                     | 1            |
| `labelColor`       | `string`                     | -            |
| `valueColor`       | `string`                     | -            |
| `boldValue`        | `boolean`                    | false        |
| `noWrap`           | `boolean`                    | false        |
| `dividerColor`     | `string`                     | -            |
| `dividerThickness` | `number`                     | -            |
| `dividerMargin`    | `number`                     | -            |


# Link

Clickable link styled for PDF documents.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="link" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/link
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/link/link.tsx" base="forme" title="components/pdf/link/link.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Link } from "@/components/pdf/link";
```

```tsx
<Link href="https://example.com">Example</Link>
```

## API Reference [#api-reference]

### Link [#link]

| Prop        | Type                                | Default     |
| ----------- | ----------------------------------- | ----------- |
| `href`      | `string`                            | -           |
| `align`     | `'left' \| 'center' \| 'right'`     | `'left'`    |
| `color`     | `string`                            | -           |
| `variant`   | `'default' \| 'muted' \| 'primary'` | `'default'` |
| `underline` | `'always' \| 'none'`                | `'always'`  |


# List

Ordered and unordered lists.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="list" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/list
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/list/list.tsx" base="forme" title="components/pdf/list/list.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfList } from "@/components/pdf/list";
```

```tsx
<PdfList items={[{ text: "Alpha" }, { text: "Beta" }]} />
```

### Variants [#variants]

```tsx
<PdfList variant="numbered" items={items} />
<PdfList variant="checklist" items={checklistItems} gap="md" />
```

## API Reference [#api-reference]

### PdfList [#pdflist]

| Prop      | Type                                                                                | Default    |
| --------- | ----------------------------------------------------------------------------------- | ---------- |
| `items`   | `ListItem[]`                                                                        | -          |
| `variant` | `'bullet' \| 'numbered' \| 'checklist' \| 'icon' \| 'multi-level' \| 'descriptive'` | `'bullet'` |
| `gap`     | `'xs' \| 'sm' \| 'md'`                                                              | `'sm'`     |
| `noWrap`  | `boolean`                                                                           | `false`    |
| `style`   | `Style`                                                                             | -          |


# Page Break

Forces a page break in the document.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="page-break" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/page-break
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/page-break/page-break.tsx" base="forme" title="components/pdf/page-break/page-break.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PageBreak } from "@/components/pdf/page-break";
```

```tsx
<PageBreak />
```

## API Reference [#api-reference]

### PageBreak [#pagebreak]

| Prop       | Type    | Default |
| ---------- | ------- | ------- |
| `children` | `never` | -       |


# Page Footer

Repeating page footer.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="page-footer" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/page-footer
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/page-footer/page-footer.tsx" base="forme" title="components/pdf/page-footer/page-footer.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PageFooter } from "@/components/pdf/page-footer";
```

```tsx
<PageFooter leftText="pdfcn" rightText="Confidential" />
```

## API Reference [#api-reference]

### PageFooter [#pagefooter]

| Prop          | Type                                                                               | Default  |
| ------------- | ---------------------------------------------------------------------------------- | -------- |
| `leftText`    | `string`                                                                           | -        |
| `rightText`   | `string`                                                                           | -        |
| `centerText`  | `string`                                                                           | -        |
| `variant`     | `'simple' \| 'centered' \| 'branded' \| 'minimal' \| 'three-column' \| 'detailed'` | 'simple' |
| `background`  | `string`                                                                           | -        |
| `textColor`   | `string`                                                                           | -        |
| `marginTop`   | `number`                                                                           | -        |
| `address`     | `string`                                                                           | -        |
| `phone`       | `string`                                                                           | -        |
| `email`       | `string`                                                                           | -        |
| `website`     | `string`                                                                           | -        |
| `fixed`       | `boolean`                                                                          | false    |
| `sticky`      | `boolean`                                                                          | false    |
| `pagePadding` | `number`                                                                           | 0        |
| `noWrap`      | `boolean`                                                                          | true     |


# Page Header

Repeating page header.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="page-header" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/page-header
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/page-header/page-header.tsx" base="forme" title="components/pdf/page-header/page-header.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PageHeader } from "@/components/pdf/page-header";
```

```tsx
<PageHeader title="Company" subtitle="Invoice" />
```

## API Reference [#api-reference]

### PageHeader [#pageheader]

| Prop           | Type                                                                                              | Default  |
| -------------- | ------------------------------------------------------------------------------------------------- | -------- |
| `title`        | `string`                                                                                          | -        |
| `subtitle`     | `string`                                                                                          | -        |
| `rightText`    | `string`                                                                                          | -        |
| `rightSubText` | `string`                                                                                          | -        |
| `variant`      | `'simple' \| 'centered' \| 'minimal' \| 'branded' \| 'logo-left' \| 'logo-right' \| 'two-column'` | 'simple' |
| `background`   | `string`                                                                                          | -        |
| `titleColor`   | `string`                                                                                          | -        |
| `marginBottom` | `number`                                                                                          | -        |
| `address`      | `string`                                                                                          | -        |
| `phone`        | `string`                                                                                          | -        |
| `email`        | `string`                                                                                          | -        |
| `logo`         | `ReactNode`                                                                                       | -        |
| `fixed`        | `boolean`                                                                                         | false    |
| `noWrap`       | `boolean`                                                                                         | true     |


# Page Number

Current page number marker.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="page-number" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/page-number
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/page-number/page-number.tsx" base="forme" title="components/pdf/page-number/page-number.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfPageNumber } from "@/components/pdf/page-number";
```

```tsx
<PdfPageNumber />
```

## API Reference [#api-reference]

### PdfPageNumber [#pdfpagenumber]

| Prop       | Type                            | Default                    |
| ---------- | ------------------------------- | -------------------------- |
| `format`   | `string`                        | 'Page \{page} of \{total}' |
| `align`    | `'left' \| 'center' \| 'right'` | 'center'                   |
| `size`     | `'xs' \| 'sm' \| 'md'`          | 'sm'                       |
| `fixed`    | `boolean`                       | false                      |
| `muted`    | `boolean`                       | true                       |
| `children` | `never`                         | -                          |


# PDF Image

Embedded image with fit options.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="pdf-image" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/pdf-image
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/pdf-image/pdf-image.tsx" base="forme" title="components/pdf/pdf-image/pdf-image.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfImage } from "@/components/pdf/pdf-image";
```

```tsx
<PdfImage src="/logo.png" width={120} />
```

## API Reference [#api-reference]

### PdfImage [#pdfimage]

| Prop           | Type                                                                                                    | Default     |
| -------------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `src`          | `string \| &#123; uri: string; method?: string; headers?: Record<string, string>; body?: string &#125;` | -           |
| `variant`      | `'default' \| 'full-width' \| 'thumbnail' \| 'avatar' \| 'cover' \| 'bordered' \| 'rounded'`            | `'default'` |
| `width`        | `number \| string`                                                                                      | -           |
| `height`       | `number \| string`                                                                                      | -           |
| `fit`          | `'cover' \| 'contain' \| 'fill' \| 'none'`                                                              | -           |
| `position`     | `string`                                                                                                | `'50% 50%'` |
| `caption`      | `string`                                                                                                | -           |
| `aspectRatio`  | `number`                                                                                                | -           |
| `borderRadius` | `number`                                                                                                | -           |
| `noWrap`       | `boolean`                                                                                               | `true`      |
| `style`        | `Style`                                                                                                 | -           |


# QR Code

QR code generated from a string value.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="qrcode" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/qrcode
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/qrcode/qrcode.tsx" base="forme" title="components/pdf/qrcode/qrcode.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfQRCode } from "@/components/pdf/qrcode";
```

```tsx
<PdfQRCode value="https://pdfcn.dev" />
```

## API Reference [#api-reference]

### PdfQRCode [#pdfqrcode]

| Prop              | Type                       | Default |
| ----------------- | -------------------------- | ------- |
| `value`           | `string`                   | -       |
| `size`            | `number`                   | -       |
| `color`           | `string`                   | -       |
| `backgroundColor` | `string`                   | -       |
| `errorLevel`      | `'L' \| 'M' \| 'Q' \| 'H'` | -       |
| `margin`          | `number`                   | -       |
| `caption`         | `string`                   | -       |
| `children`        | `never`                    | -       |


# Section

Section wrapper with optional title.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="section" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/section
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/section/section.tsx" base="forme" title="components/pdf/section/section.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Section } from "@/components/pdf/section";
import { Text } from "@/components/pdf/text";
```

```tsx
<Section>
  <Text>Section body</Text>
</Section>
```

## API Reference [#api-reference]

### Section [#section]

| Prop          | Type                                              | Default   |
| ------------- | ------------------------------------------------- | --------- |
| `spacing`     | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`          | 'md'      |
| `padding`     | `'none' \| 'sm' \| 'md' \| 'lg'`                  | -         |
| `background`  | `string`                                          | -         |
| `border`      | `boolean`                                         | false     |
| `variant`     | `'default' \| 'callout' \| 'highlight' \| 'card'` | 'default' |
| `accentColor` | `string`                                          | -         |
| `noWrap`      | `boolean`                                         | false     |


# Signature

Signature block with name and label.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="signature" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/signature
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/signature/signature.tsx" base="forme" title="components/pdf/signature/signature.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfSignatureBlock } from "@/components/pdf/signature";
```

```tsx
<PdfSignatureBlock name="Jane Doe" label="Authorized Signature" />
```

## API Reference [#api-reference]

### PdfSignatureBlock [#pdfsignatureblock]

| Prop      | Type                                 | Default  |
| --------- | ------------------------------------ | -------- |
| `variant` | `'single' \| 'double' \| 'inline'`   | 'single' |
| `label`   | `string`                             | -        |
| `name`    | `string`                             | -        |
| `title`   | `string`                             | -        |
| `date`    | `string`                             | -        |
| `signers` | `[SignatureSigner, SignatureSigner]` | -        |
| `style`   | `Style`                              | -        |


# Stack

Vertical stack with spacing.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="stack" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/stack
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/stack/stack.tsx" base="forme" title="components/pdf/stack/stack.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Stack } from "@/components/pdf/stack";
import { Text } from "@/components/pdf/text";
```

```tsx
<Stack gap="md">
  <Text>One</Text>
  <Text>Two</Text>
</Stack>
```

## API Reference [#api-reference]

### Stack [#stack]

| Prop        | Type                                                    | Default    |
| ----------- | ------------------------------------------------------- | ---------- |
| `gap`       | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                | 'md'       |
| `direction` | `'vertical' \| 'horizontal'`                            | 'vertical' |
| `align`     | `'start' \| 'center' \| 'end' \| 'stretch'`             | 'start'    |
| `justify`   | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | 'start'    |
| `wrap`      | `boolean`                                               | false      |
| `noWrap`    | `boolean`                                               | false      |


# Table

Low-level table primitives.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="table" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/table
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/table/table.tsx" base="forme" title="components/pdf/table/table.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text,
} from "@/components/pdf/table";
```

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableCell>
        <Text>Item</Text>
      </TableCell>
    </TableRow>
  </TableHeader>
</Table>
```

### Variants [#variants]

```tsx
<Table variant="striped" zebraStripe>
  {/* header, body, rows, and cells */}
</Table>
```

## API Reference [#api-reference]

### Table [#table]

| Prop          | Type                                                                                        | Default  |
| ------------- | ------------------------------------------------------------------------------------------- | -------- |
| `variant`     | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | `'line'` |
| `zebraStripe` | `boolean`                                                                                   | `false`  |
| `noWrap`      | `boolean`                                                                                   | `false`  |
| `children`    | `ReactNode`                                                                                 | -        |
| `style`       | `Style`                                                                                     | -        |

### TableRow [#tablerow]

| Prop      | Type                                                                                        | Default   |
| --------- | ------------------------------------------------------------------------------------------- | --------- |
| `header`  | `boolean`                                                                                   | `false`   |
| `footer`  | `boolean`                                                                                   | `false`   |
| `stripe`  | `boolean`                                                                                   | `false`   |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | inherited |

### TableCell [#tablecell]

| Prop      | Type                                                                                        | Default   |
| --------- | ------------------------------------------------------------------------------------------- | --------- |
| `header`  | `boolean`                                                                                   | `false`   |
| `footer`  | `boolean`                                                                                   | `false`   |
| `align`   | `'left' \| 'center' \| 'right'`                                                             | `'left'`  |
| `width`   | `string \| number`                                                                          | -         |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | inherited |


# Text

Body text with typography variants.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="text" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/text
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/text/text.tsx" base="forme" title="components/pdf/text/text.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Text } from "@/components/pdf/text";
```

```tsx
<Text>Hello from pdfcn</Text>
```

## API Reference [#api-reference]

### Text [#text]

| Prop         | Type                                                       | Default    |
| ------------ | ---------------------------------------------------------- | ---------- |
| `variant`    | `'xs' \| 'sm' \| 'base' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'base'`   |
| `align`      | `'left' \| 'center' \| 'right' \| 'justify'`               | `'left'`   |
| `color`      | `string`                                                   | -          |
| `weight`     | `'normal' \| 'medium' \| 'semibold' \| 'bold'`             | `'normal'` |
| `italic`     | `boolean`                                                  | `false`    |
| `decoration` | `'underline' \| 'line-through' \| 'none'`                  | `'none'`   |
| `transform`  | `'uppercase' \| 'lowercase' \| 'capitalize'`               | -          |
| `noMargin`   | `boolean`                                                  | `false`    |


# Watermark

Diagonal or centered watermark overlay.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="forme" name="watermark" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/watermark
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install @formepdf/react @formepdf/core
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/watermark/watermark.tsx" base="forme" title="components/pdf/watermark/watermark.tsx" />

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" base="forme" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/forme/lib/resolve-color.ts" base="forme" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="forme" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfWatermark } from "@/components/pdf/watermark";
import { Text } from "@/components/pdf/text";
```

```tsx
<PdfWatermark text="DRAFT" />
```

## API Reference [#api-reference]

### PdfWatermark [#pdfwatermark]

| Prop       | Type                                                                       | Default |
| ---------- | -------------------------------------------------------------------------- | ------- |
| `text`     | `string`                                                                   | -       |
| `opacity`  | `number`                                                                   | -       |
| `fontSize` | `number`                                                                   | -       |
| `color`    | `string`                                                                   | -       |
| `angle`    | `number`                                                                   | -       |
| `position` | `'center' \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | -       |
| `fixed`    | `boolean`                                                                  | true    |
| `children` | `never`                                                                    | -       |


# Alert

Alert box with info, success, warning, and error variants.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="alert" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/alert
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/alert/alert.tsx" base="takumi" title="components/pdf/alert/alert.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfAlert } from "@/components/pdf/alert";
```

```tsx
<PdfAlert variant="info" title="Info">
  Alert body
</PdfAlert>
```

## API Reference [#api-reference]

### PdfAlert [#pdfalert]

| Prop         | Type                                          | Default  |
| ------------ | --------------------------------------------- | -------- |
| `variant`    | `'info' \| 'success' \| 'warning' \| 'error'` | `'info'` |
| `title`      | `string`                                      | -        |
| `children`   | `ReactNode`                                   | -        |
| `showIcon`   | `boolean`                                     | `true`   |
| `showBorder` | `boolean`                                     | `true`   |


# Badge

Compact status badge for labels and tags.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="badge" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/badge
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/badge/badge.tsx" base="takumi" title="components/pdf/badge/badge.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Badge } from "@/components/pdf/badge";
```

```tsx
<Badge>Badge</Badge>
```

## API Reference [#api-reference]

### Badge [#badge]

| Prop         | Type                                                                                       | Default     |
| ------------ | ------------------------------------------------------------------------------------------ | ----------- |
| `label`      | `string`                                                                                   | -           |
| `children`   | `string`                                                                                   | -           |
| `variant`    | `'default' \| 'primary' \| 'success' \| 'warning' \| 'destructive' \| 'info' \| 'outline'` | `'default'` |
| `size`       | `'sm' \| 'md' \| 'lg'`                                                                     | `'md'`      |
| `background` | `string`                                                                                   | -           |
| `color`      | `string`                                                                                   | -           |


# Card

Bordered content card with title and body.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="card" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/card
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/card/card.tsx" base="takumi" title="components/pdf/card/card.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfCard } from "@/components/pdf/card";
```

```tsx
<PdfCard title="Card">Card body</PdfCard>
```

## API Reference [#api-reference]

### PdfCard [#pdfcard]

| Prop       | Type                                 | Default     |
| ---------- | ------------------------------------ | ----------- |
| `title`    | `string`                             | -           |
| `children` | `ReactNode`                          | -           |
| `variant`  | `'default' \| 'bordered' \| 'muted'` | `'default'` |
| `padding`  | `'sm' \| 'md' \| 'lg'`               | `'md'`      |
| `wrap`     | `boolean`                            | `false`     |


# Data Table

Tabular data with columns and rows.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="data-table" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/data-table
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/data-table/data-table.tsx" base="takumi" title="components/pdf/data-table/data-table.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { DataTable } from "@/components/pdf/data-table";
```

```tsx
<DataTable
  columns={[{ key: "name", header: "Name" }]}
  data={[{ name: "Widget" }]}
/>
```

### Variants [#variants]

Use any `TableVariant` for the table treatment and `size="compact"` for denser reports.

```tsx
<DataTable columns={columns} data={rows} variant="striped" size="compact" />
```

## API Reference [#api-reference]

### DataTable [#datatable]

| Prop      | Type                                                                                        | Default     |
| --------- | ------------------------------------------------------------------------------------------- | ----------- |
| `columns` | `DataTableColumn<T>[]`                                                                      | -           |
| `data`    | `T[]`                                                                                       | -           |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | `'grid'`    |
| `footer`  | `Partial<Record<keyof T, string \| number>>`                                                | -           |
| `stripe`  | `boolean`                                                                                   | `false`     |
| `size`    | `'default' \| 'compact'`                                                                    | `'default'` |
| `noWrap`  | `boolean`                                                                                   | `false`     |
| `style`   | `Style`                                                                                     | -           |

### DataTableColumn [#datatablecolumn]

`key` is the row-field accessor—for example, `key: "name"` reads `row.name`. It is not React's reserved `key` prop.

| Prop           | Type                            | Default  |
| -------------- | ------------------------------- | -------- |
| `key`          | `keyof T & string`              | -        |
| `header`       | `string`                        | -        |
| `align`        | `'left' \| 'center' \| 'right'` | `'left'` |
| `width`        | `string \| number`              | -        |
| `render`       | `(value, row) => ReactNode`     | -        |
| `renderFooter` | `(value) => ReactNode`          | -        |


# Divider

Horizontal rule to separate sections.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="divider" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/divider
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/divider/divider.tsx" base="takumi" title="components/pdf/divider/divider.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Divider } from "@/components/pdf/divider";
```

```tsx
<Divider />
```

## API Reference [#api-reference]

### Divider [#divider]

| Prop        | Type                              | Default   |
| ----------- | --------------------------------- | --------- |
| `spacing`   | `'none' \| 'sm' \| 'md' \| 'lg'`  | `'md'`    |
| `variant`   | `'solid' \| 'dashed' \| 'dotted'` | `'solid'` |
| `color`     | `string`                          | -         |
| `thickness` | `'thin' \| 'medium' \| 'thick'`   | `'thin'`  |
| `label`     | `string`                          | -         |
| `width`     | `string \| number`                | -         |


# Form

Labeled form groups for PDF inputs.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="form" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/form
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/form/form.tsx" base="takumi" title="components/pdf/form/form.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfForm } from "@/components/pdf/form";
```

```tsx
<PdfForm title="Contact" groups={[{ fields: [{ label: "Email" }] }]} />
```

### Variants [#variants]

```tsx
<PdfForm
  variant="outlined"
  labelPosition="left"
  groups={[{ title: "Contact", layout: "two-column", fields }]}
/>
```

## API Reference [#api-reference]

### PdfForm [#pdfform]

| Prop            | Type                                            | Default       |
| --------------- | ----------------------------------------------- | ------------- |
| `title`         | `string`                                        | -             |
| `subtitle`      | `string`                                        | -             |
| `groups`        | `PdfFormGroup[]`                                | -             |
| `variant`       | `'underline' \| 'box' \| 'outlined' \| 'ghost'` | `'underline'` |
| `labelPosition` | `'above' \| 'left'`                             | `'above'`     |
| `noWrap`        | `boolean`                                       | `false`       |
| `style`         | `Style`                                         | -             |

Groups support `single`, `two-column`, and `three-column` layouts.


# Graph

Bar, line, and area charts drawn with SVG.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="graph" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/graph
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/graph/graph.tsx" base="takumi" title="components/pdf/graph/graph.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfGraph } from "@/components/pdf/graph";
```

```tsx
<PdfGraph variant="bar" data={[{ label: "Q1", value: 30 }]} />
```

### Variants [#variants]

```tsx
<PdfGraph variant="line" data={series} showDots smooth />
<PdfGraph variant="donut" data={totals} centerLabel="$48k" />
```

## API Reference [#api-reference]

### PdfGraph [#pdfgraph]

| Prop          | Type                                                                | Default    |
| ------------- | ------------------------------------------------------------------- | ---------- |
| `variant`     | `'bar' \| 'horizontal-bar' \| 'line' \| 'area' \| 'pie' \| 'donut'` | `'bar'`    |
| `data`        | `GraphDataPoint[] \| GraphSeries[]`                                 | -          |
| `title`       | `string`                                                            | -          |
| `subtitle`    | `string`                                                            | -          |
| `xLabel`      | `string`                                                            | -          |
| `yLabel`      | `string`                                                            | -          |
| `width`       | `number`                                                            | `420`      |
| `height`      | `number`                                                            | `260`      |
| `fullWidth`   | `boolean`                                                           | `false`    |
| `colors`      | `string[]`                                                          | theme      |
| `showValues`  | `boolean`                                                           | `false`    |
| `showGrid`    | `boolean`                                                           | `true`     |
| `legend`      | `'bottom' \| 'right' \| 'none'`                                     | `'bottom'` |
| `centerLabel` | `string`                                                            | -          |
| `showDots`    | `boolean`                                                           | `true`     |
| `smooth`      | `boolean`                                                           | `false`    |
| `yTicks`      | `number`                                                            | `5`        |
| `noWrap`      | `boolean`                                                           | `true`     |
| `style`       | `Style`                                                             | -          |


# Heading

Document headings with typographic scale.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="heading" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/heading
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/heading/heading.tsx" base="takumi" title="components/pdf/heading/heading.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Heading } from "@/components/pdf/heading";
```

```tsx
<Heading level={1}>Heading</Heading>
```

## API Reference [#api-reference]

### Heading [#heading]

| Prop           | Type                                                    | Default    |
| -------------- | ------------------------------------------------------- | ---------- |
| `level`        | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                            | `1`        |
| `align`        | `'left' \| 'center' \| 'right'`                         | `'left'`   |
| `color`        | `string`                                                | -          |
| `transform`    | `'uppercase' \| 'lowercase' \| 'capitalize'`            | -          |
| `weight`       | `'normal' \| 'medium' \| 'semibold' \| 'bold'`          | `'bold'`   |
| `tracking`     | `'tighter' \| 'tight' \| 'normal' \| 'wide' \| 'wider'` | `'normal'` |
| `noMargin`     | `boolean`                                               | `false`    |
| `keepWithNext` | `boolean`                                               | -          |


# Takumi

PDF UI primitives for the Takumi base.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentsList folderName="Components" base="takumi" />


# Keep Together

Keeps children on the same PDF page.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="keep-together" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/keep-together
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/keep-together/keep-together.tsx" base="takumi" title="components/pdf/keep-together/keep-together.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { KeepTogether } from "@/components/pdf/keep-together";
import { Text } from "@/components/pdf/text";
```

```tsx
<KeepTogether>
  <Text>Keep these lines together.</Text>
</KeepTogether>
```

## API Reference [#api-reference]

### KeepTogether [#keeptogether]

| Prop               | Type        | Default |
| ------------------ | ----------- | ------- |
| `children`         | `ReactNode` | -       |
| `minPresenceAhead` | `number`    | -       |
| `style`            | `Style`     | -       |


# Key Value

Definition list of keys and values.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="key-value" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/key-value
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/key-value/key-value.tsx" base="takumi" title="components/pdf/key-value/key-value.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { KeyValue } from "@/components/pdf/key-value";
```

```tsx
<KeyValue items={[{ key: "Name", value: "Ada" }]} />
```

## API Reference [#api-reference]

### KeyValue [#keyvalue]

| Prop               | Type                         | Default        |
| ------------------ | ---------------------------- | -------------- |
| `items`            | `KeyValueEntry[]`            | -              |
| `direction`        | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `divided`          | `boolean`                    | `false`        |
| `size`             | `'sm' \| 'md' \| 'lg'`       | `'md'`         |
| `labelFlex`        | `number`                     | `1`            |
| `labelColor`       | `string`                     | -              |
| `valueColor`       | `string`                     | -              |
| `boldValue`        | `boolean`                    | `false`        |
| `noWrap`           | `boolean`                    | `false`        |
| `dividerColor`     | `string`                     | -              |
| `dividerThickness` | `number`                     | -              |
| `dividerMargin`    | `number`                     | -              |


# Link

Clickable link styled for PDF documents.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="link" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/link
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/link/link.tsx" base="takumi" title="components/pdf/link/link.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Link } from "@/components/pdf/link";
```

```tsx
<Link href="https://example.com">Example</Link>
```

## API Reference [#api-reference]

### Link [#link]

| Prop        | Type                                | Default     |
| ----------- | ----------------------------------- | ----------- |
| `href`      | `string`                            | -           |
| `align`     | `'left' \| 'center' \| 'right'`     | `'left'`    |
| `color`     | `string`                            | -           |
| `variant`   | `'default' \| 'muted' \| 'primary'` | `'default'` |
| `underline` | `'always' \| 'none'`                | `'always'`  |


# List

Ordered and unordered lists.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="list" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/list
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/list/list.tsx" base="takumi" title="components/pdf/list/list.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfList } from "@/components/pdf/list";
```

```tsx
<PdfList items={[{ text: "Alpha" }, { text: "Beta" }]} />
```

### Variants [#variants]

```tsx
<PdfList variant="numbered" items={items} />
<PdfList variant="checklist" items={checklistItems} gap="md" />
```

## API Reference [#api-reference]

### PdfList [#pdflist]

| Prop      | Type                                                                                | Default    |
| --------- | ----------------------------------------------------------------------------------- | ---------- |
| `items`   | `ListItem[]`                                                                        | -          |
| `variant` | `'bullet' \| 'numbered' \| 'checklist' \| 'icon' \| 'multi-level' \| 'descriptive'` | `'bullet'` |
| `gap`     | `'xs' \| 'sm' \| 'md'`                                                              | `'sm'`     |
| `noWrap`  | `boolean`                                                                           | `false`    |
| `style`   | `Style`                                                                             | -          |


# Page Break

Forces a page break in the document.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="page-break" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/page-break
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/page-break/page-break.tsx" base="takumi" title="components/pdf/page-break/page-break.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PageBreak } from "@/components/pdf/page-break";
```

```tsx
<PageBreak />
```

## API Reference [#api-reference]

### PageBreak [#pagebreak]

| Prop       | Type    | Default |
| ---------- | ------- | ------- |
| `children` | `never` | -       |


# Page Footer

Repeating page footer.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="page-footer" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/page-footer
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/page-footer/page-footer.tsx" base="takumi" title="components/pdf/page-footer/page-footer.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PageFooter } from "@/components/pdf/page-footer";
```

```tsx
<PageFooter leftText="pdfcn" rightText="Confidential" />
```

## API Reference [#api-reference]

### PageFooter [#pagefooter]

| Prop          | Type                                                                               | Default    |
| ------------- | ---------------------------------------------------------------------------------- | ---------- |
| `leftText`    | `string`                                                                           | -          |
| `rightText`   | `string`                                                                           | -          |
| `centerText`  | `string`                                                                           | -          |
| `variant`     | `'simple' \| 'centered' \| 'branded' \| 'minimal' \| 'three-column' \| 'detailed'` | `'simple'` |
| `background`  | `string`                                                                           | -          |
| `textColor`   | `string`                                                                           | -          |
| `marginTop`   | `number`                                                                           | -          |
| `address`     | `string`                                                                           | -          |
| `phone`       | `string`                                                                           | -          |
| `email`       | `string`                                                                           | -          |
| `website`     | `string`                                                                           | -          |
| `fixed`       | `boolean`                                                                          | `false`    |
| `sticky`      | `boolean`                                                                          | `false`    |
| `pagePadding` | `number`                                                                           | `0`        |
| `noWrap`      | `boolean`                                                                          | `true`     |


# Page Header

Repeating page header.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="page-header" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/page-header
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/page-header/page-header.tsx" base="takumi" title="components/pdf/page-header/page-header.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PageHeader } from "@/components/pdf/page-header";
```

```tsx
<PageHeader title="Company" subtitle="Invoice" />
```

## API Reference [#api-reference]

### PageHeader [#pageheader]

| Prop           | Type                                                                                              | Default    |
| -------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| `title`        | `string`                                                                                          | -          |
| `subtitle`     | `string`                                                                                          | -          |
| `rightText`    | `string`                                                                                          | -          |
| `rightSubText` | `string`                                                                                          | -          |
| `variant`      | `'simple' \| 'centered' \| 'minimal' \| 'branded' \| 'logo-left' \| 'logo-right' \| 'two-column'` | `'simple'` |
| `background`   | `string`                                                                                          | -          |
| `titleColor`   | `string`                                                                                          | -          |
| `marginBottom` | `number`                                                                                          | -          |
| `address`      | `string`                                                                                          | -          |
| `phone`        | `string`                                                                                          | -          |
| `email`        | `string`                                                                                          | -          |
| `logo`         | `ReactNode`                                                                                       | -          |
| `fixed`        | `boolean`                                                                                         | `false`    |
| `noWrap`       | `boolean`                                                                                         | `true`     |


# Page Number

Current page number marker.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="page-number" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/page-number
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/page-number/page-number.tsx" base="takumi" title="components/pdf/page-number/page-number.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfPageNumber } from "@/components/pdf/page-number";
```

```tsx
<PdfPageNumber />
```

## API Reference [#api-reference]

### PdfPageNumber [#pdfpagenumber]

| Prop       | Type                            | Default                    |
| ---------- | ------------------------------- | -------------------------- |
| `format`   | `string`                        | `'Page {page} of {total}'` |
| `align`    | `'left' \| 'center' \| 'right'` | `'center'`                 |
| `size`     | `'xs' \| 'sm' \| 'md'`          | `'sm'`                     |
| `fixed`    | `boolean`                       | `false`                    |
| `muted`    | `boolean`                       | `true`                     |
| `children` | `never`                         | -                          |


# PDF Image

Embedded image with fit options.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="pdf-image" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/pdf-image
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/pdf-image/pdf-image.tsx" base="takumi" title="components/pdf/pdf-image/pdf-image.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfImage } from "@/components/pdf/pdf-image";
```

```tsx
<PdfImage src="/logo.png" width={120} />
```

## API Reference [#api-reference]

### PdfImage [#pdfimage]

| Prop           | Type                                                                                                    | Default     |
| -------------- | ------------------------------------------------------------------------------------------------------- | ----------- |
| `src`          | `string \| &#123; uri: string; method?: string; headers?: Record<string, string>; body?: string &#125;` | -           |
| `variant`      | `'default' \| 'full-width' \| 'thumbnail' \| 'avatar' \| 'cover' \| 'bordered' \| 'rounded'`            | `'default'` |
| `width`        | `number \| string`                                                                                      | -           |
| `height`       | `number \| string`                                                                                      | -           |
| `fit`          | `'cover' \| 'contain' \| 'fill' \| 'none'`                                                              | -           |
| `position`     | `string`                                                                                                | `'50% 50%'` |
| `caption`      | `string`                                                                                                | -           |
| `aspectRatio`  | `number`                                                                                                | -           |
| `borderRadius` | `number`                                                                                                | -           |
| `noWrap`       | `boolean`                                                                                               | `true`      |
| `style`        | `Style`                                                                                                 | -           |


# QR Code

QR code generated from a string value.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="qrcode" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/qrcode
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/qrcode/qrcode.tsx" base="takumi" title="components/pdf/qrcode/qrcode.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfQRCode } from "@/components/pdf/qrcode";
```

```tsx
<PdfQRCode value="https://pdfcn.dev" />
```

## API Reference [#api-reference]

### PdfQRCode [#pdfqrcode]

| Prop              | Type                       | Default |
| ----------------- | -------------------------- | ------- |
| `value`           | `string`                   | -       |
| `size`            | `number`                   | -       |
| `color`           | `string`                   | -       |
| `backgroundColor` | `string`                   | -       |
| `errorLevel`      | `'L' \| 'M' \| 'Q' \| 'H'` | -       |
| `margin`          | `number`                   | -       |
| `caption`         | `string`                   | -       |
| `children`        | `never`                    | -       |


# Section

Section wrapper with optional title.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="section" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/section
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/section/section.tsx" base="takumi" title="components/pdf/section/section.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Section } from "@/components/pdf/section";
import { Text } from "@/components/pdf/text";
```

```tsx
<Section>
  <Text>Section body</Text>
</Section>
```

## API Reference [#api-reference]

### Section [#section]

| Prop          | Type                                              | Default     |
| ------------- | ------------------------------------------------- | ----------- |
| `spacing`     | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`          | `'md'`      |
| `padding`     | `'none' \| 'sm' \| 'md' \| 'lg'`                  | -           |
| `background`  | `string`                                          | -           |
| `border`      | `boolean`                                         | `false`     |
| `variant`     | `'default' \| 'callout' \| 'highlight' \| 'card'` | `'default'` |
| `accentColor` | `string`                                          | -           |
| `noWrap`      | `boolean`                                         | `false`     |


# Signature

Signature block with name and label.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="signature" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/signature
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/signature/signature.tsx" base="takumi" title="components/pdf/signature/signature.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfSignatureBlock } from "@/components/pdf/signature";
```

```tsx
<PdfSignatureBlock name="Jane Doe" label="Authorized Signature" />
```

## API Reference [#api-reference]

### PdfSignatureBlock [#pdfsignatureblock]

| Prop      | Type                                 | Default    |
| --------- | ------------------------------------ | ---------- |
| `variant` | `'single' \| 'double' \| 'inline'`   | `'single'` |
| `label`   | `string`                             | -          |
| `name`    | `string`                             | -          |
| `title`   | `string`                             | -          |
| `date`    | `string`                             | -          |
| `signers` | `[SignatureSigner, SignatureSigner]` | -          |
| `style`   | `Style`                              | -          |


# Stack

Vertical stack with spacing.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="stack" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/stack
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/stack/stack.tsx" base="takumi" title="components/pdf/stack/stack.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Stack } from "@/components/pdf/stack";
import { Text } from "@/components/pdf/text";
```

```tsx
<Stack gap="md">
  <Text>One</Text>
  <Text>Two</Text>
</Stack>
```

## API Reference [#api-reference]

### Stack [#stack]

| Prop        | Type                                                    | Default      |
| ----------- | ------------------------------------------------------- | ------------ |
| `gap`       | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`                | `'md'`       |
| `direction` | `'vertical' \| 'horizontal'`                            | `'vertical'` |
| `align`     | `'start' \| 'center' \| 'end' \| 'stretch'`             | `'start'`    |
| `justify`   | `'start' \| 'center' \| 'end' \| 'between' \| 'around'` | `'start'`    |
| `wrap`      | `boolean`                                               | `false`      |
| `noWrap`    | `boolean`                                               | `false`      |


# Table

Low-level table primitives.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="table" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/table
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/table/table.tsx" base="takumi" title="components/pdf/table/table.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  Text,
} from "@/components/pdf/table";
```

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableCell>
        <Text>Item</Text>
      </TableCell>
    </TableRow>
  </TableHeader>
</Table>
```

### Variants [#variants]

```tsx
<Table variant="striped" zebraStripe>
  {/* header, body, rows, and cells */}
</Table>
```

## API Reference [#api-reference]

### Table [#table]

| Prop          | Type                                                                                        | Default  |
| ------------- | ------------------------------------------------------------------------------------------- | -------- |
| `variant`     | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | `'line'` |
| `zebraStripe` | `boolean`                                                                                   | `false`  |
| `noWrap`      | `boolean`                                                                                   | `false`  |
| `children`    | `ReactNode`                                                                                 | -        |
| `style`       | `Style`                                                                                     | -        |

### TableRow [#tablerow]

| Prop      | Type                                                                                        | Default   |
| --------- | ------------------------------------------------------------------------------------------- | --------- |
| `header`  | `boolean`                                                                                   | `false`   |
| `footer`  | `boolean`                                                                                   | `false`   |
| `stripe`  | `boolean`                                                                                   | `false`   |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | inherited |

### TableCell [#tablecell]

| Prop      | Type                                                                                        | Default   |
| --------- | ------------------------------------------------------------------------------------------- | --------- |
| `header`  | `boolean`                                                                                   | `false`   |
| `footer`  | `boolean`                                                                                   | `false`   |
| `align`   | `'left' \| 'center' \| 'right'`                                                             | `'left'`  |
| `width`   | `string \| number`                                                                          | -         |
| `variant` | `'line' \| 'grid' \| 'minimal' \| 'striped' \| 'compact' \| 'bordered' \| 'primary-header'` | inherited |


# Text

Body text with typography variants.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="text" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/text
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/text/text.tsx" base="takumi" title="components/pdf/text/text.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { Text } from "@/components/pdf/text";
```

```tsx
<Text>Hello from pdfcn</Text>
```

## API Reference [#api-reference]

### Text [#text]

| Prop         | Type                                                       | Default    |
| ------------ | ---------------------------------------------------------- | ---------- |
| `variant`    | `'xs' \| 'sm' \| 'base' \| 'lg' \| 'xl' \| '2xl' \| '3xl'` | `'base'`   |
| `align`      | `'left' \| 'center' \| 'right' \| 'justify'`               | `'left'`   |
| `color`      | `string`                                                   | -          |
| `weight`     | `'normal' \| 'medium' \| 'semibold' \| 'bold'`             | `'normal'` |
| `italic`     | `boolean`                                                  | `false`    |
| `decoration` | `'underline' \| 'line-through' \| 'none'`                  | `'none'`   |
| `transform`  | `'uppercase' \| 'lowercase' \| 'capitalize'`               | -          |
| `noMargin`   | `boolean`                                                  | `false`    |


# Watermark

Diagonal or centered watermark overlay.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).



<ComponentPreview base="takumi" name="watermark" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/watermark
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Install the following dependencies:
      </Step>

      ```bash
      npm install takumi-pdf @takumi-rs/helpers
      ```

      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/watermark/watermark.tsx" base="takumi" title="components/pdf/watermark/watermark.tsx" />

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" base="takumi" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/resolve-color.ts" base="takumi" title="lib/resolve-color.ts" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-primitives.tsx" base="takumi" title="lib/pdf-primitives.tsx" />

      <ComponentSource src="registry/bases/takumi/lib/pdf-svg.tsx" base="takumi" title="lib/pdf-svg.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <ComponentSource src="registry/types/pdf-components.ts" base="takumi" title="types/pdf-components.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfWatermark } from "@/components/pdf/watermark";
import { Text } from "@/components/pdf/text";
```

```tsx
<PdfWatermark text="DRAFT" />
```

## API Reference [#api-reference]

### PdfWatermark [#pdfwatermark]

| Prop       | Type                                                                       | Default |
| ---------- | -------------------------------------------------------------------------- | ------- |
| `text`     | `string`                                                                   | -       |
| `opacity`  | `number`                                                                   | -       |
| `fontSize` | `number`                                                                   | -       |
| `color`    | `string`                                                                   | -       |
| `angle`    | `number`                                                                   | -       |
| `position` | `'center' \| 'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right'` | -       |
| `fixed`    | `boolean`                                                                  | `true`  |
| `children` | `never`                                                                    | -       |


# Theming

Configure PDF themes, colors, typography, and spacing for Forme.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ThemePreview base="forme" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/forme/theme-provider
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/forme/components/theme-provider.tsx" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="forme" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="forme" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="forme" title="types/pdf-themes.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { professionalTheme } from "@/lib/pdf-themes/professional";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={professionalTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```

## Color Tokens [#color-tokens]

All color values must be hex strings (e.g., `#1a1a1a`). React PDF supports hex, `rgb()`, and `hsl()` — but NOT `oklch`.

| Token               | Purpose                     |
| ------------------- | --------------------------- |
| `foreground`        | Primary text color          |
| `background`        | Page background             |
| `muted`             | Secondary backgrounds       |
| `mutedForeground`   | Captions, footnotes         |
| `primary`           | Brand/accent color          |
| `primaryForeground` | Text on primary backgrounds |
| `border`            | Table borders, dividers     |
| `accent`            | Call-to-action elements     |
| `destructive`       | Error states                |
| `success`           | Success states              |
| `warning`           | Warning states              |
| `info`              | Informational states        |

## Primitive Tokens [#primitive-tokens]

Primitives define the raw design scales available to themes:

* **Typography Scale** — Major Third (1.25) ratio with 12pt base
* **Spacing Scale** — 4pt grid system
* **Font Weights** — 400–700
* **Line Heights** — 1.2–1.6
* **Border Radius** — 0–8pt

## Custom Themes [#custom-themes]

Use the `PdfcnTheme` interface to create custom themes while preserving the complete theme shape.

```tsx
import type { PdfcnTheme } from "@/registry/themes";
import { defaultPrimitives } from "@/registry/themes";

export const oceanTheme: PdfcnTheme = {
  name: "ocean",
  primitives: defaultPrimitives,
  colors: {
    foreground: "#0f172a",
    background: "#ffffff",
    primary: "#0369a1",
    accent: "#0ea5e9",
    muted: "#f1f5f9",
    border: "#e2e8f0",
    mutedForeground: "#64748b",
    primaryForeground: "#ffffff",
    destructive: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    info: "#0ea5e9",
  },
  typography: {
    body: { fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.6 },
    heading: {
      fontFamily: "Times-Roman",
      fontWeight: 700,
      lineHeight: 1.25,
      fontSize: { h1: 32, h2: 24, h3: 20, h4: 16, h5: 14, h6: 12 },
    },
  },
  spacing: {
    page: { marginTop: 56, marginRight: 48, marginBottom: 56, marginLeft: 48 },
    sectionGap: 28,
    paragraphGap: 10,
    componentGap: 14,
  },
  page: { size: "A4", orientation: "portrait" },
};
```

## Available Themes [#available-themes]

<ThemePreviewGrid />


# Theming

Configure PDF themes, colors, typography, and spacing for Takumi.

> For the complete documentation index, see [llms.txt](/llms.txt). Markdown variants are available by appending `.md` to any URL or sending an `Accept: text/markdown` header. An agent skill is available at [/.well-known/agent-skills/site-skill.md](/.well-known/agent-skills/site-skill.md).





<ThemePreview base="takumi" />

## Installation [#installation]

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">
      Command
    </TabsTrigger>

    <TabsTrigger value="manual">
      Manual
    </TabsTrigger>
  </TabsList>

  <TabsContent value="cli">
    ```bash
    npx shadcn@latest add @pdfcn/takumi/theme-provider
    ```
  </TabsContent>

  <TabsContent value="manual">
    <Steps>
      <Step>
        Copy and paste the following code into your project.
      </Step>

      <ComponentSource src="registry/bases/takumi/components/theme-provider.tsx" title="components/pdf/theme-provider.tsx" />

      <ComponentSource src="registry/themes/professional.ts" base="takumi" title="lib/pdf-themes/professional.ts" />

      <ComponentSource src="registry/themes/primitives.ts" base="takumi" title="lib/pdf-themes/primitives.ts" />

      <ComponentSource src="registry/types/pdf-themes.ts" base="takumi" title="types/pdf-themes.ts" />

      <Step>
        Update the import paths to match your project setup.
      </Step>
    </Steps>
  </TabsContent>
</CodeTabs>

## Usage [#usage]

```tsx
import { PdfcnThemeProvider } from "@/components/pdf/theme-provider";
import { professionalTheme } from "@/lib/pdf-themes/professional";

export function Invoice() {
  return (
    <PdfcnThemeProvider theme={professionalTheme}>
      {/* Your PDF content */}
    </PdfcnThemeProvider>
  );
}
```

## Color Tokens [#color-tokens]

All color values must be hex strings (e.g., `#1a1a1a`). React PDF supports hex, `rgb()`, and `hsl()` — but NOT `oklch`.

| Token               | Purpose                     |
| ------------------- | --------------------------- |
| `foreground`        | Primary text color          |
| `background`        | Page background             |
| `muted`             | Secondary backgrounds       |
| `mutedForeground`   | Captions, footnotes         |
| `primary`           | Brand/accent color          |
| `primaryForeground` | Text on primary backgrounds |
| `border`            | Table borders, dividers     |
| `accent`            | Call-to-action elements     |
| `destructive`       | Error states                |
| `success`           | Success states              |
| `warning`           | Warning states              |
| `info`              | Informational states        |

## Primitive Tokens [#primitive-tokens]

Primitives define the raw design scales available to themes:

* **Typography Scale** — Major Third (1.25) ratio with 12pt base
* **Spacing Scale** — 4pt grid system
* **Font Weights** — 400–700
* **Line Heights** — 1.2–1.6
* **Border Radius** — 0–8pt

## Custom Themes [#custom-themes]

Use the `PdfcnTheme` interface to create custom themes while preserving the complete theme shape.

```tsx
import type { PdfcnTheme } from "@/registry/themes";
import { defaultPrimitives } from "@/registry/themes";

export const oceanTheme: PdfcnTheme = {
  name: "ocean",
  primitives: defaultPrimitives,
  colors: {
    foreground: "#0f172a",
    background: "#ffffff",
    primary: "#0369a1",
    accent: "#0ea5e9",
    muted: "#f1f5f9",
    border: "#e2e8f0",
    mutedForeground: "#64748b",
    primaryForeground: "#ffffff",
    destructive: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
    info: "#0ea5e9",
  },
  typography: {
    body: { fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.6 },
    heading: {
      fontFamily: "Times-Roman",
      fontWeight: 700,
      lineHeight: 1.25,
      fontSize: { h1: 32, h2: 24, h3: 20, h4: 16, h5: 14, h6: 12 },
    },
  },
  spacing: {
    page: { marginTop: 56, marginRight: 48, marginBottom: 56, marginLeft: 48 },
    sectionGap: 28,
    paragraphGap: 10,
    componentGap: 14,
  },
  page: { size: "A4", orientation: "portrait" },
};
```

## Available Themes [#available-themes]

<ThemePreviewGrid />
