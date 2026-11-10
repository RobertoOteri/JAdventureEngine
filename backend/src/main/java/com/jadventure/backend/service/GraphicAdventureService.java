package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureDto;
import com.jadventure.backend.dto.item.ItemDto;
import com.jadventure.backend.dto.scene.SceneDto;
import com.jadventure.backend.exception.ConflictException;
import com.jadventure.backend.exception.InvalidOperationException;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.*;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.Item;
import com.jadventure.backend.model.Scene;
import com.jadventure.backend.model.User;
import com.jadventure.backend.model.enums.AdventureStatus;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.util.FileStorageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Log4j2
public class GraphicAdventureService {

    private final GraphicAdventureRepository graphicAdventureRepository;
    private final GraphicAdventureMapper graphicAdventureMapper;
    private final SceneMapper sceneMapper;
    private final ItemMapper itemMapper;
    private final AuthService authService;
    private final FileStorageUtil fileStorageUtil;

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getAllAdventures() {
        log.info("Executing getAllAdventures");
        Map<String, GraphicAdventure> latestByCode = new LinkedHashMap<>();
        graphicAdventureRepository.findAllByStatusOrderByCodeAscVersionNumberDesc(AdventureStatus.PUBLISHED)
                .forEach(adventure -> latestByCode.putIfAbsent(adventure.getCode(), adventure));

        List<GraphicAdventureDto> adventures = graphicAdventureMapper.toDtoList(new ArrayList<>(latestByCode.values()));
        log.info("Executed getAllAdventures: found {} published adventures", adventures.size());
        return adventures;
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getMyAdventures() {
        log.info("Executing getMyAdventures");
        String username = authService.getCurrentUsername();
        List<GraphicAdventureDto> adventures = graphicAdventureMapper.toDtoList(
                graphicAdventureRepository.findAllByAuthorUsernameAndStatusOrderByCreatedAtDesc(
                        username, AdventureStatus.DRAFT)
        );
        log.info("Executed getMyAdventures: found {} draft adventures for user {}", adventures.size(), username);
        return adventures;
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getPublishedVersions(Long adventureId) {
        log.info("Executing getPublishedVersions with adventureId: {}", adventureId);
        GraphicAdventure adventure = findReadableAdventure(adventureId);
        List<GraphicAdventureDto> versions = graphicAdventureMapper.toDtoList(
                graphicAdventureRepository.findAllByCodeAndStatusOrderByVersionNumberDesc(
                        adventure.getCode(), AdventureStatus.PUBLISHED)
        );
        log.info("Executed getPublishedVersions: found {} published versions for adventure {}", versions.size(), adventure.getCode());
        return versions;
    }

    @Transactional(readOnly = true)
    public GraphicAdventureDto getAdventureById(Long adventureId) {
        log.info("Executing getAdventureById with adventureId: {}", adventureId);
        GraphicAdventureDto adventure = graphicAdventureMapper.toDto(findReadableAdventure(adventureId));
        log.info("Executed getAdventureById: returning adventure {}", adventure);
        return adventure;
    }

    @Transactional
    public GraphicAdventureDto createAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        log.info("Executing createAdventure with adventure: {}, coverImage provided: {}", dto, coverImage != null && !coverImage.isEmpty());
        String title = dto.getTitle();
        if (graphicAdventureRepository.existsByTitle(title)) {
            log.error("Cannot create adventure: title '{}' is already taken", title);
            throw new InvalidOperationException("error.adventure.titleTaken");
        }

        String code = generateUniqueCode(title);
        User author = authService.getCurrentUser();

        GraphicAdventure adventure = GraphicAdventure.builder()
                .title(title)
                .code(code)
                .description(dto.getDescription())
                .initialSceneCode(null)
                .versionNumber(1)
                .status(AdventureStatus.DRAFT)
                .author(author)
                .build();

        if (coverImage != null && !coverImage.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ADVENTURE_COVER, code, adventure.getVersionNumber());
            adventure.setCoverImageUrl(fileStorageUtil.storeFile(path, coverImage));
        }

        GraphicAdventureDto created = graphicAdventureMapper.toDto(graphicAdventureRepository.save(adventure));
        log.info("Executed createAdventure: returning adventure {}", created);
        return created;
    }

    @Transactional
    public GraphicAdventureDto updateAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        log.info("Executing updateAdventure with adventure: {}, coverImage provided: {}", dto, coverImage != null && !coverImage.isEmpty());
        GraphicAdventure adventure = findOwnedDraft(dto.getId());

        if (graphicAdventureRepository.existsByTitleAndCodeNot(dto.getTitle(), adventure.getCode())) {
            log.error("Cannot update adventure {}: title '{}' is already taken", dto.getId(), dto.getTitle());
            throw new InvalidOperationException("error.adventure.titleTaken");
        }

        adventure.setTitle(dto.getTitle());
        adventure.setDescription(dto.getDescription());

        if (dto.getInitialSceneCode() != null && !dto.getInitialSceneCode().isBlank()) {
            adventure.setInitialSceneCode(dto.getInitialSceneCode());
        }

