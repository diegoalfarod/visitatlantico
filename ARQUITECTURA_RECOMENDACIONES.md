# 🏗️ Arquitectura del Sistema de Recomendaciones

> **Resumen**: Jimmy (chatbot) y PlannerPage comparten la misma fuente de datos centralizada

---

## 📊 Diagrama de Flujo General

```
┌─────────────────────────────────────────────────────────────┐
│                    FUENTE ÚNICA DE DATOS                     │
│                                                              │
│          src/data/atlantico-places.ts (27 lugares)          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ export const CURATED_PLACES: CuratedPlace[] = [    │    │
│  │   { id, name, category, coordinates, rating, ... } │    │
│  │   { ... }                                           │    │
│  │ ]                                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Funciones de búsqueda disponibles:                         │
│  • getPlacesByCategory()                                    │
│  • getPlacesByInterest()                                    │
│  • getFamilyPlaces()                                        │
│  • getRomanticPlaces()                                      │
│  • getPlaceById()                                           │
│  • getPlacesForItinerary()                                  │
└──────────────────┬───────────────────────┬──────────────────┘
                   │                       │
        ┌──────────▼────────┐   ┌─────────▼──────────┐
        │  JIMMY CHATBOT    │   │   PLANNERPAGE      │
        │   (Conversación)  │   │   (Formulario)     │
        └──────────┬────────┘   └─────────┬──────────┘
                   │                       │
                   │                       │
        ┌──────────▼───────────────────────▼──────────┐
        │         AMBOS RECOMIENDAN LOS               │
        │         MISMOS LUGARES CURADOS              │
        └─────────────────────────────────────────────┘
```

---

## 🤖 Jimmy Chatbot - Flujo Detallado

### 1️⃣ Usuario envía mensaje

```
Usuario: "¿Dónde comer comida típica?"
   │
   ▼
GeminiWidget.tsx
   │
   └─> handleSend(text)
```

### 2️⃣ Llamada al servicio

```
claudeService.ts
   │
   └─> sendChatMessage(messages)
        │
        ▼
     POST /api/chat
```

### 3️⃣ Backend procesa con Claude

```
/api/chat/route.ts
   │
   ├─> Genera contexto dinámico de CURATED_PLACES
   │   (Agrupa por categoría: playas, restaurantes, museos...)
   │
   ├─> Envía a Claude API con SYSTEM_PROMPT que incluye:
   │   • Lista completa de lugares con IDs
   │   • Tips locales
   │   • Categorías
   │
   └─> Claude analiza y responde:
       "¡Uy, la comida costeña es lo máximo! 🍽️
        Para lo auténtico, prueba NarcoBollo...
        [PLACES: ["narcobollo", "la-cueva"]]"
```

### 4️⃣ Frontend procesa respuesta

```
claudeService.ts
   │
   ├─> Extrae IDs: ["narcobollo", "la-cueva"]
   │
   ├─> Busca en CURATED_PLACES:
   │   const places = getPlacesFromIds(ids)
   │
   └─> Retorna mensaje enriquecido con objetos Place completos
```

### 5️⃣ Renderizado en ChatWindow

```
ChatWindow.tsx
   │
   ├─> Muestra mensaje de Jimmy
   │
   ├─> Renderiza InlinePlaceCard para cada lugar:
   │   ┌──────────────────────────────────┐
   │   │ 🖼️ [Imagen]  NarcoBollo         │
   │   │              Restaurante • 4.6⭐  │
   │   │              Cocina costeña...    │
   │   └──────────────────────────────────┘
   │
   ├─> Agrega al panel "Places" (lista completa)
   │
   └─> Panel "Place" muestra detalles + galería + mapa
```

### 🔄 Sistema de Fallback (Si Claude falla)

```
claudeService.ts → simulateResponse()
   │
   ├─> Detecta intención por keywords
   │   (/comida|food|comer|eat|restaurante/)
   │
   ├─> Usa funciones de búsqueda:
   │   const restaurantes = getPlacesByCategory('restaurante')
   │   const narcobollo = restaurantes.find(p => p.id === 'narcobollo')
   │
   └─> Genera respuesta con lugares reales de CURATED_PLACES
```

