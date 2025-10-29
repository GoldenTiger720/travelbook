import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Car,
  Users,
  CalendarIcon,
  DollarSign,
  Settings,
  Send,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { logisticsService } from "@/services/logisticsService";
import { apiCall } from "@/config/api";
import {
  TourOperation,
  Vehicle,
  Driver,
  Guide,
  VehicleDistribution,
} from "@/types/logistics";
import { useToast } from "@/components/ui/use-toast";
import PassengerListTable from "@/components/LogisticsPage/PassengerListTable";

const LogisticsPage = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTour, setSelectedTour] = useState<string>("");
  const [selectedOperator, setSelectedOperator] = useState<string>("all");
  const [tours, setTours] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedOperation, setSelectedOperation] =
    useState<TourOperation | null>(null);
  const [bookingTours, setBookingTours] = useState<any[]>([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);

  useEffect(() => {
    loadBasicData();
    loadPassengerData();
  }, []);

  const loadBasicData = async () => {
    try {
      const data = await logisticsService.getBasicData();

      // Set data from API response if available
      if (data) {
        // Set tours
        if (data.tours) {
          setTours(data.tours);
        }

        // Set vehicles - map API structure to local Vehicle type
        if (data.vehicles) {
          const vehiclesList = data.vehicles.map((vehicle: any) => ({
            id: vehicle.id,
            name: vehicle.vehicle_name,
            type: 'van' as const, // Default type, could be enhanced based on model
            capacity: vehicle.capacity,
            licensePlate: vehicle.license_plate,
            status: vehicle.status ? 'available' : 'maintenance',
            currentLocation: undefined,
            assignedTourId: undefined
          }));
          setVehicles(vehiclesList);
        }

        // Filter users by role
        if (data.users) {
          const driversList = data.users
            .filter((user: any) => user.role === 'driver')
            .map((user: any) => ({
              id: user.id,
              name: user.full_name,
              phone: user.phone,
              licenseNumber: user.email, // Using email as placeholder
              status: user.is_active ? 'available' : 'off-duty',
              role: user.role
            }));

          const guidesList = data.users
            .filter((user: any) => user.role === 'guide' || user.role === 'assistant_guide')
            .map((user: any) => ({
              id: user.id,
              name: user.full_name,
              phone: user.phone,
              languages: [], // No language data in API
              specialties: [], // No specialty data in API
              status: user.is_active ? 'available' : 'assigned',
              role: user.role
            }));

          setDrivers(driversList);
          setGuides(guidesList);
        }
      }
    } catch (error) {
      console.error('Failed to load basic logistics data:', error);
      toast({
        title: "Error",
        description: "Failed to load basic logistics data",
        variant: "destructive",
      });
    }
  };

  const handleTourSelect = (tourId: string) => {
    setSelectedTour(tourId);
    const selectedTourData = tours.find((tour) => tour.id === tourId);

    if (selectedTourData) {
      // Create a TourOperation object from the selected tour
      const operation: TourOperation = {
        id: selectedTourData.id,
        date: selectedDate,
        tourId: selectedTourData.id,
        tourName: selectedTourData.name,
        tourCode: selectedTourData.name, // Using name as code for now
        mainDriver: undefined,
        mainGuide: undefined,
        assistantGuide: undefined,
        departureTime: selectedTourData.departure_time,
        expectedWaitingTime: 15,
        vehicleId: undefined,
        reservations: [],
        totalPassengers: 0,
        status: 'planning',
        operator: 'own-operation'
      };
      setSelectedOperation(operation);
    } else {
      setSelectedOperation(null);
    }
  };

  const loadPassengerData = async () => {
    try {
      setLoadingPassengers(true);
      const data = await logisticsService.getTourPassengers();

      if (data && data.booking_tours) {
        setBookingTours(data.booking_tours);
      } else {
        setBookingTours([]);
      }
    } catch (error) {
      console.error('Failed to load passenger data:', error);
      toast({
        title: "Error",
        description: "Failed to load passenger data",
        variant: "destructive",
      });
      setBookingTours([]);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const handleSavePassengers = async (updatedPassengers: any[], tourAssignment?: any) => {
    try {
      // Remove id and pax_number from passengers array
      const cleanedPassengers = updatedPassengers.map(({ id, pax_number, ...rest }) => rest);

      // Prepare data to send to backend
      const payload = {
        tour_assignment: {
          tour_id: tourAssignment?.tourId,
          date: tourAssignment?.date,
          departure_time: tourAssignment?.departureTime,
          main_driver: tourAssignment?.mainDriver,
          main_guide: tourAssignment?.mainGuide,
          assistant_guide: tourAssignment?.assistantGuide,
          vehicle_id: tourAssignment?.vehicleId,
          status: tourAssignment?.status
        },
        passengers: cleanedPassengers
      };

      // Send to backend
      const response = await apiCall('/api/logistics/passengers/', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to save passenger data');
      }

      toast({
        title: "Success",
        description: "Passenger data saved successfully",
      });
    } catch (error) {
      console.error('Failed to save passenger data:', error);
      toast({
        title: "Error",
        description: "Failed to save passenger data",
        variant: "destructive",
      });
    }
  };

  // Convert booking_tours to passenger list for the selected tour
  const getPassengersForSelectedTour = () => {
    if (!selectedOperation) return [];

    const filteredTours = bookingTours.filter(bt => bt.tour_id === selectedOperation.id);
    const passengers: any[] = [];

    filteredTours.forEach((bookingTour) => {
      const totalPax = bookingTour.adult_pax + bookingTour.child_pax + bookingTour.infant_pax;

      for (let paxNum = 1; paxNum <= totalPax; paxNum++) {
        passengers.push({
          id: `${bookingTour.id}_${paxNum}`,
          booking_tour_id: bookingTour.id,
          pax_number: paxNum,
          name: '',
          telephone: '',
          age: '',
          gender: '',
          nationality: bookingTour.destination_id || 'Not Informed'
        });
      }
    });

    return passengers;
  };

  // Calculate total PAX for selected tour
  const getTotalPaxForSelectedTour = () => {
    if (!selectedOperation) return 0;

    const filteredTours = bookingTours.filter(bt => bt.tour_id === selectedOperation.id);
    return filteredTours.reduce((sum, bt) => sum + bt.adult_pax + bt.child_pax, 0);
  };

  // Calculate total value for selected tour
  const getTotalValueForSelectedTour = () => {
    if (!selectedOperation) return 0;

    const filteredTours = bookingTours.filter(bt => bt.tour_id === selectedOperation.id);
    return filteredTours.reduce((sum, bt) => sum + bt.subtotal, 0);
  };

  const handleAssignmentUpdate = (field: string, value: string) => {
    if (!selectedOperation) return;

    // Update local state only (no API call)
    setSelectedOperation((prev) =>
      prev ? { ...prev, [field]: value } : null
    );
  };

  const handleVehicleAssign = (vehicleId: string) => {
    if (!selectedOperation) return;

    // Update local state only (no API call)
    handleAssignmentUpdate("vehicleId", vehicleId);
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
                    {tours.map((tour) => (
                      <SelectItem key={tour.id} value={tour.id}>
                        <div className="flex items-center justify-between gap-2 w-full">
                          <span className="truncate flex-1 min-w-0">{tour.name}</span>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {tour.destination__name}
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
                  {/* Tour Assignment Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
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

                    <div>
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
                  </div>

                  {/* Driver and Guide Selection */}
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
                              <SelectItem key={driver.id} value={driver.id}>
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
                            .filter((g) => g.status === "available" && g.role === "guide")
                            .map((guide) => (
                              <SelectItem key={guide.id} value={guide.id}>
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
                                g.role === "assistant_guide" &&
                                g.id !== selectedOperation.mainGuide
                            )
                            .map((guide) => (
                              <SelectItem key={guide.id} value={guide.id}>
                                {guide.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passenger Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 w-full">
              <Card className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                    <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium truncate">Total PAX</p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {getTotalPaxForSelectedTour()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 text-center sm:text-left">
                    <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-medium truncate">Total Value</p>
                      <p className="text-xl sm:text-2xl font-bold truncate">
                        {formatCurrency(getTotalValueForSelectedTour())}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Passenger List Table */}
            {!loadingPassengers && selectedOperation && getPassengersForSelectedTour().length > 0 && (
              <PassengerListTable
                passengers={getPassengersForSelectedTour()}
                tourAssignment={selectedOperation}
                onSave={handleSavePassengers}
              />
            )}

            {loadingPassengers && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Loading passenger data...</p>
                </CardContent>
              </Card>
            )}

            {!loadingPassengers && selectedOperation && getPassengersForSelectedTour().length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No passengers found for this tour.</p>
                </CardContent>
              </Card>
            )}

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
                  <div className="space-y-3 sm:space-y-4">
                    {/* Vehicle Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 w-full">
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
                              <Users className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <p className="font-semibold text-sm truncate">Staff</p>
                            </div>
                            <div className="text-xs space-y-1">
                              <p className="truncate">
                                Driver:{" "}
                                {selectedOperation.mainDriver
                                  ? drivers.find(d => d.id === selectedOperation.mainDriver)?.name || "Not found"
                                  : "Not assigned"}
                              </p>
                              <p className="truncate">
                                Guide:{" "}
                                {selectedOperation.mainGuide
                                  ? guides.find(g => g.id === selectedOperation.mainGuide)?.name || "Not found"
                                  : "Not assigned"}
                              </p>
                              {selectedOperation.assistantGuide && (
                                <p className="truncate">
                                  Assist: {guides.find(g => g.id === selectedOperation.assistantGuide)?.name || "Not found"}
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
