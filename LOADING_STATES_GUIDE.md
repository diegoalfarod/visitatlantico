# 🎯 Guía de Loading States Premium

Sistema completo de estados de carga para una experiencia de usuario profesional.

## 📋 Componentes Implementados

### 1. **TopLoadingBar** - Barra de progreso global ✅

Barra delgada en la parte superior que se muestra automáticamente durante navegaciones.

**Características:**
- ✨ Gradiente premium (azul → naranja → rojo)
- 🌊 Animación fluida con easing cinematográfico
- 💡 Efecto de glow en el extremo
- 🎯 z-index 9999 para estar siempre visible

**Ubicación:** Ya integrado en `layout.tsx` - funciona automáticamente

---

### 2. **Skeleton Components** - Estados de carga visuales ✅

Componentes que muestran la estructura del contenido mientras carga.

**Disponibles:**
```tsx
import {
  SkeletonCard,      // Para cards individuales
  SkeletonGrid,      // Para grids de cards
  SkeletonHero,      // Para secciones hero
  SkeletonList,      // Para listas
  SkeletonText,      // Para bloques de texto
  SkeletonButton,    // Para botones
} from "@/components/loading/SkeletonCard";
```

**Ejemplo de uso:**
```tsx
// En un componente
import { SkeletonGrid } from "@/components/loading/SkeletonCard";

function MyPage() {
  const { data, isLoading } = useSomeData();

  if (isLoading) {
    return <SkeletonGrid count={6} />;
  }

  return <ActualContent data={data} />;
}
```

---

### 3. **loading.tsx** - Suspense automático de Next.js ✅

Archivos especiales que Next.js muestra automáticamente durante la carga.

**Ubicaciones creadas:**
- `/app/destinations/loading.tsx`
- `/app/eventos/loading.tsx`
- `/app/mapa/loading.tsx`
- `/app/ruta23/loading.tsx`

**Cómo agregar a nuevas páginas:**

1. Crea un archivo `loading.tsx` en la carpeta de la ruta:
```tsx
// app/mi-pagina/loading.tsx
import { SkeletonGrid } from "@/components/loading/SkeletonCard";

export default function MiPaginaLoading() {
  return (
    <div className="min-h-screen bg-white p-8">
      <SkeletonGrid count={6} />
    </div>
  );
}
```

2. ¡Listo! Next.js lo usa automáticamente.

---

### 4. **NavigationLink** - Links con feedback ✅

Link mejorado que muestra un spinner al hacer clic.

**Uso básico:**
```tsx
import { NavigationLink } from "@/components/NavigationLink";

<NavigationLink
  href="/destinations"
  className="btn-primary"
>
  Ver destinos
</NavigationLink>
```

**Props:**
- `href` - URL de destino
- `className` - Clases CSS
- `showSpinner` - Mostrar spinner (default: true)
- `onClick` - Callback opcional antes de navegar

---

### 5. **NavigationButton** - Botones con loading state ✅

Botón que maneja loading automáticamente para acciones async.

**Uso básico:**
```tsx
import { NavigationButton } from "@/components/NavigationLink";

<NavigationButton
  onClick={async () => {
    await saveData();
    router.push('/success');
  }}
  className="btn-primary"
>
  Guardar
</NavigationButton>
```

---

### 6. **useNavigationLoading** - Hook personalizado ✅

Hook para detectar cuándo hay una navegación en progreso.

**Uso:**
```tsx
import { useNavigationLoading } from "@/hooks/useNavigationLoading";

function MyComponent() {
  const isNavigating = useNavigationLoading();

  if (isNavigating) {
    return <SkeletonGrid />;
  }

  return <ActualContent />;
}
```

---

### 7. **useLoadingState** - Loading con duración mínima ✅

Hook que garantiza que el loading se muestre por un tiempo mínimo (evita flashes).

**Uso:**
```tsx
import { useLoadingState } from "@/hooks/useNavigationLoading";

function MyComponent() {
  const { data, isLoading } = useSWR('/api/data');
  const showLoading = useLoadingState(isLoading, 300); // Mínimo 300ms

  if (showLoading) {
    return <Skeleton />;
  }

  return <Content data={data} />;
}
```

---

## 🎨 Animaciones Implementadas

### En Tailwind Config:

```css
/* Ya disponibles */
.animate-shimmer    // Efecto shimmer en skeletons
.animate-pulse      // Pulsación suave
.animate-spin       // Spinner
```

### Keyframes personalizados:

```css
@keyframes shimmer {
  0% { background-position: -200% 0 }
  100% { background-position: 200% 0 }
}
```

---

## 📱 Mejores Prácticas

### 1. **Usa loading.tsx para páginas completas**
```tsx
// app/mi-ruta/loading.tsx
export default function Loading() {
  return <SkeletonGrid />;
}
```

### 2. **Usa SkeletonCard para contenido que carga**
```tsx
{isLoading ? <SkeletonCard /> : <ActualCard data={data} />}
```

### 3. **Usa NavigationLink para navegación**
```tsx
<NavigationLink href="/destinos">
  Ver todos los destinos
</NavigationLink>
```

### 4. **Usa NavigationButton para acciones async**
```tsx
<NavigationButton onClick={handleSubmit}>
  Enviar formulario
</NavigationButton>
```

---

## 🚀 Ejemplos Completos

### Página con loading state:

```tsx
// app/destinos/page.tsx
import { SkeletonGrid } from "@/components/loading/SkeletonCard";

async function DestinosPage() {
  const destinos = await getDestinos();

  return (
    <div className="container py-12">
      <h1>Destinos</h1>
      <div className="grid grid-cols-3 gap-6">
        {destinos.map(d => <DestinationCard key={d.id} {...d} />)}
      </div>
    </div>
  );
}

export default DestinosPage;

// app/destinos/loading.tsx
export default function Loading() {
  return (
    <div className="container py-12">
      <div className="h-10 bg-gray-200 rounded w-64 mb-8" />
      <SkeletonGrid count={9} />
    </div>
  );
}
```

### Componente con data fetching:

```tsx
"use client";

import { useState, useEffect } from "react";
import { SkeletonList } from "@/components/loading/SkeletonCard";
import { useLoadingState } from "@/hooks/useNavigationLoading";

export function EventList() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Garantiza mínimo 300ms de loading (evita flash)
  const showLoading = useLoadingState(isLoading, 300);

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(data => {
        setEvents(data);
        setIsLoading(false);
      });
  }, []);

  if (showLoading) {
    return <SkeletonList count={5} />;
  }

  return (
    <div>
      {events.map(e => <EventCard key={e.id} {...e} />)}
    </div>
  );
}
```

---

## ✨ Resultado Final

Con este sistema implementado, el usuario experimenta:

✅ **Feedback inmediato** - Barra superior se activa al navegar
✅ **Tranquilidad** - Skeletons muestran que algo está cargando
✅ **Profesionalismo** - Animaciones suaves y coherentes
✅ **Sin frustración** - No hay clics perdidos o pantallas en blanco
✅ **Experiencia premium** - Como Airbnb, YouTube, GitHub

---

## 🎯 Próximos Pasos Opcionales

Si quieres mejorar aún más:

1. **Optimistic UI** - Actualizar UI antes de que termine la llamada
2. **Error states** - Componentes para mostrar errores elegantemente
3. **Retry logic** - Botones de reintentar en skeletons
4. **Progress tracking** - Mostrar % real de carga para uploads
5. **Infinite scroll** - Con skeletons al final

---

## 📞 Soporte

Si tienes dudas sobre cómo implementar loading states en un componente específico, solo pregunta y te doy un ejemplo personalizado.
