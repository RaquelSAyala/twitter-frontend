# Twitter Frontend

Frontend de un clon simple de Twitter construido con React y Vite.  
La app consume una API backend para mostrar el timeline y publicar posts autenticados con Auth0.

## Integrantes:

- Raquel Selma

- Deisy Guzmán

- Lina Sánchez

## Qué se hizo

- Se creó una SPA con React 19 sobre Vite.
- Se integró autenticación con Auth0 usando `@auth0/auth0-react`.
- Se implementó listado público de posts desde el backend (`GET /stream`).
- Se implementó creación de posts autenticados (`POST /posts`) con token Bearer.
- Se agregó control de sesión ante reinicio del backend consultando `GET /instance`.
- Se armó una UI base de timeline con formulario de publicación (límite 140 caracteres).

## Arquitectura

El proyecto sigue una arquitectura frontend simple por capas:

1. Capa de entrada
- `src/main.jsx` monta React y envuelve la app con el proveedor de Auth0.

2. Capa de autenticación
- `src/components/Auth0ProviderWithHistory.jsx` centraliza configuración Auth0 con variables de entorno.
- Si falta configuración, muestra un estado de error guiando qué variables completar.

3. Capa de presentación y lógica de página
- `src/App.jsx` contiene:
	- Estado local de posts y contenido del formulario.
	- Carga inicial del timeline.
	- Publicación de posts con token (`getAccessTokenSilently`).
	- Render condicional según autenticación (login/logout/formulario).

4. Capa de acceso a API
- Se usa `axios` directamente en `App.jsx` para consumir el backend.
- URL base configurable por `VITE_API_BASE_URL`.

## Estructura principal

```
src/
	main.jsx
	App.jsx
	App.css
	index.css
	components/
		Auth0ProviderWithHistory.jsx
```

## Variables de entorno

Crear archivo `.env.local` en la raíz del frontend con:

```env
VITE_API_BASE_URL=http://localhost:3000

VITE_AUTH0_DOMAIN=tu-dominio.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id
VITE_AUTH0_AUDIENCE=tu_api_audience
VITE_AUTH0_SCOPE=openid profile email read:posts write:posts read:profile
VITE_AUTH0_REDIRECT_URI=http://localhost:5173
```

## Scripts

- `npm run dev`: levanta el entorno local (puerto 5173).
- `npm run build`: genera build de producción.
- `npm run preview`: sirve el build generado.
- `npm run lint`: ejecuta ESLint.

## Flujo funcional

1. La app carga posts públicos desde `/stream`.
2. Si el usuario no está autenticado, puede iniciar sesión con Auth0.
3. Autenticado, puede crear un post (máximo 140 caracteres).
4. El frontend obtiene un access token y lo envía al backend para autorizar el `POST /posts`.

## Stack

- React 19
- Vite 8
- Auth0 React SDK
- Axios
- ESLint 9
