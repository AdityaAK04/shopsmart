package com.shopsmart.loyaltytransaction.controller;
//mistake make it to public
public record RetailerVoucherRequest(
        Integer ownerId,
        String voucherCode,
        Integer pointsCost,
        Integer expiryDays
) {}
