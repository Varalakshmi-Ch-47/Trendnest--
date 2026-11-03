package com.example.ecommerce.dto;

import java.math.BigDecimal;

import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;

public record CartItemResponse(
        Long productId,
        String name,
        String imageUrl,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal subtotal,
        Integer availableStock
) {

    public static CartItemResponse from(CartItem item) {
        Product product = item.getProduct();
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
        return new CartItemResponse(
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getPrice(),
                item.getQuantity(),
                subtotal,
                product.getStockQuantity()
        );
    }
}