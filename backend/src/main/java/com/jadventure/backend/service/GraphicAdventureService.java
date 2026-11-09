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
public class GraphicAdventureService {

    private final GraphicAdventureRepository graphicAdventureRepository;
    private final GraphicAdventureMapper graphicAdventureMapper;
    private final SceneMapper sceneMapper;
    private final ItemMapper itemMapper;
    private final AuthService authService;
    private final FileStorageUtil fileStorageUtil;

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getAllAdventures() {
        Map<String, GraphicAdventure> latestByCode = new LinkedHashMap<>();
        graphicAdventureRepository.findAllByStatusOrderByCodeAscVersionNumberDesc(AdventureStatus.PUBLISHED)
                .forEach(adventure -> latestByCode.putIfAbsent(adventure.getCode(), adventure));

        return graphicAdventureMapper.toDtoList(new ArrayList<>(latestByCode.values()));
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getMyAdventures() {
        String username = authService.getCurrentUsername();
        return graphicAdventureMapper.toDtoList(
                graphicAdventureRepository.findAllByAuthorUsernameAndStatusOrderByCreatedAtDesc(
                        username, AdventureStatus.DRAFT)
        );
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureDto> getPublishedVersions(Long adventureId) {
        GraphicAdventure adventure = findReadableAdventure(adventureId);
        return graphicAdventureMapper.toDtoList(
                graphicAdventureRepository.findAllByCodeAndStatusOrderByVersionNumberDesc(
                        adventure.getCode(), AdventureStatus.PUBLISHED)
        );
    }

    @Transactional(readOnly = true)
    public GraphicAdventureDto getAdventureById(Long adventureId) {
        return graphicAdventureMapper.toDto(findReadableAdventure(adventureId));
    }

    @Transactional
    public GraphicAdventureDto createAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        String title = dto.getTitle();
        if (graphicAdventureRepository.existsByTitle(title)) {
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

        return graphicAdventureMapper.toDto(graphicAdventureRepository.save(adventure));
    }

    @Transactional
    public GraphicAdventureDto updateAdventure(GraphicAdventureDto dto, MultipartFile coverImage) {
        GraphicAdventure adventure = findOwnedDraft(dto.getId());

        if (graphicAdventureRepository.existsByTitleAndCodeNot(dto.getTitle(), adventure.getCode())) {
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

        return graphicAdventureMapper.toDto(graphicAdventureRepository.save(adventure));
    }

    @Transactional
    public void deleteAdventureById(Long adventureId) {
        GraphicAdventure adventure = findOwnedDraft(adventureId);
        graphicAdventureRepository.deleteAll(graphicAdventureRepository.findAllByCode(adventure.getCode()));
    }

    @Transactional
    public GraphicAdventureDto publish(Long adventureId) {
        GraphicAdventure published = findOwnedDraft(adventureId);

        if (published.getScenes().isEmpty()) {
            throw new ConflictException("error.adventure.publishNoScenes");
        }

        boolean initialSceneValid = published.getInitialSceneCode() != null
                && published.getScenes().stream()
                .anyMatch(s -> s.getCode().equals(published.getInitialSceneCode()));
        if (!initialSceneValid) {
            throw new ConflictException("error.adventure.publishInvalidStartScene");
        }

        published.setStatus(AdventureStatus.PUBLISHED);
        published.setPublishedAt(LocalDateTime.now());

        graphicAdventureRepository.saveAndFlush(published);

        GraphicAdventure newDraft = createNextDraft(published);

        return graphicAdventureMapper.toDto(newDraft);
    }

    @Transactional
    public SceneDto addScene(Long adventureId, SceneDto sceneDto, MultipartFile backgroundImage) {
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

        return sceneMapper.toDto(scene);
    }

    @Transactional
    public ItemDto addItem(Long adventureId, ItemDto itemDto, MultipartFile image) {
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

        return itemMapper.toDto(item);
    }

    private GraphicAdventure findAdventureById(Long id) {
        return graphicAdventureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("error.adventure.notFoundById", id));
    }

    private GraphicAdventure findReadableAdventure(Long id) {
        GraphicAdventure adventure = findAdventureById(id);
        boolean isAuthor = adventure.getAuthor().getUsername().equals(authService.getCurrentUsername());
        if (!isAuthor && adventure.getStatus() != AdventureStatus.PUBLISHED) {
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

        return graphicAdventureRepository.save(draft);
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