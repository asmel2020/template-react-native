# Reglas del Proyecto (Workspace Guidelines)

## Formularios
- **Librería de Formularios**: Usar **única y exclusivamente `@tanstack/react-form`**.
- **Validación**: Todos los formularios deben estar **validados con `Zod`** (`z.object({...})`).
- **Standard Schema**: Tanto `@tanstack/react-form` v1 como `zod` soportan la especificación Standard Schema de forma nativa (`validators: { onChange: schema }`).
- **Integración con React Native / PanelUI**:
  - Enlazar cada campo con `field.state.value`, `onChangeText={field.handleChange}` y `onBlur={field.handleBlur}`.
  - Mostrar mensajes de error condicionales cuando `field.state.meta.isTouched && field.state.meta.errors.length > 0`.
  - Conectar el botón de submit mediante `form.Subscribe` para controlar reactivamente `canSubmit` e `isSubmitting`.
