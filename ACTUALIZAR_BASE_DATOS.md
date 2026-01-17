# 📍 Guía para Actualizar la Base de Datos de Lugares

> **Fuente única de verdad**: `src/data/atlantico-places.ts`

Esta guía te explica cómo agregar, editar o eliminar lugares turísticos del Atlántico. Tanto **Jimmy (chatbot)** como **PlannerPage** usan la misma fuente de datos, así que cualquier cambio se reflejará automáticamente en ambos sistemas.

---

## 🎯 ¿Dónde está todo?

**Archivo principal**: [`src/data/atlantico-places.ts`](src/data/atlantico-places.ts)

Este archivo contiene:
- ✅ **CURATED_PLACES**: Array con todos los lugares (línea 100)
- ✅ **Funciones de búsqueda**: getPlacesByCategory, getFamilyPlaces, etc.
- ✅ **Constantes**: INTERESTS, WELCOME_IMAGES, etc.

---

## ➕ Cómo Agregar un Nuevo Lugar

### 1. Copia esta plantilla:

```typescript
{
  id: "mi-nuevo-lugar", // ÚNICO, sin espacios, kebab-case
  name: "Mi Nuevo Lugar",
  slug: "mi-nuevo-lugar",

  // Descripción
  shortDescription: "Descripción corta de 1-2 líneas",
  longDescription: "Descripción completa y detallada del lugar...",
  localTip: "Tip útil: llega temprano, reserva con anticipación, etc.",

  // Ubicación
  municipality: "Barranquilla", // O Puerto Colombia, Galapa, etc.
  address: "Calle 123 #45-67",
  coordinates: {
    lat: 10.9639, // Latitud real de Google Maps
    lng: -74.7964 // Longitud real de Google Maps
  },

  // Categorización
  category: "restaurante", // playa, museo, restaurante, bar, parque, etc.
  subcategories: ["costeño", "moderno"],
  interests: ["gastronomia_local"], // IDs de INTERESTS (ver línea 1068)

  // Información práctica
  typicalDuration: 90, // Minutos
  priceRange: "moderado", // gratis, economico, moderado, premium
  estimatedCost: 50000, // COP por persona

  // Horarios
  schedule: {
    opens: "12:00",
    closes: "22:00",
    closedDays: ["Lunes"], // Opcional
    bestTime: "Atardecer", // Opcional
    peakHours: "Viernes y sábados" // Opcional
  },

  // Perfil de visitante
  suitableFor: ["pareja", "amigos"], // solo, pareja, familia, amigos
  physicalLevel: "low", // low, moderate, high
  familyFriendly: true, // true o false
  romanticSpot: false, // true o false
  instagrammable: true, // true o false

  // Media
  images: [
    "/images/places/mi-lugar-1.jpg",
    "/images/places/mi-lugar-2.jpg"
  ],
  primaryImage: "/images/places/mi-lugar-1.jpg",

  // Metadata
  rating: 4.5, // De 1.0 a 5.0
  reviewCount: 1200,
  verified: true,
  featured: false, // true para destacados

  // Contexto para IA
  aiContext: "Info útil para que Claude recomiende este lugar correctamente",
  mustTry: ["Plato especial", "Actividad específica"],
  avoidIf: ["Condición que lo hace no recomendable"]
}
```

### 2. Agrégalo al array CURATED_PLACES

Busca el array `CURATED_PLACES` (línea 100) y agrega tu nuevo objeto al final, **antes** del `];` final.

```typescript
export const CURATED_PLACES: CuratedPlace[] = [
  // ... lugares existentes ...

  // TU NUEVO LUGAR AQUÍ
  {
    id: "mi-nuevo-lugar",
    name: "Mi Nuevo Lugar",
    // ... resto de campos
  }
]; // <-- No olvides la coma antes de tu nuevo lugar
```

### 3. Categorías disponibles

```typescript
category:
  | 'playa'           // Playas y costas
  | 'museo'           // Museos y cultura
  | 'restaurante'     // Restaurantes y comida
  | 'bar'             // Bares y vida nocturna
  | 'parque'          // Parques y espacios públicos
  | 'iglesia'         // Iglesias y templos
  | 'monumento'       // Monumentos históricos
  | 'mercado'         // Mercados
  | 'artesanias'      // Talleres y artesanías
  | 'mirador'         // Miradores y vistas
  | 'naturaleza'      // Ecoturismo y naturaleza
  | 'entretenimiento' // Zoológicos, cines, etc.
  | 'cafe'            // Cafés
  | 'hotel'           // Hoteles
```

### 4. Intereses disponibles (interests)

Usa estos IDs exactos:

```typescript
interests: [
  "carnaval_cultura",      // Carnaval y folclor
  "playas_rio",            // Playas y río
  "gastronomia_local",     // Comida típica
  "vida_nocturna",         // Rumba y música
  "historia_patrimonio",   // Historia y cultura
  "artesanias_tradiciones", // Artesanías locales
  "naturaleza_aventura"    // Ecoturismo
]
```

---

## ✏️ Cómo Editar un Lugar Existente

1. **Busca el lugar** por su `id` en el array CURATED_PLACES
2. **Modifica** los campos que necesites
3. **Guarda** el archivo

**Ejemplo**: Cambiar el horario del Museo del Caribe:

```typescript
{
  id: "museo-del-caribe",
  // ... otros campos ...
  schedule: {
    opens: "09:00",
    closes: "18:00", // <-- Cambio de 17:00 a 18:00
    closedDays: ["Lunes"],
    bestTime: "Mañana (10-12)",
    peakHours: "Domingos 2-4pm"
  },
  // ... otros campos ...
}
```

