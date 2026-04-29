// src/components/UpgradeModal.jsx
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Zap, Lock } from "lucide-react";

export function UpgradeModal({ open, onClose, featureName, used, limit }) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-xl font-display">Daily Limit Reached</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm mt-1">
          You've used <span className="font-semibold text-foreground">{used}/{limit}</span> free{" "}
          {featureName} today. Upgrade to Pro for unlimited access.
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <Button
            className="w-full bg-gradient-primary text-primary-foreground"
            onClick={() => { onClose(); navigate("/pricing"); }}
          >
            <Zap className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
          <Button variant="ghost" className="w-full" onClick={onClose}>
            Maybe later
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Limit resets every day at midnight 🌙
        </p>
      </DialogContent>
    </Dialog>
  );
}