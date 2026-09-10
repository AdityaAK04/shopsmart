package com.shopsmart.shop.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "shop")
@Data
public class Shop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shop_id")
    private Integer shopId;

    @Column(name = "shop_name", nullable = false, length = 100)
    private String shopName;

    @Column(name = "address", length = 255)
    private String address;

    @Column(name = "owner_id", nullable = false)
    private Integer ownerId;

    // Add this field so status can be saved to the database
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'ACTIVE'")
    private String status = "ACTIVE";
}