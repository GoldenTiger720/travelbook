import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, User, Mail, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TermsAcceptanceInfo {
  email?: string | null;
  ip?: string | null;
  name?: string | null;
  date?: string | null;
  accepted: boolean;
}

interface TermsAcceptanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  acceptanceInfo: TermsAcceptanceInfo | null;
}

export const TermsAcceptanceDialog: React.FC<TermsAcceptanceDialogProps> = ({
  open,
  onOpenChange,
  acceptanceInfo
}) => {
  const hasAccepted = acceptanceInfo?.accepted === true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasAccepted ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Terms Accepted
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-500" />
                Terms Not Accepted
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {hasAccepted && acceptanceInfo ? (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-3">
                  Customer Acceptance Information
                </p>

                <div className="space-y-3">
                  {/* Name */}
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="text-sm font-medium text-gray-900">
                        {acceptanceInfo.name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">
                        {acceptanceInfo.email || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {/* IP Address */}
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">IP Address</p>
                      <p className="text-sm font-medium text-gray-900">
                        {acceptanceInfo.ip || 'Not captured'}
                      </p>
                    </div>
                  </div>

                  {/* Acceptance Date */}
                  <div className="flex items-start gap-3">
                    <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Accepted On</p>
                      <p className="text-sm font-medium text-gray-900">
                        {acceptanceInfo.date
                          ? format(new Date(acceptanceInfo.date), 'PPpp')
                          : 'Date not recorded'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 pt-3 border-t border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Status</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accepted
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <XCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Terms Not Yet Accepted
                  </h3>
                  <p className="text-sm text-red-700 mt-2">
                    The customer has not yet accepted the terms and conditions for this reservation.
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Please ensure the customer reviews and accepts the terms before proceeding.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};