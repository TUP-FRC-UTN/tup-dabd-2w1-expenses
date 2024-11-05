# 🌍 Expense Manager Frontend - Trabajo Práctico Integrador 2024

> Proyecto frontend desarrollado como parte del TPI 2024 para las asignaturas **Laboratorio de Computación IV**, **Programación IV** y **Metodología de Sistemas** de la carrera *Tecnicatura Universitaria en Programación* de la *Universidad Tecnológica Nacional - Facultad Regional Córdoba*.

---

## 📋 Descripción del Proyecto

**Expense Manager Frontend** es la interfaz de usuario del sistema de gestión de gastos orientado a consorcios de propietarios, barrios cerrados o countries. Desarrollada en **Angular**, esta aplicación web permite:

- **Visualizar y gestionar** diversos tipos de gastos
- **Generar reportes** y gráficos estadísticos
- **Administrar categorías** de gastos
- **Consultar** gastos individuales y comunes
- **Exportar datos** en diferentes formatos

---

## 🛠️ Tecnologías Utilizadas

| Tecnología        | Descripción                                      |
|-------------------|---------------------------------------------------|
| **Angular**       | Framework principal para el desarrollo frontend   |
| **TypeScript**    | Lenguaje de programación                         |
| **Bootstrap 5**   | Framework CSS para diseño responsivo             |
| **DataTables**    | Biblioteca para tablas interactivas              |
| **Chart.js**      | Visualización de datos y gráficos                |
| **Docker**        | Contenerización para despliegue                  |

---

## 🚀 Requisitos Previos

Para ejecutar este proyecto, asegúrate de tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (gestor de paquetes de Node.js)
- **Angular CLI** (última versión)
- **Docker** y **Docker Compose**
- **Git** (opcional, para clonar el repositorio)

---

## 📦 Instrucciones de Instalación y Ejecución

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd expense-manager-frontend
```

### 2. Instalación de Dependencias

```bash
# Instalación inicial de npm
npm install

# Librerías para tablas y manipulación de datos
npm install jquery --save
npm install datatables.net --save
npm install datatables.net-bs5 --save
npm install datatables.net-dt --save

# Types para TypeScript
npm install @types/jquery --save-dev
npm install @types/datatables.net --save-dev

# Librerías para exportación
npm install xlsx
npm install jspdf jspdf-autotable

# Gráficos y visualización
npm install ng2-google-charts
npm install --save @types/google.visualization

# Utilidades adicionales
npm install ng2-currency-mask --save
npm install --save @ng-select/ng-select
```

### 3. Configuración del Entorno Docker

```bash
# Construir la imagen Docker
docker compose build

# Levantar los contenedores
docker compose up
```

---

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── components/
│   │   ├── expenses-components/
│   │   │   ├── expenses-categories-ngSelect/
│   │   │   ├── expenses-categories-select/
│   │   │   ├── expenses-edit-category/
│   │   │   ├── expenses-filter/
│   │   │   ├── expenses-kpi/
│   │   │   ├── expenses-navbar/
│   │   │   ├── expenses-owners-ng-select/
│   │   │   ├── expenses-providers-ngSelect/
│   │   │   ├── expenses-providers-select/
│   │   │   ├── expenses-register-category/
│   │   │   ├── expenses-register-expense/
│   │   │   ├── expenses-report/
│   │   │   ├── expenses-routing/
│   │   │   ├── expenses-side-button/
│   │   │   ├── expenses-type-expense-ng-select/
│   │   │   ├── expenses-view/
│   │   │   ├── expenses-view-category/
│   │   │   ├── expenses-view-category-details/
│   │   │   ├── expenses-view-expense-admin/
│   │   │   └── expenses-view-expense-owner/
│   ├── models/
│   ├── pipes/
│   └── services/
└── assets/
```

---

## 📱 Componentes Principales

### Gestión de Categorías
- **expenses-categories-ngSelect**: Selector avanzado de categorías
- **expenses-edit-category**: Edición de categorías existentes
- **expenses-register-category**: Registro de nuevas categorías
- **expenses-view-category**: Vista general de categorías
- **expenses-view-category-details**: Detalles específicos de categoría

### Gestión de Expensas
- **expenses-register-expense**: Registro de nuevos gastos
- **expenses-view**: Vista general de gastos
- **expenses-view-expense-admin**: Vista administrativa de gastos
- **expenses-view-expense-owner**: Vista de gastos por propietario
- **expenses-type-expense-ng-select**: Selector de tipo de gasto

### Filtros y Navegación
- **expenses-filter**: Filtros avanzados de búsqueda
- **expenses-navbar**: Barra de navegación principal
- **expenses-side-button**: Botones laterales de acción

### Selección de Entidades
- **expenses-owners-ng-select**: Selector de propietarios
- **expenses-providers-ngSelect**: Selector de proveedores
- **expenses-providers-select**: Selector simple de proveedores

### Reportes y KPIs
- **expenses-kpi**: Indicadores clave de rendimiento
- **expenses-report**: Generación de reportes

---

## 📱 Componentes Principales

### Gestión de Expensas
- Lista de expensas con filtros y búsqueda
- Formulario de creación/edición de expensas
- Visualización detallada de expensas
- Exportación a PDF y Excel

### Categorías
- CRUD completo de categorías
- Asociación de expensas a categorías
- Estado activo/inactivo de categorías

### Gráficos y Reportes
- Gráfico de torta por categorías
- Gráfico de barras por meses
- Resumen mensual de gastos
- Comparativas anuales


## 🔄 Integración con Backend

La aplicación se comunica con el backend a través de servicios REST.
