package com.example.HealthCare.enums;

public enum Privilege {
	VIEW_USER("View user Have right to view all user profiles"),
	CREATE_USER("Create user Have right to create a new user."),
	MODIFY_USER("Modify user Have right to modify an user."),
	DELETE_USER("Delete user Have right to delete an user."),
	LOCK_UNLOCK_USER("Lock and Unlock user Have right to lock or unlock an user."),
	VIEW_ROLE("View role Have right to view all role privileges."),
	CREATE_ROLE("Create role Have right to create a new custom role."),
	UPDATE_ROLE("Update role Have right to modify privileges of custom role."),
	DELETE_ROLE("Delete role Have right to delete a custom role."),
	APPROVE_DOCTOR("Approve doctor Have right to approve pending doctor accounts."),
	REJECT_DOCTOR("Reject doctor Have right to reject pending doctor accounts."),
	VIEW_DASHBOARD("View dashboard Have right to view dashboard statistics."),
	MANAGE_NOTIFICATIONS("Manage notifications Have right to manage notifications."),
	VIEW_APPOINTMENTS("View appointments Have right to view all appointments."),
	PROCESS_REFUNDS("Process refunds Have right to process refunds for appointments."),
	VIEW_PAYROLL("View payroll Have right to view doctor payroll information."),
	SETTLE_PAYROLL("Settle payroll Have right to settle doctor payrolls.");

	private final String description;

	Privilege(String description) {
		this.description = description;
	}

	public String getDescription() {
		return description;
	}
}
