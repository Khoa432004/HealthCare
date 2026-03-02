package com.example.HealthCare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IcdChapterDto {
    private String id;
    private String codeFrom;
    private String codeTo;
    private String titleVi;
    private String titleEn;
}
