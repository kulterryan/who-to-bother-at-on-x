# Who to Bother on X

A community-maintained directory to help developers find the right people to reach out to at tech companies on X (formerly Twitter).

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Deployed on Cloudflare](https://img.shields.io/badge/Deployed%20on-Cloudflare-orange?style=flat&logo=cloudflare)](https://pages.cloudflare.com)
[![Built with TanStack](https://img.shields.io/badge/Built%20with-TanStack-black?style=flat)](https://tanstack.com)

## Overview

This open-source project helps developers quickly find the right contacts at various tech companies for:
- Product feedback and bug reports
- Technical questions and support
- Community engagement
- Feature requests

## Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details on how to add your company or update existing information.

### Quick Start for Contributors

1. Fork and clone the repository
2. Add your company data to `src/data/companies/`
3. Update the registry in `src/data/companies.json`
4. Add your logo to `src/components/company-logos.tsx`
5. Submit a PR!

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare Pages
pnpm deploy
```

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: TanStack Router
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Pages
- **Build**: Vite

## Project Structure

```
src/
├── app/                 # Routes and pages
├── components/          # Reusable components
├── data/               # Company data (JSON)
│   └── companies/      # Individual company files
└── types/              # TypeScript definitions
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Concept by [@strehldev](https://x.com/strehldev)
- Maintained by [@thehungrybird_](https://x.com/thehungrybird_) and contributors

## Disclaimer

This is a community-maintained resource and is not officially affiliated with any of the listed companies. For official support, please visit the respective company websites.