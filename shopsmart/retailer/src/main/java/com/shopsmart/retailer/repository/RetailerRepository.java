package com.shopsmart.retailer.repository;

import com.shopsmart.retailer.entity.Retailer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RetailerRepository extends JpaRepository<Retailer, Integer> {
}