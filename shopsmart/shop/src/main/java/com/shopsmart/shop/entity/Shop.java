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
    private Integer ownerId;//this one is like tpo connect to retailer if owner id is present then only rest shop id will be executed otherwise it will cause execption
}