# Aula de exámenes

Aplicación web de demostración para crear exámenes y formularios, compartirlos entre cuentas del mismo navegador y consultar las respuestas. También incluye un formulario de registro que valida un documento PDF seleccionado.

## Funcionalidades

- Crear una cuenta local o ingresar con una cuenta existente.
- Explorar exámenes propios y exámenes creados por otras cuentas locales.
- Crear exámenes con preguntas de opción múltiple o respuesta abierta.
- Guardar automáticamente borradores de creación y de respuestas.
- Responder exámenes y limitar cada cuenta a un envío por examen.
- Consultar las respuestas recibidas de los exámenes propios.
- Completar un formulario de registro con un PDF válido.
- Cambiar entre modo claro y oscuro; la preferencia se conserva en el navegador.

## Tecnologías

- Node.js 24
- React 19
- React Router 7
- Vite 8
- Vitest y React Testing Library

## Requisitos

- Node.js 24
- npm

## Instalación y ejecución

Desde la carpeta del proyecto:

```bash
npm ci
npm run dev
```

Vite mostrará en la terminal la dirección local de la aplicación. Ábrela en un navegador para empezar.

## Cuenta de demostración

También puedes iniciar sesión con estas credenciales:

- Usuario: `demo`
- Contraseña: `Examen123!`

O crea una cuenta desde la opción **Crear cuenta**.

## Pruebas y compilación

Ejecutar todas las pruebas una vez:

```bash
npm test
```

Ejecutar Vitest en modo interactivo:

```bash
npm run test:watch
```

Generar la versión de producción:

```bash
npm run build
```

Previsualizar localmente la compilación:

```bash
npm run preview
```

## Almacenamiento y alcance de la demostración

La aplicación no utiliza un servidor ni una base de datos. Las cuentas, la sesión, los exámenes, las respuestas, los borradores y la preferencia de tema se almacenan en `localStorage` del navegador. Por ello, los datos solo están disponibles en ese navegador y dispositivo; las cuentas distintas del mismo navegador pueden compartir los exámenes creados allí.

El formulario de registro comprueba que el archivo tenga extensión PDF, tipo MIME compatible y una firma PDF válida, pero no envía ni guarda los datos personales o el archivo. Esta aplicación es una demostración y no debe usarse para proteger credenciales ni procesar información personal real.
