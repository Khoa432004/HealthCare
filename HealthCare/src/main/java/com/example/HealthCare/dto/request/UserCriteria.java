package com.example.HealthCare.dto.request;

import com.example.HealthCare.enums.Gender;

import lombok.Data;

@Data
public class UserCriteria {
	private String username;
	private String email;
	private String phone;
	private String identityCard;
	private String fullName;
	private Gender gender;
	private String department;
	private String roleName;
	private Integer ageFrom;
	private Integer ageTo;
}
