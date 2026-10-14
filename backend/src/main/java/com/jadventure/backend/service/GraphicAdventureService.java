package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GraphicAdventureMapper;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GraphicAdventureRepository;
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
    private final SceneMapper sceneMapper;
    private final AuthService authService;
    private final FileStorageService fileStorageService;

    public GraphicAdventureService(GraphicAdventureRepository graphicAdventureRepository,
                                   GraphicAdventureMapper graphicAdventureMapper,
                                   SceneMapper sceneMapper,
                                   AuthService authService,
                                   FileStorageService fileStorageService) {
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.graphicAdventureMapper = graphicAdventureMapper;
        this.sceneMapper = sceneMapper;
        this.authService = authService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getAllAdventures() {
        return graphicAdventureMapper.toDtoList(graphicAdventureRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getMyAdventures() {
        String username = authService.getCurrentUsername();
        return graphicAdventureMapper.toDtoList(
                graphicAdventureRepository.findAllByAuthorUsernameOrderByCreatedAtDesc(username)
        );
    }

    @Transactional(readOnly = true)
    public GraphicAdventureDto getAdventureById(Long adventureId) {
        GraphicAdventure adventure = findAdventureById(adventureId);
        return graphicAdventureMapper.toDto(adventure);
    }

    @Transactional(readOnly = true)
    public GraphicAdventureDto getAdventureByCode(String code) {
        return graphicAdventureMapper.toDto(findAdventureByCode(code));
    }

    @Transactional(readOnly = true)
    public boolean existsByCode(String code) {
        return graphicAdventureRepository.existsByCode(code);
    }

    @Transactional
    public GraphicAdventureDto createAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        String title = dto.getTitle();
        String code = generateUniqueCode(title);

        User author = authService.getCurrentUser();

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

        return graphicAdventureMapper.toDto(graphicAdventureRepository.save(adventure));
    }

    @Transactional
    public GraphicAdventureDto updateAdventureById(Long adventureId, GraphicAdventureDto dto, MultipartFile coverImage) {
        GraphicAdventure adventure = findAdventureById(adventureId);
        authService.validateOwnership(adventure.getAuthor().getUsername());

        adventure.setTitle(dto.getTitle());
        adventure.setDescription(dto.getDescription());

        if (coverImage != null && !coverImage.isEmpty()) {
            adventure.setCoverImageUrl(fileStorageService.storeAdventureCover(adventure.getCode(), coverImage));
        }

        return graphicAdventureMapper.toDto(graphicAdventureRepository.save(adventure));
    }

    @Transactional
    public void deleteAdventureById(Long adventureId) {
        GraphicAdventure adventure = findAdventureById(adventureId);
        authService.validateOwnership(adventure.getAuthor().getUsername());

        graphicAdventureRepository.delete(adventure);
    }

    @Transactional
    public void updateInitialSceneCode(String adventureCode, String sceneCode) {
        GraphicAdventure adventure = findAdventureByCode(adventureCode);
        authService.validateOwnership(adventure.getAuthor().getUsername());
        adventure.setInitialSceneCode(sceneCode);
        graphicAdventureRepository.save(adventure);
    }

    @Transactional
    public SceneDto addScene(Long adventureId, SceneDto sceneDto, MultipartFile backgroundImage) {
        GraphicAdventure adventure = findAdventureById(adventureId);
        authService.validateOwnership(adventure.getAuthor().getUsername());

        if (adventure.getScenes().stream().anyMatch(s -> s.getCode().equalsIgnoreCase(sceneDto.getCode()))) {
            throw new IllegalArgumentException("Scena già presente con codice: " + sceneDto.getCode());
        }

        Scene scene = sceneMapper.toEntity(sceneDto);

        String bgUrl = fileStorageService.storeSceneBackground(adventure.getCode(), sceneDto.getCode(), backgroundImage);
        scene.setBackgroundImageUrl(bgUrl);
        scene.setGraphicAdventure(adventure);
        adventure.getScenes().add(scene);

        boolean hasNoInitialScene = adventure.getInitialSceneCode() == null || adventure.getInitialSceneCode().isBlank();
        if (hasNoInitialScene || sceneDto.isSetAsInitial()) {
            adventure.setInitialSceneCode(scene.getCode());
        }

        graphicAdventureRepository.save(adventure);

        return sceneMapper.toDto(scene);
    }

    private GraphicAdventure findAdventureById(Long id) {
        return graphicAdventureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata con ID: " + id));
    }

    private GraphicAdventure findAdventureByCode(String code) {
        return graphicAdventureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata: " + code));
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