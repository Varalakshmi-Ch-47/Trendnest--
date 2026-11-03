package com.example.ecommerce.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ecommerce.dto.AddToCartRequest;
import com.example.ecommerce.dto.CartItemResponse;
import com.example.ecommerce.dto.CartResponse;
import com.example.ecommerce.dto.UpdateCartItemRequest;
import com.example.ecommerce.entity.Cart;
import com.example.ecommerce.entity.CartItem;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.CartRepository;
import com.example.ecommerce.repository.ProductRepository;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartService(CartRepository cartRepository,
                       CartItemRepository cartItemRepository,
                       ProductRepository productRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(String cartId) {
        String id = normalizeCartId(cartId);
        return buildResponse(id);
    }

    @Transactional
    public CartResponse addItem(String cartId, AddToCartRequest request) {
        String id = normalizeCartId(cartId);

        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + request.productId()));

        Cart cart = cartRepository.findById(id)
                .orElseGet(() -> cartRepository.save(new Cart(id)));

        CartItem item = cartItemRepository.findByCart_IdAndProduct_Id(id, product.getId())
                .orElse(null);

        int currentQuantity = (item == null) ? 0 : item.getQuantity();
        int newQuantity = currentQuantity + request.quantity();
        checkStock(product, newQuantity);

        if (item == null) {
            cartItemRepository.save(new CartItem(cart, product, newQuantity));
        } else {
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        }
        return buildResponse(id);
    }

    @Transactional
    public CartResponse updateItem(String cartId, Long productId, UpdateCartItemRequest request) {
        String id = normalizeCartId(cartId);
        CartItem item = findItemOrThrow(id, productId);
        checkStock(item.getProduct(), request.quantity());
        item.setQuantity(request.quantity());
        cartItemRepository.save(item);
        return buildResponse(id);
    }

    @Transactional
    public CartResponse removeItem(String cartId, Long productId) {
        String id = normalizeCartId(cartId);
        CartItem item = findItemOrThrow(id, productId);
        cartItemRepository.delete(item);
        cartItemRepository.flush();
        return buildResponse(id);
    }

    @Transactional
    public CartResponse clearCart(String cartId) {
        String id = normalizeCartId(cartId);
        cartItemRepository.deleteByCart_Id(id);
        cartItemRepository.flush();
        return buildResponse(id);
    }

    private CartItem findItemOrThrow(String cartId, Long productId) {
        return cartItemRepository.findByCart_IdAndProduct_Id(cartId, productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product " + productId + " is not in the cart"));
    }

    private void checkStock(Product product, int requestedQuantity) {
        if (requestedQuantity > product.getStockQuantity()) {
            throw new InsufficientStockException(
                    "Only " + product.getStockQuantity() + " unit(s) of '"
                            + product.getName() + "' are available");
        }
    }

    static String normalizeCartId(String cartId) {
        if (cartId == null || cartId.isBlank()) {
            throw new BadRequestException("Cart id is required");
        }
        try {
            return UUID.fromString(cartId.trim()).toString();
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Cart id must be a valid UUID");
        }
    }

    private CartResponse buildResponse(String cartId) {
        List<CartItemResponse> items = cartItemRepository.findByCart_IdOrderByIdAsc(cartId).stream()
                .map(CartItemResponse::from)
                .toList();

        int totalQuantity = items.stream()
                .mapToInt(CartItemResponse::quantity)
                .sum();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(cartId, items, totalQuantity, totalAmount);
    }
}