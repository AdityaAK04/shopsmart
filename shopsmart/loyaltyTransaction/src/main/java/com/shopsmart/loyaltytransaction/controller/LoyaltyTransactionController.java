package com.shopsmart.loyaltytransaction.controller;

import com.shopsmart.loyaltytransaction.entity.LoyaltyTransaction;
import com.shopsmart.loyaltytransaction.entity.RedeemVoucher;
import com.shopsmart.loyaltytransaction.service.LoyaltyTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shopsmart/loyaltyTransaction")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoyaltyTransactionController {

    private final LoyaltyTransactionService transactionService;

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<LoyaltyTransaction>> getTransactions(@PathVariable Integer customerId) {
        return ResponseEntity.ok(transactionService.getTransactionsByCustomer(customerId));
    }

    @GetMapping("/retailer/vouchers")
    public ResponseEntity<List<RedeemVoucher>> getAllRetailerVouchers() {
        return ResponseEntity.ok(transactionService.getAllRetailerVouchers());
    }

    @PostMapping
    public ResponseEntity<LoyaltyTransaction> createTransaction(@RequestBody LoyaltyTransaction transaction) {
        return ResponseEntity.ok(transactionService.logTransaction(transaction));
    }

    @GetMapping("/vouchers/customer/{customerId}")
    public ResponseEntity<List<RedeemVoucher>> getVouchers(@PathVariable Integer customerId) {
        return ResponseEntity.ok(transactionService.getVouchersByCustomer(customerId));
    }

    @PostMapping("/customer/vouchers/redeem")
    public ResponseEntity<RedeemVoucher> customerRedeemVoucher(@RequestBody RedeemRequest request) {
        RedeemVoucher voucher = transactionService.customerRedeemPointsForVoucher(
                request.customerId(),
                request.loyaltyId(),
                request.voucherId(),
                request.pointsCost()
        );
        return ResponseEntity.ok(voucher);
    }

    @PostMapping("/retailer/vouchers")
    public ResponseEntity<RedeemVoucher> retailerAddVoucher(@RequestBody RetailerVoucherRequest request) {
        RedeemVoucher voucher = transactionService.retailerCreateVoucher(
                request.ownerId(),
                request.voucherCode(),
                request.pointsCost(),
                request.expiryDays()
        );
        return ResponseEntity.ok(voucher);
    }

    // ==========================================
    // NEW: Update and Delete Endpoints for Vouchers
    // ==========================================

    @PutMapping("/retailer/vouchers/{voucherId}")
    public ResponseEntity<RedeemVoucher> retailerUpdateVoucher(
            @PathVariable Integer voucherId,
            @RequestBody RetailerVoucherRequest request) {
        RedeemVoucher updatedVoucher = transactionService.retailerUpdateVoucher(
                voucherId,
                request.ownerId(),
                request.voucherCode(),
                request.pointsCost(),
                request.expiryDays()
        );
        return ResponseEntity.ok(updatedVoucher);
    }

    @DeleteMapping("/retailer/vouchers/{voucherId}")
    public ResponseEntity<Void> retailerDeleteVoucher(@PathVariable Integer voucherId) {
        transactionService.retailerDeleteVoucher(voucherId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/retailer/vouchers/owner/{ownerId}")
    public ResponseEntity<List<RedeemVoucher>> getVouchersByRetailer(@PathVariable Integer ownerId) {
        return ResponseEntity.ok(transactionService.getVouchersByRetailer(ownerId));
    }
    @GetMapping("/vouchers/available")
    public ResponseEntity<List<RedeemVoucher>> getAllAvailableVouchers() {
        return ResponseEntity.ok(transactionService.getAllRetailerVouchers());
    }
}