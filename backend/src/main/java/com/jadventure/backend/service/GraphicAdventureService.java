package com.jadventure.backend.service;

import com.jadventure.backend.dto.adventure.GraphicAdventureCreateRequest;
import com.jadventure.backend.dto.adventure.GraphicAdventureResponse;
import com.jadventure.backend.exception.ResourceNotFoundException;
import com.jadventure.backend.mapper.GraphicAdventureMapper;
import com.jadventure.backend.model.GraphicAdventure;
import com.jadventure.backend.model.User;
import com.jadventure.backend.service.SlugService;
import com.jadventure.backend.repository.GraphicAdventureRepository;
import com.jadventure.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GraphicAdventureService {

    private final GraphicAdventureRepository graphicAdventureRepository;
    private final GraphicAdventureMapper graphicAdventureMapper;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final SlugService slugService;

    public GraphicAdventureService(GraphicAdventureRepository graphicAdventureRepository,
                                   GraphicAdventureMapper graphicAdventureMapper,
                                   UserRepository userRepository,
                                   FileStorageService fileStorageService,
                                   SlugService slugService) {
        this.graphicAdventureRepository = graphicAdventureRepository;
        this.graphicAdventureMapper = graphicAdventureMapper;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.slugService = slugService;
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureResponse> getAllAdventures() {
        List<GraphicAdventure> adventures = graphicAdventureRepository.findAll();
        return graphicAdventureMapper.toResponseList(adventures);
    }

    @Transactional(readOnly = true)
    public List<GraphicAdventureResponse> getAdventuresByAuthor(String username) {
        List<GraphicAdventure> adventures = graphicAdventureRepository.findAllByAuthorUsernameOrderByCreatedAtDesc(username);
        return graphicAdventureMapper.toResponseList(adventures);
    }

    @Transactional(readOnly = true)
    public GraphicAdventureResponse getAdventureByCode(String code) {
        GraphicAdventure adventure = graphicAdventureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura grafica non trovata con codice " + code));
        return graphicAdventureMapper.toResponse(adventure);
    }

    @Transactional
    public GraphicAdventureResponse createAdventure(GraphicAdventureCreateRequest request, MultipartFile coverImage) {
        String trimmedTitle = request.getTitle().trim();

        if (graphicAdventureRepository.existsByTitleIgnoreCase(trimmedTitle)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Esiste già un'avventura con questo titolo: '" + trimmedTitle + "'"
            );
        }

        String generatedCode = slugService.slugify(trimmedTitle);
        if (generatedCode.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Il titolo deve contenere caratteri alfanumerici validi per generare il codice univoco."
            );
        }

        if (graphicAdventureRepository.existsByCode(generatedCode)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Il codice generato '" + generatedCode + "' è già presente. Scegli un titolo differente."
            );
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User author = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("Utente '" + currentUsername + "' non trovato"));

        String coverUrl = null;
        if (coverImage != null && !coverImage.isEmpty()) {
            coverUrl = fileStorageService.storeAdventureCover(generatedCode, coverImage);
        }

        GraphicAdventure adventure = GraphicAdventure.builder()
                .title(trimmedTitle)
                .code(generatedCode)
                .description(request.getDescription())
                .coverImageUrl(coverUrl)
                .initialSceneCode(null)
                .author(author)
                .build();

        GraphicAdventure saved = graphicAdventureRepository.save(adventure);
        return graphicAdventureMapper.toResponse(saved);
    }

    @Transactional
    public void deleteAdventure(String code, String currentUsername) {
        GraphicAdventure adventure = graphicAdventureRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Avventura non trovata con codice: " + code));

        if (!adventure.getAuthor().getUsername().equals(currentUsername)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Non hai i permessi per eliminare questa avventura grafica."
            );
        }

        graphicAdventureRepository.delete(adventure);
    }
}