---

## 📋 PlannerPage - Flujo Detallado

### 1️⃣ Usuario completa formulario (4 pasos)

```
PlannerPage.tsx
   │
   ├─> Paso 1: Días (1-7) + Ubicación inicial
   ├─> Paso 2: Intereses (hasta 3)
   ├─> Paso 3: Tipo de viaje + Presupuesto + Ritmo
   └─> Paso 4: Email + Preview
```

### 2️⃣ Generación del itinerario

```
generateItinerary()
   │
   └─> POST /api/itinerary/generate
       {
         profile: {
           days: 3,
           interests: ["gastronomia_local", "playas_rio"],
           tripType: "pareja",
           budget: "moderado",
           travelPace: "moderado"
         }
       }
```

### 3️⃣ Backend genera con Claude

```
/api/itinerary/generate/route.ts
   │
   └─> ClaudeItineraryEnhancer.generateItinerary(profile)
       │
       ├─> Filtra lugares de CURATED_PLACES:
       │   • Por intereses seleccionados
       │   • Por tipo de viaje (suitableFor)
       │   • Por presupuesto (priceRange)
       │   • Si familia → solo familyFriendly
       │
       ├─> Ordena por:
       │   1. featured (destacados primero)
       │   2. rating (mejor calificados)
       │
       ├─> Distribuye en días según ritmo:
       │   • Relajado: 2-3 lugares/día
       │   • Moderado: 3-4 lugares/día
       │   • Intenso: 5+ lugares/día
       │
       └─> Usa Claude para:
           • Personalizar descripciones
           • Optimizar orden de visita
           • Generar títulos creativos por día
           • Calcular tiempos y costos
```

### 4️⃣ Respuesta al frontend

```
{
  itineraryId: "itin_12345",
  itinerary: {
    days: [
      {
        day: 1,
        title: "Día 1 - Bienvenida Caribeña",
        activities: [
          {
            id: "museo-del-caribe",
            name: "Museo del Caribe",
            time: "10:00",
            duration: "120 min",
            location: { ... },
            tips: ["Los martes tienen descuento"],
            pricing: "$18k COP",
            rating: 4.7
          },
          { ... }
        ]
      },
      { ... }
    ]
  }
}
```

---

## 🔍 Funciones de Búsqueda - Cómo Funcionan

### getPlacesByCategory(category)

```typescript
// Uso
const playas = getPlacesByCategory('playa');

// Implementación
CURATED_PLACES.filter(p => p.category === 'playa')

// Resultado
[
  { id: "playa-pradomar", name: "Playa Pradomar", ... },
  { id: "castillo-salgar", name: "Castillo de Salgar", ... },
  { id: "puerto-velero", name: "Puerto Velero", ... }
]
```

### getPlacesByInterest(interestId)

```typescript
// Uso
const gastronomy = getPlacesByInterest('gastronomia_local');

// Implementación
CURATED_PLACES.filter(p => p.interests.includes('gastronomia_local'))

// Resultado
[
  { id: "la-cueva", interests: ["gastronomia_local", "historia_patrimonio"], ... },
  { id: "narcobollo", interests: ["gastronomia_local"], ... },
  { id: "caiman-del-rio", interests: ["gastronomia_local", "playas_rio"], ... }
]
```

### getFamilyPlaces()

```typescript
// Uso
const family = getFamilyPlaces();

// Implementación
CURATED_PLACES.filter(p => p.familyFriendly === true)

// Resultado
[
  { id: "zoologico-barranquilla", familyFriendly: true, ... },
  { id: "gran-malecon", familyFriendly: true, ... },
  { id: "museo-del-caribe", familyFriendly: true, ... }
]
```

### getPlacesForItinerary(profile)

