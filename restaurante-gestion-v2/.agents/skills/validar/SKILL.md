---
name: validar
description: Ejecuta la fase de validación de Spec-Driven Development (SDD). Evalúa la implementación frente a los criterios de aceptación de spec.md e introduce correcciones si algo no se cumple.
argument-hint: "<funcionalidad>"
---

# SDD: /validar

Comando para validar y verificar que la implementación cumpla estrictamente con la especificación en SDD.

## Instrucciones

Valida la implementación contra `specs/<funcionalidad>/spec.md`.

1. Revisa cada criterio de aceptación y reporta de manera explícita si se cumple o no.
2. Si algún criterio o caso límite no se cumple, corrígelo en el código.
3. Notifica al usuario el resultado de la validación y los ajustes realizados si fueron necesarios.
