package com.dsy.ticketnotice.model;

public class EmailParam {

    private String addr;
    private String title;
    private String content;

    public EmailParam(String addr, String title, String content) {
        this.addr = addr;
        this.title = title;
        this.content = content;
    }

    // Getters and Setters
    public String getAddr() {
        return addr;
    }
    public void setAddr(String addr) {
        this.addr = addr;
    }   

    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }
    public String getContent() {
        return content;
    }
    

}
