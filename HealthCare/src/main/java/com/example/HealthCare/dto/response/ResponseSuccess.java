package com.example.HealthCare.dto.response;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResponseSuccess {
	private int status;
	private String message;
	private Object data;
	private LocalDateTime timestamp;

	public ResponseSuccess(HttpStatus status, String message) {
		this.status = status.value();
		this.message = message;
		this.timestamp = LocalDateTime.now();
	}

	public ResponseSuccess(HttpStatus status, String message, Object data) {
		this.status = status.value();
		this.message = message;
		this.data = data;
		this.timestamp = LocalDateTime.now();
	}

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	public static class Payload {
		private int status;
		private String message;
		private Object data;
		private LocalDateTime timestamp;

		public Payload(int status, String message, Object data) {
			this.status = status;
			this.message = message;
			this.data = data;
			this.timestamp = LocalDateTime.now();
		}
	}
}
