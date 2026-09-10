package com.shopsmart.retailer.repository.mongo;

import com.shopsmart.retailer.document.RetailerImage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RetailerImageRepository extends MongoRepository<RetailerImage, Integer> {
}