# School Management System (SMS) - Skill

Skill complet pour le développement et la maintenance du **Student Management System** - une application de gestion scolaire full-stack avec Laravel 11 + React 18.

---

## 📋 Vue d'ensemble du projet

| Aspect | Technologie |
|--------|-------------|
| **Backend** | Laravel 11 (PHP 8.2+) |
| **Frontend** | React 18 + Vite |
| **Style** | Tailwind CSS 3.4 |
| **State Management** | Zustand (persist) |
| **Data Fetching** | React Query (TanStack Query) v3 |
| **Routing** | React Router DOM v6 |
| **Auth** | Laravel Sanctum + Spatie Permission |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **PDF** | barryvdh/laravel-dompdf |
| **DB** | MySQL |

---

## 🏗️ Architecture du projet

```
student-management-system/
├── backend/                    # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/    # Contrôleurs API
│   │   │   ├── AbsenceController.php
│   │   │   ├── ClasseController.php
│   │   │   ├── CourController.php
│   │   │   ├── DashboardController.php
│   │   │   ├── DevoirController.php
│   │   │   ├── EmploiTempController.php
│   │   │   ├── EtudiantController.php
│   │   │   ├── EtudiantDashboardController.php
│   │   │   ├── ExamenController.php
│   │   │   ├── FiliereController.php
│   │   │   ├── ModuleController.php
│   │   │   ├── NoteController.php
│   │   │   ├── ProfesseurController.php
│   │   │   └── ProfesseurDashboardController.php
│   │   ├── Http/Controllers/Auth/
│   │   │   └── AuthController.php      # Login/Logout/Me
│   │   ├── Models/                    # Modèles Eloquent
│   │   │   ├── User.php               # HasRoles (Spatie)
│   │   │   ├── Etudiant.php
│   │   │   ├── Professeur.php
│   │   │   ├── Filiere.php
│   │   │   ├── Classe.php
│   │   │   ├── Module.php
│   │   │   ├── Cour.php
│   │   │   ├── Devoir.php
│   │   │   ├── Examen.php
│   │   │   ├── Note.php
│   │   │   ├── Absence.php
│   │   │   └── EmploiTemp.php
│   │   └── Providers/
│   ├── database/migrations/           # 14 migrations
│   ├── database/seeders/
│   │   ├── RolePermissionSeeder.php   # Roles: admin, professeur, etudiant
│   │   ├── AdminSeeder.php
│   │   └── ...
│   ├── routes/api.php                 # Routes API groupées par rôle
│   ├── config/
│   │   ├── auth.php                   # Guard: sanctum
│   │   ├── cors.php                   # Frontend: localhost:5173
│   │   └── dompdf.php
│   └── resources/views/pdf/           # Templates PDF Blade
│
└── frontend/                      # React 18 SPA
    ├── src/
    │   ├── App.jsx                    # Routing conditionnel par rôle
    │   ├── main.jsx
    │   ├── context/
    │   │   └── authStore.js           # Zustand auth store (persist)
    │   ├── services/
    │   │   └── api.js                 # Axios instance + interceptors
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── AdminLayout.jsx
    │   │   │   ├── ProfesseurLayout.jsx
    │   │   │   └── EtudiantLayout.jsx
    │   │   └── ui/
    │   │       ├── Modal.jsx
    │   │       └── ConfirmDialog.jsx
    │   ├── pages/
    │   │   ├── auth/LoginPage.jsx
    │   │   ├── admin/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── Etudiants.jsx
    │   │   │   ├── Professeurs.jsx
    │   │   │   ├── Modules.jsx
    │   │   │   ├── Classes.jsx
    │   │   │   ├── Filieres.jsx
    │   │   │   ├── EmploisTemps.jsx
    │   │   │   └── Examens.jsx
    │   │   ├── professeur/
    │   │   │   ├── Dashboard.jsx
    │   │   │   ├── MesModules.jsx
    │   │   │   ├── MesClasses.jsx
    │   │   │   ├── GestionNotes.jsx
    │   │   │   ├── GestionAbsences.jsx
    │   │   │   ├── DepotCours.jsx
    │   │   │   └── Devoirs.jsx
    │   │   └── etudiant/
    │   │       ├── Dashboard.jsx
    │   │       ├── MonProfil.jsx
    │   │       ├── MesModules.jsx
    │   │       ├── MesNotes.jsx
    │   │       ├── MesAbsences.jsx
    │   │       ├── MonEmploiTemps.jsx
    │   │       └── MesCours.jsx
    │   ├── utils/
    │   │   └── helpers.js
    │   └── styles/
    │       └── index.css
    ├── tailwind.config.js             # Custom primary colors
    ├── vite.config.js                 # Port 5173, proxy /api
    └── package.json
```

