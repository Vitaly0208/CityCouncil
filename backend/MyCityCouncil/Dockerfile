# Этап 1: Сборка (используем SDK версии 10)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Копируем файл проекта
COPY MyCityCouncil.csproj ./
RUN dotnet restore

# Копируем код и публикуем
COPY . .
RUN dotnet publish -c Release -o out

# Этап 2: Запуск (используем Runtime версии 10)
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

EXPOSE 8080
ENTRYPOINT ["dotnet", "MyCityCouncil.dll"]