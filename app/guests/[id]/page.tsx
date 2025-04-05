"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Calendar, CreditCard, Edit, Mail, MapPin, Phone, Star, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

// Sample guest data
const guestData = {
  id: "G-1001",
  name: "John Smith",
  email: "john.smith@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main Street, New York, NY 10001",
  visits: 3,
  lastStay: "2023-04-15",
  status: "active",
  isVip: true,
  loyaltyPoints: 1250,
  notes: "Prefers rooms on higher floors with city view. Allergic to feather pillows.",
  preferences: ["Non-smoking room", "King bed", "High floor", "City view", "Early check-in when available"],
  bookings: [
    {
      id: "B-1001",
      checkIn: "2023-04-15",
      checkOut: "2023-04-18",
      roomNumber: "101",
      roomType: "Deluxe King",
      status: "completed",
      totalAmount: "$349.99",
    },
    {
      id: "B-0845",
      checkIn: "2023-01-10",
      checkOut: "2023-01-15",
      roomNumber: "205",
      roomType: "Standard Queen",
      status: "completed",
      totalAmount: "$499.99",
    },
    {
      id: "B-0721",
      checkIn: "2022-09-22",
      checkOut: "2022-09-25",
      roomNumber: "310",
      roomType: "Deluxe King",
      status: "completed",
      totalAmount: "$374.99",
    },
  ],
}

export default function GuestProfilePage() {
  const params = useParams()
  const { toast } = useToast()
  const [guest] = useState(guestData)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
  }

  const handleAddNote = () => {
    toast({
      title: "Note added",
      description: "Guest note has been added successfully.",
    })
  }

  const handleSendEmail = () => {
    toast({
      title: "Email sent",
      description: `Email has been sent to ${guest.email}`,
    })
  }

  return (
    <div className="flex-1">
      <div className="p-4 md:p-6">
        <div className="mb-6">
          <Link
            href="/guests"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Guests
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 space-y-6">
            <Card>
              <CardHeader className="relative pb-2">
                <div className="absolute right-6 top-6">
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-2">
                    <AvatarFallback className="bg-rose-100 text-rose-800 text-2xl">
                      {getInitials(guest.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-xl">{guest.name}</CardTitle>
                  <div className="flex items-center mt-1">
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="h-3 w-3 mr-1 fill-amber-500" />
                      VIP Guest
                    </Badge>
                  </div>
                  <CardDescription className="mt-1">Guest ID: {guest.id}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">{guest.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">{guest.phone}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-sm text-muted-foreground">{guest.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Last Stay</div>
                      <div className="text-sm text-muted-foreground">{guest.lastStay}</div>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Total Visits</div>
                      <div className="text-sm text-muted-foreground">{guest.visits} stays</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <Button variant="outline" onClick={handleSendEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Email
                </Button>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  New Booking
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
                <CardDescription>Guest loyalty status and points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Status</div>
                    <Badge className="bg-rose-100 text-rose-800">Gold Member</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Points Balance</div>
                      <div>{guest.loyaltyPoints} pts</div>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-600 rounded-full"
                        style={{ width: `${Math.min((guest.loyaltyPoints / 2000) * 100, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      {guest.loyaltyPoints}/2000 points to Platinum
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Redeem Points
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3 space-y-6">
            <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="bookings">Bookings</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking History</CardTitle>
                    <CardDescription>Past and upcoming reservations</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Booking ID</TableHead>
                          <TableHead>Dates</TableHead>
                          <TableHead>Room</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {guest.bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>
                              {booking.checkIn} to {booking.checkOut}
                            </TableCell>
                            <TableCell>
                              {booking.roomNumber} ({booking.roomType})
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                {booking.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{booking.totalAmount}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                  <CardFooter className="flex justify-end pt-4">
                    <Button>
                      <Calendar className="mr-2 h-4 w-4" />
                      New Booking
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Preferences</CardTitle>
                    <CardDescription>Recorded preferences and special requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Room Preferences</h3>
                        <div className="flex flex-wrap gap-2">
                          {guest.preferences.map((pref, index) => (
                            <Badge key={index} variant="outline">
                              {pref}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Dietary Requirements</h3>
                        <p className="text-sm text-muted-foreground">No dietary requirements recorded.</p>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Accessibility Needs</h3>
                        <p className="text-sm text-muted-foreground">No accessibility needs recorded.</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Preferences
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Guest Notes</CardTitle>
                    <CardDescription>Important information about this guest</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="rounded-md border p-4">
                        <div className="font-medium">Staff Notes</div>
                        <p className="mt-1 text-sm">{guest.notes}</p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Added by: Sarah Johnson (Front Desk) - April 15, 2023
                        </div>
                      </div>

                      <div className="rounded-md border p-4">
                        <div className="font-medium">VIP Status Note</div>
                        <p className="mt-1 text-sm">
                          Guest has been upgraded to VIP status due to frequent stays. Provide complimentary welcome
                          amenities.
                        </p>
                        <div className="mt-2 text-xs text-muted-foreground">
                          Added by: Robert Wilson (Manager) - January 10, 2023
                        </div>
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">Add New Note</h3>
                        <textarea
                          className="w-full min-h-[100px] p-2 rounded-md border border-input bg-transparent text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Enter a new note about this guest..."
                        />
                        <Button className="mt-2" onClick={handleAddNote}>
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>Communication History</CardTitle>
                <CardDescription>Recent interactions with the guest</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 rounded-md border p-4">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Booking Confirmation</div>
                      <p className="text-sm text-muted-foreground">
                        Booking confirmation email sent for reservation #B-1001
                      </p>
                      <div className="mt-1 text-xs text-muted-foreground">April 12, 2023 - 10:23 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-md border p-4">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Pre-arrival Information</div>
                      <p className="text-sm text-muted-foreground">Pre-arrival email sent with check-in instructions</p>
                      <div className="mt-1 text-xs text-muted-foreground">April 14, 2023 - 9:00 AM</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 rounded-md border p-4">
                    <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Phone Call</div>
                      <p className="text-sm text-muted-foreground">Guest called to request early check-in</p>
                      <div className="mt-1 text-xs text-muted-foreground">April 14, 2023 - 2:15 PM</div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

