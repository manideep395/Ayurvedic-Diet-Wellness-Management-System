**Overview**

A Vite + React + TypeScript app for Ayurvedic diet planning that combines practitioner 
workflows, a searchable foods database with Ayurvedic attributes, and AI‑powered 
personalized recommendations. 

 
**Core features & functionality **

- Patient management: create/edit/delete patient profiles with prakriti, health conditions, 
preferences and lifestyle notes.

- Food database: searchable foods with nutrition + Ayurvedic attributes (rasa, guna, virya, 
vipaka, dosha effects).

- AI-powered recommendations: generate meal plans or dietary advice using a Supabase Edge 
Function that calls Gemini.

- Meal plan rendering: structured display and parsing of AI responses 
 
- Data persistence: Postgres (Supabase) schema for patients, diet_charts, meal_plans, 
recommendations and foods


** Tech stack  **

- Frontend: Vite + React + TypeScript
- Styling: Tailwind CSS with design tokens
- UI primitives: Radix + shadcn-style components
- Data & Auth: Supabase (Postgres + Auth + Edge Functions)
- AI: Google Gemini via Supabase Edge Function
- State & data fetching: React Query
- Notifications: custom toast hook + UI

  
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