---

## ❌ Cómo Eliminar un Lugar

1. **Busca el lugar** por su `id`
2. **Elimina todo el objeto** incluyendo las llaves `{ }`
3. **Elimina la coma** si queda una coma doble `,,`

**⚠️ IMPORTANTE**: Asegúrate de que ningún otro archivo referencie ese `id` específico.

---

## 🔍 Funciones de Búsqueda Disponibles

Estas funciones están disponibles para usar en cualquier parte del código:

```typescript
// Por categoría
getPlacesByCategory('playa')           // Todas las playas
getPlacesByCategory('restaurante')     // Todos los restaurantes

// Por interés
getPlacesByInterest('gastronomia_local')  // Lugares gastronómicos
getPlacesByInterest('carnaval_cultura')   // Lugares de carnaval

// Por tipo de viaje
getPlacesByTripType('familia')  // Lugares para familias
getPlacesByTripType('pareja')   // Lugares para parejas

// Por presupuesto
getPlacesByPriceRange('economico')  // Lugares económicos
getPlacesByPriceRange('premium')    // Lugares premium

// Especiales
getFeaturedPlaces()      // Lugares destacados (featured: true)
getRomanticPlaces()      // Lugares románticos (romanticSpot: true)
getFamilyFriendlyPlaces() // Lugares family-friendly (familyFriendly: true)

// Por ID
getPlaceById('museo-del-caribe')  // Un lugar específico

// Búsqueda de texto
searchPlaces('malecón')  // Busca en nombre, descripción, etc.
```

---

## 🤖 Cómo se Usan los Datos

### **Jimmy (Chatbot)**

**Archivo**: `src/lib/claudeService.ts`

Jimmy usa:
1. **API de Claude** (principal): Envía todo CURATED_PLACES al prompt
2. **Fallback local** (si Claude falla): Usa funciones de búsqueda

**Ejemplo de uso en fallback**:
```typescript
// Si usuario dice "quiero ir a la playa"
const beachPlaces = getPlacesByCategory('playa');
const beach = beachPlaces.find(p => p.featured) || beachPlaces[0];
// Recomienda la playa destacada o la primera
```

### **PlannerPage**

**Archivo**: `src/app/api/itinerary/generate/route.ts`

El Planner usa `ClaudeItineraryEnhancer` que:
1. Filtra lugares según el perfil del usuario
2. Usa `getPlacesForItinerary()` con múltiples filtros
3. Ordena por `featured` y `rating`
4. Distribuye en días según el ritmo

---

## ✅ Checklist Antes de Guardar

Cuando agregues o edites un lugar, verifica:

- [ ] El `id` es único (no existe otro igual)
- [ ] Las coordenadas son correctas (verifica en Google Maps)
- [ ] La categoría es válida (ver lista arriba)
- [ ] Los intereses son válidos (ver lista arriba)
- [ ] `suitableFor` incluye al menos un tipo
- [ ] `priceRange` es uno de: gratis, economico, moderado, premium
- [ ] `physicalLevel` es: low, moderate o high
- [ ] `rating` está entre 1.0 y 5.0
- [ ] El horario está en formato 24h (09:00, 22:00, etc.)
- [ ] `featured` es true solo para lugares imperdibles
- [ ] `localTip` tiene información útil y práctica

---

## 🚀 Próximos Pasos (Futuro)

### Opción 1: Migrar a Base de Datos (Firebase/Supabase)

**Ventajas**:
- Editar lugares sin tocar código
- Interfaz web para agregar/editar
- Sincronización automática

**Cómo hacerlo**:
1. Exportar CURATED_PLACES a JSON
2. Importar a Firebase/Supabase
3. Cambiar `getPlaceById()` por llamadas a la DB
4. Mantener cache en memoria para velocidad

### Opción 2: CMS Headless (Contentful, Strapi)

**Ventajas**:
- Interfaz profesional para edición
- Versionado de contenido
- Múltiples usuarios editores

### Opción 3: Google Sheets + API

**Ventajas**:
- Súper fácil de editar
- Colaboración en tiempo real
- Sincronización cada X minutos

---

## 📊 Estadísticas Actuales

```typescript
PLACES_STATS = {
  total: 27,
  byMunicipality: {
    barranquilla: 11,
    puertoColombiaPlaces: 5,
    galapa: 2,
    usiacuri: 2,
    juanDeAcosta: 1
  },
  featured: 18,
  familyFriendly: 21,
  romantic: 5
}
```

---

## 🐛 Problemas Comunes

### "El lugar no aparece en Jimmy"

**Solución**: Verifica que:
1. El lugar tenga el `interest` correcto
2. El `id` sea válido (sin espacios ni caracteres especiales)
3. Reinicia el servidor de desarrollo

### "Las imágenes no cargan"

**Solución**:
1. Las rutas deben empezar con `/images/places/`
2. O usar URLs completas de Google Places (ver `place-images.ts`)
3. Agrega el lugar a `PLACE_IMAGES` para imágenes de Google

### "El lugar sale en Jimmy pero no en Planner"

**Solución**: Verifica que:
1. `suitableFor` incluya el tipo de viaje del usuario
2. `priceRange` esté dentro del presupuesto
3. `interests` coincida con los seleccionados

---

## 📞 Ayuda

Si tienes dudas:
1. Revisa ejemplos existentes en `CURATED_PLACES`
2. Compara con lugares similares
3. Verifica que el TypeScript compile sin errores

---

**Última actualización**: Enero 2026
**Total de lugares**: 27
**Municipios cubiertos**: 5
