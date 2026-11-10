# Token Efficiency Policy

Optimize token consumption in every interaction and task.

## General rules

- Be concise and direct. Avoid unnecessary explanations, repetition and introductions.
- Prefer short, precise responses over verbose descriptions.
- Do not repeat information already provided or established in the conversation.
- Do not summarize entire files when only specific sections are relevant.
- Avoid unnecessary examples, alternatives and background explanations.
- Use bullet points instead of lengthy paragraphs when appropriate.

## Context management

- Read only the files and code sections necessary to complete the task.
- Prefer targeted searches over scanning entire directories.
- Avoid loading large files unless strictly necessary.
- Reuse information already available in the conversation.
- Do not re-read files unless they have changed or additional context is required.
- Avoid redundant tool calls and repeated searches.

## Code generation

- Modify only the code necessary to fulfill the request.
- Do not rewrite entire files when a targeted change is sufficient.
- Avoid unnecessary comments, documentation and boilerplate.
- Reuse existing functions, components and utilities.
- Do not generate code or tests unrelated to the requested task.

## Tool usage

- Use tools only when they provide meaningful value.
- Prefer a single targeted operation over multiple redundant operations.
- Avoid unnecessary MCP calls.
- Do not invoke subagents unless parallelization provides a clear benefit.

## Output

- Report only relevant changes and important decisions.
- Show code snippets only when necessary.
- Do not include lengthy explanations unless explicitly requested.
- Ask for clarification only when essential information is missing.

## Priority

Token efficiency must not compromise correctness, security, maintainability or completeness.