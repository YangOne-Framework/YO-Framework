# Yang One Framework (YO Framework)

A comprehensive .NET framework for building modern web applications with built-in modules for Identity, Admin, Real-time Communication, Push Notifications, and more.

## Features

- **Identity & Authentication** - OpenID Connect/OAuth2 server with ASP.NET Core Identity integration
- **Real-time Communication** - SignalR-based RTC core for real-time features
- **Modular Architecture** - Plugin-based module system with dynamic loading
- **SEO & Sitemap** - Built-in SEO management and sitemap generation
- **Grid & Forms** - Advanced data grid and form builders
- **Localization** - Support for locale
- **Secure** - Secure api supporting entrypted or obfusicated payload and csp controls
- **Secure** - Secure api supporting entrypted or obfusicated payload and csp controls
- **Admin Dashboard** - Complete admin panel with user management, roles, permissions, menus, and settings

## Project Structure

```
src/
├── Core/
│   ├── YangOne.Core/           # Core utilities and base classes
│   ├── YangOne.Data/           # Data access layer (EF Core)
│   ├── YangOne.Identity/       # Identity management
│   ├── YangOne.Web/            # Web framework core
│   ├── YangOne.OTP/            # One-time password (HOTP/TOTP)
│   ├── YangOne.RTC.Core/       # Real-time communication core
│   ├── YangOne.Widget/         # Widget system
│   └── YangOne.Extensions/     # Common extensions
├── Modules/
│   ├── YangOne.IdentityServer/ # OpenID Connect/OAuth2 server
│   ├── YangOne.Identity.Web/   # Identity web UI (login, register, etc.)
│   ├── YandOne.Admin/          # Admin dashboard module
│   ├── YangOne.FCM/            # Firebase Cloud Messaging
│   └── YangOne.Agro/           # Agriculture module (example)
├── Extensions/
│   ├── YangOne.SMS.Azure/      # Azure SMS sender
│   └── YangOne.Storage.AzureBlob/ # Azure Blob Storage
└── App/
    └── YOApp/                  # Sample application
```

## Getting Started

### Prerequisites

- .NET 10.0 SDK or later
- SQL Server / PostgreSQL
- Redis (for caching, optional)
- Azure Account (for SMS/Blob storage, optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/YangOne-Framework/YO-Framework.git
cd yang-one-framework

# Restore dependencies
dotnet restore

# Build the solution
dotnet build src/YO-Framework.sln
```

### Configuration

Configure your `appsettings.json` with connection strings and service settings:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=...;User=...;Password=...;"
  },
  "YangOne": {
    "IdentityServer": {
      "IssuerUri": "https://your-domain.com"
    },
    "Azure": {
      "StorageConnectionString": "DefaultEndpointsProtocol=https;...",
      "SmsConnectionString": "endpoint=...;accesskey=..."
    }
  }
}
```

## Modules

### Identity Server (`YangOne.IdentityServer`)
OpenID Connect/OAuth2 server implementation with:
- Client management
- API Resource/Scopes management
- Grant management
- Admin UI for configuration

### Admin Module (`YandOne.Admin`)
Complete administration panel featuring:
- User & Role management
- Menu & Permission system
- Module management
- Settings & Configuration
- Media library
- Localization
## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 Yang One Framework
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- Documentation: [Wiki](github.com/YangOne-Framework/YO-Framework/wiki)
- Issues: [GitHub Issues](github.com/YangOne-Framework/YO-Framework/issues)
- Discussions: [GitHub Discussions](github.com/YangOne-Framework/YO-Framework/discussions)

## Organization

**Yang One Framework** (YO Framework) - Building the future of .NET web applications.