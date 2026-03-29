# ============================================================
# Stage 1: Build - dùng Maven + JDK 17 để compile và đóng gói
# ============================================================
FROM maven:3.9-eclipse-temurin-17-alpine AS build

WORKDIR /app

# Copy pom.xml trước để tận dụng Docker layer cache (tránh tải lại dependencies mỗi lần build)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ source code rồi build JAR (bỏ qua tests để build nhanh hơn)
COPY src ./src
RUN mvn clean package -DskipTests

# ============================================================
# Stage 2: Runtime - chỉ cần JRE 17, image nhỏ hơn (~100MB)
# ============================================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Tạo user/group riêng (không chạy app bằng root - best practice bảo mật)
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

# Copy file JAR đã build từ stage trước
COPY --from=build /app/target/*.jar app.jar

# Đổi ownership về user không phải root
RUN chown -R appuser:appgroup /app

USER appuser

# Expose cổng mặc định Spring Boot
EXPOSE 8080

# Health check: gọi /actuator/health mỗi 30s
# - start-period=60s: cho app thời gian khởi động trước khi kiểm tra
# - retries=3: thử lại 3 lần trước khi báo unhealthy
HEALTHCHECK --interval=30s --timeout=10s --start-period=180s --retries=5 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Tối ưu JVM cho môi trường container:
# - UseContainerSupport: nhận diện giới hạn CPU/RAM của container
# - MaxRAMPercentage=75.0: dùng tối đa 75% RAM được cấp
# - urandom: tránh block khi tạo random numbers (quan trọng với JWT/Security)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
