package com.ecommerce.analytics.service;

import com.ecommerce.analytics.dto.ProductDTO;
import com.ecommerce.analytics.entity.Product;
import com.ecommerce.analytics.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Cacheable(value = "productMetrics", key = "'all-products'")
    public Page<ProductDTO> getAllProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findActiveProducts(pageable);
        
        return products.map(this::convertToDTO);
    }

    @Cacheable(value = "productMetrics", key = "'top-selling'")
    public List<ProductDTO> getTopSellingProducts(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Product> products = productRepository.findTopSellingProducts(pageable);
        
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getLowStockProducts(int threshold) {
        List<Product> products = productRepository.findLowStockProducts(threshold);
        
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<ProductDTO> searchProducts(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByNameContainingIgnoreCase(query, pageable);
        
        return products.map(this::convertToDTO);
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSku(product.getSku());
        dto.setPrice(product.getPrice());
        dto.setInventory(product.getInventory());
        dto.setRating(product.getRating());
        dto.setReviewCount(product.getReviewCount());
        
        if (product.getCategory() != null) {
            dto.setCategoryName(product.getCategory().getName());
        }
        
        if (product.getVendor() != null) {
            dto.setVendorName(product.getVendor().getName());
        }
        
        // Calculate additional metrics (would typically come from aggregated data)
        dto.setTotalRevenue(product.getPrice().multiply(java.math.BigDecimal.valueOf(product.getInventory())));
        dto.setUnitsSold(0); // Would be calculated from order items
        
        return dto;
    }
}