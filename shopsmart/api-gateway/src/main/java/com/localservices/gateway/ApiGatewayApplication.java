package com.localservices.gateway;
//localservices
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }

    @Bean
    public RouteLocator gatewayRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("retailer", r -> r.path("/shopsmart/retailer/**")
                        .uri("http://localhost:8080"))

                .route("shop", r -> r.path("/shopsmart/shop/**")
                        .uri("http://localhost:8081"))

                .route("product", r -> r.path("/shopsmart/product/**")
                        .uri("http://localhost:8082"))

                .route("customerService", r -> r.path("/customers/**")
                        .uri("http://localhost:8091"))//needs auth

                .route("loyaltyAcc", r -> r.path("/shopsmart/loyalty/**")
                        .uri("http://localhost:8088"))

                .route("loyaltyTransaction", r -> r.path("/shopsmart/loyaltyTransaction/**")
                        .uri("http://localhost:8089"))
                .build();
    }
}