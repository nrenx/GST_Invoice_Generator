import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, X } from "lucide-react";
import { Profile, PROFILE_PINS } from "@/types/profile";

interface PinDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onSuccess: (profileId: string) => void;
}

export const PinDialog = ({ isOpen, onClose, profile, onSuccess }: PinDialogProps) => {
  const [pin, setPin] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [attempts, setAttempts] = useState(0);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setPin(["", "", "", ""]);
      setError("");
      // Focus first input after a short delay
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  const handleInputChange = (index: number, value: string) => {
    // Only allow single digit numbers
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullPin = newPin.join("");
      if (fullPin.length === 4) {
        verifyPin(fullPin);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    // Handle Enter - verify pin
    if (e.key === "Enter") {
      const fullPin = pin.join("");
      if (fullPin.length === 4) {
        verifyPin(fullPin);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (pastedData.length === 4) {
      const newPin = pastedData.split("");
      setPin(newPin);
      verifyPin(pastedData);
    }
  };

  const verifyPin = (enteredPin: string) => {
    if (!profile) return;

    // Get PIN from hardcoded PROFILE_PINS constant
    const correctPin = PROFILE_PINS[profile.id];

    if (!correctPin) {
      setError("No PIN configured for this profile");
      return;
    }

    if (enteredPin === correctPin) {
      setError("");
      setAttempts(0);
      onSuccess(profile.id);
      onClose();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin(["", "", "", ""]);
      inputRefs[0].current?.focus();

      if (newAttempts >= 3) {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(`Incorrect PIN. ${3 - newAttempts} attempts remaining.`);
      }
    }
  };

  const handleClose = () => {
    setPin(["", "", "", ""]);
    setError("");
    setAttempts(0);
    onClose();
  };

  if (!profile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-accent" />
          </div>
          <DialogTitle className="text-center text-xl">
            Enter PIN for {profile.name}
          </DialogTitle>
          <DialogDescription className="text-center">
            Enter your 4-digit PIN to access this profile
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* PIN Input Fields */}
          <div className="flex justify-center gap-3" onPaste={handlePaste}>
            {pin.map((digit, index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={attempts >= 3}
                className="w-14 h-14 text-center text-2xl font-bold border-2 focus:border-accent focus:ring-accent"
                autoComplete="off"
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive text-center font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Help Text */}
          <p className="mt-4 text-xs text-muted-foreground text-center">
            Contact administrator if you forgot your PIN
          </p>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleClose} className="gap-2">
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
