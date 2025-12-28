GO
ALTER TABLE [dbo].[OpenIddictTokens] DROP CONSTRAINT [FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId]
GO
ALTER TABLE [dbo].[OpenIddictTokens] DROP CONSTRAINT [FK_OpenIddictTokens_OpenIddictApplications_ApplicationId]
GO
ALTER TABLE [dbo].[OpenIddictAuthorizations] DROP CONSTRAINT [FK_OpenIddictAuthorizations_OpenIddictApplications_ApplicationId]
GO
CREATE TABLE [dbo].[OpenIddictApplications](
	[Id] [nvarchar](450) NOT NULL,
	[ApplicationType] [nvarchar](50) NULL,
	[ClientId] [nvarchar](100) NULL,
	[ClientSecret] [nvarchar](max) NULL,
	[ClientType] [nvarchar](50) NULL,
	[ConcurrencyToken] [nvarchar](50) NULL,
	[ConsentType] [nvarchar](50) NULL,
	[DisplayName] [nvarchar](max) NULL,
	[DisplayNames] [nvarchar](max) NULL,
	[JsonWebKeySet] [nvarchar](max) NULL,
	[Permissions] [nvarchar](max) NULL,
	[PostLogoutRedirectUris] [nvarchar](max) NULL,
	[Properties] [nvarchar](max) NULL,
	[RedirectUris] [nvarchar](max) NULL,
	[Requirements] [nvarchar](max) NULL,
	[Settings] [nvarchar](max) NULL,
 CONSTRAINT [PK_OpenIddictApplications] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OpenIddictAuthorizations]    Script Date: 4/5/2025 8:55:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OpenIddictAuthorizations](
	[Id] [nvarchar](450) NOT NULL,
	[ApplicationId] [nvarchar](450) NULL,
	[ConcurrencyToken] [nvarchar](50) NULL,
	[CreationDate] [datetime2](7) NULL,
	[Properties] [nvarchar](max) NULL,
	[Scopes] [nvarchar](max) NULL,
	[Status] [nvarchar](50) NULL,
	[Subject] [nvarchar](400) NULL,
	[Type] [nvarchar](50) NULL,
 CONSTRAINT [PK_OpenIddictAuthorizations] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OpenIddictScopes]    Script Date: 4/5/2025 8:55:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OpenIddictScopes](
	[Id] [nvarchar](450) NOT NULL,
	[ConcurrencyToken] [nvarchar](50) NULL,
	[Description] [nvarchar](max) NULL,
	[Descriptions] [nvarchar](max) NULL,
	[DisplayName] [nvarchar](max) NULL,
	[DisplayNames] [nvarchar](max) NULL,
	[Name] [nvarchar](200) NULL,
	[Properties] [nvarchar](max) NULL,
	[Resources] [nvarchar](max) NULL,
 CONSTRAINT [PK_OpenIddictScopes] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OpenIddictTokens]    Script Date: 4/5/2025 8:55:41 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OpenIddictTokens](
	[Id] [nvarchar](450) NOT NULL,
	[ApplicationId] [nvarchar](450) NULL,
	[AuthorizationId] [nvarchar](450) NULL,
	[ConcurrencyToken] [nvarchar](50) NULL,
	[CreationDate] [datetime2](7) NULL,
	[ExpirationDate] [datetime2](7) NULL,
	[Payload] [nvarchar](max) NULL,
	[Properties] [nvarchar](max) NULL,
	[RedemptionDate] [datetime2](7) NULL,
	[ReferenceId] [nvarchar](100) NULL,
	[Status] [nvarchar](50) NULL,
	[Subject] [nvarchar](400) NULL,
	[Type] [nvarchar](500) NULL,
 CONSTRAINT [PK_OpenIddictTokens] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
GO
ALTER TABLE [dbo].[OpenIddictAuthorizations]  WITH CHECK ADD  CONSTRAINT [FK_OpenIddictAuthorizations_OpenIddictApplications_ApplicationId] FOREIGN KEY([ApplicationId])
REFERENCES [dbo].[OpenIddictApplications] ([Id])
GO
ALTER TABLE [dbo].[OpenIddictAuthorizations] CHECK CONSTRAINT [FK_OpenIddictAuthorizations_OpenIddictApplications_ApplicationId]
GO
ALTER TABLE [dbo].[OpenIddictTokens]  WITH CHECK ADD  CONSTRAINT [FK_OpenIddictTokens_OpenIddictApplications_ApplicationId] FOREIGN KEY([ApplicationId])
REFERENCES [dbo].[OpenIddictApplications] ([Id])
GO
ALTER TABLE [dbo].[OpenIddictTokens] CHECK CONSTRAINT [FK_OpenIddictTokens_OpenIddictApplications_ApplicationId]
GO
ALTER TABLE [dbo].[OpenIddictTokens]  WITH CHECK ADD  CONSTRAINT [FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId] FOREIGN KEY([AuthorizationId])
REFERENCES [dbo].[OpenIddictAuthorizations] ([Id])
GO
ALTER TABLE [dbo].[OpenIddictTokens] CHECK CONSTRAINT [FK_OpenIddictTokens_OpenIddictAuthorizations_AuthorizationId]
GO