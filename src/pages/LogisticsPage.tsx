import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Car,
  MapPin,
  Clock,
  Users,
  Plus,
  CalendarIcon,
  Phone,
  Mail,
  Navigation,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Settings,
  Send,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { logisticsService } from "@/services/logisticsService";
import {
  TourOperation,
  Vehicle,
  Driver,
  Guide,
  VehicleDistribution,
} from "@/types/logistics";
import { useToast } from "@/components/ui/use-toast";
import ReservationDetailsTable from "@/components/ReservationDetailsTable";

const LogisticsPage = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [tourOperations, setTourOperations] = useState<TourOperation[]>([]);
  const [filteredTourOperations, setFilteredTourOperations] = useState<
    TourOperation[]
  >([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedOperation, setSelectedOperation] =
    useState<TourOperation | null>(null);
  const [expandedReservations, setExpandedReservations] = useState<Set<string>>(
    new Set()
  );
  const [selectedReservations, setSelectedReservations] = useState<Set<string>>(
    new Set()
  );
  const [assignedOperator, setAssignedOperator] =
    useState<string>("own-operation");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadTourOperations();
    }
  }, [selectedDate]);

  useEffect(() => {
    filterTourOperations();
  }, [tourOperations, selectedOperator]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [vehiclesData, driversData, guidesData] = await Promise.all([
        logisticsService.getVehicles(),
        logisticsService.getDrivers(),
        logisticsService.getGuides(),
      ]);

      setVehicles(vehiclesData);
      setDrivers(driversData);
      setGuides(guidesData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load logistics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTourOperations = async () => {
    try {
      const operations = await logisticsService.getTourOperations(selectedDate);
      setTourOperations(operations);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tour operations",
        variant: "destructive",
      });
    }
  };

  const filterTourOperations = () => {
    let filtered = [...tourOperations];

    if (selectedOperator !== "all") {
      filtered = filtered.filter((operation) => {
        const operator = operation.operator || "own-operation";
        if (selectedOperator === "own-operation") {
          return operator === "own-operation";
        } else {
          return operator !== "own-operation";
        }
      });
    }

    setFilteredTourOperations(filtered);

    // Auto-select first tour if none selected or if current selection is filtered out
    if (!selectedTour && filtered.length > 0) {
      setSelectedTour(filtered[0].id);
      setSelectedOperation(filtered[0]);
    } else if (selectedTour) {
      const operation = filtered.find((op) => op.id === selectedTour);
      if (operation) {
        setSelectedOperation(operation);
      } else if (filtered.length > 0) {
        // Current selection filtered out, select first available
        setSelectedTour(filtered[0].id);
        setSelectedOperation(filtered[0]);
      } else {
        // No tours available after filtering
        setSelectedOperation(null);
        setSelectedTour("");
      }
    }
  };

  const handleTourSelect = (tourId: string) => {
    setSelectedTour(tourId);
    const operation = filteredTourOperations.find((op) => op.id === tourId);
    setSelectedOperation(operation || null);
  };

  const handleAssignmentUpdate = async (field: string, value: string) => {
    if (!selectedOperation) return;

    try {
      await logisticsService.updateTourOperation(selectedOperation.id, {
        [field]: value,
      });

      // Update local state
      setSelectedOperation((prev) =>
        prev ? { ...prev, [field]: value } : null
      );
      setTourOperations((prev) =>
        prev.map((op) =>
          op.id === selectedOperation.id ? { ...op, [field]: value } : op
        )
      );

      toast({
        title: "Updated",
        description: `Assignment updated successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      });
    }
  };

  const handleVehicleAssign = async (vehicleId: string) => {
    if (!selectedOperation) return;

    try {
      await logisticsService.assignVehicleToOperation(
        selectedOperation.id,
        vehicleId
      );
      await handleAssignmentUpdate("vehicleId", vehicleId);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to assign vehicle",
        variant: "destructive",
      });
    }
  };

  const toggleReservationExpansion = (reservationId: string) => {
    setExpandedReservations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId);
      } else {
        newSet.add(reservationId);
      }
      return newSet;
    });
  };

  const toggleReservationSelection = (reservationId: string) => {
    setSelectedReservations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId);
      } else {
        newSet.add(reservationId);
      }
      return newSet;
    });
  };

  const selectAllReservations = () => {
    if (!selectedOperation) return;
    const allIds = selectedOperation.reservations.map((r) => r.id);
    setSelectedReservations(new Set(allIds));
  };

  const clearReservationSelection = () => {
    setSelectedReservations(new Set());
  };

  const confirmAssignments = async () => {
    if (!selectedOperation || selectedReservations.size === 0) {
      toast({
        title: "No Selection",
        description: "Please select reservations to assign",
        variant: "destructive",
      });
      return;
    }

    try {
      // Apply assignments to selected reservations
      await logisticsService.updateReservationAssignments(
        Array.from(selectedReservations),
        {
          operator: assignedOperator,
          driver:
            assignedOperator === "own-operation"
              ? selectedOperation.mainDriver
              : undefined,
          guide:
            assignedOperator === "own-operation"
              ? selectedOperation.mainGuide
              : undefined,
          vehicle:
            assignedOperator === "own-operation"
              ? selectedOperation.vehicleId
              : undefined,
        }
      );

      toast({
        title: "Success",
        description: `Assignments confirmed for ${selectedReservations.size} reservations`,
      });

      // Clear selection after successful assignment
      setSelectedReservations(new Set());

      // Reload tour operations to reflect changes
      await loadTourOperations();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to confirm assignments",
        variant: "destructive",
      });
    }
  };

  const sendWhatsAppList = (operation: TourOperation) => {
    if (!operation.vehicleId) return;

    const vehicle = vehicles.find((v) => v.id === operation.vehicleId);
    if (!vehicle) return;

    const distribution: VehicleDistribution = {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      assignedPassengers: operation.totalPassengers,
      capacity: vehicle.capacity,
      passengerList: operation.reservations.map((r) => ({
        reservationNumber: r.reservationNumber,
        clientName: r.clientName,
        passengers: r.passengers.total,
        hotelName: r.hotelName,
        pickupLocation: r.pickupLocation,
        specialRequests: r.specialRequests,
      })),
    };

    const message = logisticsService.generateWhatsAppMessage(distribution);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, "_blank");

    toast({
      title: "WhatsApp Opened",
      description: "Passenger list ready to send",
    });
  };

  const getStatusBadge = (status: TourOperation["status"]) => {
    const variants = {
      planning: {
        className: "bg-yellow-100 text-yellow-800",
        label: "Planning",
      },
      assigned: { className: "bg-blue-100 text-blue-800", label: "Assigned" },
      "in-progress": {
        className: "bg-green-100 text-green-800",
        label: "In Progress",
      },
      completed: { className: "bg-gray-100 text-gray-800", label: "Completed" },
    };

    const variant = variants[status];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden">
      <div className="w-full max-w-full overflow-x-hidden px-2 sm:px-4 lg:px-6 py-2 sm:py-4 space-y-2 sm:space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-2 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold">Logistics / Operations</h1>
            <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
              Manage daily tour operations and logistics
            </p>
          </div>
        </div>

        {/* Date and Tour Selection */}
        <Card className="overflow-hidden w-full max-w-full">
          <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">Operation Date & Tour</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-4 overflow-x-hidden px-2 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              <div>
                <Label className="text-sm">Operation Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate
                        ? format(selectedDate, "PPP")
                        : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="text-sm">Operator</Label>
                <Select
                  value={selectedOperator}
                  onValueChange={setSelectedOperator}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="own-operation">Own Operation</SelectItem>
                    <SelectItem value="external">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Tour Operation</Label>
                <Select value={selectedTour} onValueChange={handleTourSelect}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTourOperations.map((operation) => (
                      <SelectItem key={operation.id} value={operation.id}>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="truncate flex-1 min-w-0">{operation.tourName}</span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {operation.totalPassengers} PAX
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedOperation && (
          <>
            {/* Tour Assignment Panel */}
            <Card className="overflow-hidden w-full max-w-full">
              <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6">
                <CardTitle className="text-sm sm:text-base font-medium">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Settings className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm lg:text-base">Tour Assignment - {selectedOperation.tourName}</span>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(selectedOperation.status)}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 sm:space-y-4 px-2 sm:px-6">
                <div className="space-y-4">
                  {/* Operator Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                    <div>
                      <Label className="text-sm">Operator</Label>
                      <Select
                        value={assignedOperator}
                        onValueChange={setAssignedOperator}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="own-operation">
                            Own Operation
                          </SelectItem>
                          <SelectItem value="others">Others</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm">Departure Time</Label>
                      <Input
                        type="time"
                        value={selectedOperation.departureTime || ""}
                        onChange={(e) =>
                          handleAssignmentUpdate(
                            "departureTime",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Waiting Time (minutes)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="60"
                        value={selectedOperation.expectedWaitingTime}
                        onChange={(e) =>
                          handleAssignmentUpdate(
                            "expectedWaitingTime",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {assignedOperator === "own-operation" && (
                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label className="text-sm">Assign Vehicle</Label>
                        <Select
                          value={selectedOperation.vehicleId || undefined}
                          onValueChange={handleVehicleAssign}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles
                              .filter((v) => v.status === "available")
                              .map((vehicle) => (
                                <SelectItem key={vehicle.id} value={vehicle.id}>
                                  {vehicle.name} ({vehicle.capacity} seats)
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  {/* Driver and Guide Selection - Only for Own Operation */}
                  {assignedOperator === "own-operation" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      <div>
                        <Label className="text-sm">Main Driver</Label>
                        <Select
                          value={selectedOperation.mainDriver || undefined}
                          onValueChange={(value) =>
                            handleAssignmentUpdate("mainDriver", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers
                              .filter((d) => d.status === "available")
                              .map((driver) => (
                                <SelectItem key={driver.id} value={driver.name}>
                                  {driver.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Main Guide</Label>
                        <Select
                          value={selectedOperation.mainGuide || undefined}
                          onValueChange={(value) =>
                            handleAssignmentUpdate("mainGuide", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select guide" />
                          </SelectTrigger>
                          <SelectContent>
                            {guides
                              .filter((g) => g.status === "available")
                              .map((guide) => (
                                <SelectItem key={guide.id} value={guide.name}>
                                  {guide.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Assistant Guide</Label>
                        <Select
                          value={selectedOperation.assistantGuide || undefined}
                          onValueChange={(value) =>
                            handleAssignmentUpdate("assistantGuide", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assistant" />
                          </SelectTrigger>
                          <SelectContent>
                            {guides
                              .filter(
                                (g) =>
                                  g.status === "available" &&
                                  g.name !== selectedOperation.mainGuide
                              )
                              .map((guide) => (
                                <SelectItem key={guide.id} value={guide.name}>
                                  {guide.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirmation Button */}
                <div className="flex justify-center sm:justify-end pt-2 sm:pt-4">
                  <Button
                    onClick={confirmAssignments}
                    disabled={selectedReservations.size === 0}
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-sm sm:text-base"
                  >
                    <CheckCircle className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Confirm Assignments </span>
                    <span className="sm:hidden">Confirm </span>
                    ({selectedReservations.size})
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Reservation Details Table */}
            <Card className="overflow-hidden w-full max-w-full">
              <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6">
                <CardTitle className="text-sm sm:text-base font-medium">
                  <span className="block truncate">Reservation Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-hidden p-1 sm:p-6">
                <ReservationDetailsTable
                  reservations={selectedOperation.reservations.map((reservation) => ({
                    id: reservation.id,
                    reservationNumber: reservation.reservationNumber,
                    operationDate: selectedOperation.date,
                    pickupTime: reservation.pickupTime || selectedOperation.departureTime || "08:00",
                    passengerName: reservation.clientName,
                    product: selectedOperation.tourName,
                    operator: selectedOperation.operator === "own-operation" ? undefined : selectedOperation.operator,
                    pickupAddress: reservation.pickupLocation,
                    paxAdl: reservation.passengers.adults,
                    paxChd: reservation.passengers.children,
                    paxInf: reservation.passengers.infants,
                    contactPhone: reservation.contactPhone || "",
                    salesperson: reservation.salesperson || "",
                    driver: selectedOperation.mainDriver,
                    guideCoordinator: selectedOperation.mainGuide,
                  }))}
                  rowsPerPage={5}
                  selectedReservations={selectedReservations}
                  onSelectionChange={toggleReservationSelection}
                  onSelectAll={selectAllReservations}
                  onClearSelection={clearReservationSelection}
                />
              </CardContent>
            </Card>

            {/* Passenger Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 sm:gap-2 lg:gap-3 w-full">
              <Card className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-center sm:text-left">
                    <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">Total PAX</p>
                      <p className="text-base sm:text-lg font-bold">
                        {selectedOperation.totalPassengers}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-center sm:text-left">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">Confirmed</p>
                      <p className="text-base sm:text-lg font-bold">
                        {
                          selectedOperation.reservations.filter(
                            (r) => r.status === "confirmed"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-center sm:text-left">
                    <Clock className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">Pending</p>
                      <p className="text-base sm:text-lg font-bold">
                        {
                          selectedOperation.reservations.filter(
                            (r) => r.status === "pending"
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-2 sm:p-3">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2 text-center sm:text-left">
                    <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">Total Value</p>
                      <p className="text-sm sm:text-lg font-bold truncate">
                        {formatCurrency(
                          selectedOperation.reservations.reduce(
                            (sum, r) => sum + r.totalValue,
                            0
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* Vehicle Assignment & Passenger Distribution */}
            {selectedOperation.vehicleId && (
              <Card className="overflow-hidden w-full max-w-full">
                <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6">
                  <CardTitle className="text-sm sm:text-base font-medium flex items-center gap-2">
                    <Car className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Vehicle Assignment & Passenger Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                  <div className="space-y-4">
                    {/* Vehicle Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 w-full">
                      {vehicles
                        .filter((v) => v.id === selectedOperation.vehicleId)
                        .map((vehicle) => (
                          <Card key={vehicle.id} className="overflow-hidden">
                            <CardContent className="p-2 sm:p-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Car className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                  <p className="font-semibold text-sm truncate">
                                    {vehicle.name}
                                  </p>
                                </div>
                                <div className="text-xs space-y-1">
                                  <p className="truncate">
                                    Cap: {vehicle.capacity} | Assigned:{" "}
                                    {selectedOperation.totalPassengers}
                                  </p>
                                  <p
                                    className={`font-medium ${
                                      selectedOperation.totalPassengers <=
                                      vehicle.capacity
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {vehicle.capacity -
                                      selectedOperation.totalPassengers >=
                                    0
                                      ? `${
                                          vehicle.capacity -
                                          selectedOperation.totalPassengers
                                        } seats left`
                                      : `${
                                          selectedOperation.totalPassengers -
                                          vehicle.capacity
                                        } over capacity`}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                      <Card className="overflow-hidden">
                        <CardContent className="p-2 sm:p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Navigation className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <p className="font-semibold text-sm truncate">
                                Route Info
                              </p>
                            </div>
                            <div className="text-xs space-y-1">
                              <p>
                                Departure:{" "}
                                {selectedOperation.departureTime || "Not set"}
                              </p>
                              <p>
                                Wait: {selectedOperation.expectedWaitingTime}min
                              </p>
                              <p>
                                Locations:{" "}
                                {
                                  new Set(
                                    selectedOperation.reservations.map(
                                      (r) => r.hotelName
                                    )
                                  ).size
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="overflow-hidden">
                        <CardContent className="p-2 sm:p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <p className="font-semibold text-sm truncate">Staff</p>
                            </div>
                            <div className="text-xs space-y-1">
                              <p className="truncate">
                                Driver:{" "}
                                {selectedOperation.mainDriver || "Not assigned"}
                              </p>
                              <p className="truncate">
                                Guide:{" "}
                                {selectedOperation.mainGuide || "Not assigned"}
                              </p>
                              {selectedOperation.assistantGuide && (
                                <p className="truncate">
                                  Assist: {selectedOperation.assistantGuide}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Passenger List Actions */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="flex-1 sm:flex-none text-sm"
                          >
                            <FileText className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">View Passenger List</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto mx-2">
                          <DialogHeader>
                            <DialogTitle className="text-base sm:text-lg pr-8">
                              <span className="block truncate">Passenger List - {selectedOperation.tourName}</span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                              <p>
                                Date: {format(selectedOperation.date, "PPP")}
                              </p>
                              <p>
                                Departure:{" "}
                                {selectedOperation.departureTime || "Not set"}
                              </p>
                              <p>
                                Vehicle:{" "}
                                {
                                  vehicles.find(
                                    (v) => v.id === selectedOperation.vehicleId
                                  )?.name
                                }
                              </p>
                            </div>

                            <div className="space-y-2">
                              {selectedOperation.reservations.map(
                                (reservation, index) => (
                                  <div
                                    key={reservation.id}
                                    className="border rounded p-2 sm:p-3 text-xs sm:text-sm"
                                  >
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                      <div className="min-w-0">
                                        <p className="font-semibold truncate">
                                          {index + 1}. {reservation.clientName}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {reservation.reservationNumber}
                                        </p>
                                      </div>
                                      <Badge
                                        variant={
                                          reservation.status === "confirmed"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs flex-shrink-0"
                                      >
                                        {reservation.passengers.total} PAX
                                      </Badge>
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <p className="break-words">
                                        <strong>Pickup:</strong>{" "}
                                        {reservation.pickupLocation}
                                      </p>
                                      <p className="truncate">
                                        <strong>Hotel:</strong>{" "}
                                        {reservation.hotelName}
                                      </p>
                                      <p>
                                        <strong>Passengers:</strong>{" "}
                                        {reservation.passengers.adults}A
                                        {reservation.passengers.children > 0 &&
                                          ` + ${reservation.passengers.children}C`}
                                        {reservation.passengers.infants > 0 &&
                                          ` + ${reservation.passengers.infants}I`}
                                      </p>
                                      {reservation.specialRequests && (
                                        <p className="text-orange-600 break-words">
                                          <strong>Special:</strong>{" "}
                                          {reservation.specialRequests}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        onClick={() => sendWhatsAppList(selectedOperation)}
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                      >
                        <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="whitespace-nowrap">WhatsApp</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Available Resources */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 w-full overflow-x-hidden">
              {/* Available Vehicles */}
              <Card className="overflow-hidden w-full max-w-full">
                <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Car className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Available Vehicles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {vehicles
                    .filter((v) => v.status === "available")
                    .map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="p-2 rounded border text-xs"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{vehicle.name}</p>
                            <p className="text-muted-foreground text-xs truncate">
                              {vehicle.capacity} seats • {vehicle.licensePlate}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs w-full sm:w-auto flex-shrink-0"
                            onClick={() => handleVehicleAssign(vehicle.id)}
                          >
                            Assign
                          </Button>
                        </div>
                      </div>
                    ))}
                  {vehicles.filter((v) => v.status === "available").length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No vehicles available</p>
                  )}
                </CardContent>
              </Card>

              {/* Available Drivers */}
              <Card className="overflow-hidden w-full max-w-full">
                <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Available Drivers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {drivers
                    .filter((d) => d.status === "available")
                    .map((driver) => (
                      <div
                        key={driver.id}
                        className="p-2 rounded border text-xs space-y-1"
                      >
                        <p className="font-medium truncate">{driver.name}</p>
                        <p className="text-muted-foreground text-xs break-words">{driver.phone}</p>
                        <p className="text-muted-foreground text-xs truncate">
                          License: {driver.licenseNumber}
                        </p>
                      </div>
                    ))}
                  {drivers.filter((d) => d.status === "available").length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No drivers available</p>
                  )}
                </CardContent>
              </Card>

              {/* Available Guides */}
              <Card className="overflow-hidden w-full max-w-full">
                <CardHeader className="pb-2 sm:pb-3 px-2 sm:px-6">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">Available Guides</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[300px] overflow-y-auto">
                  {guides
                    .filter((g) => g.status === "available")
                    .map((guide) => (
                      <div
                        key={guide.id}
                        className="p-2 rounded border text-xs space-y-1"
                      >
                        <p className="font-medium truncate">{guide.name}</p>
                        <p className="text-muted-foreground text-xs break-words">{guide.phone}</p>
                        <p className="text-muted-foreground text-xs truncate">
                          Languages: {guide.languages.join(", ")}
                        </p>
                        <p className="text-muted-foreground text-xs truncate">
                          Specialties: {guide.specialties.join(", ")}
                        </p>
                      </div>
                    ))}
                  {guides.filter((g) => g.status === "available").length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No guides available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!selectedOperation && (
          <Card className="overflow-hidden w-full max-w-full">
            <CardContent className="p-4 sm:p-8 text-center">
              <div className="space-y-2">
                <CalendarIcon className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-muted-foreground" />
                <h3 className="text-sm sm:text-lg font-medium">Select Date and Tour</h3>
                <p className="text-xs sm:text-sm text-muted-foreground px-2">
                  Choose an operation date and tour to manage logistics
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LogisticsPage;
