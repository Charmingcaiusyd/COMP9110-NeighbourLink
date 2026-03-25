package com.neighbourlink.controller;

import com.neighbourlink.entity.Driver;
import com.neighbourlink.repository.DriverRepository;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/driver-documents")
public class DriverDocumentController {

    private final DriverRepository driverRepository;
    private final Path driverDocumentsRootPath;

    public DriverDocumentController(
            DriverRepository driverRepository,
            @Value("${neighbourlink.storage.driver-documents-dir:./data/driver-documents}") String driverDocumentsRootDir
    ) {
        this.driverRepository = driverRepository;
        this.driverDocumentsRootPath = Paths.get(driverDocumentsRootDir).toAbsolutePath().normalize();
    }

    @GetMapping("/{driverId}/{documentType}")
    public ResponseEntity<Resource> getDriverDocument(
            @PathVariable Long driverId,
            @PathVariable String documentType
    ) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Driver not found"));

        String path = resolveDocumentPath(driver, documentType);
        if (path == null || path.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }

        Path targetPath = driverDocumentsRootPath.resolve(path).normalize();
        if (!targetPath.startsWith(driverDocumentsRootPath) || !Files.exists(targetPath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        }

        try {
            Resource resource = new UrlResource(targetPath.toUri());
            if (!resource.exists()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
            }
            String contentType = Files.probeContentType(targetPath);
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }
            return ResponseEntity.ok()
                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + targetPath.getFileName().toString() + "\""
                    )
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (MalformedURLException ex) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Document not found");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to read document");
        }
    }

    private String resolveDocumentPath(Driver driver, String documentTypeRaw) {
        String documentType = documentTypeRaw == null ? "" : documentTypeRaw.trim().toLowerCase(Locale.ROOT);
        switch (documentType) {
            case "licence":
            case "license":
                return driver.getLicenceDocumentPath();
            case "seat-proof":
            case "seatproof":
            case "spare-seat-proof":
                return driver.getSpareSeatProofDocumentPath();
            case "rego":
            case "vehicle-rego":
                return driver.getVehicleRegoDocumentPath();
            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "documentType must be licence, seat-proof, or rego"
                );
        }
    }
}
