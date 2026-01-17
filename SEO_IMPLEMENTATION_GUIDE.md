# 📊 Guía de Implementación SEO - VisitAtlántico

## ✅ Fase 1: Fundamentos Técnicos (COMPLETADO)

### Metadata y SEO Base
- ✅ Metadata base optimizada en `layout.tsx`
- ✅ metadataBase configurado
- ✅ Keywords estratégicas implementadas
- ✅ OpenGraph y Twitter Cards
- ✅ robots.txt dinámico
- ✅ Sitemap.xml dinámico con prioridades

### Schema.org (Structured Data)
- ✅ `TouristAttractionSchema.tsx` - Para destinos y atracciones
- ✅ `EventSchema.tsx` - Para eventos (especialmente Carnaval)
- ✅ `RestaurantSchema.tsx` - Para gastronomía
- ✅ `CarnavalEventSchema` - Schema específico del Carnaval 2026

### Core Web Vitals
- ✅ Componente `OptimizedImage.tsx` para LCP
- ✅ `HeroImage` con priority automático
- ✅ next.config.mjs optimizado (AVIF/WebP, deviceSizes)
- ✅ Lazy loading automático

### Contenido Prioritario
- ✅ Página `/carnaval` - Pillar page del Carnaval 2026
- ✅ Página `/playas/salinas-del-rey` - Keyword emergente Blue Flag

---

## 🚧 Fase 2: Siguientes Pasos (PENDIENTE)

### 1. Tracking y Analytics

#### Google Tag Manager (GTM)
Crear archivo: `src/components/GoogleTagManager.tsx`

```tsx
export function GoogleTagManager() {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `,
        }}
      />
    </>
  );
}

