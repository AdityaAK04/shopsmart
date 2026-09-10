package com.shopsmart.loyaltytransaction.repository;

import com.shopsmart.loyaltytransaction.entity.RedeemVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RedeemVoucherRepository extends JpaRepository<RedeemVoucher, Integer> {
    List<RedeemVoucher> findByCustomerId(Integer customerId);
    List<RedeemVoucher> findByLoyaltyId(Integer loyaltyId);
    List<RedeemVoucher> findByOwnerId(Integer ownerId);
    List<RedeemVoucher> findByStatus(String status);
}