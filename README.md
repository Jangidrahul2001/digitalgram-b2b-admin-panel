# B2B Admin Panel

Built with Next.js, Tailwind CSS, and React.

## Folder Structure

- `app/`: Next.js App Router pages.
  - `(dashboard)`: Authenticated routes.
  - `(auth)`: Authentication routes.
- `components/`: React components.
  - `ui/`: Reusable primitive components (Button, Input, etc.).
  - `layouts/`: Layout components (Sidebar, Header).
  - `tables/`: Table components.
- `config/`: Application configuration.
  - `theme.config.js`: Theme settings.
  - `tables.config.js`: Table defaults and styles.
  - `site.config.js`: Site metadata.
- `lib/`: Utilities.

## Configuration

You can customize the application by editing files in the `config/` directory.

- **Theme**: Edit `app/globals.css` for colors/variables and `config/theme.config.js` for structural settings.
- **Tables**: Edit `config/tables.config.js` to change default page sizes, styles, or behaviors.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```
