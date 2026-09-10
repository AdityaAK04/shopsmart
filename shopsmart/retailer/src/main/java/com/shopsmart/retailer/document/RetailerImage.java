package com.shopsmart.retailer.document;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "retailer_images")
public class RetailerImage {

    @Id
    private Integer ownerId; // Maps to SQL ownerId primary key
    private String profileImage; // Stores Base64 string

    public RetailerImage() {}

    public RetailerImage(Integer ownerId, String profileImage) {
        this.ownerId = ownerId;
        this.profileImage = profileImage;
    }

    public Integer getOwnerId() { return ownerId; }
    public void setOwnerId(Integer ownerId) { this.ownerId = ownerId; }

    public String getProfileImage() { return profileImage; }
    public void setProfileImage(String profileImage) { this.profileImage = profileImage; }
}