package com.shopsmart.loyaltytransaction.repository;

import com.shopsmart.loyaltytransaction.entity.LoyaltyTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, Integer> {
    List<LoyaltyTransaction> findByCustomerId(Integer customerId);
}