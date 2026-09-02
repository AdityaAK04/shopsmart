package com.shopsmart.product.service;

import com.shopsmart.product.entity.Product;
import com.shopsmart.product.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        log.info("Fetching all products");
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(Integer id) {
        log.info("Fetching product by ID: {}", id);
        return productRepository.findById(id);
    }

    public List<Product> getProductsByShopId(Integer shopId) {
        log.info("Fetching products for shop_id: {}", shopId);
        return productRepository.findByShopId(shopId);
    }

    public Product createProduct(Product product) {
        log.info("Creating product '{}' tied to shop_id {}", product.getProductName(), product.getShopId());

        // Validate that the shop exists on Port 8081 before saving
        validateShopExists(product.getShopId());

        return productRepository.save(product);
    }

    public Product updateProduct(Integer id, Product productDetails) {
        log.info("Updating product ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found " + id));

        if (productDetails.getShopId() != null) {
            validateShopExists(productDetails.getShopId());
            product.setShopId(productDetails.getShopId());
        }

        product.setProductName(productDetails.getProductName());
        product.setDescription(productDetails.getDescription());
        product.setOriginalPrice(productDetails.getOriginalPrice());
        product.setDiscount(productDetails.getDiscount());
        product.setStockLeft(productDetails.getStockLeft());
        product.setStockUsed(productDetails.getStockUsed());
        product.setCategory(productDetails.getCategory());

        return productRepository.save(product);
    }
    public void deleteProduct(Integer id) {
        log.info("Deleting product ID: {}", id);
        productRepository.deleteById(id);
    }
    public Product addStock(Integer productId, Integer quantity) {
        log.info("Adding {} items to stock for product ID: {}", quantity, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found " + productId));
        product.setStockLeft(product.getStockLeft() + quantity);

        return productRepository.save(product);
    }
    public Product useStock(Integer productId, Integer quantity) {
        log.info("Using {} items from stock for product ID: {}", quantity, productId);

        // Check if Product ID matches/exists
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found " + productId));

        // Check if stock is 0
        if (product.getStockLeft() <= 0) {
            throw new RuntimeException("Stock is 0 for product ID " + productId + ". Cannot use items.");
        }

        // Check if there is enough stock left for the requested quantity
        if (product.getStockLeft() < quantity) {
            throw new RuntimeException("Insufficient stock. Only " + product.getStockLeft() + " item(s) left in stock.");
        }

        // Perform the stock update
        product.setStockLeft(product.getStockLeft() - quantity);
        product.setStockUsed(product.getStockUsed() + quantity);

        return productRepository.save(product);
    }
    // Inter-service call to Shop Service (Port 8081)
    public Map<String, Object> getFinalDiscountPrice(Integer productId) {
        log.info("Calculating final discounted price for product ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found " + productId));

        Double originalPrice = product.getOriginalPrice() != null ? product.getOriginalPrice() : product.getPrice();
        Double discountPercentage = product.getDiscount() != null ? product.getDiscount() : 0.00;

        // Calculate discounted price
        Double discountAmount = (originalPrice * discountPercentage) / 100.0;
        Double finalPrice = originalPrice - discountAmount;
        return Map.of(
                "productId", product.getProductId(),
                "productName", product.getProductName(),
                "originalPrice", originalPrice,
                "discountPercentage", discountPercentage + "%",
                "discountAmount", Math.round(discountAmount * 100.0) / 100.0,
                "finalPrice", Math.round(finalPrice * 100.0) / 100.0
        );
    }
    private void validateShopExists(Integer shopId) {
        RestClient restClient = RestClient.create();
        try {
            String shopServiceUrl = "http://localhost:8081/shopsmart/shop/" + shopId;
            restClient.get()
                    .uri(shopServiceUrl)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Shop validation failed for ID {}: {}", shopId, e.getMessage());
            throw new RuntimeException("Shop with ID " + shopId + " does not exist.");
        }
    }
}