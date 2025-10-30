# Haus OS UI Starter

A comprehensive Next.js starter template for building applications on the Haus OS data layer. This repository provides everything you need to quickly bootstrap projects with authentication, file management, semantic search, and collaborative features.

## 🚀 What's Included

### **Core Features**

- **🔐 Authentication** - Complete Supabase auth setup with user management
- **📁 Heap CRUD** - Heap, Members, Files
- **🎨 UI Components** - Modern, accessible components with theme customization

### **Technical Stack**

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **UI**: shadcn/ui components with custom theming

## 🛠️ Quick Start

### Installation

1. **Clone and install dependencies**

   ```bash
   git clone <your-repo-url>
   cd hausos-starter
   npm install
   ```

2. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Configure your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 Documentation

- **[Component Theme Guide](docs/component-theme.md)** - UI theming and customization
- **Authentication Guide** - Complete auth setup and user management - COMING SOON
- **API Routes Documentation** - Full API reference with examples -COMING SOON
