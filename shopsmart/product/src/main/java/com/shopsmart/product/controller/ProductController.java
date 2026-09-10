package com.shopsmart.product.controller;

import com.shopsmart.product.entity.Product;
import com.shopsmart.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/shopsmart/product")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }
    // --1
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Integer id) {
        Product product = productService.getProductById(id)
                .orElseThrow(() -> new RuntimeException("Product not found " + id));
        return ResponseEntity.ok(product);
    }
    // --2
    @GetMapping("/shop/{shopId}")
    public List<Product> getProductsByShopId(@PathVariable Integer shopId) {
        return productService.getProductsByShopId(shopId);
    }
    // --3
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productService.createProduct(product);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }
    // --4
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Integer id, @RequestBody Product productDetails) {
        Product updatedProduct = productService.updateProduct(id, productDetails);
        return ResponseEntity.ok(updatedProduct);
    }
    // --5
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Integer id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
    // --6
    @PatchMapping("/{id}/use-stock")
    public ResponseEntity<Product> useStock(
            @PathVariable Integer id,
            @RequestParam Integer quantity) {
        Product updatedProduct = productService.useStock(id, quantity);
        return ResponseEntity.ok(updatedProduct);
    }
    // --7
    @PatchMapping("/{id}/add-stock")
    public ResponseEntity<Product> addStock(
            @PathVariable Integer id,
            @RequestParam Integer quantity) {
        Product updatedProduct = productService.addStock(id, quantity);
        return ResponseEntity.ok(updatedProduct);
    }
    // --8
    @GetMapping("/{id}/final-price")
    public ResponseEntity<Map<String, Object>> getFinalDiscountPrice(@PathVariable Integer id) {
        Map<String, Object> priceDetails = productService.getFinalDiscountPrice(id);
        return ResponseEntity.ok(priceDetails);
    }
}