```typescript
// Uso
const places = getPlacesForItinerary({
  interests: ["playas_rio", "gastronomia_local"],
  tripType: "pareja",
  priceRange: "moderado",
  days: 3
});

// Implementación (simplificada)
1. Filtrar por intereses
2. Filtrar por tripType (suitableFor incluye "pareja")
3. Filtrar por presupuesto (≤ moderado)
4. Si familia → solo familyFriendly
5. Ordenar por featured + rating
6. Retornar suficientes para los días

// Resultado
[
  { id: "castillo-salgar", featured: true, rating: 4.5, suitableFor: ["pareja"], ... },
  { id: "la-cueva", featured: true, rating: 4.5, suitableFor: ["pareja"], ... },
  { id: "playa-pradomar", featured: true, rating: 4.2, suitableFor: ["pareja"], ... }
]
```

---

## 🎨 Enriquecimiento de Lugares

### Proceso de Enriquecimiento (ChatWindow)

```typescript
// Lugar básico del API
{
  id: "museo-del-caribe",
  name: "Museo del Caribe"
}

      ↓ enrichPlace()

// Lugar completo de CURATED_PLACES
{
  id: "museo-del-caribe",
  name: "Museo del Caribe",
  shortDescription: "El museo más importante del Caribe colombiano",
  longDescription: "Centro cultural interactivo que celebra...",
  localTip: "Los martes tienen descuento. Pregunta por la visita guiada...",
  municipality: "Barranquilla",
  address: "Calle 36 #46-66, Centro Histórico",
  coordinates: { lat: 10.9639, lng: -74.7964 },
  category: "museo",
  subcategories: ["cultura", "historia", "interactivo"],
  interests: ["carnaval_cultura", "historia_patrimonio"],
  typicalDuration: 120,
  priceRange: "economico",
  estimatedCost: 18000,
  schedule: {
    opens: "09:00",
    closes: "17:00",
    closedDays: ["Lunes"],
    bestTime: "Mañana (10-12)",
    peakHours: "Domingos 2-4pm"
  },
  suitableFor: ["solo", "pareja", "familia", "amigos"],
  physicalLevel: "low",
  familyFriendly: true,
  romanticSpot: false,
  instagrammable: true,
  images: [...],
  primaryImage: "URL de Google Places",
  rating: 4.7,
  reviewCount: 2850,
  verified: true,
  featured: true,
  aiContext: "Museo interactivo ideal para entender...",
  mustTry: ["Sala de la Naturaleza", "Exposición de García Márquez"],
  avoidIf: ["Buscas actividades al aire libre"]
}
```

---

## 📦 Estructura de Datos

### CuratedPlace (Tipo Principal)

```typescript
interface CuratedPlace {
  // Identificación
  id: string;                    // Único, kebab-case
  name: string;                  // Nombre visible
  slug: string;                  // Para URLs

  // Descripción
  shortDescription: string;      // 1-2 líneas
  longDescription: string;       // Completa
  localTip: string;             // Tip útil

  // Ubicación
  municipality: string;          // Municipio del Atlántico
  address: string;               // Dirección completa
  coordinates: { lat, lng };     // Google Maps

  // Categorización
  category: PlaceCategory;       // playa, museo, restaurante...
  subcategories: string[];       // Tags adicionales
  interests: string[];           // IDs de INTERESTS

  // Info práctica
  typicalDuration: number;       // Minutos
  priceRange: PriceRange;        // gratis, economico, moderado, premium
  estimatedCost: number;         // COP por persona
  schedule: {                    // Horarios
    opens: string;
    closes: string;
    closedDays?: string[];
    bestTime?: string;
    peakHours?: string;
  };

  // Perfil
  suitableFor: TripType[];       // solo, pareja, familia, amigos
  physicalLevel: 'low' | 'moderate' | 'high';
  familyFriendly: boolean;
  romanticSpot: boolean;
  instagrammable: boolean;

  // Media
  images: string[];              // URLs de imágenes
  primaryImage: string;          // Imagen principal

  // Metadata
  rating: number;                // 1.0 - 5.0
  reviewCount: number;
  verified: boolean;
  featured: boolean;             // Destacado

  // Contexto para IA
  aiContext: string;             // Info para Claude
  mustTry: string[];            // Qué no perderse
  avoidIf: string[];            // Cuándo no ir
}
```

