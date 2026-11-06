# Comandos personalizados SDD

Un prompt por cada fase de Spec-Driven Development. Se reutilizan cambiando
el nombre de la funcionalidad (por ejemplo, 001-buscador-platos).

## /especificar
No escribas código. Lee AGENTS.md, memory.md y docs/constitution.md.
Hazme máximo 5 preguntas para aclarar la funcionalidad. Con mis respuestas,
genera specs/<funcionalidad>/spec.md con: objetivo, requisitos funcionales
numerados, casos límite y criterios de aceptación.

## /clarificar
Revisa specs/<funcionalidad>/spec.md como si fueras un analista de calidad.
Lista ambigüedades, contradicciones y requisitos que falten. Corrige la spec
con lo que encuentres y dime qué cambiaste.

## /planificar
Lee docs/constitution.md y la spec. No escribas código. Genera
specs/<funcionalidad>/plan.md con los archivos que vas a tocar, cómo lo vas
a implementar y los casos límite.

## /tareas
Con base en el plan, genera specs/<funcionalidad>/tasks.md con una lista de
tareas pequeñas y numeradas, con casillas para marcar. No escribas código.

## /implementar
Implementa solo la siguiente tarea pendiente de tasks.md. Márcala como hecha
y actualiza memory.md. Dime qué archivos cambiaste.

## /validar
Valida la implementación contra specs/<funcionalidad>/spec.md. Para cada
criterio de aceptación dime si se cumple. Si algo no se cumple, corrígelo.