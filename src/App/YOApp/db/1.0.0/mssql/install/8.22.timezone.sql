


GO
SET ANSI_NULLS ON
GO
SET ANSI_PADDING ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[Timezone](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Identifier] [nvarchar](100) NULL,
	[StandardName] [nvarchar](100) NULL,
	[DisplayName] [nvarchar](100) NULL,
	[DaylightName] [nvarchar](100) NULL,
	[SupportsDaylightSavingTime] [bit] NULL,
	[BaseUtcOffsetSec] [int] NULL,
    [UTC] [nvarchar](15) NULL,
 CONSTRAINT [PK_Timezone] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
)
GO

SET IDENTITY_INSERT [dbo].[Timezone] ON
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (1, N'Dateline Standard Time', N'Dateline Standard Time', N'(UTC-12: 00) International Dateline (West)', N'Dateline Summer Time', 0, -43200, N'UTC -12:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (2, N'UTC-11', N'UTC-11', N'(UTC-11: 00) Coordinated World Time-11', N'UTC-11', 0, -39600, N'UTC -11:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (3, N'Hawaiian Standard Time', N'Hawaii Standard Time', N'(UTC-10: 00) Hawaii', N'Hawaii Summer Time', 0, -36000, N'UTC -10:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (4, N'Alaskan Standard Time', N'Alaska Standard Time', N'(UTC-09: 00) Alaska', N'Alaska Summer Time', 1, -32400, N'UTC -09:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (5, N'Pacific Standard Time (Mexico)', N'Pacific Standard Time (Mexico)', N'(UTC-08: 00) Baja California', N'Pacific Summer Time (Mexico)', 1, -28800, N'UTC -08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (6, N'Pacific Standard Time', N'Pacific Standard Time', N'(UTC-08: 00) Pacific Time (USA & Canada)', N'Pacific Summer Time', 1, -28800, N'UTC -08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (7, N'Us Mountain Standard Time', N'Mountain Standard Time (Arizona)', N'(UTC-07: 00) Arizona', N'Mountain Summer Time (Arizona)', 0, -25200, N'UTC -07:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (8, N'Mountain Standard Time (Mexico)', N'Mountain Standard Time (Mexico)', N'(UTC-07: 00) Chihuahua, La Paz, Mazatlan', N'Mountain Summer Time (Mexico)', 1, -25200, N'UTC -07:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (9, N'Mountain Standard Time', N'Mountain Standard Time', N'(UTC-07: 00) Mountain Time (USA & Canada)', N'Mountain Summer Time', 1, -25200, N'UTC -07:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (10, N'Central Standard Time', N'Central Standard Time', N'(UTC-06: 00) Central Time (USA & Canada)', N'Central Summer Time', 1, -21600, N'UTC -06:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (11, N'Central Standard Time (Mexico)', N'Central Standard Time (Mexico)', N'(UTC-06: 00) Guadalajara, Mexico City, Monterrey', N'Central Summer Time (Mexico)', 1, -21600, N'UTC -06:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (12, N'Central America Standard Time', N'Central American Standard Time', N'(UTC-06: 00) Central America', N'Central American Summer Time', 0, -21600, N'UTC -06:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (13, N'Canada Central Standard Time', N'Central Standard Time (Canada)', N'(UTC-06: 00) Saskatchewan', N'Central Summer Time (Canada)', 0, -21600, N'UTC -06:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (14, N'Sa Pacific Standard Time', N'West. South America Standard Time', N'(UTC-05: 00) Bogotá, Lima, Quito, Rio Branco', N'West. South America Summer Time', 0, -18000, N'UTC -05:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (15, N'Eastern Standard Time', N'Eastern Standard Time', N'(UTC-05: 00) Eastern Time (USA & Canada)', N'Eastern Summer Time', 1, -18000, N'UTC -05:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (16, N'Us Eastern Standard Time', N'Eastern Standard Time (Indiana)', N'(UTC-05: 00) Indiana (East)', N'Eastern Summer Time (Indiana)', 1, -18000, N'UTC -05:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (17, N'Venezuela Standard Time', N'Venezuela Standard Time', N'(UTC-04: 30) Caracas', N'Venezuela Summer Time', 0, -16200, N'UTC -04:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (18, N'Paraguay Standard Time', N'Paraguay Standard Time', N'(UTC-04: 00) Asuncion', N'Paraguay Summer Time', 1, -14400, N'UTC -04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (19, N'Atlantic Standard Time', N'Atlantic Standard Time', N'(UTC-04: 00) Atlantic (Canada)', N'Atlantic Summer Time', 1, -14400, N'UTC -04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (20, N'Central Brazilian Standard Time', N'Central Brazilian Standard Time', N'(UTC-04: 00) Cuiaba', N'Central Brazilian Summer Time', 1, -14400, N'UTC -04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (21, N'Sa Western Standard Time', N'Middle South America Standard Time', N'(UTC-04: 00) Georgetown, La Paz, Manaus, San Juan', N'Middle South America Summer Time', 0, -14400, N'UTC -04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (22, N'Pacific Sa Standard Time', N'Chilean Standard Time', N'(UTC-04: 00) Santiago', N'Chilean Summer Time', 1, -14400, N'UTC -04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (23, N'Newfoundland Standard Time', N'Newfoundland Standard Time', N'(UTC-03: 30) Newfoundland', N'Newfoundland Summer Time', 1, -12600, N'UTC -03:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (24, N'E. South America Standard Time', N'East South America Standard Time', N'(UTC-03: 00) Brasilia', N'Östl. South America Summer Time', 1, -10800, N'UTC -03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (25, N'Argentina Standard Time', N'Argentina Standard Time', N'(UTC-03: 00) Buenos Aires', N'Argentina Summer Time', 1, -10800, N'UTC -03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (26, N'Sa Eastern Standard Time', N'East South America Standard Time', N'(UTC-03: 00) Cayenne, Fortaleza', N'Östl. South America Summer Time', 0, -10800, N'UTC -03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (27, N'Greenland Standard Time', N'Greenland Standard Time', N'(UTC-03: 00) Greenland', N'Greenland Summer Time', 1, -10800, N'UTC -03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (28, N'Montevideo Standard Time', N'Montevideo Standard Time', N'(UTC-03: 00) Montevideo', N'Montevideo Summer Time', 1, -10800, N'UTC -03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (29, N'Bahia Standard Time', N'Bahia Standard Time', N'(UTC-03: 00) Salvador', N'Bahia Summer Time', 1, -10800, N'UTC -03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (30, N'UTC-02', N'UTC-02', N'(UTC-02: 00) Coordinated Worldtime-02', N'UTC-02', 0, -7200, N'UTC -02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (31, N'Mid-atlantic Standard Time', N'Central Atlantic Standard Time', N'(UTC-02: 00) Central Atlantic - Old', N'Central Atlantic Summer Time', 1, -7200, N'UTC -02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (32, N'Azores Standard Time', N'Azores Standard Time', N'(UTC-01: 00) Azores', N'Azores Summer Time', 1, -3600, N'UTC -01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (33, N'Cape Verde Standard Time', N'Cape Verde Standard Time', N'(UTC-01: 00) Cape Verde', N'Cape Verde Summer Time', 0, -3600, N'UTC -01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (34, N'Morocco Standard Time', N'Morocco Standard Time', N'(UTC) Casablanca', N'Morocco Summer Time', 1, 0, N'UTC');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (35, N'Gmt Standard Time', N'West European Time', N'(UTC) Dublin, Edinburgh, Lisbon, London', N'West European Summer Time', 1, 0, N'UTC');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (36, N'UTC', N'Coordinated World Time', N'(UTC) Coordinated Worldtime', N'Coordinated World Time', 0, 0, N'UTC');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (37, N'Greenwich Standard Time', N'West African Standard Time', N'(UTC) Monrovia, Reykjavik', N'West African Summer Time', 0, 0, N'UTC');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (38, N'W. Europe Standard Time', N'Central European Time', N'(UTC + 01: 00) Amsterdam, Berlin, Berne, Rome, Stockholm, Vienna', N'Central European Summer Time', 1, 3600, N'UTC +01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (39, N'Central Europe Standard Time', N'Central European Time', N'(UTC + 01: 00) Belgrade, Bratislava (Bratislava), Budapest, Ljubljana, Prague', N'Central European Summer Time', 1, 3600, N'UTC +01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (40, N'Romance Standard Time', N'Central European Time', N'(UTC + 01: 00) Brussels, Copenhagen, Madrid, Paris', N'Central European Summer Time', 1, 3600, N'UTC +01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (41, N'Central European Standard Time', N'Central European Time', N'(UTC + 01: 00) Sarajevo, Skopje, Warsaw, Zagreb', N'Central European Summer Time', 1, 3600, N'UTC +01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (42, N'W. Central Africa Standard Time', N'West Central Africa Standard Time', N'(UTC + 01: 00) West Central Africa', N'West Central Africa Summer Time', 0, 3600, N'UTC +01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (43, N'Namibia Standard Time', N'Namibia Standard Time', N'(UTC + 01: 00) Windhoek', N'Namibia Summer Time', 1, 3600, N'UTC +01:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (44, N'Jordan Standard Time', N'Jordan Standard Time', N'(UTC + 02: 00) Amman', N'Jordan Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (45, N'Gtb Standard Time', N'Eastern European Time', N'(UTC + 02: 00) Athens, Bucharest', N'Eastern European Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (46, N'Middle East Standard Time', N'Middle East Standard Time', N'(UTC + 02: 00) Beirut', N'Middle East Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (47, N'Syria Standard Time', N'Syria Standard Time', N'(UTC + 02: 00) Damascus', N'Syria Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (48, N'South Africa Standard Time', N'South Africa Standard Time', N'(UTC + 02: 00) Harare, Pretoria', N'South Africa Summer Time', 0, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (49, N'Fle Standard Time', N'Eastern European Time', N'(UTC + 02: 00) Helsinki, Kiev, Riga, Sofia, Tallinn, Vilnius', N'Eastern European Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (50, N'Turkey Standard Time', N'Turkey Standard Time', N'(UTC + 02: 00) Istanbul', N'Turkey Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (51, N'Israel Standard Time', N'JerUSAlem Standard Time', N'(UTC + 02: 00) JerUSAlem', N'JerUSAlem Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (52, N'Egypt Standard Time', N'Egypt Standard Time', N'(UTC + 02: 00) Cairo', N'Egypt Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (53, N'E. Europe Standard Time', N'Eastern European Time', N'(UTC + 02: 00) Eastern Europe', N'Eastern European Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (54, N'Libya Standard Time', N'Libya Standard Time', N'(UTC + 02: 00) Tripoli', N'Libya Summer Time', 1, 7200, N'UTC +02:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (55, N'Arabic Standard Time', N'Arabic Standard Time', N'(UTC + 03: 00) Baghdad', N'Arab Summer Time', 1, 10800, N'UTC +03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (56, N'Kaliningrad Standard Time', N'Kaliningrad Standard Time', N'(UTC + 03: 00) Kaliningrad, Minsk', N'Kaliningrad Summer Time', 1, 10800, N'UTC +03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (57, N'Arab Standard Time', N'Arabic Standard Time', N'(UTC + 03: 00) Kuwait, Riyadh', N'Arab Summer Time', 0, 10800, N'UTC +03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (58, N'E. Africa Standard Time', N'East African Standard Time', N'(UTC + 03: 00) Nairobi', N'East African Summer Time', 0, 10800, N'UTC +03:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (59, N'Iran Standard Time', N'Iran Standard Time', N'(UTC + 03: 30) Tehran', N'Iran Summer Time', 1, 12600, N'UTC +03:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (60, N'Arabian Standard Time', N'Arabic Standard Time', N'(UTC + 04: 00) Abu Dhabi, Muscat', N'Arab Summer Time', 0, 14400, N'UTC +04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (61, N'Azerbaijan Standard Time', N'Azerbaijan Standard Time', N'(UTC + 04: 00) Baku', N'Azerbaijan Summer Time', 1, 14400, N'UTC +04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (62, N'Caucasus Standard Time', N'Caucasian Standard Time', N'(UTC + 04: 00) Yerevan', N'Caucasian Summer Time', 1, 14400, N'UTC +04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (63, N'Russian Standard Time', N'Russian Standard Time', N'(UTC + 04: 00) Moscow, St. Petersburg, Volgograd', N'Russian Summer Time', 1, 14400, N'UTC +04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (64, N'Mauritius Standard Time', N'Mauritius Standard Time', N'(UTC + 04: 00) Port Louis', N'Mauritius Summer Time', 1, 14400, N'UTC +04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (65, N'Georgian Standard Time', N'Georgian Standard Time', N'(UTC + 04: 00) Tbilisi', N'Georgian Summer Time', 0, 14400, N'UTC +04:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (66, N'Afghanistan Standard Time', N'Afghanistan Standard Time', N'(UTC + 04: 30) Kabul', N'Afghanistan Summer Time', 0, 16200, N'UTC +04:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (67, N'West Asia Standard Time', N'West Asia Standard Time', N'(UTC + 05: 00) Ashgabat, Tashkent', N'West Asia Summer Time', 0, 18000, N'UTC +05:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (68, N'Pakistan Standard Time', N'Pakistan Standard Time', N'(UTC + 05: 00) Islamabad, Karachi', N'Pakistan Summer Time', 1, 18000, N'UTC +05:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (69, N'India Standard Time', N'India Standard Time', N'(UTC + 05: 30) Chennai, Kolkata, Mumbai, New Delhi', N'India Summer Time', 0, 19800, N'UTC +05:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (70, N'Sri Lanka Standard Time', N'Sri Lanka Standard Time', N'(UTC + 05: 30) Sri Jayawardenepura', N'Sri Lanka Summer Time', 0, 19800, N'UTC +05:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (71, N'Nepal Standard Time', N'Nepal Standard Time', N'(UTC + 05: 45) Kathmandu', N'Nepal Summer Time', 0, 20700, N'UTC +05:45');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (72, N'Central Asia Standard Time', N'Central Asia Standard Time', N'(UTC + 06: 00) Astana', N'Central Asia Summer Time', 0, 21600, N'UTC +06:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (73, N'Bangladesh Standard Time', N'Bangladesh Standard Time', N'(UTC + 06: 00) Dakka', N'Bangladesh Summer Time', 1, 21600, N'UTC +06:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (74, N'Ekaterinburg Standard Time', N'Yekaterinburg Standard Time', N'(UTC + 06: 00) Yekaterinburg', N'Yekaterinburg Summer Time', 1, 21600, N'UTC +06:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (75, N'Myanmar Standard Time', N'Myanmar Standard Time', N'(UTC + 06: 30) Yangon (Yangon)', N'Myanmar Summer Time', 0, 23400, N'UTC +06:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (76, N'Se Asia Standard Time', N'SouthEast Asian Standard Time', N'(UTC + 07: 00) Bangkok, Hanoi, Jakarta', N'SouthEast Asian Summer Time', 0, 25200, N'UTC +07:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (77, N'N. Central Asia Standard Time', N'North Central Asia Standard Time', N'(UTC + 07: 00) Novosibirsk', N'North Central Asia Summer Time', 1, 25200, N'UTC +07:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (78, N'North Asia Standard Time', N'North Asia Standard Time', N'(UTC + 08: 00) Krasnoyarsk', N'North Asia Summer Time', 1, 28800, N'UTC +08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (79, N'Singapore Standard Time', N'Malay Peninsula Standard Time', N'(UTC + 08: 00) Kuala Lumpur, Singapore', N'Malay Peninsula Summer Time', 0, 28800, N'UTC +08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (80, N'China Standard Time', N'China Standard Time', N'(UTC + 08: 00) Beijing, Chongqing, Hong Kong (Sar), Urumchi', N'China Summer Time', 0, 28800, N'UTC +08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (81, N'W. Australia Standard Time', N'Western Australian Standard Time', N'(UTC + 08: 00) Perth', N'Western Australian Summer Time', 1, 28800, N'UTC +08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (82, N'Taipei Standard Time', N'Taipei Standard Time', N'(UTC + 08: 00) Taipei', N'Taipei Summer Time', 0, 28800, N'UTC +08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (83, N'Ulaanbaatar Standard Time', N'Ulan-bator Standard Time', N'(UTC + 08: 00) Ulan-bator', N'Ulan-bator Summer Time', 0, 28800, N'UTC +08:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (84, N'North Asia East Standard Time', N'East-north Asian Standard Time', N'(UTC + 09: 00) Irkutsk', N'East-north Asian Summer Time', 1, 32400, N'UTC +09:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (85, N'Tokyo Standard Time', N'Japanese Standard Time', N'(UTC + 09: 00) Osaka, Sapporo, Tokyo', N'Japanese Summer Time', 0, 32400, N'UTC +09:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (86, N'Korea Standard Time', N'Korean Standard Time', N'(UTC + 09: 00) Seoul', N'Korean Summer Time', 0, 32400, N'UTC +09:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (87, N'Cen. Australia Standard Time', N'Central Australian Standard Time', N'(UTC + 09: 30) Adelaide', N'Central Australian Summer Time', 1, 34200, N'UTC +09:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (88, N'Aus Central Standard Time', N'Central Australian Standard Time', N'(UTC + 09: 30) Darwin', N'Central Australian Summer Time', 0, 34200, N'UTC +09:30');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (89, N'E. Australia Standard Time', N'Eastern Australian Standard Time', N'(UTC + 10: 00) Brisbane', N'Ostaustralische Sommertime', 0, 36000, N'UTC +10:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (90, N'Aus Eastern Standard Time', N'Eastern Australian Standard Time', N'(UTC + 10: 00) Canberra, Melbourne, Sydney', N'Ostaustralische Sommertime', 1, 36000, N'UTC +10:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (91, N'West Pacific Standard Time', N'Western Pacific Standard Time', N'(UTC + 10: 00) Guam, Port Moresby', N'Western Pacific Summer Time', 0, 36000, N'UTC +10:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (92, N'Tasmania Standard Time', N'Tasmania Standard Time', N'(UTC + 10: 00) Hobart', N'Tasmania Summer Time', 1, 36000, N'UTC +10:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (93, N'Yakutsk Standard Time', N'Yakutsk Standard Time', N'(UTC + 10: 00) Yakutsk', N'Yakutsk Summer Time', 1, 36000, N'UTC +10:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (94, N'Central Pacific Standard Time', N'Central Pacific Standard Time', N'(UTC + 11: 00) Solomon Islands, New Caledonia', N'Central Pacific Summer Time', 0, 39600, N'UTC +11:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (95, N'Vladivostok Standard Time', N'Vladivostok Standard Time', N'(UTC + 11: 00) Vladivostok', N'Vladivostok Summer Time', 1, 39600, N'UTC +11:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (96, N'New Zealand Standard Time', N'New Zealand Standard Time', N'(UTC + 12: 00) Auckland, Wellington', N'New Zealand Summer Time', 1, 43200, N'UTC +12:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (97, N'Fiji Standard Time', N'Fiji Standard Time', N'(UTC + 12: 00) Fiji', N'Fiji Summer Time', 1, 43200, N'UTC +12:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (98, N'UTC+12', N'UTC + 12', N'(UTC + 12: 00) Coordinated Worldtime + 12', N'UTC + 12', 0, 43200, N'UTC +12:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (99, N'Magadan Standard Time', N'Magadan Standard Time', N'(UTC + 12: 00) Magadan', N'Magadan Summer Time', 1, 43200, N'UTC +12:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (100, N'Kamchatka Standard Time', N'Kamchatka Standard Time', N'(UTC + 12: 00) Petropavlovsk-kamchatsky - Outdated', N'Kamchatka Summer Time', 1, 43200, N'UTC +12:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (101, N'Tonga Standard Time', N'Tonga Standard Time', N'(UTC + 13: 00) Nuku''alofa', N'Tonga Summer Time', 0, 46800, N'UTC +13:00');
INSERT [dbo].[Timezone] ([Id], [Identifier], [StandardName], [DisplayName], [DaylightName], [SupportsDaylightSavingTime], [BaseUtcOffsetSec], [UTC]) VALUES (102, N'Samoa Standard Time', N'Samoa Standard Time', N'(UTC + 13: 00) Samoa', N'Samoa Summer Time', 1, 46800, N'UTC +13:00');
GO

SET IDENTITY_INSERT [dbo].[Timezone] OFF

CREATE TABLE [dbo].[TimezoneAdjustmentRule](
	[Id] [int] NOT NULL,
	[TimezoneId] [int] NULL,
	[RuleNo] [int] NULL,
	[DateStart] [datetime2](7) NULL,
	[DateEnd] [datetime2](7) NULL,
	[DaylightTransitionStartIsFixedDateRule] [bit] NULL,
	[DaylightTransitionStartMonth] [int] NULL,
	[DaylightTransitionStartDay] [int] NULL,
	[DaylightTransitionStartWeek] [int] NULL,
	[DaylightTransitionStartDayOfWeek] [int] NULL,
	[DaylightTransitionStartTimeOfDay] [time](7) NULL,
	[DaylightTransitionEndIsFixedDateRule] [bit] NULL,
	[DaylightTransitionEndMonth] [int] NULL,
	[DaylightTransitionEndDay] [int] NULL,
	[DaylightTransitionEndWeek] [int] NULL,
	[DaylightTransitionEndDayOfWeek] [int] NULL,
	[DaylightTransitionEndTimeOfDay] [time](7) NULL,
	[DaylightDeltaSec] [int] NULL,
 CONSTRAINT [PK_TimezoneAdjustmentRule] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)
)
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_Timezone_Identifier] ON [dbo].[Timezone]
(
	[Identifier] ASC
)
GO

CREATE UNIQUE NONCLUSTERED INDEX [UX_TimezoneAdjustmentRule_TimezoneId_DateStart_DateEnd] ON [dbo].[TimezoneAdjustmentRule]
(
	[TimezoneId] ASC,
	[DateStart] ASC,
	[DateEnd] ASC
)
GO

ALTER TABLE [dbo].[TimezoneAdjustmentRule]  WITH CHECK ADD  CONSTRAINT [FK_TimezoneAdjustmentRule_Timezone] FOREIGN KEY([TimezoneId])
REFERENCES [dbo].[Timezone] ([Id])
GO

ALTER TABLE [dbo].[TimezoneAdjustmentRule] CHECK CONSTRAINT [FK_TimezoneAdjustmentRule_Timezone]
GO

INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (1, 4, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (2, 4, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (3, 5, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (4, 6, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (5, 6, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (6, 8, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (7, 9, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (8, 9, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (9, 10, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (10, 10, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (11, 11, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (12, 15, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (13, 15, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (14, 16, 1, N'2006-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (15, 16, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (16, 18, 1, N'0001-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 3, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (17, 18, 2, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 3, 1, 1, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (18, 18, 3, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 4, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (19, 18, 4, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 4, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (20, 18, 5, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 4, 1, 1, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (21, 18, 6, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (22, 18, 7, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (23, 18, 8, N'2015-01-01 00:00:00', N'2015-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (24, 18, 9, N'2016-01-01 00:00:00', N'2016-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (25, 18, 10, N'2017-01-01 00:00:00', N'2017-12-31 00:00:00', 0, 9, 1, 5, 6, N'23:59:59.999', 0, 3, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (26, 18, 11, N'2018-01-01 00:00:00', N'2018-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (27, 18, 12, N'2019-01-01 00:00:00', N'2019-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (28, 18, 13, N'2020-01-01 00:00:00', N'2020-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (29, 18, 14, N'2021-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 1, 6, N'23:59:59.999', 0, 3, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (30, 19, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (31, 19, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (32, 20, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 11, 1, 1, 0, N'00:00:00', 0, 2, 1, 2, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (33, 20, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 10, 1, 2, 0, N'00:00:00', 0, 2, 1, 5, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (34, 20, 3, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (35, 20, 4, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (36, 20, 5, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (37, 20, 6, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (38, 20, 7, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (39, 20, 8, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (40, 20, 9, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (41, 20, 10, N'2015-01-01 00:00:00', N'2015-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (42, 20, 11, N'2016-01-01 00:00:00', N'2016-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (43, 20, 12, N'2017-01-01 00:00:00', N'2017-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (44, 20, 13, N'2018-01-01 00:00:00', N'2018-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (45, 20, 14, N'2019-01-01 00:00:00', N'2019-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (46, 20, 15, N'2020-01-01 00:00:00', N'2020-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (47, 20, 16, N'2021-01-01 00:00:00', N'2021-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (48, 20, 17, N'2022-01-01 00:00:00', N'2022-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (49, 20, 18, N'2023-01-01 00:00:00', N'2023-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (50, 20, 19, N'2024-01-01 00:00:00', N'2024-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (51, 20, 20, N'2025-01-01 00:00:00', N'2025-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (52, 20, 21, N'2026-01-01 00:00:00', N'2026-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (53, 20, 22, N'2027-01-01 00:00:00', N'2027-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (54, 20, 23, N'2028-01-01 00:00:00', N'2028-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (55, 20, 24, N'2029-01-01 00:00:00', N'2029-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (56, 20, 25, N'2030-01-01 00:00:00', N'2030-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (57, 20, 26, N'2031-01-01 00:00:00', N'2031-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (58, 20, 27, N'2032-01-01 00:00:00', N'2032-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (59, 20, 28, N'2033-01-01 00:00:00', N'2033-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (60, 20, 29, N'2034-01-01 00:00:00', N'2034-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (61, 20, 30, N'2035-01-01 00:00:00', N'2035-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (62, 20, 31, N'2036-01-01 00:00:00', N'2036-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (63, 20, 32, N'2037-01-01 00:00:00', N'2037-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (64, 20, 33, N'2038-01-01 00:00:00', N'2038-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (65, 20, 34, N'2039-01-01 00:00:00', N'2039-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (66, 20, 35, N'2040-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (67, 22, 1, N'0001-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 3, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (68, 22, 2, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 3, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (69, 22, 3, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 3, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (70, 22, 4, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 4, 1, 1, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (71, 22, 5, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 8, 1, 3, 6, N'23:59:59.999', 0, 5, 1, 1, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (72, 22, 6, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 9, 1, 1, 6, N'23:59:59.999', 0, 4, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (73, 22, 7, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 9, 1, 1, 6, N'23:59:59.999', 0, 4, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (74, 22, 8, N'2014-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 3, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (75, 23, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'00:01:00', 0, 10, 1, 5, 0, N'00:01:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (76, 23, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 3, 1, 2, 0, N'00:01:00', 0, 11, 1, 1, 0, N'00:01:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (77, 23, 3, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 3, 1, 2, 0, N'00:01:00', 0, 11, 1, 1, 0, N'00:01:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (78, 23, 4, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 3, 1, 2, 0, N'00:01:00', 0, 11, 1, 1, 0, N'00:01:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (79, 23, 5, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 2, 0, N'00:01:00', 0, 11, 1, 1, 0, N'00:01:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (80, 23, 6, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 2, 0, N'00:01:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (81, 23, 7, N'2012-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 2, 0, N'02:00:00', 0, 11, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (82, 24, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 11, 1, 1, 0, N'00:00:00', 0, 2, 1, 2, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (83, 24, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 10, 1, 2, 0, N'00:00:00', 0, 2, 1, 5, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (84, 24, 3, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (85, 24, 4, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (86, 24, 5, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (87, 24, 6, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (88, 24, 7, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (89, 24, 8, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (90, 24, 9, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (91, 24, 10, N'2015-01-01 00:00:00', N'2015-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (92, 24, 11, N'2016-01-01 00:00:00', N'2016-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (93, 24, 12, N'2017-01-01 00:00:00', N'2017-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (94, 24, 13, N'2018-01-01 00:00:00', N'2018-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (95, 24, 14, N'2019-01-01 00:00:00', N'2019-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (96, 24, 15, N'2020-01-01 00:00:00', N'2020-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (97, 24, 16, N'2021-01-01 00:00:00', N'2021-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (98, 24, 17, N'2022-01-01 00:00:00', N'2022-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (99, 24, 18, N'2023-01-01 00:00:00', N'2023-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (100, 24, 19, N'2024-01-01 00:00:00', N'2024-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (101, 24, 20, N'2025-01-01 00:00:00', N'2025-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (102, 24, 21, N'2026-01-01 00:00:00', N'2026-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (103, 24, 22, N'2027-01-01 00:00:00', N'2027-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (104, 24, 23, N'2028-01-01 00:00:00', N'2028-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (105, 24, 24, N'2029-01-01 00:00:00', N'2029-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (106, 24, 25, N'2030-01-01 00:00:00', N'2030-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (107, 24, 26, N'2031-01-01 00:00:00', N'2031-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (108, 24, 27, N'2032-01-01 00:00:00', N'2032-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (109, 24, 28, N'2033-01-01 00:00:00', N'2033-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (110, 24, 29, N'2034-01-01 00:00:00', N'2034-12-31 00:00:00', 0, 10, 1, 2, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (111, 24, 30, N'2035-01-01 00:00:00', N'2035-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (112, 24, 31, N'2036-01-01 00:00:00', N'2036-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (113, 24, 32, N'2037-01-01 00:00:00', N'2037-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (114, 24, 33, N'2038-01-01 00:00:00', N'2038-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (115, 24, 34, N'2039-01-01 00:00:00', N'2039-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (116, 24, 35, N'2040-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 2, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (117, 25, 1, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 12, 1, 5, 0, N'00:00:00', 0, 1, 1, 1, 1, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (118, 25, 2, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 3, 1, 3, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (119, 25, 3, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 1, 1, 1, 4, N'00:00:00', 0, 3, 1, 2, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (120, 27, 1, N'0001-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (121, 27, 2, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 4, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (122, 27, 3, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (123, 27, 4, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (124, 27, 5, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 3, 1, 4, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (125, 27, 6, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (126, 27, 7, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (127, 27, 8, N'2015-01-01 00:00:00', N'2015-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 4, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (128, 27, 9, N'2016-01-01 00:00:00', N'2016-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (129, 27, 10, N'2017-01-01 00:00:00', N'2017-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (130, 27, 11, N'2018-01-01 00:00:00', N'2018-12-31 00:00:00', 0, 3, 1, 4, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (131, 27, 12, N'2019-01-01 00:00:00', N'2019-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (132, 27, 13, N'2020-01-01 00:00:00', N'2020-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 4, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (133, 27, 14, N'2021-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 6, N'22:00:00', 0, 10, 1, 5, 6, N'23:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (134, 28, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 9, 1, 2, 0, N'02:00:00', 0, 3, 1, 2, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (135, 28, 2, N'2007-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 1, 0, N'02:00:00', 0, 3, 1, 2, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (136, 29, 1, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 10, 1, 3, 6, N'23:59:59.999', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (137, 29, 2, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 1, 1, 1, 0, N'00:00:00', 0, 2, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (138, 31, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 9, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (139, 32, 1, N'0001-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (140, 32, 2, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (141, 32, 3, N'2013-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'00:00:00', 0, 10, 1, 5, 0, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (142, 34, 1, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 5, 1, 5, 6, N'23:59:59.999', 0, 8, 1, 5, 0, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (143, 34, 2, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 5, 1, 5, 0, N'23:59:59.999', 0, 8, 1, 3, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (144, 34, 3, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 5, 1, 1, 6, N'23:59:59.999', 0, 8, 1, 1, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (145, 34, 4, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 4, 1, 1, 6, N'23:59:59.999', 0, 7, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (146, 34, 5, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 4, 1, 5, 0, N'02:00:00', 0, 9, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (147, 34, 6, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 4, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (148, 34, 7, N'2014-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 6, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (149, 35, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'01:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (150, 38, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (151, 39, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (152, 40, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (153, 41, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (154, 43, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 4, 1, 1, 0, N'02:00:00', 0, 9, 1, 1, 0, N'02:00:00', -3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (155, 43, 2, N'2011-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 9, 1, 1, 0, N'02:00:00', 0, 4, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (156, 44, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 3, 1, 5, 4, N'00:00:00', 0, 9, 1, 5, 5, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (157, 44, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 5, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (158, 44, 3, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 5, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (159, 44, 4, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 5, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (160, 44, 5, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 5, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (161, 44, 6, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 5, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (162, 44, 7, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 1, 1, 1, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (163, 44, 8, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 1, 1, 1, 2, N'00:00:00', 0, 12, 1, 3, 5, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (164, 44, 9, N'2014-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 5, N'01:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (165, 45, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'03:00:00', 0, 10, 1, 5, 0, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (166, 46, 1, N'0001-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 3, 1, 5, 0, N'00:00:00', 0, 10, 1, 5, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (167, 46, 2, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (168, 46, 3, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (169, 46, 4, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 3, 1, 4, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (170, 46, 5, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (171, 46, 6, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (172, 46, 7, N'2015-01-01 00:00:00', N'2015-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (173, 46, 8, N'2016-01-01 00:00:00', N'2016-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (174, 46, 9, N'2017-01-01 00:00:00', N'2017-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (175, 46, 10, N'2018-01-01 00:00:00', N'2018-12-31 00:00:00', 0, 3, 1, 4, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (176, 46, 11, N'2019-01-01 00:00:00', N'2019-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (177, 46, 12, N'2020-01-01 00:00:00', N'2020-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 4, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (178, 46, 13, N'2021-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (179, 47, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 3, 1, 5, 5, N'23:59:59.999', 0, 9, 1, 3, 3, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (180, 47, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 11, 1, 1, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (181, 47, 3, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 4, 1, 1, 4, N'23:59:59.999', 0, 10, 1, 5, 5, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (182, 47, 4, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (183, 47, 5, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 4, 1, 1, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (184, 47, 6, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (185, 47, 7, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 4, 1, 1, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (186, 47, 8, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 4, 1, 1, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (187, 47, 9, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 4, 1, 1, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (188, 47, 10, N'2015-01-01 00:00:00', N'2015-12-31 00:00:00', 0, 4, 1, 1, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (189, 47, 11, N'2016-01-01 00:00:00', N'2016-12-31 00:00:00', 0, 3, 1, 5, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (190, 47, 12, N'2017-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 4, 1, 1, 4, N'23:59:59.999', 0, 10, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (191, 49, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'03:00:00', 0, 10, 1, 5, 0, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (192, 50, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'03:00:00', 0, 10, 1, 5, 0, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (193, 50, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 1, N'03:00:00', 0, 10, 1, 5, 0, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (194, 50, 3, N'2012-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'03:00:00', 0, 10, 1, 5, 0, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (195, 51, 1, N'2005-01-01 00:00:00', N'2005-12-31 00:00:00', 0, 4, 1, 1, 5, N'02:00:00', 0, 10, 1, 2, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (196, 51, 2, N'2006-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (197, 51, 3, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 9, 1, 3, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (198, 51, 4, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (199, 51, 5, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 9, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (200, 51, 6, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 9, 1, 2, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (201, 51, 7, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 4, 1, 1, 5, N'02:00:00', 0, 10, 1, 1, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (202, 51, 8, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 9, 1, 4, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (203, 51, 9, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (204, 51, 10, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (205, 51, 11, N'2015-01-01 00:00:00', N'2015-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (206, 51, 12, N'2016-01-01 00:00:00', N'2016-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (207, 51, 13, N'2017-01-01 00:00:00', N'2017-12-31 00:00:00', 0, 3, 1, 4, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (208, 51, 14, N'2018-01-01 00:00:00', N'2018-12-31 00:00:00', 0, 3, 1, 4, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (209, 51, 15, N'2019-01-01 00:00:00', N'2019-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (210, 51, 16, N'2020-01-01 00:00:00', N'2020-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (211, 51, 17, N'2021-01-01 00:00:00', N'2021-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (212, 51, 18, N'2022-01-01 00:00:00', N'2022-12-31 00:00:00', 0, 3, 1, 5, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (213, 51, 19, N'2023-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 4, 5, N'02:00:00', 0, 10, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (214, 52, 1, N'0001-01-01 00:00:00', N'2005-12-31 00:00:00', 0, 4, 1, 5, 5, N'00:00:00', 0, 9, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (215, 52, 2, N'2006-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 5, 5, N'00:00:00', 0, 9, 1, 3, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (216, 52, 3, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 4, 1, 5, 4, N'23:59:59.999', 0, 9, 1, 1, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (217, 52, 4, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 4, 1, 5, 4, N'23:59:59.999', 0, 8, 1, 5, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (218, 52, 5, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 4, 1, 4, 4, N'23:59:59.999', 0, 8, 1, 3, 4, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (219, 52, 6, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 4, 1, 5, 5, N'00:00:00', 0, 8, 1, 2, 3, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (220, 53, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (221, 54, 1, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 1, 1, 1, 0, N'00:00:00', 0, 11, 1, 2, 6, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (222, 54, 2, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 3, 1, 5, 5, N'01:00:00', 0, 1, 1, 1, 2, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (223, 55, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 4, 1, 1, 0, N'03:00:00', 0, 10, 1, 1, 0, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (224, 55, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 4, 1, 1, 0, N'03:00:00', 0, 10, 1, 1, 1, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (225, 56, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (226, 56, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (227, 59, 1, N'0001-01-01 00:00:00', N'2005-12-31 00:00:00', 0, 3, 1, 1, 0, N'02:00:00', 0, 9, 1, 4, 2, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (228, 59, 2, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 3, 1, 3, 4, N'23:59:59.999', 0, 9, 1, 3, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (229, 59, 3, N'2009-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 3, 6, N'23:59:59.999', 0, 9, 1, 3, 1, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (230, 61, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'04:00:00', 0, 10, 1, 5, 0, N'05:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (231, 62, 1, N'0001-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (232, 63, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (233, 63, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (234, 64, 1, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 10, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 2, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (235, 64, 2, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 1, 1, 1, 4, N'00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (236, 68, 1, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 5, 1, 5, 6, N'23:59:59.999', 0, 10, 1, 5, 5, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (237, 68, 2, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 4, 1, 2, 2, N'23:59:59.999', 0, 10, 1, 5, 6, N'23:59:59.999', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (238, 73, 1, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 6, 1, 3, 5, N'23:00:00', 0, 12, 1, 5, 4, N'23:59:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (239, 74, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (240, 74, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (241, 77, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (242, 77, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (243, 78, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (244, 78, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (245, 81, 1, N'2006-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 12, 1, 1, 0, N'02:00:00', 0, 1, 1, 1, 0, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (246, 81, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 10, 1, 5, 0, N'02:00:00', 0, 3, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (247, 81, 3, N'2008-01-01 00:00:00', N'2008-12-31 00:00:00', 0, 10, 1, 5, 0, N'02:00:00', 0, 3, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (248, 81, 4, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 1, 1, 1, 4, N'00:00:00', 0, 3, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (249, 84, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (250, 84, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (251, 87, 1, N'0001-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 10, 1, 5, 0, N'02:00:00', 0, 3, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (252, 87, 2, N'2008-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 1, 0, N'02:00:00', 0, 4, 1, 1, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (253, 90, 1, N'0001-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 10, 1, 5, 0, N'02:00:00', 0, 3, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (254, 90, 2, N'2008-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 1, 0, N'02:00:00', 0, 4, 1, 1, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (255, 92, 1, N'0001-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 10, 1, 1, 0, N'02:00:00', 0, 3, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (256, 92, 2, N'2008-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 1, 0, N'02:00:00', 0, 4, 1, 1, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (257, 93, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (258, 93, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (259, 95, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (260, 95, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (261, 96, 1, N'0001-01-01 00:00:00', N'2006-12-31 00:00:00', 0, 10, 1, 1, 0, N'02:00:00', 0, 3, 1, 3, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (262, 96, 2, N'2007-01-01 00:00:00', N'2007-12-31 00:00:00', 0, 9, 1, 5, 0, N'02:00:00', 0, 3, 1, 3, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (263, 96, 3, N'2008-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 9, 1, 5, 0, N'02:00:00', 0, 4, 1, 1, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (264, 97, 1, N'2009-01-01 00:00:00', N'2009-12-31 00:00:00', 0, 11, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 4, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (265, 97, 2, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 10, 1, 4, 0, N'02:00:00', 0, 3, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (266, 97, 3, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 10, 1, 4, 0, N'02:00:00', 0, 3, 1, 1, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (267, 97, 4, N'2012-01-01 00:00:00', N'2012-12-31 00:00:00', 0, 10, 1, 3, 0, N'02:00:00', 0, 1, 1, 4, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (268, 97, 5, N'2013-01-01 00:00:00', N'2013-12-31 00:00:00', 0, 10, 1, 4, 0, N'02:00:00', 0, 1, 1, 3, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (269, 97, 6, N'2014-01-01 00:00:00', N'2014-12-31 00:00:00', 0, 10, 1, 4, 0, N'02:00:00', 0, 1, 1, 3, 0, N'02:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (270, 97, 7, N'2015-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 10, 1, 4, 0, N'02:00:00', 0, 1, 1, 4, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (271, 99, 1, N'0001-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (272, 99, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 1, 1, 1, 6, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (273, 100, 1, N'0001-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 3, 1, 5, 0, N'02:00:00', 0, 10, 1, 5, 0, N'03:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (274, 102, 1, N'2010-01-01 00:00:00', N'2010-12-31 00:00:00', 0, 9, 1, 5, 6, N'23:59:59.999', 0, 1, 1, 1, 5, N'00:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (275, 102, 2, N'2011-01-01 00:00:00', N'2011-12-31 00:00:00', 0, 9, 1, 4, 6, N'03:00:00', 0, 4, 1, 1, 6, N'04:00:00', 3600)
INSERT INTO [dbo].[TimezoneAdjustmentRule] ([Id], [TimezoneId], [RuleNo], [DateStart], [DateEnd], [DaylightTransitionStartIsFixedDateRule], [DaylightTransitionStartMonth], [DaylightTransitionStartDay], [DaylightTransitionStartWeek], [DaylightTransitionStartDayOfWeek], [DaylightTransitionStartTimeOfDay], [DaylightTransitionEndIsFixedDateRule], [DaylightTransitionEndMonth], [DaylightTransitionEndDay], [DaylightTransitionEndWeek], [DaylightTransitionEndDayOfWeek], [DaylightTransitionEndTimeOfDay], [DaylightDeltaSec]) VALUES (276, 102, 3, N'2012-01-01 00:00:00', N'9999-12-31 00:00:00', 0, 9, 1, 5, 0, N'00:00:00', 0, 4, 1, 1, 0, N'01:00:00', 3600)
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Converts the given date to UTC applying the given timezone

Parameters:
    
    @OriginalTimezoneId INT: The unique ID of your original timezone (supported timezone IDs see table "DateTimeUtil.Timezone" column "Id")
    @TargetTimezoneId INT: The unique ID of your target timezone (supported timezone IDs see table "DateTimeUtil.Timezone" column "Id")
    @LocalDate DATETIME2: The datetime value in your original timezone which you want to convert to the corresponding datetime value in your target timezone

Return value:
    
    @Result DATETIME2: The converted datetime value in your target timezone

Remarks:


Samples:

    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneId] (38, 46, GETDATE())
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneId] (38, 46, '2014-03-30 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneId] (38, 46, '2014-03-30 03:05:00')
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneId] (38, 46, '2014-10-26 02:05:00')
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneId] (38, 46, '2014-10-26 03:05:00')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_ConvertLocalToLocalByTimezoneId]
(
    @OriginalTimezoneId INT
    ,@TargetTimezoneId INT
    ,@LocalDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (
        @TargetTimezoneId
        ,[dbo].[UDF_ConvertLocalToUtcByTimezoneId] (
            @OriginalTimezoneId
            ,@LocalDate
        )
    );

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Converts the given date to UTC applying the given timezone

Parameters:
    
    @OriginalTimezoneIdentifier NVARCHAR(100): The unique identifier of your original timezone (supported timezone identifiers see table "DateTimeUtil.Timezone" column "Identifier")
    @TargetTimezoneIdentifier NVARCHAR(100): The unique identifier of your target timezone (supported timezone identifiers see table "DateTimeUtil.Timezone" column "Identifier")
    @LocalDate DATETIME2: The datetime value in your original timezone which you want to convert to the corresponding datetime value in your target timezone

Return value:
    
    @Result DATETIME2: The converted datetime value in your target timezone

Remarks:


Samples:

    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneIdentifier] ('W. Europe Standard Time', 'Middle East Standard Time', GETDATE())
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneIdentifier] ('W. Europe Standard Time', 'Middle East Standard Time', '2014-03-30 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneIdentifier] ('W. Europe Standard Time', 'Middle East Standard Time', '2014-03-30 03:05:00')
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneIdentifier] ('W. Europe Standard Time', 'Middle East Standard Time', '2014-10-26 02:05:00')
    SELECT [dbo].[UDF_ConvertLocalToLocalByTimezoneIdentifier] ('W. Europe Standard Time', 'Middle East Standard Time', '2014-10-26 03:05:00')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_ConvertLocalToLocalByTimezoneIdentifier]
(
    @OriginalTimezoneIdentifier NVARCHAR(100)
    ,@TargetTimezoneIdentifier NVARCHAR(100)
    ,@LocalDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] (
        @TargetTimezoneIdentifier
        ,[dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] (
            @OriginalTimezoneIdentifier
            ,@LocalDate
        )
    );

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Converts the given date to UTC applying the given timezone

Parameters:
    
    @OriginalTimezoneId INT: The unique ID of your original timezone (supported timezone IDs see table "DateTimeUtil.Timezone" column "Id")
    @LocalDate DATETIME2: The original local datetime value which you want to convert to UTC datetime

Return value:
    
    @Result DATETIME2: The converted datetime value in UTC datetime

Remarks:


Samples:

    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (38, GETDATE())

    -- northern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (38, '2014-03-30 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (38, '2014-03-30 03:05:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (38, '2014-10-26 02:05:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (38, '2014-10-26 03:05:00')

    -- southern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (43, '2014-04-06 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (43, '2014-04-06 02:05:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (43, '2014-09-07 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneId] (43, '2014-09-07 03:05:00')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_ConvertLocalToUtcByTimezoneId]
(
    @OriginalTimezoneId INT
    ,@LocalDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = 
        DATEADD(SECOND, -([tz].[BaseUtcOffsetSec] + COALESCE([ar].[DaylightDeltaSec], 0)), @LocalDate)
    FROM
        [dbo].[Timezone] AS [tz] WITH (READUNCOMMITTED)
        LEFT JOIN [dbo].[TimezoneAdjustmentRule] AS [ar] WITH (READUNCOMMITTED)
            ON 1 = 1
            AND [ar].[TimezoneId] = [tz].[Id]
            AND @LocalDate BETWEEN [ar].[DateStart] AND [ar].[DateEnd]
            AND ( 1 = 0
                OR ( 1 = 1
                    -- southern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] > [ar].[DaylightTransitionEndMonth]
                    AND NOT @LocalDate
                        BETWEEN
                            CASE
                                WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    END
                            END
                        AND
                            CASE
                                WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    END
                            END                
                ) OR
                ( 1 = 1
                    -- northern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] <= [ar].[DaylightTransitionEndMonth]
                    AND @LocalDate
                        BETWEEN
                            CASE
                                WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    END
                            END
                        AND
                            CASE
                                WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    END
                            END
                )                          
            )
    WHERE 1 = 1
        AND [tz].[Id] = @OriginalTimezoneId
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Converts the given date to UTC applying the given timezone

Parameters:
    
    @OriginalTimezoneIdentifier NVARCHAR(100): The unique identifier of your original timezone (supported timezone identifiers see table "DateTimeUtil.Timezone" column "Identifier")
    @LocalDate DATETIME2: The original local datetime value which you want to convert to UTC datetime

Return value:
    
    @Result DATETIME2: The converted datetime value in UTC datetime

Remarks:


Samples:

    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('W. Europe Standard Time', GETDATE())
    
    -- northern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('W. Europe Standard Time', '2014-03-30 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('W. Europe Standard Time', '2014-03-30 03:05:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('W. Europe Standard Time', '2014-10-26 02:05:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('W. Europe Standard Time', '2014-10-26 03:05:00')

    -- southern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('Namibia Standard Time', '2014-04-06 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('Namibia Standard Time', '2014-04-06 02:05:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('Namibia Standard Time', '2014-09-07 01:55:00')
    SELECT [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier] ('Namibia Standard Time', '2014-09-07 03:05:00')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_ConvertLocalToUtcByTimezoneIdentifier]
(
    @OriginalTimezoneIdentifier NVARCHAR(100)
    ,@LocalDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = 
        DATEADD(SECOND, -([tz].[BaseUtcOffsetSec] + COALESCE([ar].[DaylightDeltaSec], 0)), @LocalDate)
    FROM
        [dbo].[Timezone] AS [tz] WITH (READUNCOMMITTED)
        LEFT JOIN [dbo].[TimezoneAdjustmentRule] AS [ar] WITH (READUNCOMMITTED)
            ON 1 = 1
            AND [ar].[TimezoneId] = [tz].[Id]
            AND @LocalDate BETWEEN [ar].[DateStart] AND [ar].[DateEnd]
            AND ( 1 = 0
                OR ( 1 = 1
                    -- southern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] > [ar].[DaylightTransitionEndMonth]
                    AND NOT @LocalDate
                        BETWEEN
                            CASE
                                WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    END
                            END
                        AND
                            CASE
                                WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    END
                            END                
                ) OR
                ( 1 = 1
                    -- northern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] <= [ar].[DaylightTransitionEndMonth]
                    AND @LocalDate
                        BETWEEN
                            CASE
                                WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    END
                            END
                        AND
                            CASE
                                WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@LocalDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    END
                            END
                )                          
            )
    WHERE 1 = 1
        AND [tz].[Identifier] = @OriginalTimezoneIdentifier
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Converts the given UTC date to the given timezone

Parameters:
    
    @TargetTimezoneId INT: The unique ID of your target timezone (supported timezone IDs see table "DateTimeUtil.Timezone" column "Id")
    @UtcDate DATETIME2: The original UTC datetime value which you want to convert to local datetime

Return value:
    
    @Result DATETIME2: The converted datetime value in local datetime

Remarks:


Samples:

    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (38, GETUTCDATE())

    -- northern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (38, '2014-03-30 00:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (38, '2014-03-30 01:05:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (38, '2014-10-26 00:05:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (38, '2014-10-26 01:05:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (38, '2014-10-26 02:05:00')

    -- southern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (43, '2014-04-05 23:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (43, '2014-04-06 00:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (43, '2014-04-06 01:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (43, '2014-09-07 00:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneId] (43, '2014-09-07 01:05:00')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_ConvertUtcToLocalByTimezoneId]
(
    @TargetTimezoneId INT
    ,@UtcDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = 
        DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + COALESCE([ar].[DaylightDeltaSec], 0), @UtcDate)
    FROM
        [dbo].[Timezone] AS [tz] WITH (READUNCOMMITTED)
        LEFT JOIN [dbo].[TimezoneAdjustmentRule] AS [ar] WITH (READUNCOMMITTED)
            ON 1 = 1
            AND [ar].[TimezoneId] = [tz].[Id]
            AND CONVERT(DATE,
                    CASE
                        -- southern hemisphere
                        WHEN [ar].[DaylightTransitionStartMonth] > [ar].[DaylightTransitionEndMonth] THEN DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + [ar].[DaylightDeltaSec], @UtcDate)
                        -- northern hemisphere
                        ELSE DATEADD(SECOND, [tz].[BaseUtcOffsetSec], @UtcDate)
                    END
                ) BETWEEN [ar].[DateStart] AND [ar].[DateEnd]
            AND ( 1 = 0
                OR ( 1 = 1
                    -- southern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] > [ar].[DaylightTransitionEndMonth]
                    AND NOT ( 1 = 1
                        AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + [ar].[DaylightDeltaSec], @UtcDate) >=
                            CASE
                                WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    END
                            END
                        AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec], @UtcDate) <=
                            CASE
                                WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    END
                            END
                    )                          
                ) OR
                ( 1 = 1
                    -- northern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] <= [ar].[DaylightTransitionEndMonth]
                    AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec], @UtcDate) >=
                        CASE
                            WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                            ELSE 
                                CASE
                                    WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                END
                        END
                    AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + [ar].[DaylightDeltaSec], @UtcDate) <=
                        CASE
                            WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                            ELSE 
                                CASE
                                    WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                END
                        END
                )              
            )
    WHERE 1 = 1
        AND [tz].[Id] = @TargetTimezoneId
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Converts the given UTC date to the given timezone

Parameters:
    
    @TargetTimezoneIdentifier NVARCHAR(100): The unique identifier of your target timezone (supported timezone identifiers see table "DateTimeUtil.Timezone" column "Identifier")
    @UtcDate DATETIME2: The original UTC datetime value which you want to convert to local datetime

Return value:
    
    @Result DATETIME2: The converted datetime value in local datetime

Remarks:


Samples:

    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('W. Europe Standard Time', GETUTCDATE())

    -- northern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('W. Europe Standard Time', '2014-03-30 00:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('W. Europe Standard Time', '2014-03-30 01:05:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('W. Europe Standard Time', '2014-10-26 00:05:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('W. Europe Standard Time', '2014-10-26 01:05:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('W. Europe Standard Time', '2014-10-26 02:05:00')

    -- southern hemisphere (+3600)
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('Namibia Standard Time', '2014-04-05 23:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('Namibia Standard Time', '2014-04-06 00:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('Namibia Standard Time', '2014-04-06 01:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('Namibia Standard Time', '2014-09-07 00:55:00')
    SELECT [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier] ('Namibia Standard Time', '2014-09-07 01:05:00')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_ConvertUtcToLocalByTimezoneIdentifier]
(
    @TargetTimezoneIdentifier NVARCHAR(100)
    ,@UtcDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;

    SELECT @Result = 
        DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + COALESCE([ar].[DaylightDeltaSec], 0), @UtcDate)
    FROM
        [dbo].[Timezone] AS [tz] WITH (READUNCOMMITTED)
        LEFT JOIN [dbo].[TimezoneAdjustmentRule] AS [ar] WITH (READUNCOMMITTED)
            ON 1 = 1
            AND [ar].[TimezoneId] = [tz].[Id]
            AND CONVERT(DATE,
                    CASE
                        -- southern hemisphere
                        WHEN [ar].[DaylightTransitionStartMonth] > [ar].[DaylightTransitionEndMonth] THEN DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + [ar].[DaylightDeltaSec], @UtcDate)
                        -- northern hemisphere
                        ELSE DATEADD(SECOND, [tz].[BaseUtcOffsetSec], @UtcDate)
                    END
                ) BETWEEN [ar].[DateStart] AND [ar].[DateEnd]
            AND ( 1 = 0
                OR ( 1 = 1
                    -- southern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] > [ar].[DaylightTransitionEndMonth]
                    AND NOT ( 1 = 1
                        AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + [ar].[DaylightDeltaSec], @UtcDate) >=
                            CASE
                                WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    END
                            END
                        AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec], @UtcDate) <=
                            CASE
                                WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                ELSE 
                                    CASE
                                        WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                        ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    END
                            END
                    )                          
                ) OR
                ( 1 = 1
                    -- northern hemisphere
                    AND [ar].[DaylightTransitionStartMonth] <= [ar].[DaylightTransitionEndMonth]
                    AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec], @UtcDate) >=
                        CASE
                            WHEN [ar].[DaylightTransitionStartIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                            ELSE 
                                CASE
                                    WHEN [ar].[DaylightTransitionStartWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                    ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionStartWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionStartDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionStartTimeOfDay]), 121)
                                END
                        END
                    AND DATEADD(SECOND, [tz].[BaseUtcOffsetSec] + [ar].[DaylightDeltaSec], @UtcDate) <=
                        CASE
                            WHEN [ar].[DaylightTransitionEndIsFixedDateRule] = 1 THEN CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2) + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                            ELSE 
                                CASE
                                    WHEN [ar].[DaylightTransitionEndWeek] = 5 THEN CONVERT(DATETIME2, CONVERT(NVARCHAR, [dbo].[UDF_GetLastWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                    ELSE CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, DATEADD(DAY, ([ar].[DaylightTransitionEndWeek] - 1) * 7, [dbo].[UDF_GetFirstWeekdayInMonth] ([ar].[DaylightTransitionEndDayOfWeek], CONVERT(DATETIME2, RIGHT('0000' + CONVERT(NVARCHAR, YEAR(@UtcDate)), 4) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndMonth]), 2) + '-' + RIGHT('00' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndDay]), 2), 121)))), 121)  + ' ' + CONVERT(NVARCHAR, [ar].[DaylightTransitionEndTimeOfDay]), 121)
                                END
                        END
                )              
            )
    WHERE 1 = 1
        AND [tz].[Identifier] = @TargetTimezoneIdentifier
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the end of day for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The end of the day for the given @ReferenceDate (time value is set to 23:59:59.9999999)

Remarks:

Samples:

    SELECT [dbo].[UDF_GetEndOfDay] (GETDATE())
    SELECT [dbo].[UDF_GetEndOfDay] ('2014-05-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetEndOfDay]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SELECT @Result =
        CONVERT(DATETIME2, CONVERT(NVARCHAR, CONVERT(DATE, @ReferenceDate), 121) + ' 23:59:59.9999999')
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the end of month for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The end of the month for the given @ReferenceDate

Remarks:

Samples:

    SELECT [dbo].[UDF_GetEndOfMonth] (GETDATE())
    SELECT [dbo].[UDF_GetEndOfMonth] ('2014-02-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetEndOfMonth]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SELECT @Result =
        [dbo].[UDF_GetEndOfDay] (DATEADD(MONTH, DATEDIFF(MONTH, -1, @ReferenceDate), -1))
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the end of quarter for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The end of the quarter for the given @ReferenceDate

Remarks:

Samples:

    SELECT [dbo].[UDF_GetEndOfQuarter] (GETDATE())
    SELECT [dbo].[UDF_GetEndOfQuarter] ('2014-02-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetEndOfQuarter]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SELECT @Result =
        [dbo].[UDF_GetEndOfDay] (DATEADD(QUARTER, DATEDIFF(QUARTER, -1, @ReferenceDate), -1))
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the end of week for a given reference date based on your @@DATEFIRST setting

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The end of the week for the given @ReferenceDate based on your @@DATEFIRST setting

Remarks:

Samples:

    SET DATEFIRST 7 -- Sunday
    SET DATEFIRST 1 -- Monday

    SELECT [dbo].[UDF_GetEndOfWeek] (GETDATE())
    SELECT [dbo].[UDF_GetEndOfWeek] ('2014-02-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetEndOfWeek]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
        ,@DayOfWeek INT = @@DATEFIRST
    ;  

    DECLARE
        @FirstOfWeekday DATETIME2 = DATEADD(DAY, @DayOfWeek - 1, 0)
    ;

    SELECT @Result =
        [dbo].[UDF_GetEndOfDay](DATEADD(DAY, 6, [dbo].[UDF_GetStartOfWeek](@ReferenceDate)))
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the end of year for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The end of the year for the given @ReferenceDate

Remarks:

Samples:

    SELECT [dbo].[UDF_GetEndOfYear] (GETDATE())
    SELECT [dbo].[UDF_GetEndOfYear] ('2013-02-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetEndOfYear]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SELECT @Result =
        [dbo].[UDF_GetEndOfDay] (DATEADD(YEAR, DATEDIFF(YEAR, -1, @ReferenceDate), -1))
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Returns the first occurence of a given weekday in a month

Parameters:
    
    @DayOfWeek INT: The day of week you search for; see remarks for supported values
    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:
    
    @Result DATETIME2: The first occurence of a given weekday in a month

Remarks:

    Supported values for parameter @DayOfWeek
        1 = Monday
        2 = Tuesday
        3 = Wednesday
        4 = Thursday
        5 = Friday
        6 = Saturday
        0 or 7 = Sunday

Samples:

    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (0, GETDATE())
    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (1, GETDATE())
    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (2, GETDATE())
    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (3, GETDATE())
    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (4, GETDATE())
    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (5, GETDATE())
    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (6, GETDATE())
    SELECT [dbo].[UDF_GetFirstWeekdayInMonth] (7, GETDATE())

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetFirstWeekdayInMonth]
(
    @DayOfWeek INT
    ,@ReferenceDate DATETIME2
)
RETURNS DATE
AS
BEGIN
	DECLARE
        @Result DATE = NULL
    ;  

    SELECT @Result =
        DATEADD(
            DAY
            ,7
            ,[dbo].[UDF_GetLastWeekdayInMonth] (@DayOfWeek, DATEADD(MONTH, -1, @ReferenceDate))
        )
    ;

	RETURN @Result;

END
GO


/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-04-26
Description:    Returns the last occurence of a given weekday in a month

Parameters:
    
    @DayOfWeek INT: The day of week you search for; see remarks for supported values
    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:
    
    @Result DATETIME2: The last occurence of a given weekday in a month

Remarks:

    Supported values for parameter @DayOfWeek
        1 = Monday
        2 = Tuesday
        3 = Wednesday
        4 = Thursday
        5 = Friday
        6 = Saturday
        0 or 7 = Sunday

Samples:

    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (0, GETDATE())
    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (1, GETDATE())
    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (2, GETDATE())
    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (3, GETDATE())
    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (4, GETDATE())
    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (5, GETDATE())
    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (6, GETDATE())
    SELECT [dbo].[UDF_GetLastWeekdayInMonth] (7, GETDATE())

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetLastWeekdayInMonth]
(
    @DayOfWeek INT
    ,@ReferenceDate DATETIME2
)
RETURNS DATE
AS
BEGIN
	DECLARE
        @Result DATE = NULL
    ;

    -- support of .NET values
    IF @DayOfWeek = 0 BEGIN
        SET @DayOfWeek = 7;
    END;  

    DECLARE
        @FirstOfWeekday DATETIME2 = DATEADD(DAY, @DayOfWeek - 1, 0)
    ;  

    SELECT @Result =
        DATEADD(
            DAY
            ,DATEDIFF(
                DAY
                ,@FirstOfWeekday
                ,DATEADD(
                    MONTH
                    ,DATEDIFF(
                        MONTH
                        ,0
                        ,@ReferenceDate
                    )
                    ,DATEADD(
                        DAY
                        ,-1
                        ,DATEADD(
                            MONTH
                            ,1
                            ,0
                        )
                    )
                )
            ) / 7 * 7
            ,@FirstOfWeekday
        )
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the start of day for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The start of the day for the given @ReferenceDate (time value is set to 00:00:00)

Remarks:

Samples:

    SELECT [dbo].[UDF_GetStartOfDay] (GETDATE())
    SELECT [dbo].[UDF_GetStartOfDay] ('2014-05-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetStartOfDay]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SELECT @Result =
        CONVERT(DATETIME2, CONVERT(DATE, @ReferenceDate))
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the start of month for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The start of the month for the given @ReferenceDate

Remarks:

Samples:

    SELECT [dbo].[UDF_GetStartOfMonth] (GETDATE())
    SELECT [dbo].[UDF_GetStartOfMonth] ('2014-02-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetStartOfMonth]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SET @ReferenceDate = CONVERT(DATE, @ReferenceDate);

    SELECT @Result =
        DATEADD(MONTH, DATEDIFF(MONTH, 0, @ReferenceDate), 0)
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the start of quarter for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The start of the quarter for the given @ReferenceDate

Remarks:

Samples:

    SELECT [dbo].[UDF_GetStartOfQuarter] (GETDATE())
    SELECT [dbo].[UDF_GetStartOfQuarter] ('2014-02-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetStartOfQuarter]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SELECT @Result =
        DATEADD(QUARTER, DATEDIFF(QUARTER, 0, @ReferenceDate), 0)
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the start of week for a given reference date based on your @@DATEFIRST setting

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The start of the week for the given @ReferenceDate based on your @@DATEFIRST setting

Remarks:

Samples:

    SET DATEFIRST 7 -- Sunday
    SET DATEFIRST 1 -- Monday

    SELECT [dbo].[UDF_GetStartOfWeek] (GETDATE())
    SELECT [dbo].[UDF_GetStartOfWeek] ('2014-02-03 12:45:13')

Change log:
    2015-01-13 | adss | Bug fix with DATEDIFF(WEEK...) (Issue #1248)
	
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetStartOfWeek]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
        ,@DayOfWeek INT = @@DATEFIRST
    ;  

    DECLARE
        @FirstOfWeekday DATETIME2 = DATEADD(DAY, @DayOfWeek - 1, 0)
    ;

    SELECT @Result =
        --DATEADD(WEEK, DATEDIFF(WEEK, @FirstOfWeekday, @ReferenceDate), @FirstOfWeekday)
        DATEADD(WEEK, DATEDIFF(DAY, @FirstOfWeekday, @ReferenceDate) / 7, @FirstOfWeekday)
    ;

	RETURN @Result;

END
GO

/*
=============================================
Author:         Degen, Andreas
Copyright:      All rights reserved
Create date:    2014-05-12
Description:    Returns the start of year for a given reference date

Parameters:

    @ReferenceDate DATETIME2: The reference date used as basis for the calculation

Return value:

    @Result DATETIME2: The start of the year for the given @ReferenceDate

Remarks:

Samples:

    SELECT [dbo].[UDF_GetStartOfYear] (GETDATE())
    SELECT [dbo].[UDF_GetStartOfYear] ('2013-05-03 12:45:13')

Change log:
    
=============================================
*/
CREATE FUNCTION [dbo].[UDF_GetStartOfYear]
(
    @ReferenceDate DATETIME2
)
RETURNS DATETIME2
AS
BEGIN
	DECLARE
        @Result DATETIME2 = NULL
    ;  

    SET @ReferenceDate = CONVERT(DATE, @ReferenceDate);

    SELECT @Result =
        DATEADD(YEAR, DATEDIFF(YEAR, 0, @ReferenceDate), 0)
    ;

	RETURN @Result;

END
GO
