# Runtime image for one backend module. The JARs are built ONCE beforehand (scripts/build-images.sh or
# `./mvnw -DskipTests package`); building Maven inside 16 images in parallel exhausted Docker Desktop's memory.
#   docker build --build-arg MODULE=identity-service backend/
FROM eclipse-temurin:25-jre-alpine
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app
ARG MODULE
COPY ${MODULE}/target/${MODULE}-0.1.0-SNAPSHOT.jar /app/app.jar
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
