---
name: tareas
description: Ejecuta la fase de desglose de tareas de Spec-Driven Development (SDD). Con base en plan.md, genera tasks.md con lista de tareas pequeñas, numeradas y con casillas para marcar, sin escribir código.
argument-hint: "<funcionalidad>"
---

# SDD: /tareas

Comando para desglosar el plan técnico en tareas ejecutables individuales en SDD.

## Instrucciones

Con base en el plan (`specs/<funcionalidad>/plan.md`), genera `specs/<funcionalidad>/tasks.md` con:
- Una lista de tareas pequeñas, atómicas y numeradas.
- Cada tarea debe contar con una casilla de verificación para marcar (`- [ ]`).
- No escribas código en esta fase.