---

## 🔐 Système d'authentification

### Backend (Laravel Sanctum)

```php
// config/auth.php - Guard par défaut: sanctum
'defaults' => [
    'guard' => 'sanctum',
    'passwords' => 'users',
],
```

**Flux d'authentification :**
1. `POST /api/login` → retourne `{ token, user, profile, role }`
2. `POST /api/logout` → supprime le token courant
3. `GET /api/me` → retourne l'utilisateur authentifié avec son profil

**Rôles et permissions (Spatie) :**
| Rôle | Permissions |
|------|-------------|
| `admin` | Toutes les permissions |
| `professeur` | manage_notes, manage_absences, manage_cours, manage_devoirs, view_dashboard |
| `etudiant` | view_dashboard |

### Frontend (Zustand + Persist)

```javascript
// src/context/authStore.js
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      profile: null,
      setAuth: (data) => set({ user: data.user, token: data.token, profile: data.profile }),
      logout: () => { localStorage.removeItem('token'); set({ user: null, token: null, profile: null }) },
    }),
    { name: 'auth-storage' }
  )
)
```

### API Service (Axios)

```javascript
// src/services/api.js
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true,
})

// Interceptor request: ajoute Bearer token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor response: 401 → logout + redirect
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 🛣️ Routes API (backend/routes/api.php)

```php
// Public
POST /api/login

// Auth:sanctum
POST /api/logout
GET  /api/me

// Admin (role:admin)  → prefix: /api/admin
GET    /api/admin/dashboard
GET    /api/admin/etudiants
POST   /api/admin/etudiants
GET    /api/admin/etudiants/{id}
PUT    /api/admin/etudiants/{id}
DELETE /api/admin/etudiants/{id}
// ... (même pattern pour professeurs, modules, examens, filieres, classes)
GET    /api/admin/emplois-temps
GET    /api/admin/emplois-temps/classe/{classe}
POST   /api/admin/emplois-temps
PUT    /api/admin/emplois-temps/{id}
DELETE /api/admin/emplois-temps/{id}
GET    /api/admin/emplois-temps/{classe}/pdf
GET    /api/admin/modules/{module}/professeurs

// Professeur (role:professeur) → prefix: /api/professeur
GET /api/professeur/dashboard
GET /api/professeur/mes-modules
GET /api/professeur/mes-classes
GET /api/professeur/classes/{classe}/etudiants
GET /api/professeur/classes/{classe}/modules/{module}/notes
GET /api/professeur/modules/{module}/examens
GET /api/professeur/classes/{classe}/modules/{module}/etudiants
POST /api/professeur/notes
GET /api/professeur/classes/{classe}/modules/{module}/absences
POST /api/professeur/absences
GET|POST /api/professeur/cours
DELETE /api/professeur/cours/{id}
GET|POST /api/professeur/devoirs
DELETE /api/professeur/devoirs/{id}

// Etudiant (role:etudiant) → prefix: /api/etudiant
GET /api/etudiant/dashboard
GET /api/etudiant/profil
GET /api/etudiant/mes-modules
GET /api/etudiant/mes-notes
GET /api/etudiant/mon-emploi-temps
GET /api/etudiant/mes-cours
GET /api/etudiant/mes-absences

// Shared
GET /api/cours/{cour}/download
```

---

## 🗄️ Modèles de données (Eloquent)

### Relations principales

```
User
├── hasOne Etudiant
├── hasOne Professeur
└── HasRoles (Spatie)

