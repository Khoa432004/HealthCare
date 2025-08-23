package com.example.HealthCare.exception;

public class UsernameIsExistException extends RuntimeException {
	public UsernameIsExistException(String message) {
		super(message);
	}
}
