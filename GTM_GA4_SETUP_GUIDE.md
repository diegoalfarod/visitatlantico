# 🎯 Guía: Configurar Google Analytics 4 en Google Tag Manager

## ✅ Lo Que Ya Tienes

- ✅ Google Tag Manager: `GTM-M453F8JL` (instalado en tu sitio)
- ✅ Google Analytics 4: `G-ZETHSQTTGF` (cuenta creada)

Ahora solo necesitas **conectar GA4 con GTM**.

---

## 📋 Pasos para Configurar GA4 en GTM

### **Paso 1: Accede a Google Tag Manager**

1. Ve a: https://tagmanager.google.com
2. Selecciona tu cuenta y container (el que tiene ID: `GTM-M453F8JL`)
3. Click en **"Workspace"** (Espacio de trabajo)

---

### **Paso 2: Crear Tag de Google Analytics 4**

1. **Click en "Tags"** (en el menú lateral izquierdo)

2. **Click en "New"** (botón rojo, arriba derecha)

3. **Dale un nombre al tag**:
   ```
   GA4 - Configuration Tag
   ```

4. **Click en "Tag Configuration"** (cuadro grande arriba)

5. **Selecciona**: `Google Analytics: GA4 Configuration`
   - Si no lo ves, búscalo en "Tag Type Gallery"

6. **Configura el tag**:

   **Measurement ID:**
   ```
   G-ZETHSQTTGF
   ```

   ⚠️ **IMPORTANTE**: Copia exactamente: `G-ZETHSQTTGF`

7. **Configuración adicional** (Opcional pero recomendada):
   - Click en "Fields to Set" → "Add Row"
   - **Field Name**: `page_location`
   - **Value**: `{{Page URL}}` (variable incorporada)

   - Agrega otra fila:
   - **Field Name**: `page_title`
   - **Value**: `{{Page Title}}`

---

### **Paso 3: Configurar Trigger (Disparador)**

1. **Click en "Triggering"** (cuadro grande abajo)

2. **Selecciona**: `All Pages` (Todas las páginas)
   - Esto significa que GA4 se activará en TODAS las páginas de tu sitio

3. **Click en "Save"** (arriba derecha)

---

### **Paso 4: Crear Tag para Eventos de Page View**

1. **Click en "New"** nuevamente

2. **Nombre del tag**:
   ```
   GA4 - Page View Event
   ```

3. **Tag Configuration** → `Google Analytics: GA4 Event`

4. **Configuración**:
   - **Configuration Tag**: Selecciona `GA4 - Configuration Tag` (el que creaste antes)
   - **Event Name**: `page_view`

5. **Triggering**: Selecciona `All Pages`

6. **Save**

---

### **Paso 5: Publicar los Cambios**

1. **Click en "Submit"** (botón azul arriba derecha)

2. **Version Name** (nombre de versión):
   ```
   Initial Setup - GA4 Integration
   ```

3. **Version Description**:
   ```
   Configuración inicial de Google Analytics 4
   ```

4. **Click en "Publish"**

---

## 🧪 Verificar que Funciona

### **Método 1: Preview Mode en GTM**

1. En GTM, click en **"Preview"** (botón arriba derecha)

2. **Enter URL**: `https://visitatlantico.com` (o `http://localhost:3000` si estás en desarrollo)

3. Click **"Connect"**

4. Se abrirá tu sitio con Tag Assistant conectado

5. **Verifica**:
   - Busca `GA4 - Configuration Tag`
   - Estado debe ser: **"Tags Fired"** (verde)
   - Ve los eventos que se disparan

### **Método 2: Google Analytics Realtime**

1. Ve a Google Analytics: https://analytics.google.com

2. Selecciona tu propiedad (G-ZETHSQTTGF)

3. **Reports → Realtime**

4. Abre tu sitio en otra pestaña: `https://visitatlantico.com`

5. En unos segundos deberías ver:
   - **1 user active now** (1 usuario activo)
   - Eventos de `page_view`
   - Páginas visitadas

### **Método 3: Consola del Navegador**

1. Abre tu sitio: `https://visitatlantico.com`

2. **F12 → Console**

3. Escribe:
   ```javascript
   dataLayer
   ```

4. Deberías ver eventos de GA4 en el array

---

## 🎯 Eventos Personalizados (Opcional - Avanzado)

Una vez que GA4 esté funcionando, puedes crear eventos personalizados:

### **Ejemplo: Trackear Clicks en Hoteles**

1. **Crear Variable**:
   - Variables → New → Click URL → Nombre: "Click URL"

2. **Crear Trigger**:
   - Triggers → New → Click - All Elements
   - **Fire when**: Click URL contains `/hoteles/`
   - Nombre: "Click - Hotel Links"

3. **Crear Tag**:
   - Tags → New → GA4 Event
   - **Event Name**: `click_hotel`
   - **Event Parameters**:
     - Parameter Name: `hotel_url`
     - Value: `{{Click URL}}`
   - Triggering: "Click - Hotel Links"

4. **Submit & Publish**

---

## 📊 Eventos Recomendados para VisitAtlántico

| Evento | Cuándo se dispara | Configuración |
|--------|-------------------|---------------|
| `view_destination` | Ver página de destino | Trigger: Page Path contains `/destinos/` |
| `view_carnaval` | Ver página de Carnaval | Trigger: Page Path = `/carnaval` |
| `view_beach` | Ver página de playa | Trigger: Page Path contains `/playas/` |
| `download_guide` | Descargar guía PDF | Trigger: Click URL contains `.pdf` |
| `click_hotel` | Click en link de hotel | Trigger: Click URL contains hotel keywords |
| `search` | Búsqueda en el sitio | Trigger: Form submission |

---

## 🔍 Troubleshooting

### **GA4 no aparece en Realtime**

1. ✅ Verifica que publicaste los cambios (Submit → Publish)
2. ✅ Espera 5-10 minutos (puede haber delay)
3. ✅ Verifica que el Measurement ID sea exactamente: `G-ZETHSQTTGF`
4. ✅ Prueba en modo incógnito (para evitar bloqueadores de ads)

### **Tag no se dispara en Preview**

1. ✅ Verifica que el trigger sea "All Pages"
2. ✅ Refresca la página en Preview Mode
3. ✅ Revisa si hay errores en Tag Assistant

### **Veo duplicados en GA4**

- Asegúrate de NO tener el código de GA4 instalado manualmente
- Solo debe estar configurado en GTM

---

## ✨ Resumen

| Paso | Estado |
|------|--------|
| GTM instalado en sitio | ✅ `GTM-M453F8JL` |
| GA4 cuenta creada | ✅ `G-ZETHSQTTGF` |
| Crear tag GA4 Configuration | ⏳ **Hazlo ahora** |
| Crear tag GA4 Page View | ⏳ **Hazlo ahora** |
| Publicar container | ⏳ **Hazlo ahora** |
| Verificar en Realtime | ⏳ Después de publicar |

---

## 🚀 Siguiente Nivel

Una vez que GA4 funcione, puedes:

1. **Configurar Conversiones**:
   - Descargas de guías → Conversion
   - Clicks en hoteles → Conversion
   - Formularios de contacto → Conversion

2. **Agregar Meta Pixel** (Facebook/Instagram Ads)

3. **Configurar eventos de e-commerce** (si vendes tours/experiencias)

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Revisa la sección Troubleshooting arriba
2. Usa Preview Mode de GTM para debuggear
3. Verifica en GA4 Realtime

**Tiempo estimado total**: 10-15 minutos

---

**Última actualización**: Enero 2026
