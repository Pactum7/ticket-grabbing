package com.dsy.ticketnotice.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dsy.ticketnotice.service.EmailService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.dsy.ticketnotice.model.EmailParam;
import com.dsy.ticketnotice.model.ResultModel;

@RequestMapping("/notice")
@RestController
public class NoticeController {

    @Autowired
    private EmailService emailService;

    @PostMapping("/email")
    public ResultModel email(@RequestBody EmailParam emailParam) {
        emailService.sendSimpleMessage(emailParam.getAddr(), emailParam.getTitle(), emailParam.getContent());
        return ResultModel.asSuccess();
    }
    
    
    @GetMapping("/errorTest")
    public ResultModel errorTest() {
        int a = 1 / 0;
        return ResultModel.asSuccess();
    }

}
