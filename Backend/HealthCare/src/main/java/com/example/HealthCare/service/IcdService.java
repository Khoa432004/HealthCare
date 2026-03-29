package com.example.HealthCare.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.HealthCare.dto.IcdChapterDto;
import com.example.HealthCare.dto.IcdDiseaseSearchItemDto;
import com.example.HealthCare.dto.IcdMedicationItemDto;
import com.example.HealthCare.model.IcdDiseaseMedication;
import com.example.HealthCare.repository.IcdDiseaseMedicationRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IcdService {

    private static final int SEARCH_PAGE_SIZE = 30;
    private static final int CODES_PAGE_SIZE = 200;

    private static final List<IcdChapterDto> CHAPTERS = List.of(
            IcdChapterDto.builder().id("I").codeFrom("A00").codeTo("B99")
                    .titleVi("Bệnh nhiễm trùng và ký sinh trùng").titleEn("Infectious and parasitic diseases").build(),
            IcdChapterDto.builder().id("II").codeFrom("C00").codeTo("D48")
                    .titleVi("U tân sinh").titleEn("Neoplasms").build(),
            IcdChapterDto.builder().id("III").codeFrom("D50").codeTo("D89")
                    .titleVi("Bệnh máu, cơ quan tạo máu và các bệnh lý liên quan đến cơ chế miễn dịch").titleEn("Diseases of the blood and blood-forming organs and certain disorders involving the immune mechanism").build(),
            IcdChapterDto.builder().id("IV").codeFrom("E00").codeTo("E90")
                    .titleVi("Bệnh nội tiết, dinh dưỡng và chuyển hoá").titleEn("Endocrine, nutritional and metabolic diseases").build(),
            IcdChapterDto.builder().id("V").codeFrom("F00").codeTo("F99")
                    .titleVi("Rối loạn tâm thần và hành vi").titleEn("Mental and behavioral disorders").build(),
            IcdChapterDto.builder().id("VI").codeFrom("G00").codeTo("G99")
                    .titleVi("Bệnh hệ thần kinh").titleEn("Diseases of the nervous system").build(),
            IcdChapterDto.builder().id("VII").codeFrom("H00").codeTo("H59")
                    .titleVi("Bệnh mắt và phần phụ của mắt").titleEn("Diseases of the eye and adnexa").build(),
            IcdChapterDto.builder().id("VIII").codeFrom("H60").codeTo("H95")
                    .titleVi("Bệnh tai và xương chũm").titleEn("Diseases of the ear and mastoid process").build(),
            IcdChapterDto.builder().id("IX").codeFrom("I00").codeTo("I99")
                    .titleVi("Bệnh hệ tuần hoàn").titleEn("Diseases of the circulatory system").build(),
            IcdChapterDto.builder().id("X").codeFrom("J00").codeTo("J99")
                    .titleVi("Bệnh hệ hô hấp").titleEn("Diseases of the respiratory system").build(),
            IcdChapterDto.builder().id("XI").codeFrom("K00").codeTo("K93")
                    .titleVi("Bệnh hệ tiêu hoá").titleEn("Diseases of the digestive system").build(),
            IcdChapterDto.builder().id("XII").codeFrom("L00").codeTo("L99")
                    .titleVi("Bệnh da và mô dưới da").titleEn("Diseases of the skin and subcutaneous tissue").build(),
            IcdChapterDto.builder().id("XIII").codeFrom("M00").codeTo("M99")
                    .titleVi("Bệnh hệ cơ xương khớp và mô liên kết").titleEn("Diseases of the musculoskeletal system and connective tissue").build(),
            IcdChapterDto.builder().id("XIV").codeFrom("N00").codeTo("N99")
                    .titleVi("Bệnh hệ tiết niệu sinh dục").titleEn("Diseases of the genitourinary system").build(),
            IcdChapterDto.builder().id("XV").codeFrom("O00").codeTo("O99")
                    .titleVi("Thai sản, sinh đẻ và hậu sản").titleEn("Pregnancy, childbirth and the puerperium").build(),
            IcdChapterDto.builder().id("XVI").codeFrom("P00").codeTo("P96")
                    .titleVi("Bệnh có nguồn gốc chu sinh").titleEn("Certain conditions originating in the perinatal period").build(),
            IcdChapterDto.builder().id("XVII").codeFrom("Q00").codeTo("Q99")
                    .titleVi("Dị tật bẩm sinh").titleEn("Congenital malformations, deformations and chromosomal abnormalities").build(),
            IcdChapterDto.builder().id("XVIII").codeFrom("R00").codeTo("R99")
                    .titleVi("Triệu chứng, dấu hiệu và bất thường lâm sàng, cận lâm sàng").titleEn("Symptoms, signs and abnormal clinical and laboratory findings").build(),
            IcdChapterDto.builder().id("XIX").codeFrom("S00").codeTo("T98")
                    .titleVi("Chấn thương, ngộ độc và một số hậu quả do nguyên nhân bên ngoài").titleEn("Injury, poisoning and certain other consequences of external causes").build(),
            IcdChapterDto.builder().id("XX").codeFrom("V01").codeTo("Y98")
                    .titleVi("Nguyên nhân bên ngoài của bệnh tật và tử vong").titleEn("External causes of morbidity and mortality").build(),
            IcdChapterDto.builder().id("XXI").codeFrom("Z00").codeTo("Z99")
                    .titleVi("Các yếu tố ảnh hưởng đến tình trạng sức khoẻ").titleEn("Factors influencing health status and contact with health services").build()
    );

    private final IcdDiseaseMedicationRepository repository;

    @Cacheable("icdChapters")
    public List<IcdChapterDto> getChapters() {
        return CHAPTERS;
    }

    @Cacheable(value = "icdCodes", key = "#codeFrom + ':' + #codeTo")
    public List<IcdDiseaseSearchItemDto> getCodesByRange(String codeFrom, String codeTo) {
        if (codeFrom == null || codeTo == null || codeFrom.isBlank() || codeTo.isBlank()) {
            return List.of();
        }
        List<Object[]> rows = repository.findDistinctByIcdCodeRange(
                codeFrom.trim(), codeTo.trim(), PageRequest.of(0, CODES_PAGE_SIZE, Sort.by("icdCode")));
        return rows.stream()
                .map(row -> IcdDiseaseSearchItemDto.builder()
                        .icdCode((String) row[0])
                        .diseaseName((String) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    @Cacheable(value = "icdSearch", key = "#q")
    public List<IcdDiseaseSearchItemDto> search(String q) {
        if (q == null || q.isBlank()) {
            return List.of();
        }
        String trimmed = q.trim();
        List<Object[]> rows = repository.findDistinctIcdAndDiseaseByQuery(
                trimmed, PageRequest.of(0, SEARCH_PAGE_SIZE));
        return rows.stream()
                .map(row -> IcdDiseaseSearchItemDto.builder()
                        .icdCode((String) row[0])
                        .diseaseName((String) row[1])
                        .build())
                .collect(Collectors.toList());
    }

    @Cacheable(value = "icdMedications", key = "#icdCode")
    public List<IcdMedicationItemDto> getMedicationsByIcdCode(String icdCode) {
        if (icdCode == null || icdCode.isBlank()) {
            return List.of();
        }
        List<IcdDiseaseMedication> list = repository.findByIcdCodeOrderByMedicationName(icdCode.trim());
        return list.stream()
                .map(m -> IcdMedicationItemDto.builder()
                        .medicationName(m.getMedicationName())
                        .medicationType(m.getMedicationType())
                        .dosage(m.getDosage())
                        .medicationGroup(m.getMedicationGroup())
                        .role(m.getRole())
                        .build())
                .collect(Collectors.toList());
    }
}
