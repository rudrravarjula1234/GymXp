FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["GymXP.API/GymXP.API.csproj", "GymXP.API/"]
COPY ["GymXP.Application/GymXP.Application.csproj", "GymXP.Application/"]
COPY ["GymXP.Domain/GymXP.Domain.csproj", "GymXP.Domain/"]
COPY ["GymXP.Infrastructure/GymXP.Infrastructure.csproj", "GymXP.Infrastructure/"]
COPY ["GymXP.Workflows/GymXP.Workflows.csproj", "GymXP.Workflows/"]

RUN dotnet restore "GymXP.API/GymXP.API.csproj"

COPY . .

RUN dotnet build "GymXP.API/GymXP.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GymXP.API/GymXP.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "GymXP.API.dll"]