---

## 🚀 Ventajas de la Arquitectura Actual

### ✅ Centralización
- **Una sola fuente de verdad** (CURATED_PLACES)
- Cambios se reflejan en Jimmy y Planner simultáneamente
- Fácil mantenimiento

### ✅ Rendimiento
- **Sin llamadas a DB** en producción
- Datos en memoria (muy rápido)
- Búsquedas O(n) aceptables con 27 lugares

### ✅ Type Safety
- **TypeScript** garantiza estructura correcta
- Autocompletado en todo el código
- Errores en tiempo de compilación

### ✅ Flexibilidad
- **Múltiples funciones de búsqueda**
- Fácil agregar filtros personalizados
- Combinación de criterios

### ✅ Escalabilidad
- **Fácil migrar a DB** cuando crezca
- Mismo código, distinta fuente
- Mantener cache en memoria

---

## 🔮 Migración Futura a Base de Datos

### Opción 1: Firebase/Firestore

```typescript
// ANTES (actual)
import { CURATED_PLACES, getPlaceById } from '@/data/atlantico-places';
const place = getPlaceById('museo-del-caribe');

// DESPUÉS (con Firebase)
import { getPlaceById } from '@/services/places-service';
const place = await getPlaceById('museo-del-caribe');
// Implementación interna usa Firebase + cache
```

### Opción 2: API REST propia

```typescript
// ANTES
const playas = getPlacesByCategory('playa');

// DESPUÉS
const playas = await fetch('/api/places?category=playa').then(r => r.json());
```

### Manteniendo compatibilidad

```typescript
// places-service.ts
let CACHE: CuratedPlace[] | null = null;

export async function getPlaceById(id: string): Promise<CuratedPlace | undefined> {
  // 1. Intentar cache en memoria
  if (CACHE) {
    return CACHE.find(p => p.id === id);
  }

  // 2. Fetch de Firebase/API
  const places = await fetchPlacesFromDB();
  CACHE = places;

  // 3. Retornar
  return CACHE.find(p => p.id === id);
}
```

---

## 📈 Estadísticas del Sistema

### Datos Actuales
- **Total de lugares**: 27
- **Municipios**: 5 (Barranquilla, Puerto Colombia, Galapa, Usiacurí, Juan de Acosta)
- **Categorías**: 14 diferentes
- **Lugares destacados**: 18
- **Family-friendly**: 21
- **Románticos**: 5

### Funciones Disponibles
- **Búsqueda**: 10+ funciones especializadas
- **Filtrado**: Por categoría, interés, tipo, presupuesto
- **Ordenamiento**: Por rating, featured, reviews

### Uso en Código
- **Jimmy**: Usa en fallback + Claude prompt
- **Planner**: Usa en generación de itinerario
- **ChatWindow**: Usa para enriquecimiento
- **API /chat**: Usa para contexto de Claude

---

## 📝 Resumen Ejecutivo

```
┌─────────────────────────────────────────────────────────────┐
│  FUENTE ÚNICA: src/data/atlantico-places.ts                 │
│  • 27 lugares curados del Atlántico                         │
│  • 10+ funciones de búsqueda especializadas                 │
│  • TypeScript con tipos completos                           │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        ▼                                   ▼
  ┌──────────┐                        ┌──────────┐
  │  JIMMY   │                        │ PLANNER  │
  │ Chatbot  │                        │   Page   │
  └──────────┘                        └──────────┘
        │                                   │
        ├─ Claude API (principal)           ├─ ClaudeItineraryEnhancer
        ├─ Fallback local (búsqueda)        ├─ Filtros múltiples
        └─ Enriquecimiento automático       └─ Distribución por días
                          │
                          ▼
          ┌─────────────────────────────┐
          │  AMBOS USAN MISMOS DATOS    │
          │  • Consistencia garantizada │
          │  • Un solo lugar a actualizar│
          │  • Fácil escalabilidad      │
          └─────────────────────────────┘
```

---

**Última actualización**: Enero 2026
**Versión**: 2.0 - Unified Data Source
