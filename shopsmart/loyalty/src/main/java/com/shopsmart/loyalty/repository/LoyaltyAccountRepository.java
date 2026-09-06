package com.shopsmart.loyalty.repository;

import com.shopsmart.loyalty.entity.LoyaltyAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LoyaltyAccountRepository extends JpaRepository<LoyaltyAccount, Integer> {
    Optional<LoyaltyAccount> findByCustomerId(Integer customerId);
}