package com.dsy.ticketnotice.model;

import org.springframework.http.HttpStatus;

public class ResultModel {
    private int statusCode;
    private String message;
    private String details;

    public ResultModel(int statusCode, String message, String details) {
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
    }

    // Getters and Setters
    public int getStatusCode() {
        return statusCode;
    }

    public void setStatusCode(int statusCode) {
        this.statusCode = statusCode;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
    
    public static ResultModel asSuccess(){
        return new ResultModel(HttpStatus.OK.value(), "success", null);
    }
}
