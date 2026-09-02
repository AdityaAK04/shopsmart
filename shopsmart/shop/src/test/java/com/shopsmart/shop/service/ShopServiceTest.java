package com.shopsmart.shop.service;

import com.shopsmart.shop.entity.Shop;
import com.shopsmart.shop.repository.ShopRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ShopServiceTest {

    @Mock
    private ShopRepository shopRepository;

    @InjectMocks
    private ShopService shopService;

    private Shop testShop;

    @BeforeEach
    void setUp() {
        testShop = new Shop();
        testShop.setShopId(1);
        testShop.setShopName("updated metro");
        testShop.setAddress("bangalore");
        testShop.setOwnerId(1);
    }

    @Test
    void testGetShopById_Success() {
        // Arrange
        when(shopRepository.findById(1)).thenReturn(Optional.of(testShop));

        // Act
        Optional<Shop> found = shopService.getShopById(1);

        // Assert
        assertTrue(found.isPresent());
        assertEquals("updated metro", found.get().getShopName());
        verify(shopRepository, times(1)).findById(1);
    }
}