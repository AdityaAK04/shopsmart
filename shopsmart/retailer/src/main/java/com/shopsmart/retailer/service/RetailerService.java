package com.shopsmart.retailer.service;

import com.shopsmart.retailer.entity.Retailer;
import com.shopsmart.retailer.repository.RetailerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RetailerService {

    @Autowired
    private RetailerRepository retailerRepository;

    public List<Retailer> getAllRetailers() {
        return retailerRepository.findAll();
    }

    public Optional<Retailer> getRetailerById(Integer id) {
        return retailerRepository.findById(id);
    }

    public Retailer createRetailer(Retailer retailer) {
        return retailerRepository.save(retailer);
    }

    public Retailer updateRetailer(Integer id, Retailer retailerDetails) {
        Retailer retailer = retailerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retailer not found " + id));
        retailer.setOwnerName(retailerDetails.getOwnerName());
        retailer.setOwnerEmail(retailerDetails.getOwnerEmail());
        retailer.setOwnerPassword(retailerDetails.getOwnerPassword());
        return retailerRepository.save(retailer);
    }

    public void deleteRetailer(Integer id) {
        retailerRepository.deleteById(id);
    }
}