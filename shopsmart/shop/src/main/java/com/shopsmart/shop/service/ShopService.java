package com.shopsmart.shop.service;

import com.shopsmart.shop.entity.Shop;
import com.shopsmart.shop.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ShopService {

    private static final Logger log = LoggerFactory.getLogger(ShopService.class);

    @Autowired
    private ShopRepository shopRepository;

    public List<Shop> getAllShops() {
        log.info("Fetching all shops");
        return shopRepository.findAll();
    }

    public Optional<Shop> getShopById(Integer id) {
        log.info("Fetching shop by ID: {}", id);
        return shopRepository.findById(id);
    }

    public List<Shop> getShopsByOwnerId(Integer ownerId) {
        log.info("all shops belonging to owner_id: {}", ownerId);
        List<Shop> shops = shopRepository.findByOwnerId(ownerId);
        log.info("Found {} shop(s) for owner_id: {}", shops.size(), ownerId);
        return shops;
    }

    public Shop createShop(Shop shop) {
        log.info("create shop '{}' tied to owner_id {}", shop.getShopName(), shop.getOwnerId());
        //check for id owner exists
        validateRetailerExists(shop.getOwnerId());

        Shop savedShop = shopRepository.save(shop);
        log.info("shop ID {} linked to owner_id {}", savedShop.getShopId(), savedShop.getOwnerId());
        return savedShop;
    }

    public Shop updateShop(Integer id, Shop shopDetails) {
        log.info("update shop ID: {}", id);
        Shop shop = shopRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shop not found " + id));

        //check for id owner exists
        validateRetailerExists(shopDetails.getOwnerId());

        shop.setShopName(shopDetails.getShopName());
        shop.setAddress(shopDetails.getAddress());
        shop.setOwnerId(shopDetails.getOwnerId());

        Shop updatedShop = shopRepository.save(shop);
        log.info("updated shop ID: {}", id);
        return updatedShop;
    }

    public void deleteShop(Integer id) {
        log.info("Deleting shop ID: {}", id);
        shopRepository.deleteById(id);
    }

    // Helper method to check if the retailer exists via port 8080
    private void validateRetailerExists(Integer ownerId) {
        RestClient restClient = RestClient.create();
        try {
            String retailerServiceUrl = "http://localhost:8080/shopsmart/retailer/"+ ownerId;
            restClient.get()
                    .uri(retailerServiceUrl)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("failed for ID {}: {}", ownerId, e.getMessage());
            throw new RuntimeException("Retailer id" + ownerId + " does not exist.");
        }
    }

    // Inter-service call to Retailer Service (Port 8080) for debugging & verification
    public Map<String, Object> getShopWithRetailerDetails(Integer shopId) {
        log.info("shop with ID: {} to cross-reference with Retailer Service", shopId);

        Shop shop = shopRepository.findById(shopId)
                .orElseThrow(() -> new RuntimeException("Shop not found" + shopId));

        RestClient restClient = RestClient.create();
        try {
            String retailerServiceUrl = "http://localhost:8080/shopsmart/retailer/" + shop.getOwnerId();

            Map retailerDetails = restClient.get()
                    .uri(retailerServiceUrl)
                    .retrieve()
                    .body(Map.class);

            return Map.of(
                    "shopId", shop.getShopId(),
                    "shopName", shop.getShopName(),
                    "address", shop.getAddress(),
                    "retailerOwnerInfo", retailerDetails
            );

        } catch (Exception e) {
            log.error("failed to fetch retailer info from port 8080: {}", e.getMessage());
            return Map.of(
                    "shopId", shop.getShopId(),
                    "shopName", shop.getShopName(),
                    "address", shop.getAddress(),
                    "retailerOwnerInfo", "owner not found"
            );
        }
    }
}
