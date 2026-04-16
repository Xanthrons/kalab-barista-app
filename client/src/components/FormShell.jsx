import { motion } from "framer-motion";
import AppBackdrop from "./AppBackdrop";
import BrandHeader from "./BrandHeader";

function FormShell({ children, telegramUser, showNav = false }) {
  return (
    <AppBackdrop>
      <div className="px-4 pb-10 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="mx-auto w-full max-w-2xl"
        >
          <div className="glass-panel rounded-[32px] p-5 sm:p-7 shadow-glow">
            <BrandHeader
              compact
              showNav={showNav}
              rightSlot={
                <div className="rounded-2xl border border-coffee-accent/30 bg-coffee-bg/40 backdrop-blur-sm px-3 py-2 text-right text-xs shadow-inner-light">
                  <p className="text-coffee-accent">Telegram</p>
                  <p className="mt-1 text-coffee-text/85">
                    {telegramUser.username
                      ? `@${telegramUser.username}`
                      : "Preview mode"}
                  </p>
                </div>
              }
            />
            <div className="soft-divider my-6" />
            {children}
          </div>
        </motion.div>
      </div>
    </AppBackdrop>
  );
}

export default FormShell;
