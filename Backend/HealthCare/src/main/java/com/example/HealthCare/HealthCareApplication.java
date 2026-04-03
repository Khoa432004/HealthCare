package com.example.HealthCare;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class HealthCareApplication {

	public static void main(String[] args) {
		loadDotEnvIntoSystemProperties();
		SpringApplication.run(HealthCareApplication.class, args);
	}

	/**
	 * Nạp .env trước khi Spring resolve placeholder trong application.properties.
	 * Hỗ trợ chạy từ {@code capstone_project} hoặc từ thư mục module {@code HealthCare/Backend/HealthCare}.
	 * Biến môi trường thật (OS/env) luôn được ưu tiên hơn file .env.
	 */
	static void loadDotEnvIntoSystemProperties() {
		Path dir = resolveDotEnvDirectory();
		if (dir == null) {
			return;
		}
		try {
			Dotenv dotenv = Dotenv.configure()
					.directory(dir.toAbsolutePath().toString())
					.filename(".env")
					.load();
			dotenv.entries().forEach(entry -> {
				String key = entry.getKey();
				if (key == null || key.isBlank()) {
					return;
				}
				if (System.getenv(key) != null) {
					return;
				}
				if (System.getProperty(key) != null) {
					return;
				}
				System.setProperty(key, entry.getValue());
			});
		} catch (Exception e) {
			System.err.println("[HealthCare] Could not load .env from " + dir.toAbsolutePath() + ": " + e.getMessage());
		}
	}

	static Path resolveDotEnvDirectory() {
		Path cwd = Paths.get("").toAbsolutePath().normalize();
		Path[] candidates = new Path[] {
				cwd.resolve("HealthCare").resolve("Backend").resolve("HealthCare"),
				cwd.resolve("Backend").resolve("HealthCare"),
				cwd
		};
		for (Path dir : candidates) {
			Path envFile = dir.resolve(".env");
			if (Files.isRegularFile(envFile)) {
				return dir;
			}
		}
		return null;
	}

}
