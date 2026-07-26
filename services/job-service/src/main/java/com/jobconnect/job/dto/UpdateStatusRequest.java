package com.jobconnect.job.dto;

import com.jobconnect.job.entities.ApplicationStatus;

import lombok.Data;

@Data
public class UpdateStatusRequest {
	private ApplicationStatus status;
}