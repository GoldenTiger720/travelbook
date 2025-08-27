# Zenith Travel Ops

A modern travel agency management system built with React, TypeScript, and shadcn/ui components. This comprehensive platform streamlines travel operations by managing reservations, quotes, customers, and financial data in one elegant interface.

![Zenith Travel Ops](./public/omg.png)

## 🚀 Features

### Core Modules

- **📊 Dashboard**: Real-time overview of key metrics including revenue, active reservations, customer count, and pending quotes
- **📅 Reservation Calendar**: Advanced booking management with day, week, and month views
- **💰 Quotes Management**: Create and track travel quotes for potential customers
- **👥 Customer Management**: Comprehensive customer database and relationship management
- **💸 Financial Module**: Track revenue, expenses, and financial reports
- **🚗 Logistics**: Manage transportation and tour services
- **📈 Reports**: Generate detailed business analytics and insights
- **⚙️ Settings**: Configure system preferences and user settings

### Technical Features

- **Modern UI/UX**: Built with shadcn/ui components for a consistent, beautiful interface
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Theme system with light/dark mode toggle
- **Type Safety**: Full TypeScript support for improved development experience
- **State Management**: Efficient state management with React Query
- **Routing**: Client-side routing with React Router v6
- **Component Library**: Extensive set of reusable UI components

## 🛠️ Tech Stack

### Frontend Framework
- **React 18.3** - Modern React with hooks and concurrent features
- **TypeScript 5.8** - Type-safe development
- **Vite 5.4** - Lightning-fast build tool and development server

### UI & Styling
- **shadcn/ui** - High-quality, accessible component library
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide Icons** - Beautiful, consistent icon set

### State & Data Management
- **React Query (TanStack Query)** - Powerful data synchronization
- **React Hook Form** - Performant forms with easy validation
- **Zod** - TypeScript-first schema validation

### Additional Libraries
- **date-fns** - Modern JavaScript date utility library
- **Recharts** - Composable charting library for data visualization
- **React Day Picker** - Flexible date picker component
- **Sonner** - Beautiful toast notifications

## 📁 Project Structure

```
zenith-travelops/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── AppSidebar.tsx # Main navigation sidebar
│   │   ├── Dashboard.tsx  # Dashboard component
│   │   └── ...           # Other feature components
│   ├── pages/            # Route page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── public/               # Static assets
├── package.json          # Project dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/zenith-travelops.git
cd zenith-travelops
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint for code quality

## 🏗️ Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🚀 Deployment

### Vercel (Recommended)

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy with zero configuration

The `vercel.json` file is already configured for proper SPA routing.

### Other Platforms

The project can be deployed to any static hosting service:
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Cloudflare Pages

## 🎨 Customization

### Theme Configuration

The project uses CSS variables for theming. You can customize colors in `src/index.css`:

```css
:root {
  --primary: 240 5.9% 10%;
  --secondary: 240 4.8% 95.9%;
  /* ... other theme variables */
}
```

### Adding New Components

1. Create new components in `src/components/`
2. Use the existing UI components from `src/components/ui/`
3. Follow the established patterns for consistency

### Adding New Pages

1. Create a new page component in `src/pages/`
2. Add the route in `src/App.tsx`
3. Update navigation in `src/components/AppSidebar.tsx`

## 🧪 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow React best practices and hooks guidelines
- Maintain consistent formatting (ESLint configured)
- Use meaningful component and variable names

### Component Structure

```typescript
import { ComponentProps } from "@/types"

export function MyComponent({ prop1, prop2 }: ComponentProps) {
  // Component logic
  return (
    // JSX
  )
}
```

### State Management

- Use React Query for server state
- Use React hooks for local state
- Consider context for cross-component state

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool

## 📞 Support

For support, email support@zenith-travelops.com or open an issue in the GitHub repository.

---

Built with ❤️ by the Zenith Travel Ops Team