# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**dash-axxia** is a single-page dashboard application for Luis Imóveis (real estate company) that visualizes lead management data. The application uses CDN-hosted libraries (Tailwind CSS and Chart.js) for styling and data visualization, with no build process or dependencies.

## Architecture

### Project Structure
```
dash-axxia/
├── index.html                      # Main HTML structure
├── css/
│   └── styles.css                  # Custom styles (glass-morphism, gradients)
├── js/
│   ├── supabase-config.js          # Supabase connection configuration
│   ├── app.js                      # Main application controller
│   └── components/                 # Modular components
│       ├── data-service.js         # Data loading and transformation
│       ├── kpi.js                  # KPI cards component
│       ├── charts.js               # Charts component (Chart.js)
│       └── lists.js                # Lists component (leads, performers, types)
├── data/
│   └── data.json                   # Local fallback data
├── supabase-setup.sql              # Database setup script
├── CLAUDE.md                       # This file
└── README.md
```

### Technology Stack
- **HTML5**: Semantic markup structure
- **Tailwind CSS** (v3.x via CDN): Utility-first styling
- **Chart.js** (v4.4.0 via CDN): Data visualizations
- **Supabase** (v2 via CDN): Backend database and real-time data
- **Vanilla JavaScript**: No frameworks, pure ES6+

### Data Flow
1. **Primary Source**: Supabase database (table: `leads`)
2. **Fallback**: Local `data/data.json` file if Supabase is unavailable
3. **Transformation**: Data from Supabase is transformed to match dashboard format
4. **Filtering**: Client-side filtering by time period (today, week, 30 days)

### Supabase Configuration
- **Project ID**: foxtwymvgdocdydbvgkd
- **URL**: https://foxtwymvgdocdydbvgkd.supabase.co
- **Config file**: `js/supabase-config.js`

### Expected Supabase Schema
The `leads` table should have the following columns:
- `id`: UUID (primary key)
- `created_at`: timestamp
- `nome`: text (lead name)
- `telefone`: text or bigint (phone number)
- `agente`: text (agent name)
- `origem`: text (lead source: Whatsapp, Facebook, etc.)
- `codigo_imovel`: text (property code)
- `valor`: numeric (property value)
- `bairro`: text (neighborhood)
- `tipo_negocio`: text (Venda, Aluguel, etc.)
- `tipo_imovel`: text (Apartamento, Casa, etc.)
- `bitrix`: boolean (registered in BITRIX)
- `visita_agendada`: boolean (visit scheduled)

### Data Structure (Dashboard Format)
After transformation, the dashboard uses this structure:
- **Aggregate metrics**: totalLeads, bitrixRegistered, visitsScheduled, avgPropertyValue
- **Breakdowns**: byAgent, byDate, byHour, byDayOfWeek, byOrigin, byBusinessType, byNeighborhood, byPropertyType
- **Lists**: recentLeads (individual lead records), topPerformers (agent performance)

### Key Features
1. **Time-based filtering**: Today, This Week, Last 30 Days
2. **KPI cards**: Total Leads, BITRIX registrations, Scheduled Visits, Average Property Value
3. **Visualizations**:
   - Bar chart for leads by hour
   - Line chart for average property values over time
   - Doughnut chart for lead sources
4. **Lists**: Recent leads and top-performing agents

## Development Workflow

### Making Changes
1. **HTML structure**: Edit `index.html` for layout changes
2. **Styling**: Modify `css/styles.css` for custom styles (or use Tailwind classes in HTML)
3. **Logic**: Update `js/app.js` for functionality changes
4. **Data**: Update `data/data.json` to change dashboard data