Etudiant
├── belongsTo User
├── belongsTo Filiere
├── belongsTo Classe
├── hasMany Note
└── hasMany Absence

Professeur
├── belongsTo User
├── hasMany Module
├── hasMany EmploiTemp
├── hasMany Note
├── hasMany Absence
├── hasMany Cour
└── hasMany Devoir

Filiere
├── hasMany Classe
└── hasMany Etudiant

Classe
├── belongsTo Filiere
├── hasMany Etudiant
└── hasMany EmploiTemp

Module
├── belongsTo Professeur
├── hasMany Note
├── hasMany Cour
└── hasMany Devoir

Examen
├── hasMany Note

Note
├── belongsTo Etudiant
├── belongsTo Module
├── belongsTo Examen
└── belongsTo Professeur

Absence
├── belongsTo Etudiant
├── belongsTo Module
└── belongsTo Professeur

EmploiTemp
├── belongsTo Classe
└── belongsTo Professeur

Cour
├── belongsTo Professeur
└── belongsTo Module

Devoir
├── belongsTo Professeur
└── belongsTo Module
```

---

## 🎨 Conventions Frontend

### Tailwind Config

```javascript
// tailwind.config.js - Couleurs personnalisées
colors: {
  primary: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe',
    300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
    600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a',
  }
}
```

### Patterns React courants

**Page Admin CRUD (pattern standard) :**
```jsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import api from '../../services/api'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import toast from 'react-hot-toast'

export default function ExemplePage() {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ /* champs initiaux */ })
  
  const queryClient = useQueryClient()
  
  const { data: items, isLoading } = useQuery('query-key', () =>
    api.get('/admin/endpoint').then((res) => res.data)
  )
  
  // Filtrage côté client
  const filteredItems = items?.filter((item) => {
    const term = searchTerm.toLowerCase()
    return item.nom?.toLowerCase().includes(term) || ...
  })
  
  const createMutation = useMutation(
    (data) => api.post('/admin/endpoint', data),
    { onSuccess: () => { queryClient.invalidateQueries('query-key'); setShowModal(false); toast.success('Succès') } }
  )
  
  const updateMutation = useMutation(
    ({ id, data }) => api.put(`/admin/endpoint/${id}`, data),
    { onSuccess: () => { queryClient.invalidateQueries('query-key'); setShowModal(false); setEditingId(null); toast.success('Modifié') } }
  )
  
  const deleteMutation = useMutation(
    (id) => api.delete(`/admin/endpoint/${id}`),
    { onSuccess: () => { queryClient.invalidateQueries('query-key'); setDeleteId(null); toast.success('Supprimé') } }
  )
  
  const handleSubmit = (e) => {
    e.preventDefault()
    editingId ? updateMutation.mutate({ id: editingId, data: formData }) : createMutation.mutate(formData)
  }
  
  const handleEdit = (item) => { setFormData({ ...item }); setEditingId(item.id); setShowModal(true) }
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Titre</h1>
      {/* Barre d'actions: recherche + bouton ajouter */}
      {/* Table avec actions edit/delete */}
      {/* Modal formulaire */}
      {/* ConfirmDialog suppression */}
    </div>
  )
}
```

**Layout avec sidebar (pattern standard) :**
```jsx
import { Outlet, NavLink } from 'react-router-dom'
import { useAuthStore } from '../../context/authStore'
import { LayoutDashboard, Users, LogOut } from 'lucide-react'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/etudiants', icon: Users, label: 'Étudiants' },
  // ...
]

