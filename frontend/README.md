# Queda / SafeSpend (Expo React Native)

Aplicación offline-first para control de gastos personales con límites Free/Pro/Plus mockeados en cliente.

## Decisión sobre objetivo de ahorro en setup

Para reducir riesgo y mantener reglas consistentes, **no** se permite crear objetivos de ahorro desde setup cuando el plan no lo permite (Free = 0 objetivos).

- El paso de objetivo sigue siendo opcional en setup.
- Si el usuario Free llena ese paso, el objetivo se omite silenciosamente al finalizar setup.
- La creación de objetivos sigue disponible desde la pantalla dedicada, donde se muestra paywall cuando corresponde.

Esto evita inconsistencias entre setup y el resto de flujos, sin rediseñar onboarding ni cambiar la arquitectura offline-first.

## Critical QA checklist

1. Fresh install → onboarding → setup → home.
2. Add 30 expenses on Free, verify the 31st is blocked from both Expenses tab and direct add screen.
3. Add 8 bills on Free, verify the 9th is blocked.
4. Add 2 envelopes on Free, verify the 3rd is blocked.
5. Use Can I Buy This 3 times on Free, verify the 4th is blocked.
6. Activate Pro mock, verify limits unlock.
7. Activate Plus mock, verify Plus features unlock.
8. Reset data, verify onboarding starts again.