        if (coverImage != null && !coverImage.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ADVENTURE_COVER,
                    adventure.getCode(), adventure.getVersionNumber());
            adventure.setCoverImageUrl(fileStorageUtil.storeFile(path, coverImage));
        }

        GraphicAdventureDto updated = graphicAdventureMapper.toDto(graphicAdventureRepository.save(adventure));
        log.info("Executed updateAdventure: returning adventure {}", updated);
        return updated;
    }

    @Transactional
    public void deleteAdventureById(Long adventureId) {
        log.info("Executing deleteAdventureById with adventureId: {}", adventureId);
        GraphicAdventure adventure = findOwnedDraft(adventureId);
        graphicAdventureRepository.deleteAll(graphicAdventureRepository.findAllByCode(adventure.getCode()));
        log.info("Executed deleteAdventureById: all versions of adventure {} deleted", adventure.getCode());
    }

    @Transactional
    public GraphicAdventureDto publish(Long adventureId) {
        log.info("Executing publish with adventureId: {}", adventureId);
        GraphicAdventure published = findOwnedDraft(adventureId);

        if (published.getScenes().isEmpty()) {
            log.error("Cannot publish adventure {}: it has no scenes", adventureId);
            throw new ConflictException("error.adventure.publishNoScenes");
        }

        boolean initialSceneValid = published.getInitialSceneCode() != null
                && published.getScenes().stream()
                .anyMatch(s -> s.getCode().equals(published.getInitialSceneCode()));
        if (!initialSceneValid) {
            log.error("Cannot publish adventure {}: initial scene '{}' is not valid", adventureId, published.getInitialSceneCode());
            throw new ConflictException("error.adventure.publishInvalidStartScene");
        }

        published.setStatus(AdventureStatus.PUBLISHED);
        published.setPublishedAt(LocalDateTime.now());

        graphicAdventureRepository.saveAndFlush(published);

        GraphicAdventure newDraft = createNextDraft(published);

        GraphicAdventureDto newDraftDto = graphicAdventureMapper.toDto(newDraft);
        log.info("Executed publish: adventure {} published as version {}, returning new draft {}",
                published.getCode(), published.getVersionNumber(), newDraftDto);
        return newDraftDto;
    }

    @Transactional
    public SceneDto addScene(Long adventureId, SceneDto sceneDto, MultipartFile backgroundImage) {
        log.info("Executing addScene with adventureId: {}, sceneCode: {}", adventureId, sceneDto.getCode());
        GraphicAdventure adventure = findOwnedDraft(adventureId);

        Scene scene = sceneMapper.toEntity(sceneDto);

        String path = String.format(FileStorageUtil.PATH_SCENE_BACKGROUND,
                adventure.getCode(), adventure.getVersionNumber(), sceneDto.getCode());
        String backgroundImageUrl = fileStorageUtil.storeFile(path, backgroundImage);

        scene.setBackgroundImageUrl(backgroundImageUrl);
        scene.setGraphicAdventure(adventure);
        adventure.getScenes().add(scene);

        if (adventure.getInitialSceneCode() == null || adventure.getInitialSceneCode().isBlank()) {
            adventure.setInitialSceneCode(scene.getCode());
        }

        graphicAdventureRepository.saveAndFlush(adventure);

        SceneDto created = sceneMapper.toDto(scene);
        log.info("Executed addScene: scene {} created with code {} in adventure {}", created.getId(), created.getCode(), adventureId);
        return created;
    }

    @Transactional
    public ItemDto addItem(Long adventureId, ItemDto itemDto, MultipartFile image) {
        log.info("Executing addItem with adventureId: {}, itemCode: {}, image provided: {}",
                adventureId, itemDto.getCode(), image != null && !image.isEmpty());
        GraphicAdventure adventure = findOwnedDraft(adventureId);

        Item item = itemMapper.toEntity(itemDto);
        item.setHotspot(null);
        item.setGraphicAdventure(adventure);

        if (image != null && !image.isEmpty()) {
            String path = String.format(FileStorageUtil.PATH_ITEM_IMAGE,
                    adventure.getCode(), adventure.getVersionNumber(), itemDto.getCode());
            item.setImageUrl(fileStorageUtil.storeFile(path, image));
        }

        adventure.getItems().add(item);
        graphicAdventureRepository.saveAndFlush(adventure);

        ItemDto created = itemMapper.toDto(item);
        log.info("Executed addItem: item {} created with code {} in adventure {}", created.getId(), created.getCode(), adventureId);
        return created;
    }

    private GraphicAdventure findAdventureById(Long id) {
        return graphicAdventureRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Adventure with id {} not found", id);
                    return new ResourceNotFoundException("error.adventure.notFoundById", id);
                });
    }

    private GraphicAdventure findReadableAdventure(Long id) {
        GraphicAdventure adventure = findAdventureById(id);
        boolean isAuthor = adventure.getAuthor().getUsername().equals(authService.getCurrentUsername());
        if (!isAuthor && adventure.getStatus() != AdventureStatus.PUBLISHED) {
            log.error("Adventure {} is not readable: it is a draft of another user", id);
            throw new ResourceNotFoundException("error.adventure.notFoundById", id);
        }
        return adventure;
    }

    private GraphicAdventure findOwnedDraft(Long id) {
        GraphicAdventure adventure = findAdventureById(id);
        authService.validateEditable(adventure.getAuthor().getUsername(), adventure.getStatus());
        return adventure;
    }

    private GraphicAdventure createNextDraft(GraphicAdventure adventure) {
        GraphicAdventure draft = graphicAdventureMapper.copy(adventure, new AdventureCopyContext());
        draft.setVersionNumber(adventure.getVersionNumber() + 1);
        draft.setStatus(AdventureStatus.DRAFT);

        GraphicAdventure savedDraft = graphicAdventureRepository.save(draft);
        log.debug("Created new draft version {} for adventure {}", savedDraft.getVersionNumber(), savedDraft.getCode());
        return savedDraft;
    }

    private String generateUniqueCode(String input) {
        String baseCode = generateCode(input);
        if (baseCode.isBlank()) {
            baseCode = "adventure";
        }

        String code = baseCode;
        int counter = 1;
        while (graphicAdventureRepository.existsByCode(code)) {
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