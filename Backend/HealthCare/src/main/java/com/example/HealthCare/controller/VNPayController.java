package com.example.HealthCare.controller;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMethod;

import com.example.HealthCare.service.vnpay.VNPayService;
@RequestMapping("/api/v1/vnpay")
@Controller
public class VNPayController {
    @Autowired
    private VNPayService vnPayService;


    @GetMapping("")
    public String home(){
        return "index";
    }

    @RequestMapping(value = "/submitOrder", method = {RequestMethod.GET, RequestMethod.POST})
    public String submidOrder(@RequestParam("orderTotal") int orderTotal,
                            @RequestParam("orderInfo") String orderInfo,
                            HttpServletRequest request){
        try {
            String baseUrl = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
            String vnpayUrl = vnPayService.createOrder(orderTotal, orderInfo, baseUrl);
            return "redirect:" + vnpayUrl;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error creating order: " + e.getMessage());
        }
    }



    @GetMapping("/vnpay-payment")
    public String GetMapping(HttpServletRequest request, Model model){
        int paymentStatus = vnPayService.orderReturn(request);

        String orderInfo = request.getParameter("vnp_OrderInfo");
        String paymentTime = request.getParameter("vnp_PayDate");
        String transactionId = request.getParameter("vnp_TransactionNo");
        String totalPrice = request.getParameter("vnp_Amount");
        String txnRef = request.getParameter("vnp_TxnRef");

        model.addAttribute("orderId", orderInfo);
        model.addAttribute("totalPrice", totalPrice);
        model.addAttribute("paymentTime", paymentTime);
        model.addAttribute("transactionId", transactionId);


        String frontendBase = "http://localhost:3000/payment-result"; 
        try {
            String encodedOrder = java.net.URLEncoder.encode(orderInfo == null ? "" : orderInfo, java.nio.charset.StandardCharsets.UTF_8.toString());
            String encodedTxnId = java.net.URLEncoder.encode(transactionId == null ? "" : transactionId, java.nio.charset.StandardCharsets.UTF_8.toString());
            String encodedTxnRef = java.net.URLEncoder.encode(txnRef == null ? "" : txnRef, java.nio.charset.StandardCharsets.UTF_8.toString());
            String encodedPayDate = java.net.URLEncoder.encode(paymentTime == null ? "" : paymentTime, java.nio.charset.StandardCharsets.UTF_8.toString());
            String encodedAmount = java.net.URLEncoder.encode(totalPrice == null ? "" : totalPrice, java.nio.charset.StandardCharsets.UTF_8.toString());

            String redirectUrl = frontendBase + (paymentStatus == 1 ? 
                ("?payment=success&orderInfo=" + encodedOrder + "&vnp_TransactionNo=" + encodedTxnId + "&vnp_TxnRef=" + encodedTxnRef + "&vnp_PayDate=" + encodedPayDate + "&vnp_Amount=" + encodedAmount)
                : ("?payment=fail&orderInfo=" + encodedOrder));
            return "redirect:" + redirectUrl;
        } catch (Exception ex) {
            // Fallback to rendering local view if encoding fails
            return paymentStatus == 1 ? "ordersuccess" : "orderfail";
        }
    }
}