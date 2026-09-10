package com.shopsmart.retailer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.shopsmart.retailer.repository.mysql")
@EnableMongoRepositories(basePackages = "com.shopsmart.retailer.repository.mongo")
public class RetailerApplication {
    public static void main(String[] args) {
        SpringApplication.run(RetailerApplication.class, args);
    }
}