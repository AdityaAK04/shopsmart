package com.shopsmart.product.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "products")
public class Product {

    // Getters and Setters
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @Setter
    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @Setter
    @Column(name = "description", length = 255)
    private String description;

    // This column in the database is treated as the ORIGINAL base price
    @Setter
    @Column(name = "price", nullable = false)
    private Double originalPrice;

    @Setter
    @Column(name = "discount")
    private Double discount = 0.00;

    @Setter
    @Column(name = "stock_left")
    private Integer stockLeft = 0;

    @Setter
    @Column(name = "stock_used")
    private Integer stockUsed = 0;

    @Setter
    @Column(name = "category", length = 50)
    private String category;

    @Setter
    @Column(name = "shop_id", nullable = false)
    private Integer shopId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void setLastUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // --- COMPUTED FIELD FOR JSON RESPONSE ---
    // @Transient means Spring Data won't try to find a column named 'price' or 'final_price' in MySQL
    @Transient
    public Double getPrice() {
        if (originalPrice == null) return 0.00;
        double currentDiscount = (discount != null) ? discount : 0.00;
        double finalVal = originalPrice - (originalPrice * currentDiscount / 100.0);
        return Math.round(finalVal * 100.0) / 100.0; // Rounds to 2 decimal places
    }

}