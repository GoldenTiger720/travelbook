import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Phone, 
  MapPin, 
  Clock, 
  Users,
  Calendar,
  User,
  Briefcase
} from "lucide-react";

interface ReservationDetail {
  id?: string;
  reservationNumber: string;
  operationDate: Date;
  pickupTime: string;
  passengerName: string;
  product: string;
  operator?: string;
  pickupAddress: string;
  paxAdl: number;
  paxChd: number;
  paxInf: number;
  contactPhone: string;
  salesperson: string;
  driver?: string;
  guideCoordinator?: string;
}

interface ReservationDetailsTableProps {
  reservations: ReservationDetail[];
  rowsPerPage?: number;
  selectedReservations?: Set<string>;
  onSelectionChange?: (reservationId: string) => void;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
}

const ReservationDetailsTable: React.FC<ReservationDetailsTableProps> = ({
  reservations,
  rowsPerPage = 5,
  selectedReservations = new Set(),
  onSelectionChange,
  onSelectAll,
  onClearSelection,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalPages = Math.ceil(reservations.length / rowsPerPage);
  
  const allSelected = reservations.length > 0 && 
    reservations.every(r => selectedReservations.has(r.id || r.reservationNumber));
  const someSelected = reservations.some(r => selectedReservations.has(r.id || r.reservationNumber));

  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return reservations.slice(startIndex, endIndex);
  }, [reservations, currentPage, rowsPerPage]);

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= Math.min(3, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > 3) {
          pages.push(-1);
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 1) {
        pages.push(1);
        pages.push(-1);
        for (let i = Math.max(totalPages - 2, 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        if (currentPage > 2) pages.push(-1);
        pages.push(currentPage);
        if (currentPage < totalPages - 1) pages.push(-1);
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleSelectAll = () => {
    if (allSelected && onClearSelection) {
      onClearSelection();
    } else if (onSelectAll) {
      onSelectAll();
    }
  };

  const handleSelectReservation = (reservation: ReservationDetail) => {
    if (onSelectionChange) {
      onSelectionChange(reservation.id || reservation.reservationNumber);
    }
  };

  if (reservations.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground">
        No reservation details available
      </div>
    );
  }

  // Mobile Card View
  if (isMobile) {
    return (
      <div className="w-full max-w-full overflow-x-hidden space-y-3">
        {/* Select All Control */}
        <div className="flex items-center justify-between px-2 py-2 bg-gray-50 rounded-lg max-w-full">
          <div className="flex items-center gap-2 min-w-0">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
              className="flex-shrink-0"
            />
            <span className="text-xs sm:text-sm font-medium truncate">Select All</span>
          </div>
          <Badge variant="secondary" className="flex-shrink-0 text-xs">
            {selectedReservations.size} selected
          </Badge>
        </div>

        {/* Reservation Cards */}
        <div className="space-y-3 overflow-x-hidden">
          {paginatedReservations.map((reservation, index) => {
            const reservationId = reservation.id || reservation.reservationNumber;
            const isSelected = selectedReservations.has(reservationId);
            
            return (
              <Card key={`${reservation.reservationNumber}-${index}`} 
                    className={`overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                <CardContent className="p-2 sm:p-4 space-y-2 overflow-x-hidden max-w-full">
                  {/* Header with checkbox and reservation number */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelectReservation(reservation)}
                        aria-label={`Select ${reservation.reservationNumber}`}
                        className="mt-1 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">
                          #{reservation.reservationNumber}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {reservation.product}
                        </p>
                      </div>
                    </div>
                    {reservation.operator && (
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {reservation.operator}
                      </Badge>
                    )}
                  </div>

                  {/* Passenger Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium truncate">{reservation.passengerName}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs">{formatDate(reservation.operationDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs">{reservation.pickupTime}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-xs line-clamp-2 break-words">{reservation.pickupAddress}</span>
                    </div>

                    {reservation.contactPhone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-xs break-all">{reservation.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {/* Passengers Count */}
                  <div className="flex items-center gap-4 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="flex gap-3 text-sm">
                        <span className="font-medium">Adults: {reservation.paxAdl}</span>
                        {reservation.paxChd > 0 && (
                          <span className="font-medium">Children: {reservation.paxChd}</span>
                        )}
                        {reservation.paxInf > 0 && (
                          <span className="font-medium">Infants: {reservation.paxInf}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Staff Info */}
                  {(reservation.driver || reservation.guideCoordinator || reservation.salesperson) && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {reservation.salesperson && (
                        <Badge variant="secondary" className="text-xs">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {reservation.salesperson}
                        </Badge>
                      )}
                      {reservation.driver && (
                        <Badge variant="secondary" className="text-xs">
                          Driver: {reservation.driver}
                        </Badge>
                      )}
                      {reservation.guideCoordinator && (
                        <Badge variant="secondary" className="text-xs">
                          Guide: {reservation.guideCoordinator}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({reservations.length} total)
            </div>
            
            <div className="flex items-center justify-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => {
                  if (page === -1) {
                    return (
                      <span key={`ellipsis-${index}`} className="px-1 text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageClick(page)}
                      className="h-9 min-w-9 px-2 text-sm"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop Table View
  return (
    <div className="w-full max-w-full space-y-4 overflow-x-hidden">
      <div className="w-[900px] max-w-full overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Reservation Number</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Operation Date</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Pickup Time</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Passenger Name</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Product</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Operator</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Pickup Address</TableHead>
              <TableHead className="whitespace-nowrap font-semibold text-center">PAX ADL</TableHead>
              <TableHead className="whitespace-nowrap font-semibold text-center">PAX CHD</TableHead>
              <TableHead className="whitespace-nowrap font-semibold text-center">PAX INF</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Contact Phone</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Salesperson</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Driver</TableHead>
              <TableHead className="whitespace-nowrap font-semibold">Guide/Coordinator</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReservations.map((reservation, index) => {
              const reservationId = reservation.id || reservation.reservationNumber;
              const isSelected = selectedReservations.has(reservationId);
              
              return (
                <TableRow key={`${reservation.reservationNumber}-${index}`} className="hover:bg-gray-50">
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectReservation(reservation)}
                      aria-label={`Select ${reservation.reservationNumber}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium whitespace-nowrap">
                    {reservation.reservationNumber}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(reservation.operationDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.pickupTime}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.passengerName}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.product}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.operator || "-"}
                  </TableCell>
                  <TableCell className="min-w-[200px]">
                    {reservation.pickupAddress}
                  </TableCell>
                  <TableCell className="text-center">
                    {reservation.paxAdl}
                  </TableCell>
                  <TableCell className="text-center">
                    {reservation.paxChd}
                  </TableCell>
                  <TableCell className="text-center">
                    {reservation.paxInf}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.contactPhone}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.salesperson}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.driver || "-"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {reservation.guideCoordinator || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
          <div className="text-sm text-muted-foreground text-center sm:text-left">
            Showing {((currentPage - 1) * rowsPerPage) + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, reservations.length)} of{" "}
            {reservations.length} entries
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === -1) {
                  return (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground hidden sm:inline">
                      ...
                    </span>
                  );
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageClick(page)}
                    className="h-8 min-w-8 px-3"
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationDetailsTable;