// components/ui/WhatsAppButton.tsx - Keep as is, it uses MessageCircle from lucide-react which works
"use client";

import { MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

export function WhatsAppButton() {
    const whatsappNumber = "919326678309";
    const message = encodeURIComponent("Hi! I need career guidance from Career Guru.");

    return (
        <motion.a
            href={`https://wa.me/${whatsappNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, type: "spring" }}
            aria-label="Chat with us on WhatsApp"
            className="fixed bottom-24 right-4 z-50 md:bottom-6 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all hover:scale-110"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
        >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-300 rounded-full animate-pulse" />
        </motion.a>
    );
}