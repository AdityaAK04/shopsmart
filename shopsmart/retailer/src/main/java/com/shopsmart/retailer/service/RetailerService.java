package com.shopsmart.retailer.service;

import com.shopsmart.retailer.document.RetailerImage;
import com.shopsmart.retailer.entity.Retailer;
import com.shopsmart.retailer.repository.mongo.RetailerImageRepository;
import com.shopsmart.retailer.repository.mysql.RetailerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RetailerService {

    @Autowired
    private RetailerRepository retailerRepository;

    @Autowired
    private RetailerImageRepository retailerImageRepository;

    public List<Retailer> getAllRetailers() {
        return retailerRepository.findAll();
    }

    public Optional<Retailer> getRetailerById(Integer id) {
        return retailerRepository.findById(id);
    }

    public Retailer createRetailer(Retailer retailer) {
        return retailerRepository.save(retailer);
    }

    public Retailer updateRetailer(Integer id, Retailer retailerDetails, String profileImage) {
        Retailer retailer = retailerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Retailer not found " + id));

        retailer.setOwnerName(retailerDetails.getOwnerName());
        retailer.setOwnerEmail(retailerDetails.getOwnerEmail());
        retailer.setOwnerPassword(retailerDetails.getOwnerPassword());
        Retailer updated = retailerRepository.save(retailer);

        if (profileImage != null) {
            retailerImageRepository.save(new RetailerImage(id, profileImage));
        }

        return updated;
    }

    public String getRetailerImage(Integer id) {
        return retailerImageRepository.findById(id)
                .map(RetailerImage::getProfileImage)
                .orElse(null);
    }

    public void deleteRetailer(Integer id) {
        retailerRepository.deleteById(id);
        retailerImageRepository.deleteById(id);
    }
}