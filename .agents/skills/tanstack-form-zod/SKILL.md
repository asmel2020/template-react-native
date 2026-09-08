---
name: tanstack-form-zod
description: Guía y mejores prácticas para validación de formularios y campos en TanStack Form usando Zod y la especificación Standard Schema (validación síncrona, asíncrona, debounce, a nivel de formulario y de campo, y patrones para React Native / PanelUI).
---

# Validación de Formularios y Campos con TanStack Form y Zod

En el núcleo de la funcionalidad de TanStack Form se encuentra el concepto de validación. Al combinarse con **Zod**, la validación se vuelve estrictamente tipada, declarativa y altamente personalizable:

- Control de **cuándo** se valida (`onChange`, `onBlur`, `onSubmit`).
- Definición de reglas a **nivel de campo** (`<form.Field>`) o a **nivel de formulario** (`useForm({ validators: ... })`).
- Validación **síncrona** y **asíncrona** (ej. consultas a APIs o bases de datos con `.refine(async ...)`).
- Soporte nativo de **Standard Schema**: No se requieren adaptadores externos; los esquemas Zod se pasan directamente a los callbacks de validación.

---

## 1. Soporte Nativo de Standard Schema (Zod)

TanStack Form v1 implementa la especificación **Standard Schema** (`~standard`). Zod (a partir de v3.24 y v4) la soporta nativamente.

Esto significa que puedes pasar cualquier esquema de Zod (`z.object()`, `z.string()`, etc.) directamente en la propiedad `validators` de la configuración del formulario o de los campos individuales sin necesidad de envoltorios o adaptadores adicionales.

```tsx
import { z } from 'zod';
import { useForm } from '@tanstack/react-form';

const loginSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(6, { error: 'La contraseña debe tener al menos 6 caracteres' }),
});
```

---

## 2. ¿Cuándo se ejecuta la validación? (Triggers)

TanStack Form permite definir exactamente cuándo debe ejecutarse la validación pasando el esquema Zod en el evento deseado dentro de `validators`:

### A. Validación en cada pulsación (`onChange`)

Se evalúa cada vez que el valor cambia mediante `field.handleChange(val)`:

```tsx
<form.Field
  name="age"
  validators={{
    onChange: z.coerce.number().min(13, { error: 'Debes tener al menos 13 años' }),
  }}
>
  {(field) => (
    <View>
      <TextInput
        value={String(field.state.value)}
        onChangeText={(text) => field.handleChange(Number(text))}
      />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <Text style={{ color: 'red' }}>{field.state.meta.errors[0]}</Text>
      )}
    </View>
  )}
</form.Field>
```

### B. Validación al perder el foco (`onBlur`)

Se evalúa únicamente cuando el usuario abandona el campo (llamando a `field.handleBlur`):

```tsx
<form.Field
  name="age"
  validators={{
    onBlur: z.coerce.number().min(13, { error: 'Debes tener al menos 13 años' }),
  }}
>
  {(field) => (
    <View>
      <TextInput
        value={String(field.state.value)}
        onBlur={field.handleBlur}
        onChangeText={(text) => field.handleChange(Number(text))}
      />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <Text style={{ color: 'red' }}>{field.state.meta.errors[0]}</Text>
      )}
    </View>
  )}
</form.Field>
```

### C. Múltiples eventos combinados

Puedes validar diferentes aspectos del campo en momentos distintos:

```tsx
<form.Field
  name="age"
  validators={{
    // Valida rango positivo mientras escribe
    onChange: z.coerce.number().min(0, { error: 'La edad no puede ser negativa' }),
    // Valida mayoría de edad solo al salir del campo
    onBlur: z.coerce.number().min(18, { error: 'Debes ser mayor de edad' }),
  }}
>
  {(field) => (
    <View>
      <TextInput
        value={String(field.state.value)}
        onBlur={field.handleBlur}
        onChangeText={(text) => field.handleChange(Number(text))}
      />
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <Text style={{ color: 'red' }}>{field.state.meta.errors.join(', ')}</Text>
      )}
    </View>
  )}
</form.Field>
```

---

## 3. Visualización de Errores

### Buenas prácticas de UX: `isTouched`
Para no frustrar al usuario con errores antes de que interactúe con el formulario, muestra los errores solo si el campo ha sido tocado:

```tsx
const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;

{hasError && (
  <Text style={{ color: 'red', fontSize: 12 }}>
    {field.state.meta.errors[0]}
  </Text>
)}
```

### Acceso a errores por evento (`errorMap`)
Si necesitas saber si el error proviene de `onChange` o `onBlur`:

```tsx
{field.state.meta.errorMap['onBlur'] ? (
  <Text style={{ color: 'red' }}>{field.state.meta.errorMap['onBlur']}</Text>
) : null}
```

---

## 4. Validación a Nivel de Formulario vs a Nivel de Campo

