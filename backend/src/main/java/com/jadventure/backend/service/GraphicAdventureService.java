package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GraphicAdventureMapper;
import com.jadventure.backend.mapper.ItemMapper;
import com.jadventure.backend.mapper.SceneMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.model.User;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.util.FileStorageUtil;
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
    private final ItemMapper itemMapper;
    private final ItemService itemService;
    private final AuthService authService;
    private final FileStorageUtil fileStorageUtil;

    public GraphicAdventureService(GraphicAdventureRepository graphicAdventureRepository,
                                   GraphicAdventureMapper graphicAdventureMapper,
                                   SceneMapper sceneMapper,
                                   ItemMapper itemMapper,
                                   ItemService itemService,
                                   AuthService authService,
                                   FileStorageUtil fileStorageUtil) {
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.graphicAdventureMapper = graphicAdventureMapper;
        this.sceneMapper = sceneMapper;
        this.itemMapper = itemMapper;
        this.itemService = itemService;
        this.authService = authService;
        this.fileStorageUtil = fileStorageUtil;
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

    @Transactional
    public GraphicAdventureDto createAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        String title = dto.getTitle();
        String code = generateUniqueCode(title);

        User author = authService.getCurrentUser();

        String coverUrl = null;
        if (coverImage != null && !coverImage.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ADVENTURE_COVER, code);
            coverUrl = fileStorageUtil.storeFile(path, coverImage);
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
    public GraphicAdventureDto updateAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        GraphicAdventure adventure = findAdventureById(dto.getId());
        authService.validateOwnership(adventure.getAuthor().getUsername());

        adventure.setTitle(dto.getTitle());
        adventure.setDescription(dto.getDescription());

        if (dto.getInitialSceneCode() != null && !dto.getInitialSceneCode().isBlank()) {
            adventure.setInitialSceneCode(dto.getInitialSceneCode());
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ADVENTURE_COVER, adventure.getCode());
            adventure.setCoverImageUrl(fileStorageUtil.storeFile(path, coverImage));
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
    public SceneDto addScene(Long adventureId, SceneDto sceneDto, MultipartFile backgroundImage) {
        GraphicAdventure adventure = findAdventureById(adventureId);
        authService.validateOwnership(adventure.getAuthor().getUsername());

        Scene scene = sceneMapper.toEntity(sceneDto);

        String path = String.format(FileStorageUtil.PATH_SCENE_BACKGROUND, adventure.getCode(), sceneDto.getCode());
        String backgroundImageUrl = fileStorageUtil.storeFile(path, backgroundImage);

        scene.setBackgroundImageUrl(backgroundImageUrl);
        scene.setGraphicAdventure(adventure);
        adventure.getScenes().add(scene);

        if (adventure.getInitialSceneCode() == null || adventure.getInitialSceneCode().isBlank()) {
            adventure.setInitialSceneCode(scene.getCode());
        }

        graphicAdventureRepository.saveAndFlush(adventure);

        return sceneMapper.toDto(scene);
    }

    @Transactional
    public ItemDto addItem(Long adventureId, ItemDto itemDto, MultipartFile image) {
        GraphicAdventure adventure = findAdventureById(adventureId);
        authService.validateOwnership(adventure.getAuthor().getUsername());

        Item item = itemMapper.toEntity(itemDto);
        item.setHotspot(null);
        item.setGraphicAdventure(adventure);

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE, adventure.getCode(), itemDto.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        }

        adventure.getItems().add(item);
        graphicAdventureRepository.saveAndFlush(adventure);

        return itemMapper.toDto(item);
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