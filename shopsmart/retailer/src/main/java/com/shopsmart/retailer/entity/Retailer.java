package com.shopsmart.retailer.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "retailer")
@Data
public class Retailer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "owner_id")
    private Integer ownerId;

    @Column(name = "owner_name", nullable = false, length = 50)
    private String ownerName;

    @Column(name = "owner_email", nullable = false, unique = true, length = 100)
    private String ownerEmail;

    @Column(name = "owner_password", nullable = false)
    private String ownerPassword;
}