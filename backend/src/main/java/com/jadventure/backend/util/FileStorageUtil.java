package com.jadventure.backend.util;

import com.jadventure.backend.exception.InvalidOperationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.Set;
import java.util.regex.Pattern;

@Component
public class FileStorageUtil {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp");
    private static final Pattern SAFE_PATH_SEGMENT = Pattern.compile("^[A-Za-z0-9_.-]+$");

    public static final String PATH_ADVENTURE_COVER = "%s/v%d/cover";
    public static final String PATH_SCENE_BACKGROUND = "%s/v%d/scenes/%s";
    public static final String PATH_ITEM_IMAGE = "%s/v%d/items/%s";
    public static final String PATH_USER_AVATAR = "users/%s/avatar-%d";

    private final Path rootUploadPath;
    private final String publicUrlBase;

    public FileStorageUtil(@Value("${app.upload.dir}") String uploadDir) {
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

    public String storeFile(String targetRelativePath, MultipartFile file) {
        if (file == null || file.isEmpty() || targetRelativePath == null) {
            return null;
        }

        String extension = extractExtension(file.getOriginalFilename());

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new InvalidOperationException("error.upload.unsupportedFormat", ALLOWED_EXTENSIONS);
        }

        if (!isSafePath(targetRelativePath)) {
            throw new InvalidOperationException("error.upload.invalidPath");
        }

        Path destinationFile = this.rootUploadPath.resolve(targetRelativePath + extension).normalize();
        if (!destinationFile.startsWith(this.rootUploadPath)) {
            throw new InvalidOperationException("error.upload.invalidPath");
        }

        try {
            if (destinationFile.getParent() != null) {
                Files.createDirectories(destinationFile.getParent());
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return this.publicUrlBase + "/" + targetRelativePath + extension;

        } catch (IOException e) {
            throw new IllegalStateException("Errore durante il salvataggio del file in: " + targetRelativePath, e);
        }
    }

    private boolean isSafePath(String relativePath) {
        return Arrays.stream(relativePath.split("/"))
                .allMatch(segment -> SAFE_PATH_SEGMENT.matcher(segment).matches()
                        && !segment.equals(".")
                        && !segment.equals(".."));
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new InvalidOperationException("error.upload.missingExtension");
        }
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }
}