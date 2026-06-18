FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy all files preserving case, then create lowercase symlinks for solution compatibility
COPY . .

# Create the directory structure expected by the solution file (lowercase paths)
RUN mkdir -p core modules extensions && \
    cp -r Core/* core/ 2>/dev/null || true && \
    cp -r Modules/* modules/ 2>/dev/null || true && \
    cp -r Extensions/* extensions/ 2>/dev/null || true

RUN dotnet restore "YO-Framework.sln"
WORKDIR "/src/App/YOApp"
RUN dotnet publish "YOApp.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

# Create lowercase symlink for case-sensitive Linux file system
RUN ln -s App_Data app_data

ENTRYPOINT ["dotnet", "YOApp.dll"]