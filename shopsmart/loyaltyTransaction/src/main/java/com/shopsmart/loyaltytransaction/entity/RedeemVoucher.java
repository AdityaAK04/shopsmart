package com.shopsmart.loyaltytransaction.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "redeemVoucher")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RedeemVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voucher_id")
    private Integer voucherId;

    @Column(name = "customer_id")
    private Integer customerId;

    @Column(name = "loyalty_id")
    private Integer loyaltyId;

    @Column(name = "voucher_code", nullable = false, unique = true)
    private String voucherCode;

    @Column(name = "points_cost", nullable = false)
    private Integer pointsCost;

    @Column(name = "status")
    private String status;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}