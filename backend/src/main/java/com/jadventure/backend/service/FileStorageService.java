package com.jadventure.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.Set;

@Service
public class FileStorageService {

    private final Path rootUploadPath;
    private final String publicUrlBase;
    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir) {
        this.rootUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        String normalizedDir = uploadDir.replace("\\", "/");
        if (!normalizedDir.startsWith("/")) {
            normalizedDir = "/" + normalizedDir;
        }
        if (normalizedDir.endsWith("/")) {
            normalizedDir = normalizedDir.substring(0, normalizedDir.length() - 1);
        }
        this.publicUrlBase = normalizedDir;

        try {
            Files.createDirectories(this.rootUploadPath);
        } catch (IOException e) {
            throw new IllegalStateException("Impossibile inizializzare la cartella uploads: " + uploadDir, e);
        }
    }

    public String storeAdventureCover(String adventureCode, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        return saveFile(file, this.rootUploadPath.resolve(adventureCode), "cover",
                this.publicUrlBase + "/" + adventureCode);
    }

//    public String storeSceneBackground(String adventureCode, String sceneCode, MultipartFile file) {
//        requireNonEmpty(file, "Il file di sfondo della scena è obbligatorio");
//        return saveFile(file, this.rootUploadPath.resolve(adventureCode).resolve("scenes"), sceneCode,
//                this.publicUrlBase + "/" + adventureCode + "/scenes");
//    }
//
//    public String storeInventoryItemIcon(String adventureCode, String itemCode, MultipartFile file) {
//        requireNonEmpty(file, "L'icona dell'oggetto dell'inventario è obbligatoria");
//        return saveFile(file, this.rootUploadPath.resolve(adventureCode).resolve("inventory-items"), itemCode,
//                this.publicUrlBase + "/"  + adventureCode + "/inventory-items");
//    }
//
//    public String storeItemImage(String adventureCode, String itemCode, MultipartFile file) {
//        if (file == null || file.isEmpty()) {
//            return null;
//        }
//        return saveFile(file, this.rootUploadPath.resolve(adventureCode).resolve("items"), itemCode,
//                this.publicUrlBase + "/"  + adventureCode + "/items");
//    }

    private String saveFile(MultipartFile file, Path targetDirectory, String baseFileName, String publicUrlPrefix) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), ""));
        String extension = extractExtension(originalFilename);

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Formato file non supportato. Estensioni consentite: " + ALLOWED_EXTENSIONS
            );
        }

        try {
            Files.createDirectories(targetDirectory);

            String finalFileName = baseFileName + extension;
            Path destinationFile = targetDirectory.resolve(finalFileName).normalize();

            if (!destinationFile.startsWith(this.rootUploadPath)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Percorso di salvataggio non valido");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return publicUrlPrefix + "/" + finalFileName;

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Errore durante il salvataggio del file: " + baseFileName,
                    e
            );
        }
    }

    private void requireNonEmpty(MultipartFile file, String message) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
        }
    }

    private String extractExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex == -1) {
            return ".png";
        }
        return filename.substring(dotIndex).toLowerCase();
    }
}

