const Ticket = require("../models/ticket");
const ExpressError = require("../utils/ExpressError");
const wrapAsync = require("../utils/wrapAsync");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/sendEmail");

// Show all tickets
module.exports.index = wrapAsync(async (req, res) => {
  const tickets = await Ticket.find({ status: "available" }).populate("owner");
  res.render("tickets/index", { tickets, currentUser: req.user });
});

// Search tickets
module.exports.searchTickets = wrapAsync(async (req, res) => {
  const { query, category, date } = req.query;
  let filter = { status: "available" };
  
  if (query) {
    filter.$or = [
      { eventName: { $regex: query, $options: 'i' } },
      { location: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }
  
  if (category) {
    filter.eventCategory = category;
  }
  
  if (date) {
    const searchDate = new Date(date);
    filter.eventDate = {
      $gte: searchDate,
      $lt: new Date(searchDate.getTime() + 24 * 60 * 60 * 1000)
    };
  }
  
  const tickets = await Ticket.find(filter).populate("owner");
  res.render("tickets/index", { 
    tickets, 
    searchQuery: query, 
    categoryFilter: category, 
    dateFilter: date 
  });
});

// Render new form
module.exports.renderNewForm = (req, res) => {
  res.render("tickets/new");
};

// Create new ticket
module.exports.createTicket = async (req, res) => {
  try {
    const ticketData = req.body.ticket;
    // Set initial values
    ticketData.pricePerTicket = ticketData.basePrice;
    ticketData.ticketsAvailable = ticketData.totalSeats;
    ticketData.owner = req.user._id; 
    
    const ticket = new Ticket(ticketData);
    await ticket.save();

    // Send email notification to ticket creator
    try {
      const emailSubject = `🎟️ Ticket Created: ${ticket.eventName}`;
      const emailText = `Hello ${req.user.username},

Your ticket for "${ticket.eventName}" has been successfully created.

Event Details:
- Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${ticket.location}
- Price: ₹${ticket.pricePerTicket.toLocaleString('en-IN')}
- Available Tickets: ${ticket.ticketsAvailable}

You can view your ticket at: http://localhost:8080/tickets/${ticket._id}

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
      
      await sendEmail(
        req.user.email,
        emailSubject,
        emailText
      );
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    req.flash("success", `✅ Ticket created successfully! Confirmation sent to ${req.user.email} 📧`);
    
    res.redirect(`/tickets/${ticket._id}`);
  } catch (err) {
    req.flash("error", " Failed to create ticket. Please try again.");
    res.redirect("/tickets/new");
  }
};

// Show single ticket
module.exports.showTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate("owner");
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  res.render("tickets/show", { ticket });
};

// Render edit form
module.exports.renderEditForm = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  if (!ticket.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this ticket!");
    return res.redirect(`/tickets/${id}`);
  }
  res.render("tickets/edit", { ticket });
});

// Update ticket with dynamic pricing
module.exports.updateTicket = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to edit this ticket!");
    return res.redirect(`/tickets/${id}`);
  }

  // Apply dynamic pricing
  const updatedData = req.body.ticket;
  updatedData.pricePerTicket = calculateDynamicPrice(
    updatedData.basePrice,
    updatedData.totalSeats,
    updatedData.ticketsAvailable
  );

  const updatedTicket = await Ticket.findByIdAndUpdate(id, updatedData, { new: true });
  
  // Send email notification to ticket owner
  try {
    const emailSubject = `✏️ Ticket Updated: ${updatedTicket.eventName}`;
    const emailText = `Hello ${req.user.username},

Your ticket for "${updatedTicket.eventName}" has been successfully updated.

Updated Event Details:
- Date: ${updatedTicket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${updatedTicket.location}
- Price: ₹${updatedTicket.pricePerTicket.toLocaleString('en-IN')}
- Available Tickets: ${updatedTicket.ticketsAvailable}

You can view your updated ticket at: http://localhost:8080/tickets/${updatedTicket._id}

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
    
    await sendEmail(
      req.user.email,
      emailSubject,
      emailText
    );
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError);
  }
  
  req.flash("success", `Ticket updated successfully! Notification sent to ${req.user.email} 📧`);
  
  res.redirect(`/tickets/${updatedTicket._id}`);
});

// Delete ticket
module.exports.deleteTicket = wrapAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id);
  if (!ticket.owner.equals(req.user._id)) {
    req.flash("error", "You do not have permission to delete this ticket!");
    return res.redirect(`/tickets/${id}`);
  }

  // Send email notification before deletion
  try {
    const emailSubject = `🗑️ Ticket Deleted: ${ticket.eventName}`;
    const emailText = `Hello ${req.user.username},

Your ticket for "${ticket.eventName}" has been successfully deleted.

Deleted Event Details:
- Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${ticket.location}

If you have any questions, please contact our support team.

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
    
    await sendEmail(
      req.user.email,
      emailSubject,
      emailText
    );
  } catch (emailError) {
    console.error('Failed to send email notification:', emailError);
  }

  await Ticket.findByIdAndDelete(id);
  
  req.flash("success", `Ticket deleted successfully! Notification sent to ${req.user.email} 📧`);
  
  res.redirect("/tickets");
});

// Book a ticket with dynamic pricing update
module.exports.bookTicket = async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id).populate("owner");
  
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  
  if (ticket.status !== "available" || ticket.ticketsAvailable <= 0) {
    req.flash("error", "Sorry, this ticket is no longer available!");
    return res.redirect(`/tickets/${id}`);
  }
  
  // Update ticket status to booked
  ticket.status = "booked";
  ticket.bookedBy = req.user._id;
  ticket.bookingDate = new Date();
  ticket.ticketsAvailable -= 1;
  
  // Generate a booking ID
  ticket.bookingId = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Generate a simple QR code representation (in a real app, you would use a QR code library)
  ticket.qrCode = `QR-${ticket.bookingId}`;
  
  // Update price based on dynamic pricing
  ticket.pricePerTicket = calculateDynamicPrice(
    ticket.basePrice,
    ticket.totalSeats,
    ticket.ticketsAvailable
  );
  
  try {
    await ticket.save();
    
    // Send email notification to buyer
    try {
      const emailSubject = `🎟️ Booking Confirmation: ${ticket.eventName}`;
      const emailText = `Hello ${req.user.username},

Your booking for "${ticket.eventName}" has been confirmed!

Booking Details:
- Booking ID: ${ticket.bookingId}
- Event: ${ticket.eventName}
- Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${ticket.location}
- Price: ₹${ticket.pricePerTicket.toLocaleString('en-IN')}
- QR Code: ${ticket.qrCode}

You can view your booking confirmation at: http://localhost:8080/tickets/${ticket._id}/confirmation

Please bring this ticket to the event. The QR code will be scanned at the entrance.

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
      
      await sendEmail(
        req.user.email,
        emailSubject,
        emailText
      );
    } catch (emailError) {
      console.error('Failed to send email to buyer:', emailError);
    }
    
    // Send email notification to seller
    try {
      const seller = ticket.owner;
      const emailSubject = `💰 Ticket Sold: ${ticket.eventName}`;
      const emailText = `Hello ${seller.username},

Your ticket for "${ticket.eventName}" has been sold!

Sale Details:
- Booking ID: ${ticket.bookingId}
- Event: ${ticket.eventName}
- Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${ticket.location}
- Price: ₹${ticket.pricePerTicket.toLocaleString('en-IN')}
- Buyer: ${req.user.username}

The buyer will bring the ticket with QR code to the event.

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
      
      await sendEmail(
        seller.email,
        emailSubject,
        emailText
      );
    } catch (emailError) {
      console.error('Failed to send email to seller:', emailError);
    }
    
    req.flash("success", `✅ Ticket booked successfully! Confirmation sent to ${req.user.email} 📧`);
    res.redirect(`/tickets/${id}/confirmation`);
  } catch (error) {
    req.flash("error", "Failed to book ticket. Please try again.");
    res.redirect(`/tickets/${id}`);
  }
};

// Cancel a ticket and update dynamic pricing
module.exports.cancelTicket = async (req, res) => {
  const { id } = req.params;
  const ticket = await Ticket.findById(id).populate("owner");
  
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  
  // Check if user is authorized to cancel (either owner or booked user)
  const isOwner = ticket.owner.equals(req.user._id);
  const isBookedByUser = ticket.bookedBy && ticket.bookedBy.equals(req.user._id);
  
  if (!isOwner && !isBookedByUser) {
    req.flash("error", "You do not have permission to cancel this ticket!");
    return res.redirect(`/tickets/${id}`);
  }
  
  // If it was booked, return it to available status
  if (ticket.status === "booked") {
    ticket.status = "available";
    ticket.bookedBy = null;
    ticket.bookingDate = null;
    ticket.ticketsAvailable += 1;
    
    // Update price based on dynamic pricing
    ticket.pricePerTicket = calculateDynamicPrice(
      ticket.basePrice,
      ticket.totalSeats,
      ticket.ticketsAvailable
    );
    
    try {
      await ticket.save();
      
      // Send email notification to user who cancelled
      try {
        const emailSubject = `❌ Booking Cancelled: ${ticket.eventName}`;
        const emailText = `Hello ${req.user.username},

Your booking for "${ticket.eventName}" has been successfully cancelled.

Cancellation Details:
- Booking ID: ${ticket.bookingId}
- Event: ${ticket.eventName}
- Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${ticket.location}
- Refund Amount: ₹${ticket.pricePerTicket.toLocaleString('en-IN')}

A refund has been initiated to your original payment method.

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
        
        await sendEmail(
          req.user.email,
          emailSubject,
          emailText
        );
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
      
      // Send email notification to seller
      try {
        const seller = ticket.owner;
        const emailSubject = `↩️ Ticket Booking Cancelled: ${ticket.eventName}`;
        const emailText = `Hello ${seller.username},

A booking for your ticket "${ticket.eventName}" has been cancelled.

Cancellation Details:
- Booking ID: ${ticket.bookingId}
- Event: ${ticket.eventName}
- Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${ticket.location}
- Refund Amount: ₹${ticket.pricePerTicket.toLocaleString('en-IN')}

The ticket is now available for other buyers.

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
        
        await sendEmail(
          seller.email,
          emailSubject,
          emailText
        );
      } catch (emailError) {
        console.error('Failed to send cancellation email to seller:', emailError);
      }
      
      req.flash("success", `✅ Ticket cancelled successfully! Refund initiated 💰. Confirmation sent to ${req.user.email} 📧`);
    } catch (error) {
      console.error('Error saving ticket after cancellation:', error);
      req.flash("error", "Failed to cancel ticket. Please try again.");
    }
  } else if (ticket.status === "available" && isOwner) {
    // If it's available and owned by user, delete it
    try {
      // Send email notification before deletion
      try {
        const emailSubject = `🗑️ Ticket Deleted: ${ticket.eventName}`;
        const emailText = `Hello ${req.user.username},

Your ticket for "${ticket.eventName}" has been successfully deleted.

Deleted Event Details:
- Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Location: ${ticket.location}

If you have any questions, please contact our support team.

Thank you for using our ticketing service!

Best regards,
Event Ticket Marketplace Team`;
        
        await sendEmail(
          req.user.email,
          emailSubject,
          emailText
        );
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
      }
      
      await Ticket.findByIdAndDelete(id);
      
      req.flash("success", `Ticket deleted successfully! Notification sent to ${req.user.email} 📧`);
      
      res.redirect("/tickets");
      return;
    } catch (error) {
      console.error('Error deleting ticket:', error);
      req.flash("error", "Failed to delete ticket. Please try again.");
    }
  }
  
  res.redirect("/tickets");
};

// Show ticket confirmation
module.exports.showConfirmation = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate("owner").populate({
    path: "bookedBy",
    select: "username email" // Only populate username and email
  });
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  // Check if ticket is booked and if current user is the one who booked it
  if (ticket.status !== "booked" || !ticket.bookedBy) {
    req.flash("error", "You do not have permission to view this confirmation!");
    return res.redirect("/tickets");
  }
  
  // Additional check to ensure the current user is the one who booked the ticket
  if (!ticket.bookedBy._id.equals(req.user._id)) {
    req.flash("error", "You do not have permission to view this confirmation!");
    return res.redirect("/tickets");
  }
  
  res.render("tickets/confirmation", { ticket });
};

// Download ticket as PDF
module.exports.downloadTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id).populate("owner").populate({
    path: "bookedBy",
    select: "username email" // Only populate username and email
  });
  if (!ticket) {
    req.flash("error", "Ticket not found!");
    return res.redirect("/tickets");
  }
  
  if (ticket.status !== "booked" || !ticket.bookedBy) {
    req.flash("error", "You do not have permission to download this ticket!");
    return res.redirect("/tickets");
  }
  
  // Additional check to ensure the current user is the one who booked the ticket
  if (!ticket.bookedBy._id.equals(req.user._id)) {
    req.flash("error", "You do not have permission to download this ticket!");
    return res.redirect("/tickets");
  }
  
  // Generate PDF
  try {
    const doc = new PDFDocument();
    const filename = `ticket-${ticket.bookingId}.pdf`;
    
    // Set headers for PDF download
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/pdf");
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add content to PDF
    doc.fontSize(20).text("🎟️ Event Ticket", { align: "center" });
    doc.moveDown();
    
    doc.fontSize(16).text(`Event: ${ticket.eventName}`);
    doc.moveDown();
    
    doc.fontSize(12).text(`Booking ID: ${ticket.bookingId}`);
    doc.text(`Date: ${ticket.eventDate.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`);
    doc.text(`Location: ${ticket.location}`);
    doc.text(`Category: ${ticket.eventCategory}`);
    doc.text(`Price: ₹${ticket.pricePerTicket.toLocaleString('en-IN')}`);
    doc.text(`Booked by: ${ticket.bookedBy.username}`);
    doc.text(`Booking Date: ${ticket.bookingDate.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
    doc.moveDown();
    
    doc.fontSize(14).text("QR Code:", { underline: true });
    doc.fontSize(12).text(ticket.qrCode);
    doc.moveDown();
    
    doc.fontSize(10).text("Note: Please bring this ticket to the event. The QR code will be scanned at the entrance.", {
      align: "center",
      italic: true
    });
    
    // Finalize PDF file
    doc.end();
  } catch (error) {
    req.flash("error", "Failed to generate ticket PDF. Please try again.");
    res.redirect(`/tickets/${req.params.id}/confirmation`);
  }
};

// Show my booked tickets
module.exports.myBookedTickets = async (req, res) => {
  const tickets = await Ticket.find({ 
    bookedBy: req.user._id, 
    status: "booked" 
  }).populate("owner");
  
  res.render("tickets/my-tickets", { tickets });
};

// Admin dashboard
module.exports.adminDashboard = async (req, res) => {
  // Get all tickets
  const allTickets = await Ticket.find({}).populate("bookedBy");
  
  // Calculate statistics
  const totalTickets = allTickets.length;
  const bookedTickets = allTickets.filter(t => t.status === "booked").length;
  const availableTickets = allTickets.filter(t => t.status === "available").length;
  
  // Calculate total revenue
  const totalRevenue = allTickets
    .filter(t => t.status === "booked")
    .reduce((sum, ticket) => sum + ticket.pricePerTicket, 0);
  
  // Group by category for charts
  const categories = ["Concert", "Sports", "Theatre", "Festival", "Comedy", "Other"];
  const categoryData = categories.map(category => 
    allTickets.filter(t => t.eventCategory === category).length
  );
  
  const revenueData = categories.map(category => {
    return allTickets
      .filter(t => t.eventCategory === category && t.status === "booked")
      .reduce((sum, ticket) => sum + ticket.pricePerTicket, 0);
  });
  
  // Get recent bookings (last 10)
  const recentBookings = allTickets
    .filter(t => t.status === "booked")
    .sort((a, b) => b.bookingDate - a.bookingDate)
    .slice(0, 10);
  
  res.render("admin/dashboard", {
    totalTickets,
    bookedTickets,
    availableTickets,
    totalRevenue,
    categoryLabels: categories,
    categoryData,
    revenueData,
    recentBookings
  });
};

// QR Scanner page
module.exports.qrScanner = async (req, res) => {
  res.render("admin/qr-scanner");
};

// Calculate dynamic price based on availability
function calculateDynamicPrice(basePrice, totalSeats, availableSeats) {
  if (totalSeats <= 0) return basePrice;
  
  const percentageLeft = (availableSeats / totalSeats) * 100;
  
  if (percentageLeft >= 80) {
    return basePrice; // ₹200
  } else if (percentageLeft >= 50) {
    return Math.round(basePrice * 1.25); // ₹250 (25% increase)
  } else if (percentageLeft >= 20) {
    return Math.round(basePrice * 1.5); // ₹300 (50% increase)
  } else {
    return Math.round(basePrice * 2); // ₹400 (100% increase)
  }
}






