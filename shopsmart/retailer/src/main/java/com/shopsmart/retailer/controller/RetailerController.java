package com.shopsmart.retailer.controller;

import com.shopsmart.retailer.entity.Retailer;
import com.shopsmart.retailer.service.RetailerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shopsmart/retailer")
@CrossOrigin(origins = "http://localhost:5173")
public class RetailerController {

    @Autowired
    private RetailerService retailerService;

    @GetMapping
    public List<Retailer> getAllRetailers() {
        return retailerService.getAllRetailers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getRetailerById(@PathVariable Integer id) {
        return retailerService.getRetailerById(id)
                .map(retailer -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("ownerId", retailer.getOwnerId());
                    response.put("ownerName", retailer.getOwnerName());
                    response.put("ownerEmail", retailer.getOwnerEmail());
                    response.put("profileImage", retailerService.getRetailerImage(id));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<Retailer> createRetailer(@RequestBody Retailer retailer) {
        Retailer savedRetailer = retailerService.createRetailer(retailer);
        return new ResponseEntity<>(savedRetailer, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Retailer> updateRetailer(@PathVariable Integer id, @RequestBody Map<String, Object> payload) {
        try {
            Retailer details = new Retailer();
            details.setOwnerName((String) payload.get("ownerName"));
            details.setOwnerEmail((String) payload.get("ownerEmail"));
            details.setOwnerPassword((String) payload.get("ownerPassword"));

            String profileImage = (String) payload.get("profileImage");

            Retailer updatedRetailer = retailerService.updateRetailer(id, details, profileImage);
            return ResponseEntity.ok(updatedRetailer);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRetailer(@PathVariable Integer id) {
        try {
            retailerService.deleteRetailer(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}