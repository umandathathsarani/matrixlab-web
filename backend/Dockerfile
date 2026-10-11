# ==============================================================================
# Multi-stage Dockerfile for ASP.NET Core API Cloud Hosting (Render / Railway)
# Follows SE3090 Lab 11 Specification
# ==============================================================================

# Stage 1: Build & Publish using .NET 8 SDK
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

# Stage 2: Production Runtime using slim ASP.NET Core image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .

# Bind ASP.NET Core to platform port
ENV ASPNETCORE_URLS=http://0.0.0.0:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MatrixLab.Api.dll"]
