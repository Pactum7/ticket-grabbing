package com.dsy.ticketnotice.config;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.dsy.ticketnotice.model.ResultModel;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;



@Component
public class ApiKeyInterceptor implements HandlerInterceptor {

    private final SecurityProperties securityProperties;
    private final ObjectMapper objectMapper;

    public ApiKeyInterceptor(SecurityProperties securityProperties, ObjectMapper objectMapper) {
        this.securityProperties = securityProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String apiKey = request.getHeader("Authentication");
        if (apiKey != null && securityProperties.getApiKeys().contains(apiKey)) {
            return true;
        } else {
            ResultModel errorDetails = new ResultModel(
                HttpStatus.UNAUTHORIZED.value(),
                "Invalid Authentication",
                null);
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
            return false;
        }
    }
}