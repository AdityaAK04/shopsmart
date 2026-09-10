package com.shopsmart.loyaltytransaction.service;

import com.shopsmart.loyaltytransaction.entity.LoyaltyTransaction;
import com.shopsmart.loyaltytransaction.entity.RedeemVoucher;
import com.shopsmart.loyaltytransaction.exception.TransactionException;
import com.shopsmart.loyaltytransaction.repository.LoyaltyTransactionRepository;
import com.shopsmart.loyaltytransaction.repository.RedeemVoucherRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.time.LocalDateTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class LoyaltyTransactionService {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyTransactionService.class);

    private final LoyaltyTransactionRepository transactionRepository;
    private final RedeemVoucherRepository voucherRepository;

    // Spring Boot RestClient for inter-service HTTP calls
    private final RestClient restClient = RestClient.create();

    public List<LoyaltyTransaction> getTransactionsByCustomer(Integer customerId) {
        validateCustomerExists(customerId);
        return transactionRepository.findByCustomerId(customerId);
    }

    public LoyaltyTransaction logTransaction(LoyaltyTransaction transaction) {
        if (transaction.getCustomerId() != null) {
            validateCustomerExists(transaction.getCustomerId());
        }
        if (transaction.getOrderId() != null) {
            validateOrderExists(transaction.getOrderId());
        }

        log.info("transaction for customer ID: {}", transaction.getCustomerId());
        return transactionRepository.save(transaction);
    }

    public List<RedeemVoucher> getVouchersByCustomer(Integer customerId) {
        validateCustomerExists(customerId);
        return voucherRepository.findByCustomerId(customerId);
    }


    @Transactional
    public RedeemVoucher retailerCreateVoucher(Integer ownerId, String voucherCode, Integer pointsCost, Integer expiryDays) {
        validateRetailerExists(ownerId);

        int days = (expiryDays != null) ? expiryDays : 30;

        RedeemVoucher voucher = RedeemVoucher.builder()
                .ownerId(ownerId) // <-- ADD THIS LINE HERE
                .voucherCode(voucherCode)
                .pointsCost(pointsCost)
                .status("ACTIVE")
                .expiryDate(LocalDateTime.now().plusDays(days))
                .build();

        log.info("Retailer (ID: {}) added new voucher code: {}", ownerId, voucherCode);
        return voucherRepository.save(voucher);
    }
    @Transactional
    public RedeemVoucher retailerUpdateVoucher(Integer voucherId, Integer ownerId, String voucherCode, Integer pointsCost, Integer expiryDays) {
        // 1. Find the existing voucher or throw an exception if not found
        RedeemVoucher existingVoucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new TransactionException("Voucher not found with ID: " + voucherId));

        // 2. Validate retailer if ownerId is being updated or provided
        if (ownerId != null) {
            validateRetailerExists(ownerId);
            existingVoucher.setOwnerId(ownerId);
        }

        // 3. Update fields if provided
        if (voucherCode != null && !voucherCode.trim().isEmpty()) {
            existingVoucher.setVoucherCode(voucherCode);
        }

        if (pointsCost != null) {
            existingVoucher.setPointsCost(pointsCost);
        }

        // 4. Recalculate expiry date if expiryDays is provided
        if (expiryDays != null) {
            existingVoucher.setExpiryDate(LocalDateTime.now().plusDays(expiryDays));
        }

        log.info("Retailer updated voucher ID: {}", voucherId);
        return voucherRepository.save(existingVoucher);
    }

    public List<RedeemVoucher> getVouchersByRetailer(Integer ownerId) {
        return voucherRepository.findByOwnerId(ownerId);
    }

    @Transactional
    public void retailerDeleteVoucher(Integer voucherId) {
        // 1. Verify existence before deletion
        if (!voucherRepository.existsById(voucherId)) {
            throw new TransactionException("Cannot delete. Voucher not found with ID: " + voucherId);
        }

        // 2. Perform deletion
        voucherRepository.deleteById(voucherId);
        log.info("Deleted retailer voucher ID: {}", voucherId);
    }    private void validateRetailerExists(Integer ownerId) {
        try {
            String retailerUrl = "http://localhost:8080/shopsmart/retailer/" + ownerId;
            restClient.get()
                    .uri(retailerUrl)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Retailer validation successful for ID: {} on port 8080", ownerId);
        } catch (Exception e) {
            log.error("Retailer validation failed for ID {}: {}", ownerId, e.getMessage());
            throw new TransactionException("Validation failed: Retailer with ID " + ownerId + " does not exist on port 8080.");
        }
    }

    @Transactional
    public RedeemVoucher customerRedeemPointsForVoucher(Integer customerId, Integer loyaltyId, Integer voucherId, Integer requestedPointsCost) {
        validateCustomerExists(customerId);

        RedeemVoucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new TransactionException("not found " + voucherId));

        Integer actualPointsCost = voucher.getPointsCost();

        String loyaltyUrl = "http://localhost:8088/shopsmart/loyalty/" + loyaltyId + "/redeem-points?points=" + actualPointsCost;
        try {
            var patchRequest = restClient.patch().uri(loyaltyUrl);

            // Forward Authorization header to port 8088 if present
            String authHeader = getAuthHeaderSafe();
            if (authHeader != null && !authHeader.isEmpty()) {
                patchRequest.header("Authorization", authHeader);
            }

            patchRequest.retrieve().toBodilessEntity();
            log.info("Deducted {} points for customer ID: {}", actualPointsCost, customerId);
        } catch (Exception e) {
            throw new TransactionException("failed: " + e.getMessage());
        }

        voucher.setCustomerId(customerId);
        voucher.setLoyaltyId(loyaltyId);
        voucher.setStatus("CLAIMED");
        voucherRepository.save(voucher);

        LoyaltyTransaction tx = LoyaltyTransaction.builder()
                .customerId(customerId)
                .transactionType("REDEEMED")
                .points(actualPointsCost)
                .description("Redeemed " + actualPointsCost + " points for voucher code: " + voucher.getVoucherCode())
                .build();

        transactionRepository.save(tx);
        return voucher;
    }

    private void validateCustomerExists(Integer customerId) {
        try {
            String customerUrl = "http://localhost:8091/customers/" + customerId;

            var getRequest = restClient.get().uri(customerUrl);

            // Safely attach Authorization header if present
            String authHeader = getAuthHeaderSafe();
            if (authHeader != null && !authHeader.isEmpty()) {
                getRequest.header("Authorization", authHeader);
            }

            getRequest.retrieve().toBodilessEntity();

            log.info("customer validation successful for ID: {}", customerId);
        } catch (Exception e) {
            log.error("customer validation failed for ID {}: {}", customerId, e.getMessage());
            throw new TransactionException("validation failed: customer with ID " + customerId + " does not exist.");
        }
    }

    // Helper method to safely extract authorization header without throwing NPE
    private String getAuthHeaderSafe() {
        try {
            ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null && attrs.getRequest() != null) {
                return attrs.getRequest().getHeader("Authorization");
            }
        } catch (Exception ignored) {}
        return null;
    }

    private void validateOrderExists(Integer orderId) {
        orderId = 1;
        log.info("order validation bypassed.{}", orderId);
    }
    public List<RedeemVoucher> getAllRetailerVouchers() {
        return voucherRepository.findAll().stream()
                .filter(v -> "ACTIVE".equalsIgnoreCase(v.getStatus()))
                .toList();
    }



}