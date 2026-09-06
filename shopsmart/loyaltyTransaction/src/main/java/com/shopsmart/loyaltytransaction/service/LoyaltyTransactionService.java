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
                .voucherCode(voucherCode)
                .pointsCost(pointsCost)
                .status("ACTIVE")
                .expiryDate(LocalDateTime.now().plusDays(days))
                .build();

        log.info("Retailer (ID: {}) added new voucher code: {}", ownerId, voucherCode);
        return voucherRepository.save(voucher);
    }

    private void validateRetailerExists(Integer ownerId) {
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

    private void validateCustomerExists(Integer customerId) {
        try {
            String customerUrl = "http://localhost:8091/customers/" + customerId;

            // If you want to grab the token from the current incoming request context:
            String authHeader = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes())
                    .getRequest().getHeader("Authorization");

            restClient.get()
                    .uri(customerUrl)
                    .header("Authorization", authHeader) // Forward the token
                    .retrieve()
                    .toBodilessEntity();

            log.info("customer validation successful for ID: {}", customerId);
        } catch (Exception e) {
            log.error("customer validation failed for ID {}: {}", customerId, e.getMessage());
            throw new TransactionException("validation failed: customer with ID " + customerId + " does not exist.");
        }
    }

    @Transactional
    public RedeemVoucher customerRedeemPointsForVoucher(Integer customerId, Integer loyaltyId, Integer voucherId, Integer requestedPointsCost) {
        validateCustomerExists(customerId);

        RedeemVoucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new TransactionException("not found " + voucherId));

        Integer actualPointsCost = voucher.getPointsCost(); // Uses the retailer's defined cost (e.g., 200)

        String loyaltyUrl = "http://localhost:8088/shopsmart/loyalty/" + loyaltyId + "/redeem-points?points=" + actualPointsCost;
        try {
            restClient.patch()
                    .uri(loyaltyUrl)
                    .retrieve()
                    .toBodilessEntity();
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
    private void validateOrderExists(Integer orderId) {
        orderId = 1;
        log.info("order validation bypassed.{}", orderId);
    }


}