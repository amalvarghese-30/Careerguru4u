// components/features/LoginGate.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, ArrowRight } from "lucide-react";
import { LoginModal } from "@/components/ui/LoginModal";

interface LoginGateProps {
    children: React.ReactNode;
    isLocked: boolean;
    message?: string;
    onUnlock?: () => void;
}

export function LoginGate({ children, isLocked, message, onUnlock }: LoginGateProps) {
    const [showModal, setShowModal] = useState(false);

    if (!isLocked) {
        return <>{children}</>;
    }

    return (
        <>
            <div className="relative">
                <div className="blur-md pointer-events-none">
                    {children}
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl"
                >
                    <div className="text-center p-6 max-w-sm">
                        <div className="h-14 w-14 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-7 w-7 text-primary-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Unlock Full Access</h3>
                        <p className="text-slate-500 text-sm mb-4">
                            {message || "You've viewed your 2 free solutions. Login to access unlimited solutions - completely FREE!"}
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all"
                        >
                            Login to Continue <Sparkles className="h-4 w-4" />
                        </button>
                        <p className="text-xs text-slate-400 mt-3">
                            First 2 solutions free per chapter. Login required after that.
                        </p>
                    </div>
                </motion.div>
            </div>

            <LoginModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onLogin={onUnlock}
            />
        </>
    );
}