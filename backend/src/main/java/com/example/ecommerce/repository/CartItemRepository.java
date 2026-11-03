package com.example.ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.ecommerce.entity.CartItem;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCart_IdOrderByIdAsc(String cartId);

    Optional<CartItem> findByCart_IdAndProduct_Id(String cartId, Long productId);

    void deleteByCart_Id(String cartId);

    @Query("select ci.product.id from CartItem ci where ci.cart.id = :cartId")
    List<Long> findProductIdsByCartId(@Param("cartId") String cartId);
}