export default function AdminLayout() {
  const { user, logout } = useAuthStore()
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-primary-700">SMS</h1>
          <p className="text-sm text-gray-500">👑 {user?.name}</p>
        </div>
        <nav className="p-4 space-y-1 flex-1">
          {menuItems.map((item) => (
            <NavLink key={item.path} to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }>
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full">
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
```

**Dashboard avec stats et charts :**
```jsx
import { useQuery } from 'react-query'
import api from '../../services/api'
import { Users, BookOpen } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
)

export default function Dashboard() {
  const { data: stats } = useQuery('admin-stats', () =>
    api.get('/admin/dashboard').then((res) => res.data)
  )
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Étudiants" value={stats?.etudiants || 0} icon={Users} color="bg-blue-500" />
        {/* ... */}
      </div>
      <div className="card">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats?.etudiants_par_filiere || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nom" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="etudiants_count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
```

---

## 📝 Conventions Backend (Laravel)

### Contrôleur API standard (CRUD)

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ModelName;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ModelNameController extends Controller
{
    public function index()
    {
        $items = ModelName::with(['relation1', 'relation2'])->get();
        return response()->json($items);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'field' => 'required|string|max:255',
            'email' => 'required|email|unique:model_names',
            'relation_id' => 'required|exists:relations,id',
        ]);

        $item = ModelName::create($validated);
        return response()->json($item->load(['relation1', 'relation2']), 201);
    }

    public function show(ModelName $item)
    {
        return response()->json($item->load(['relation1', 'relation2']));
    }

    public function update(Request $request, ModelName $item)
    {
        $validated = $request->validate([
            'field' => 'required|string|max:255',
            'email' => 'required|email|unique:model_names,email,' . $item->id,
        ]);

        $item->update($validated);
        return response()->json($item->load(['relation1', 'relation2']));
    }

    public function destroy(ModelName $item)
    {
        // Supprimer l'utilisateur associé si nécessaire
        $item->user?->delete();
        $item->delete();
        return response()->json(['message' => 'Supprimé avec succès']);
    }
}
```

### Modèle Eloquent standard

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Example extends Model
{
    use HasFactory;

    protected $fillable = [
        'field1', 'field2', 'relation_id',
    ];

    protected $casts = [
        'date_field' => 'date',
    ];

    public function relation()
    {
        return $this->belongsTo(Relation::class);
    }

    public function getFullNameAttribute()
    {
        return $this->prenom . ' ' . $this->nom;
    }
}
```

### Route binding et middleware

```php
// routes/api.php
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    // Routes publiques (authentifiées)
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    // Routes admin - middleware('role:admin') + prefix('admin')
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::apiResource('etudiants', EtudiantController::class);
        // apiResource génère: index, store, show, update, destroy
    });
    
    // Routes professeur
    Route::middleware('role:professeur')->prefix('professeur')->group(function () {
        Route::get('/dashboard', [ProfesseurDashboardController::class, 'dashboard']);
        Route::post('/notes', [NoteController::class, 'storeNotes']);
    });
    
    // Routes étudiant
    Route::middleware('role:etudiant')->prefix('etudiant')->group(function () {
        Route::get('/dashboard', [EtudiantDashboardController::class, 'dashboard']);
    });
});
```

### Génération PDF (DOMPDF)

```php
use Barryvdh\DomPDF\Facade\Pdf;

public function exportPdf(Classe $classe)
{
    $emploi = EmploiTemp::where('classe_id', $classe->id)->with('professeur')->get();
    $pdf = Pdf::loadView('pdf.emploi-temps', compact('emploi', 'classe'));
    return $pdf->download("emploi-temps-{$classe->nom}.pdf");
}
```

---

## ⚙️ Configuration CORS

```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

---

## 🚀 Commandes de développement

### Backend (Laravel)

```bash
cd backend

# Démarrer le serveur
php artisan serve

# Migrations
php artisan migrate

# Seeders
php artisan db:seed
php artisan db:seed --class=AdminSeeder

# Créer un contrôleur API
php artisan make:controller Api/NouveauController --api

# Créer un modèle + migration + factory + seeder
php artisan make:model NomModele -mfsc

# Créer une requête de validation
php artisan make:request StoreNomRequest

# Cache config (production)
php artisan config:cache
php artisan route:cache

# Tests
php artisan test
```

### Frontend (React + Vite)

```bash
cd frontend

# Démarrer le dev server
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Installer une dépendance
npm install <package>
```

### Base de données (MySQL)

```bash
# Se connecter
mysql -u root -p

# Créer la base
create database student_management;

# Vérifier les tables
use student_management;
show tables;
```

---

## 🧪 Tests et validation

### Backend - PHPUnit