export function GoogleTagManagerNoScript() {
  return (
    <noscript>
      <iframe
        src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
```

**Pasos:**
1. Crear cuenta en Google Tag Manager
2. Obtener ID del contenedor (GTM-XXXXXXX)
3. Agregar `<GoogleTagManager />` en `<head>` del layout
4. Agregar `<GoogleTagManagerNoScript />` al inicio del `<body>`
5. Configurar tags en GTM:
   - Google Analytics 4
   - Meta Pixel
   - Conversiones personalizadas

#### Google Analytics 4
- Configurar eventos personalizados:
  - `view_destination` - Ver página de destino
  - `view_attraction` - Ver atracción
  - `download_guide` - Descargar guía
  - `click_hotel_partner` - Click en hotel partner
  - `view_event` - Ver evento

#### Meta Pixel
- Implementar eventos estándar:
  - PageView
  - ViewContent
  - Lead (descarga de guías)
  - CompleteRegistration (newsletter)

### 2. Internacionalización (i18n)

**Instalar next-intl:**
```bash
npm install next-intl
```

**Estructura recomendada:**
```
src/
  i18n/
    routing.ts          # Configuración de rutas
  messages/
    es.json            # Traducciones español
    en.json            # Traducciones inglés
  app/
    [locale]/
      layout.tsx
      page.tsx
      carnaval/
      playas/
      ...
```

**Archivo: `src/i18n/routing.ts`**
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['es', 'en'],
  defaultLocale: 'es',
  pathnames: {
    '/': '/',
    '/carnaval': {
      es: '/carnaval',
      en: '/carnival',
    },
    '/playas': {
      es: '/playas',
      en: '/beaches',
    },
    '/gastronomia': {
      es: '/gastronomia',
      en: '/gastronomy',
    },
    '/destinos': {
      es: '/destinos',
      en: '/destinations',
    },
  },
});
```

### 3. Pillar Pages Pendientes

#### Playas del Atlántico
Crear: `src/app/playas/page.tsx`
- Keywords: "mejores playas atlántico colombia", "playas cerca barranquilla"
- Contenido: 2,500+ palabras
- Cluster pages:
  - ✅ `/playas/salinas-del-rey`
  - `/playas/puerto-velero`
  - `/playas/puerto-colombia`
  - `/playas/familias`

#### Gastronomía del Caribe
Crear: `src/app/gastronomia/page.tsx`
- Keywords: "comida típica barranquilla", "gastronomía caribeña"
- Contenido: 2,000+ palabras
- Cluster pages:
  - `/gastronomia/arepa-de-huevo`
  - `/gastronomia/sancocho-costeno`
  - `/gastronomia/ruta-butifarra`

#### Ecoturismo y Naturaleza
Crear: `src/app/ecoturismo/page.tsx`
- Keywords: "ecoturismo atlántico colombia"
- Contenido: 2,000+ palabras
- Cluster pages:
  - `/ecoturismo/reserva-luriza`
  - `/ecoturismo/avistamiento-aves`
  - `/ecoturismo/volcan-totumo`

#### 17 Municipios del Atlántico
Crear: `src/app/municipios/page.tsx`
- Keywords: "municipios atlántico turismo"
- Contenido: 2,500+ palabras
- Páginas individuales para cada municipio

### 4. Mejoras de Contenido

#### Blog
Crear estructura: `src/app/blog/`
- Calendario editorial según estrategia (2-3 artículos/semana)
- Categorías: Cultura, Playas, Gastronomía, Eventos, Guías

#### Guías Descargables (Lead Magnets)
- "Guía Completa Carnaval 2026" (PDF)
- "10 Mejores Playas del Atlántico" (PDF)
- "Ruta Gastronómica del Caribe" (PDF)

### 5. Local SEO

#### Google Business Profile
1. Crear perfil principal: "VisitAtlántico - Centro de Información Turística"
2. Perfiles individuales para atracciones mayores
3. Configuración NAP consistente
4. Estrategia de reviews

#### Citations
Registrar en:
- TripAdvisor
- Viator
- GetYourGuide
- Lonely Planet
- Colombia.travel

### 6. Link Building

#### Estrategias:
1. **Colaboraciones institucionales:**
   - Gobernación del Atlántico
   - Alcaldías municipales
   - Fundación Carnaval de Barranquilla

2. **Partners turísticos:**
   - Hoteles locales
   - Operadores turísticos
   - Restaurantes certificados

3. **Medios:**
   - Press releases en certificación Blue Flag
   - Guías de viaje en medios colombianos
   - Blogs de turismo especializados

---

## 📈 Calendario de Pauta Digital

### Presupuesto Mensual Recomendado
- **Inicio:** $3,000-5,000 USD/mes
- **Crecimiento:** $7,500-15,000 USD/mes
- **Carnaval (Enero-Febrero):** +150-200% del presupuesto base

### Distribución por Plataforma
- **Google Ads:** 55-60%
  - Search: 40%
  - Performance Max: 25%
  - YouTube/Video: 20%
  - Display: 15%

- **Meta Ads:** 35-40%
  - Awareness: 30%
  - Consideration: 25%
  - Conversion: 35%
  - Remarketing: 10%

### Campañas Prioritarias (Primeros 3 Meses)

#### Mes 1: Fundamentos
- Google Search: Keywords de Carnaval 2026
- Meta Awareness: Videos de destinos
- Retargeting básico

#### Mes 2: Expansión
- Performance Max con partners hoteleros
- YouTube TrueView
- Meta Consideration con lead forms

#### Mes 3: Optimización
- Basado en datos de 60 días
- Lookalike audiences
- Optimización de CPA

---

## 🎯 KPIs de Seguimiento

### Métricas de Visibilidad (Mes 1-3)
- Tráfico orgánico: +30% trimestral
- Rankings top 10: 15+ keywords principales
- Impresiones Search: Crecimiento mensual
- Domain Authority: +2 puntos trimestral

### Métricas de Engagement
- Tiempo en página: >2 minutos
- Páginas por sesión: >3
- Tasa de rebote: <50%
- Suscripciones newsletter: +500/mes

### Métricas de Conversión
- Leads generados: Baseline + 20% trimestral
- CTR a partners: >5%
- Descargas de guías: +100/mes

### Métricas Local SEO
- Vistas GBP: Crecimiento mensual
- Solicitudes direcciones: +10% trimestral
- Rating promedio: Mantener 4.0+
- Volumen reviews: Crecimiento semanal

---

## 🛠️ Herramientas Recomendadas

### SEO
- **Google Search Console** (gratis)
- **Google Analytics 4** (gratis)
- **Semrush o Ahrefs** ($119-399/mes)
- **Screaming Frog** (gratis hasta 500 URLs)

### Local SEO
- **BrightLocal** ($39-119/mes)
- **Local Falcon** ($39-149/mes)
- **Google Business Profile** (gratis)

### Analytics & Tracking
- **Google Tag Manager** (gratis)
- **Hotjar** ($39-99/mes) - Mapas de calor
- **Clarity** (gratis) - Microsoft

### Contenido
- **Grammarly** - Corrección
- **Hemingway** - Legibilidad
- **Canva Pro** - Diseño gráfico

---

## 📋 Checklist Semanal

### Lunes
- [ ] Revisar rankings de keywords principales
- [ ] Análisis de tráfico semanal (GSC + GA4)
- [ ] Planificar contenido de la semana

### Miércoles
- [ ] Publicar artículo de blog
- [ ] Revisar y responder reviews de GBP
- [ ] Actualizar eventos si hay cambios

### Viernes
- [ ] Análisis de campañas de pauta
- [ ] Optimización basada en data
- [ ] Preparar reporte semanal

---

## 🚀 Próximos Hitos

### Enero 2026
- [ ] Escalar presupuesto pre-Carnaval +150%
- [ ] Contenido diario sobre Carnaval
- [ ] Campaña de remarketing agresivo

### Febrero 2026
- [ ] Cobertura en vivo del Carnaval
- [ ] Contenido UGC (hashtag campaign)
- [ ] Optimización real-time de campañas

### Post-Carnaval (Marzo 2026)
- [ ] Análisis ROI completo
- [ ] Pivot a contenido de playas/ecoturismo
- [ ] Planificación Carnaval 2027

---

## 📞 Notas Importantes

1. **Google Search Console:** Verifica tu sitio cuanto antes para comenzar a recopilar datos
2. **Google Business Profile:** Reclamar y optimizar AHORA
3. **Certificación Blue Flag:** Keyword emergente - actuar rápido para dominar
4. **Carnaval 2026:** 14-17 febrero - contenido urgente
5. **Traducción EN:** Prioridad media-alta para mercado internacional

---

**Última actualización:** Enero 2026
**Próxima revisión:** Semanal durante implementación