### Testing Locally
Since this uses `fetch()` to load JSON, you need a local server (browsers block file:// protocol):

```bash
# Option 1: Using Python's built-in server
python3 -m http.server 8000

# Option 2: Using Node.js http-server (if installed)
npx http-server .

# Option 3: Using PHP
php -S localhost:8000

# Then open http://localhost:8000 in browser
```

### Updating Data

#### Via Supabase (Recommended)
Data is automatically loaded from Supabase on page load. To add/update leads:
1. Insert or update records in the `leads` table in Supabase
2. Refresh the dashboard to see changes
3. The application will automatically transform the data to the correct format

#### Via Local JSON (Fallback)
If Supabase is unavailable, the app falls back to `data/data.json`:
1. Edit `data/data.json` directly or replace it with new data
2. Ensure date formats remain consistent: "DD/MM/YYYY, HH:MM:SS" or "YYYY-MM-DD HH:MM:SS"
3. Refresh the browser to see changes

#### Supabase Connection
To modify Supabase connection:
1. Edit `js/supabase-config.js`
2. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY`
3. Ensure the anon key has `SELECT` permissions on the `leads` table

## Git Workflow

### Automated Commits
The repository has automated daily commits with the pattern:
```
Relatório automático DD/MM/YYYY HH:MM
```
This suggests an automated process updates the dashboard data regularly (likely at 22:00 daily).

### Remote
- **Repository**: https://github.com/Axxia25/dash-axxia.git
- **Default branch**: main

## Code Modification Guidelines

### Styling (css/styles.css)
- Uses Tailwind CSS utility classes for most styling
- Custom CSS in `css/styles.css` for glass-morphism (`.glass-card`) and gradients (`.text-gradient`)
- Gradient color scheme: Blues (#667eea) to Purples (#764ba2)
- Background: Light gradient from #f5f7fa to #c3cfe2

### Component Architecture

The application is built with modular components for better maintainability:

#### **1. data-service.js** - Data Management
- `DataService.loadFromSupabase()`: Loads data from Supabase
- `DataService.loadFromJSON()`: Fallback to local JSON
- `DataService.transformSupabaseData()`: Transforms raw data to dashboard format

#### **2. kpi.js** - KPI Cards
- `KPIComponent.update(data)`: Updates all 4 KPI cards
- `updateTotalLeads()`, `updateBitrix()`, `updateVisits()`, `updateAvgValue()`

#### **3. charts.js** - Charts (Chart.js)
- `ChartsComponent.update(data)`: Updates all charts
- `updateHourlyChart()`: Bar chart for leads by hour
- `updateOriginChart()`: Doughnut chart for lead sources
- Manages chart instances to prevent memory leaks

#### **4. lists.js** - Dynamic Lists
- `ListsComponent.update(data)`: Updates all lists
- `updateBusinessTypeList()`: Business type breakdown with progress bars
- `updateRecentLeadsList()`: Last 5 leads with badges
- `updateTopPerformersList()`: Agent performance ranking

#### **5. app.js** - Main Controller
- `initApp()`: Loads data and initializes dashboard
- `filterData(period)`: Filters by 'today', 'week', or '30days'
- `updateDashboard()`: Orchestrates all component updates

**Key variables:**
- `rawData`: Original complete dataset (from Supabase or JSON)
- `filteredData`: Filtered copy based on time period
- `supabase`: Global Supabase client (supabase-config.js)

### Adding New Components

#### Adding a New Visualization
1. **Create component file**: `js/components/new-component.js`
2. **Define component object**:
   ```javascript
   const NewComponent = {
       update(data) {
           // Your update logic
       }
   };
   ```
3. **Add to index.html**: Load script before `app.js`
4. **Update app.js**: Call `NewComponent.update(filteredData)` in `updateDashboard()`
5. **Add HTML**: Add container element with unique ID in `index.html`

#### Modifying Existing Components
- **KPI cards**: Edit `js/components/kpi.js`
- **Charts**: Edit `js/components/charts.js`
- **Lists**: Edit `js/components/lists.js`
- **Data transformation**: Edit `js/components/data-service.js`

## Common Patterns

### Date Parsing
The application handles two date formats:
- "DD/MM/YYYY, HH:MM:SS" (from most leads)
- "YYYY-MM-DD HH:MM:SS" (alternative format)

Always split on space to separate date and time, then parse accordingly.

### Percentage Calculations
Conversion rates and percentages always include zero-check:
```javascript
const percent = filteredData.totalLeads > 0 ? (count / filteredData.totalLeads) * 100 : 0
```

### Currency Formatting
Brazilian Real (R$) formatting:
```javascript
value.toLocaleString('pt-BR', {minimumFractionDigits: 0, maximumFractionDigits: 0})
```

## Localization
- Language: Portuguese (Brazil)
- Currency: BRL (R$)
- Date format: DD/MM/YYYY
- Time format: 24-hour (HH:MM:SS)