```php
// tests/Feature/Api/EtudiantTest.php
class EtudiantTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_admin_can_list_etudiants()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $admin->assignRole('admin');
        
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/etudiants');
            
        $response->assertStatus(200)
            ->assertJsonStructure([['id', 'nom', 'prenom', 'filiere', 'classe']]);
    }
}
```

### Frontend - Patterns de test

```jsx
// Tests avec React Testing Library
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

const createTestQueryClient = () => new QueryClient({
  defaultOptions: { queries: { retry: false } }
})

const renderWithProviders = (ui) => {
  const queryClient = createTestQueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

---

## 📦 Dépendances clés

### Backend (composer.json)

| Package | Version | Usage |
|---------|---------|-------|
| `laravel/framework` | ^11.0 | Framework |
| `laravel/sanctum` | ^4.0 | Auth API tokens |
| `spatie/laravel-permission` | ^6.0 | RBAC |
| `barryvdh/laravel-dompdf` | ^3.1 | Génération PDF |
| `guzzlehttp/guzzle` | ^7.2 | HTTP client |
| `fakerphp/faker` | ^1.23 | Données de test |
| `phpunit/phpunit` | ^11.0 | Tests |

### Frontend (package.json)

| Package | Version | Usage |
|---------|---------|-------|
| `react` | ^18.3 | UI library |
| `react-router-dom` | ^6.23 | Routing |
| `axios` | ^1.7 | HTTP client |
| `react-query` | ^3.39 | Data fetching / cache |
| `zustand` | ^4.5 | State management |
| `recharts` | ^2.12 | Charts |
| `lucide-react` | ^0.378 | Icons |
| `tailwindcss` | ^3.4 | CSS framework |
| `react-hot-toast` | ^2.4 | Notifications |
| `date-fns` | ^3.6 | Date manipulation |
| `vite` | ^5.2 | Build tool |

---

## 🔧 Variables d'environnement

### Backend (.env)

```env
APP_NAME="Student Management System"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_management
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

FRONTEND_URL=http://localhost:5173
```

---

## 🎯 Bonnes pratiques du projet

1. **Authentification** : Toujours utiliser `auth:sanctum` + `role:X` pour les routes protégées
2. **Eager Loading** : Toujours charger les relations avec `with()` dans les contrôleurs
3. **Validation** : Utiliser `$request->validate()` ou Form Requests pour toutes les entrées
4. **Frontend** : Utiliser React Query pour toute la récupération de données (cache automatique)
5. **Mutations** : Invalider les queries après création/mise à jour/suppression
6. **Notifications** : Utiliser `toast.success()` / `toast.error()` pour les feedbacks utilisateur
7. **Recherche** : Filtrage côté client avec `filter()` + `toLowerCase().includes()`
8. **Passwords** : Mot de passe par défaut = CIN de l'utilisateur (Hash::make)
9. **PDF** : Utiliser Blade views dans `resources/views/pdf/` pour les exports
10. **CORS** : Le frontend tourne sur `localhost:5173`, backend sur `localhost:8000`

---

## 🐛 Dépannage courant

| Problème | Solution |
|----------|----------|
| 401 Unauthorized | Vérifier le token Sanctum, vérifier `auth:sanctum` dans les routes |
| CORS errors | Vérifier `FRONTEND_URL` dans `.env`, vérifier `config/cors.php` |
| 403 Forbidden | Vérifier le rôle Spatie (`$user->assignRole('admin')`) |
| React Query ne rafraîchit pas | Utiliser `queryClient.invalidateQueries('key')` après mutation |
| PDF ne génère pas | Vérifier `barryvdh/laravel-dompdf` installé, vérifier les permissions storage |
| Base de données vide | Exécuter `php artisan migrate --seed` |
| Token expiré | Le frontend redirige automatiquement vers login sur 401 |

---

## 📚 Références

- [Laravel 11 Documentation](https://laravel.com/docs/11.x)
- [Laravel Sanctum](https://laravel.com/docs/11.x/sanctum)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission)
- [React Query v3](https://react-query-v3.tanstack.com/)
- [Zustand](https://docs.pmnd.rs/zustand)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/en-US)
- [Vite](https://vitejs.dev/guide/)
