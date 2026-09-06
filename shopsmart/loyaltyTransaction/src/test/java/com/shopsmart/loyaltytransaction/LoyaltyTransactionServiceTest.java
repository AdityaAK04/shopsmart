package com.shopsmart.loyaltytransaction;
import com.shopsmart.loyaltytransaction.entity.LoyaltyTransaction;
import com.shopsmart.loyaltytransaction.repository.LoyaltyTransactionRepository;
import com.shopsmart.loyaltytransaction.repository.RedeemVoucherRepository;
import com.shopsmart.loyaltytransaction.service.LoyaltyTransactionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LoyaltyTransactionServiceTest {

    @Mock
    private LoyaltyTransactionRepository transactionRepository;

    @Mock
    private RedeemVoucherRepository voucherRepository;

    @InjectMocks
    private LoyaltyTransactionService transactionService;

    @Test
    void testGetTransactionsByCustomer() {
        LoyaltyTransaction tx = new LoyaltyTransaction(1, 10, 100, "EARNED", 50, "Order reward", null);
        when(transactionRepository.findByCustomerId(10)).thenReturn(List.of(tx));

        List<LoyaltyTransaction> result = transactionService.getTransactionsByCustomer(10);
        assertEquals(1, result.size());
        assertEquals("EARNED", result.get(0).getTransactionType());
        assertEquals(50, result.get(0).getPoints());
    }
}