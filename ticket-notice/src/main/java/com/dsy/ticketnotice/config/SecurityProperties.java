package com.dsy.ticketnotice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class SecurityProperties {

    @Value("${security.api-keys}")
    private String apiKeys;

    public List<String> getApiKeys() {
        return Arrays.asList(apiKeys.split(","));
    }
}