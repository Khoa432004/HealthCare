# HealthCare Backend API

Spring Boot application for HealthCare management system.

## 🚀 Quick Start

### Local Development

```bash
# Run with Maven
./mvnw spring-boot:run

# Or with Docker
docker build -t healthcare-backend .
docker run -p 8080:8080 healthcare-backend
```

### With Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up
```

Backend will be available at: http://localhost:8080

## 📚 API Documentation

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- Health Check: http://localhost:8080/actuator/health

## 🌐 Deploy to Production

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions:
- Docker deployment
- Render.com deployment
- Environment variables configuration
- Troubleshooting guide

## 🔧 Tech Stack

- Java 17
- Spring Boot 3.x
- Spring Security with JWT
- PostgreSQL
- Redis (caching)
- Maven

## 📝 Environment Variables

Create a `.env` file for local development:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/healthcare_db
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=postgres
SPRING_DATA_REDIS_HOST=localhost
SPRING_DATA_REDIS_PORT=6379
```

## 📦 Build

```bash
# Clean and package
./mvnw clean package

# Skip tests
./mvnw clean package -DskipTests
```

## 🧪 Test

```bash
./mvnw test
```

## 📖 License

MIT License