### A. A nivel de Formulario (Recomendado para esquemas completos)
Al pasar un `z.object({...})` a los `validators` de `useForm()`, TanStack Form valida todo el objeto y **propaga automáticamente los errores a cada campo correspondiente**:

```tsx
const userSchema = z.object({
  fullName: z.string().min(3, { error: 'El nombre debe tener al menos 3 caracteres' }),
  age: z.coerce.number().min(13, { error: 'Debes tener al menos 13 años' }),
});

export function RegisterForm() {
  const form = useForm({
    defaultValues: {
      fullName: '',
      age: 0,
    },
    validators: {
      onChange: userSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Datos válidos:', value);
    },
  });

  return (
    <View>
      {/* El campo fullName recibe automáticamente los errores de userSchema.fullName */}
      <form.Field name="fullName">
        {(field) => (
          <View>
            <TextInput
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <Text style={{ color: 'red' }}>{field.state.meta.errors[0]}</Text>
            )}
          </View>
        )}
      </form.Field>

      {/* El campo age recibe automáticamente los errores de userSchema.age */}
      <form.Field name="age">
        {(field) => (
          <View>
            <TextInput
              value={String(field.state.value)}
              onBlur={field.handleBlur}
              onChangeText={(text) => field.handleChange(Number(text))}
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <Text style={{ color: 'red' }}>{field.state.meta.errors[0]}</Text>
            )}
          </View>
        )}
      </form.Field>
    </View>
  );
}
```

### B. Mostrar errores globales del formulario
Cuando se usa un esquema Standard Schema (Zod) a nivel de formulario, `state.errorMap.onChange` contiene los issues mapeados por nombre de campo:

```tsx
<form.Subscribe
  selector={(state) => [state.errorMap]}
  children={([errorMap]) =>
    errorMap.onChange ? (
      <View>
        {Object.values(errorMap.onChange)
          .flat()
          .map((issue, idx) => (
            <Text key={idx} style={{ color: 'red' }}>
              {issue.message}
            </Text>
          ))}
      </View>
    ) : null
  }
/>
```

### C. Precedencia: Campo vs Formulario
> Si defines validadores tanto a nivel de formulario como a nivel de campo para la misma propiedad, el validador específico de `<form.Field>` tiene precedencia y puede sobreescribir el mensaje devuelto por la validación del formulario.

---

## 5. Validación Asíncrona con Zod

La validación asíncrona es esencial para verificar unicidad contra la base de datos o API (ej. correo ya registrado, username en uso).

### A. Esquemas Zod con `.refine(async ...)`
Zod soporta validadores asíncronos con `.refine()`:

```tsx
const usernameSchema = z.string().min(3).refine(
  async (username) => {
    const isAvailable = await checkUsernameInApi(username);
    return isAvailable;
  },
  { error: 'Este nombre de usuario ya está en uso' }
);
```

### B. Aplicación en TanStack Form con `onChangeAsync` y `asyncDebounceMs`
Para evitar saturar el backend con peticiones en cada pulsación, **siempre utiliza `asyncDebounceMs`**:

```tsx
<form.Field
  name="username"
  asyncDebounceMs={500}
  validators={{
    // Validación síncrona inmediata
    onChange: z.string().min(3, { error: 'Mínimo 3 caracteres' }),
    // Validación asíncrona debounced
    onChangeAsync: z.string().refine(
      async (val) => {
        const available = await apiCheckUsername(val);
        return available;
      },
      { error: 'El usuario ya existe' }
    ),
  }}
>
  {(field) => (
    <View>
      <TextInput
        value={field.state.value}
        onBlur={field.handleBlur}
        onChangeText={field.handleChange}
      />
      {field.state.meta.isValidating && (
        <ActivityIndicator size="small" />
      )}
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
        <Text style={{ color: 'red' }}>{field.state.meta.errors[0]}</Text>
      )}
    </View>
  )}
</form.Field>
```

### C. Orden de ejecución Síncrono vs Asíncrono
Por defecto, la validación síncrona (`onChange` / `onBlur`) se ejecuta primero. La validación asíncrona (`onChangeAsync` / `onBlurAsync`) **solo se ejecuta si la síncrona pasa sin errores**.
- Si deseas que la validación asíncrona se ejecute siempre (sin importar el resultado síncrono), añade la opción `asyncAlways: true` en el campo.

---

## 6. Control del Botón de Envío (`canSubmit` e `isSubmitting`)

Durante la interacción del usuario o mientras la validación esté activa, usa `form.Subscribe` para controlar reactivamente el botón de submit:

- `canSubmit`: Es `false` cuando cualquier campo tiene errores y el formulario ha sido tocado.
- `isPristine`: Es `true` si el usuario aún no ha modificado ningún campo.
- `isSubmitting`: Es `true` mientras la función `onSubmit` se está ejecutando.

