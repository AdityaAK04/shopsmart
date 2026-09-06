package com.shopsmart.loyalty.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "loyaltyAccount")
public class LoyaltyAccount {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "loyalty_id")
    private Integer loyaltyId;

    @Column(name = "customer_id", nullable = false, unique = true)
    private Integer customerId;

    @Column(name = "points_avail")
    private Integer pointsAvail = 0;

    @Column(name = "points_redeemed")
    private Integer pointsRedeemed = 0;

    @Column(name = "tier", length = 50)
    private String tier = "Bronze";

    @Column(name = "points_history", length = 1000)
    private String pointsHistory;

}