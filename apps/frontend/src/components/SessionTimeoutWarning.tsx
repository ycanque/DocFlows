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

// For testing: 2 minute total timeout, warning shows after 1 minute
const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 2 minutes (change to 15 * 60 * 1000 for production)
const WARNING_TIME_MS = 60 * 1000; // Show warning 1 minute before timeout

export function SessionTimeoutWarning() {
  const { logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const handleActivityRef = useRef<(() => void) | null>(null);
  const isLoggingOutRef = useRef(false);
  const showWarningRef = useRef(false);

  const resetTimeoutFn = useCallback((isUserActivity: boolean = true) => {
    // Don't reset timer if warning dialog is showing (ignore user activity on dialog)
    if (isUserActivity && showWarningRef.current) {
      return;
    }
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Hide warning if visible
    setShowWarning(false);

    // Set new warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      showWarningRef.current = true;
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

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      showWarningRef.current = false;
      setShowWarning(false);
      logout();
    }, SESSION_TIMEOUT_MS);
  }, [logout]);

  // Store the activity handler in ref to avoid adding/removing listeners repeatedly
  useEffect(() => {
    handleActivityRef.current = resetTimeoutFn;
  }, [resetTimeoutFn]);

  // Track user activity - only run once on mount
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Initialize timeout on mount (not from user activity)
    resetTimeoutFn(false);

    // Create activity handler that uses ref to get latest function
    const handleActivity = () => {
      if (handleActivityRef.current) {
        handleActivityRef.current(true); // Mark as user activity
      }
    };

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
  }, [resetTimeoutFn]);

  const handleExtendSession = () => {
    showWarningRef.current = false;
    setShowWarning(false);
    resetTimeoutFn(false); // Not user activity, but explicit action
  };

  const handleLogoutNow = (e: React.MouseEvent) => {
    // Prevent this click from being captured by activity listeners
    e.stopPropagation();
    
    // Mark that we're logging out to prevent onOpenChange from interfering
    isLoggingOutRef.current = true;
    showWarningRef.current = false;
    
    // Clear all timeouts before logout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    // Close dialog and logout
    setShowWarning(false);
    logout();
  };

  const handleDialogOpenChange = (open: boolean) => {
    // When closing the dialog (e.g., via X button or ESC), extend session instead of closing
    if (!open && !isLoggingOutRef.current) {
      handleExtendSession();
      return;
    }
    isLoggingOutRef.current = false;
    setShowWarning(open);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showWarning} onOpenChange={handleDialogOpenChange}>
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
            onClick={handleLogoutNow}
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