```tsx
<form.Subscribe
  selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
  children={([canSubmit, isSubmitting, isPristine]) => (
    <Button
      disabled={!canSubmit || isPristine || isSubmitting}
      loading={isSubmitting}
      onPress={form.handleSubmit}
    >
      {isSubmitting ? 'Guardando...' : 'Registrar'}
    </Button>
  )}
/>
```

---

## 7. Manejo de Números y Tipos en React Native con Zod

En React Native, los componentes `TextInput` reciben y devuelven cadenas de texto (`string`). Con Zod, existen dos enfoques recomendados:

### Enfoque 1: `z.coerce.number()` (Recomendado)
Permite transformar automáticamente la cadena recibida al número correspondiente durante la validación:

```tsx
const schema = z.object({
  age: z.coerce
    .number({ error: 'Debe ingresar un número' })
    .min(18, { error: 'Debes ser mayor de 18' }),
});
```

### Enfoque 2: Conversión manual en `field.handleChange`
```tsx
<TextInput
  keyboardType="numeric"
  value={String(field.state.value)}
  onChangeText={(text) => {
    const parsed = text === '' ? 0 : Number(text);
    field.handleChange(parsed);
  }}
/>
```

---

## 8. Patrón Completo para React Native / PanelUI

Ejemplo completo combinando Zod Standard Schema, validación a nivel de formulario, validación asíncrona con debounce, y componentes de PanelUI / React Native:

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import { Input, Button, Text } from 'panelui-native';

const registerSchema = z.object({
  email: z.email({ error: 'Ingresa un correo electrónico válido' }),
  age: z.coerce.number().min(18, { error: 'Debes ser mayor de edad (18+)' }),
});

export function RegisterScreen() {
  const form = useForm({
    defaultValues: {
      email: '',
      age: 18,
    },
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      // value está garantizado de cumplir con el esquema registerSchema
      await apiRegisterUser(value);
    },
  });

  return (
    <View style={styles.container}>
      {/* Campo Email con validación de formato (formulario) + async debounce de unicidad */}
      <form.Field
        name="email"
        asyncDebounceMs={500}
        validators={{
          onChangeAsync: z.string().refine(
            async (email) => {
              if (!email.includes('@')) return true; // deja pasar al validador de formato
              const isAvailable = await checkEmailAvailability(email);
              return isAvailable;
            },
            { error: 'Este correo ya se encuentra registrado' }
          ),
        }}
      >
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View style={styles.fieldContainer}>
              <Input
                label="Correo Electrónico"
                value={field.state.value}
                onChangeText={field.handleChange}
                onBlur={field.handleBlur}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {field.state.meta.isValidating && (
                <Text style={styles.validatingText}>Verificando disponibilidad...</Text>
              )}
              {hasError && (
                <Text style={styles.errorText}>{field.state.meta.errors[0]}</Text>
              )}
            </View>
          );
        }}
      </form.Field>

      {/* Campo Edad */}
      <form.Field name="age">
        {(field) => {
          const hasError = field.state.meta.isTouched && field.state.meta.errors.length > 0;
          return (
            <View style={styles.fieldContainer}>
              <Input
                label="Edad"
                value={String(field.state.value)}
                onChangeText={(text) => field.handleChange(Number(text))}
                onBlur={field.handleBlur}
                keyboardType="numeric"
              />
              {hasError && (
                <Text style={styles.errorText}>{field.state.meta.errors[0]}</Text>
              )}
            </View>
          );
        }}
      </form.Field>

      {/* Botón de Submit reactivo */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
        children={([canSubmit, isSubmitting, isPristine]) => (
          <Button
            onPress={form.handleSubmit}
            disabled={!canSubmit || isPristine || isSubmitting}
            loading={isSubmitting}
          >
            Crear Cuenta
          </Button>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  fieldContainer: {
    gap: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
  },
  validatingText: {
    color: '#6b7280',
    fontSize: 12,
  },
});
```

---

## 9. Resumen de Reglas Clave

1. **Sin adaptadores**: Pasa el esquema Zod directamente en `validators: { onChange: schema }` o `validators: { onBlur: schema }`.
2. **Standard Schema Nativo**: `@tanstack/react-form` y `zod` se integran automáticamente mediante `~standard`.
3. **Validación Asíncrona**: Usa `z.string().refine(async ...)` o `z.object().refine(async ...)` con `onChangeAsync` / `onBlurAsync`.
4. **Debounce Obligatorio**: Cuando haya validación asíncrona en `onChangeAsync`, especifica `asyncDebounceMs={500}` para proteger la API.
5. **UI Limpia**: Muestra mensajes de error sólo si `field.state.meta.isTouched && field.state.meta.errors.length > 0`.
6. **Subscripción Reactiva**: Conecta `canSubmit`, `isPristine` e `isSubmitting` usando `form.Subscribe` para el botón de acción principal.
