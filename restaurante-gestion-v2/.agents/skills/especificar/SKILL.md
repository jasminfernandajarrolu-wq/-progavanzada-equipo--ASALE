---
name: especificar
description: Ejecuta la fase de especificación de Spec-Driven Development (SDD). Lee la documentación contextual, formula preguntas para aclarar la funcionalidad y genera el archivo spec.md sin escribir código.
argument-hint: "<funcionalidad>"
---

# SDD: /especificar

Comando para la fase inicial de especificación en el flujo Spec-Driven Development.

## Instrucciones

No escribas código. Lee `AGENTS.md`, `memory.md` y `docs/constitution.md`.

Hazme máximo 5 preguntas para aclarar la funcionalidad. Con mis respuestas, genera `specs/<funcionalidad>/spec.md` con:
- **Objetivo**
- **Requisitos funcionales numerados**
- **Casos límite**
- **Criterios de aceptación**
