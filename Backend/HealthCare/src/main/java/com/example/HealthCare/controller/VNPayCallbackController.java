package com.example.HealthCare.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.example.HealthCare.service.vnpay.VNPayService;

@Controller
public class VNPayCallbackController {

    private final VNPayService vnPayService;

    @Autowired
    public VNPayCallbackController(VNPayService vnPayService) {
        this.vnPayService = vnPayService;
    }

    // VNPay often redirects to root /vnpay-payment; accept that path and delegate to service
    @GetMapping("/vnpay-payment")
    public String handleVnPayCallback(HttpServletRequest request, Model model) {
        int paymentStatus = vnPayService.orderReturn(request);

        String orderInfo = request.getParameter("vnp_OrderInfo");
        String paymentTime = request.getParameter("vnp_PayDate");
        String transactionId = request.getParameter("vnp_TransactionNo");
        String totalPrice = request.getParameter("vnp_Amount");

        model.addAttribute("orderId", orderInfo);
        model.addAttribute("totalPrice", totalPrice);
        model.addAttribute("paymentTime", paymentTime);
        model.addAttribute("transactionId", transactionId);

        // Redirect back to a public frontend page with payment status so frontend can show a message
        String frontendBase = "http://localhost:3000/payment-result"; // public page that shows payment outcome
        try {
            String encodedOrder = java.net.URLEncoder.encode(orderInfo == null ? "" : orderInfo, java.nio.charset.StandardCharsets.UTF_8.toString());
            String redirectUrl = frontendBase + (paymentStatus == 1 ?
                ("?payment=success&orderInfo=" + encodedOrder) : ("?payment=fail&orderInfo=" + encodedOrder));
            return "redirect:" + redirectUrl;
        } catch (Exception ex) {
            // Fallback to rendering local view if encoding fails
            return paymentStatus == 1 ? "ordersuccess" : "orderfail";
        }
    }
}
