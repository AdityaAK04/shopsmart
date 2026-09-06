package com.shopsmart.loyalty.service;

import com.shopsmart.loyalty.entity.LoyaltyAccount;
import com.shopsmart.loyalty.repository.LoyaltyAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Optional;

@Service
public class LoyaltyAccountService {

    private static final Logger log = LoggerFactory.getLogger(LoyaltyAccountService.class);

    @Autowired
    private LoyaltyAccountRepository repository;

    public List<LoyaltyAccount> getAllAccounts() {
        return repository.findAll();
    }

    public Optional<LoyaltyAccount> getAccountById(Integer id) {
        return repository.findById(id);
    }

    public Optional<LoyaltyAccount> getAccountByCustomerId(Integer customerId) {
        return repository.findByCustomerId(customerId);
    }

    public LoyaltyAccount createAccount(LoyaltyAccount account) {
        log.info("create loyalty acc for id:{}", account.getCustomerId());
        validateCustomerExists(account.getCustomerId());
        return repository.save(account);
    }

    public LoyaltyAccount updatePoints(Integer id, Integer pointsToAdd) {
        LoyaltyAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found " + id));

        int newPointsAvail = account.getPointsAvail() + pointsToAdd;
        account.setPointsAvail(newPointsAvail);

        if (newPointsAvail > 13000) {
            account.setTier("Diamond");
        } else if (newPointsAvail > 9000) {
            account.setTier("Platinum");
        }else if (newPointsAvail > 4500) {
            account.setTier("Gold");
        } else if (newPointsAvail > 2000) {
            account.setTier("Silver");
        }

        String historyMessage = pointsToAdd + " points were added to balance.";
        if (account.getPointsHistory() == null || account.getPointsHistory().isEmpty()) {
            account.setPointsHistory(historyMessage);
        } else {
            account.setPointsHistory(account.getPointsHistory() + " | " + historyMessage);
        }

        return repository.save(account);
    }
    public void deleteAccount(Integer id) {
        repository.deleteById(id);
    }
    public Integer getPointsAvail(Integer id) {
        LoyaltyAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found" + id));
        return account.getPointsAvail();
    }

    public Integer getPointsRedeemed(Integer id) {
        LoyaltyAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException(" Account not found" + id));
        return account.getPointsRedeemed();
    }

    private void validateCustomerExists(Integer customerId) {
        RestClient restClient = RestClient.create();
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
            throw new RuntimeException("validation failed: customer with ID " + customerId + " does not exist.");
        }
    }

    public LoyaltyAccount redeemPoints(Integer id, Integer pointsToRedeem) {
        LoyaltyAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loyalty Account not found with ID: " + id));

        if (account.getPointsAvail() < pointsToRedeem) {
            throw new RuntimeException("Insufficient points available for redemption.");
        }

        // Deduct from points available
        int newPointsAvail = account.getPointsAvail() - pointsToRedeem;
        account.setPointsAvail(newPointsAvail);

        // FIX: Update points_redeemed field here
        account.setPointsRedeemed(account.getPointsRedeemed() + pointsToRedeem);

        // Append redemption message to points history
        String historyMessage = pointsToRedeem + " points were redeemed.";
        if (account.getPointsHistory() == null || account.getPointsHistory().isEmpty()) {
            account.setPointsHistory(historyMessage);
        } else {
            account.setPointsHistory(account.getPointsHistory() + " | " + historyMessage);
        }

        return repository.save(account);
    }
    public String getPointsHistory(Integer id) {
        LoyaltyAccount account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loyalty Account not found with ID: " + id));
        return account.getPointsHistory() != null ? account.getPointsHistory() : "No points history available.";
    }
}



