'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME_MS = 60 * 1000; // Show warning 1 minute before timeout (at 14 minutes)

export function SessionTimeoutWarning() {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Hide warning if visible
    setShowWarning(false);

    // Set new warning timeout (show warning at 14 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeRemaining(60); // 1 minute remaining

      // Start countdown
      countdownIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT_MS - WARNING_TIME_MS);

    // Set logout timeout (15 minutes)
    timeoutRef.current = setTimeout(() => {
      setShowWarning(false);
      logout();
    }, SESSION_TIMEOUT_MS);
  }, [logout]);

  // Reset timeout on user activity
  const handleActivity = useCallback(() => {
    resetTimeout();
  }, [resetTimeout]);

  // Track user activity
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Initialize timeout on mount
    const initTimer = () => {
      // Clear existing timeouts
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      // Set new warning timeout (show warning at 14 minutes)
      warningTimeoutRef.current = setTimeout(() => {
        setShowWarning(true);
        setTimeRemaining(60); // 1 minute remaining

        // Start countdown
        countdownIntervalRef.current = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, SESSION_TIMEOUT_MS - WARNING_TIME_MS);

      // Set logout timeout (15 minutes)
      timeoutRef.current = setTimeout(() => {
        setShowWarning(false);
        logout();
      }, SESSION_TIMEOUT_MS);
    };

    initTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [handleActivity, logout]);

  const handleExtendSession = () => {
    setShowWarning(false);
    resetTimeout();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <DialogTitle>Session Timeout Warning</DialogTitle>
          </div>
          <DialogDescription className="mt-2">
            Your session will expire due to inactivity. You will be logged out in{' '}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {formatTime(timeRemaining)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowWarning(false);
              logout();
            }}
          >
            Logout Now
          </Button>
          <Button onClick={handleExtendSession}>
            Continue Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
