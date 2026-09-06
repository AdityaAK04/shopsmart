package com.shopsmart.loyaltytransaction.controller;

public record RedeemRequest(
        Integer customerId,
        Integer loyaltyId,
        Integer voucherId,
        Integer pointsCost
) {}