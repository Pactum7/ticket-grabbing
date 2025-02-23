package com.dsy.ticketnotice.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import com.dsy.ticketnotice.model.ResultModel;

@ControllerAdvice
public class GlobalExceptionHandler {


    // 处理所有其他未预见的异常
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex, WebRequest request) {
        ResultModel errorDetails = new ResultModel(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "系统异常",
            request.getDescription(false));
        ex.printStackTrace();
        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}