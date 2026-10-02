package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GraphicAdventureMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;

@Service
public class GraphicAdventureService {

    private final GraphicAdventureRepository graphicAdventureRepository;
    private final GraphicAdventureMapper graphicAdventureMapper;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public GraphicAdventureService(GraphicAdventureRepository graphicAdventureRepository,
                                   GraphicAdventureMapper graphicAdventureMapper,
                                   UserRepository userRepository,
                                   FileStorageService fileStorageService) {
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.graphicAdventureMapper = graphicAdventureMapper;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getAllAdventures() {
        return graphicAdventureMapper.toDtoList(graphicAdventureRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getMyAdventures() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return graphicAdventureMapper.toDtoList(
                graphicAdventureRepository.findAllByAuthorUsernameOrderByCreatedAtDesc(username)
        );
    }

    @Transactional(readOnly = true)
    public GraphicAdventureDto getAdventureByCode(String code) {
        GraphicAdventure adventure = graphicAdventureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata con codice: " + code));
        return graphicAdventureMapper.toDto(adventure);
    }

    @Transactional
    public GraphicAdventureDto createAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        String title = dto.getTitle();
        String code = generateUniqueCode(title);

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Utente non trovato: " + currentUsername));

        String coverUrl = null;
        if (coverImage != null && !coverImage.isEmpty()) {
            coverUrl = fileStorageService.storeAdventureCover(code, coverImage);
        }

        GraphicAdventure adventure = GraphicAdventure.builder()
                .title(title)
                .code(code)
                .description(dto.getDescription())
                .coverImageUrl(coverUrl)
                .initialSceneCode(null)
                .author(author)
                .build();

        GraphicAdventure saved = graphicAdventureRepository.save(adventure);
        return graphicAdventureMapper.toDto(saved);
    }

    @Transactional
    public void deleteAdventure(String code) {
        GraphicAdventure adventure = graphicAdventureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata con codice: " + code));

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        if (!adventure.getAuthor().getUsername().equals(currentUsername)) {
            throw new IllegalArgumentException("Non puoi eliminare un'avventura non tua");
        }

        graphicAdventureRepository.delete(adventure);
    }

    private String generateUniqueCode(String input) {
        String baseCode = generateCode(input);
        if (baseCode.isBlank()) {
            baseCode = "adventure";
        }

        String code = baseCode;
        int counter = 1;
        while (graphicAdventureRepository.findByCode(code).isPresent()) {
            code = baseCode + "_" + counter;
            counter++;
        }
        return code;
    }

    private String generateCode(String input) {
        if (input == null || input.isBlank()) {
            return "";
        }

        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");

        return normalized.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_+|_+$", "");
    }
}