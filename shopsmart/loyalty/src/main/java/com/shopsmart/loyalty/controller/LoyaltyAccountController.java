package com.shopsmart.loyalty.controller;

import com.shopsmart.loyalty.entity.LoyaltyAccount;
import com.shopsmart.loyalty.service.LoyaltyAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shopsmart/loyalty")
@CrossOrigin(origins = "http://localhost:5173")
public class LoyaltyAccountController {

    @Autowired
    private LoyaltyAccountService service;

    @GetMapping
    public List<LoyaltyAccount> getAllAccounts() {
        return service.getAllAccounts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoyaltyAccount> getAccountById(@PathVariable Integer id) {
        LoyaltyAccount account = service.getAccountById(id)
                .orElseThrow(() -> new RuntimeException("Account not found: " + id));
        return ResponseEntity.ok(account);
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<LoyaltyAccount> getAccountByCustomerId(@PathVariable Integer customerId) {
        LoyaltyAccount account = service.getAccountByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Account not found: " + customerId));
        return ResponseEntity.ok(account);
    }

    @PostMapping
    public ResponseEntity<LoyaltyAccount> createAccount(@RequestBody LoyaltyAccount account) {
        return new ResponseEntity<>(service.createAccount(account), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/add-points")
    public ResponseEntity<LoyaltyAccount> addPoints(@PathVariable Integer id, @RequestParam Integer points) {
        return ResponseEntity.ok(service.updatePoints(id, points));
    }

    @PatchMapping("/{id}/redeem-points")
    public ResponseEntity<LoyaltyAccount> redeemPoints(@PathVariable Integer id, @RequestParam Integer points) {
        return ResponseEntity.ok(service.redeemPoints(id, points));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<String> getPointsHistory(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPointsHistory(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Integer id) {
        service.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
    //add an new exception
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleException(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @GetMapping("/{id}/points-avail")
    public ResponseEntity<Integer> getPointsAvail(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPointsAvail(id));
    }

    @GetMapping("/{id}/points-redeemed")
    public ResponseEntity<Integer> getPointsRedeemed(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getPointsRedeemed(id));
    }
    @PatchMapping("/customer/{customerId}/redeem-points")
    public ResponseEntity<LoyaltyAccount> redeemPointsByCustomer(
            @PathVariable Integer customerId,
            @RequestParam Integer points) {

        LoyaltyAccount account = service.getAccountByCustomerId(customerId)
                .orElseThrow(() -> new RuntimeException("Loyalty account not found for customer ID: " + customerId));

        // FIX: Use getLoyaltyId() since your entity field is named loyaltyId
        return ResponseEntity.ok(service.redeemPoints(account.getLoyaltyId(), points));
    }
}