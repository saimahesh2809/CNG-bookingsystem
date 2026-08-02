// db.js - Client-Side Mock Database Layer utilizing LocalStorage
(function() {
  const DB_KEYS = {
    USERS: "cng_users",
    LOGGED_IN: "loggedInUser", // Matches original project's key
    PUMPS: "cng_pumps",
    BOOKINGS: "cng_bookings",
    TICKETS: "cng_tickets",
    SELECTED_PUMP: "selectedPump" // Matches original project's key
  };

  // Default Pumps data (extending user's original list)
  const defaultPumps = [
    { name: "HP Petrol Pump - Ameerpet", lat: 17.4375, lng: 78.4483, available: true, queue: 12, address: "Ameerpet Main Rd", hours: "6AM - 11PM", price: 89.50 },
    { name: "BP Petrol Pump - Kukatpally", lat: 17.4933, lng: 78.3995, available: true, queue: 18, address: "Kukatpally Jn", hours: "24/7", price: 89.50 },
    { name: "Indian Oil - Miyapur", lat: 17.4930, lng: 78.3657, available: true, queue: 8, address: "Miyapur Road", hours: "5AM - 11PM", price: 89.20 },
    { name: "Shell - Gachibowli", lat: 17.4401, lng: 78.3489, available: true, queue: 5, address: "Gachibowli Circle", hours: "24/7", price: 92.00 },
    { name: "Reliance - Hitech City", lat: 17.4470, lng: 78.3763, available: false, queue: 0, address: "Hitech City Road", hours: "6AM - 10PM", price: 89.00 },
    { name: "Essar - Mehdipatnam", lat: 17.3840, lng: 78.4560, available: true, queue: 10, address: "Mehdipatnam X Rd", hours: "24/7", price: 89.50 },
    { name: "HP - Uppal", lat: 17.4003, lng: 78.5586, available: true, queue: 7, address: "Uppal Main Rd", hours: "6AM - 12AM", price: 89.50 },
    { name: "BP - Secunderabad", lat: 17.4399, lng: 78.4983, available: false, queue: 0, address: "Secunderabad Station Rd", hours: "24/7", price: 89.50 },
    { name: "Indian Oil - LB Nagar", lat: 17.3532, lng: 78.5521, available: true, queue: 6, address: "LB Nagar X Rd", hours: "5AM - 11PM", price: 89.20 },
    { name: "Shell - Tarnaka", lat: 17.4297, lng: 78.5283, available: true, queue: 4, address: "Tarnaka Main Rd", hours: "24/7", price: 92.00 }
  ];

  // Default bookings to start with
  const defaultBookings = [
    {
      id: "CNG-BK-99120",
      username: "sai",
      fullname: "K. Sai Mahesh",
      contact: "6301069563",
      vehicleno: "TS09EA1234",
      pump: "HP Petrol Pump - Ameerpet",
      date: "2026-07-28",
      time: "10:00 AM",
      payment: "UPI",
      status: "Confirmed",
      timestamp: new Date("2026-07-28T10:00:00").getTime()
    },
    {
      id: "CNG-BK-99121",
      username: "sai",
      fullname: "K. Sai Mahesh",
      contact: "6301069563",
      vehicleno: "TS09EA1234",
      pump: "Indian Oil - Miyapur",
      date: "2026-07-29",
      time: "02:30 PM",
      payment: "Debit Card",
      status: "Confirmed",
      timestamp: new Date("2026-07-29T14:30:00").getTime()
    }
  ];

  // Initialize DB tables
  function initDB() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
      // Create a default test account: user "sai", password "sai123"
      const initialUsers = [{
        username: "sai",
        fullname: "K. Sai Mahesh",
        email: "support@cngbookingsystem.com",
        contact: "6301069563",
        vehicleno: "TS09EA1234",
        password: "sai123"
      }];
      localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
    }
    if (!localStorage.getItem(DB_KEYS.PUMPS)) {
      localStorage.setItem(DB_KEYS.PUMPS, JSON.stringify(defaultPumps));
    }
    if (!localStorage.getItem(DB_KEYS.BOOKINGS)) {
      localStorage.setItem(DB_KEYS.BOOKINGS, JSON.stringify(defaultBookings));
    }
    if (!localStorage.getItem(DB_KEYS.TICKETS)) {
      localStorage.setItem(DB_KEYS.TICKETS, JSON.stringify([]));
    }
  }

  // Get data helpers
  function getData(key) {
    return JSON.parse(localStorage.getItem(key));
  }

  function setData(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  // Public DB API
  window.CNG_DB = {
    init: initDB,

    // Auth methods
    getLoggedInUser: function() {
      return getData(DB_KEYS.LOGGED_IN);
    },

    register: function(fullname, email, contact, vehicleno, username, password) {
      const users = getData(DB_KEYS.USERS) || [];
      const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        return { success: false, message: "Username or Email already registered!" };
      }
      const newUser = { fullname, email, contact, vehicleno, username, password };
      users.push(newUser);
      setData(DB_KEYS.USERS, users);
      
      // Auto login
      setData(DB_KEYS.LOGGED_IN, newUser);
      return { success: true, user: newUser };
    },

    login: function(usernameOrEmail, password) {
      const users = getData(DB_KEYS.USERS) || [];
      const user = users.find(u => 
        (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
        u.password === password
      );
      if (user) {
        setData(DB_KEYS.LOGGED_IN, user);
        return { success: true, user: user };
      }
      return { success: false, message: "Invalid username/email or password." };
    },

    logout: function() {
      localStorage.removeItem(DB_KEYS.LOGGED_IN);
    },

    // Pumps methods
    getPumps: function() {
      return getData(DB_KEYS.PUMPS) || [];
    },

    getPumpByName: function(name) {
      const pumps = this.getPumps();
      return pumps.find(p => p.name === name);
    },

    setSelectedPump: function(pumpName) {
      localStorage.setItem(DB_KEYS.SELECTED_PUMP, pumpName);
    },

    getSelectedPump: function() {
      return localStorage.getItem(DB_KEYS.SELECTED_PUMP);
    },

    // Bookings methods
    getBookings: function(username) {
      const allBookings = getData(DB_KEYS.BOOKINGS) || [];
      return allBookings.filter(b => b.username === username);
    },

    getBookingById: function(bookingId) {
      const allBookings = getData(DB_KEYS.BOOKINGS) || [];
      return allBookings.find(b => b.id === bookingId);
    },

    addBooking: function(bookingData) {
      const user = this.getLoggedInUser();
      if (!user) return { success: false, message: "User not logged in." };

      const allBookings = getData(DB_KEYS.BOOKINGS) || [];
      
      // Check for double booking at the same slot for the selected pump
      const slotExists = allBookings.some(b => 
        b.pump === bookingData.pump && 
        b.date === bookingData.date && 
        b.time === bookingData.time && 
        b.status === "Confirmed"
      );
      if (slotExists) {
        return { success: false, message: "This slot is already booked. Please choose another slot." };
      }

      const bookingId = "CNG-BK-" + Math.floor(10000 + Math.random() * 90000);
      const newBooking = {
        id: bookingId,
        username: user.username,
        fullname: bookingData.fullname || user.fullname,
        contact: bookingData.contact || user.contact,
        vehicleno: bookingData.vehicleno || user.vehicleno,
        pump: bookingData.pump,
        date: bookingData.date,
        time: bookingData.time,
        payment: bookingData.payment,
        status: "Confirmed",
        timestamp: new Date(`${bookingData.date}T${convertTo24h(bookingData.time)}`).getTime()
      };

      allBookings.push(newBooking);
      setData(DB_KEYS.BOOKINGS, allBookings);

      // Increment queue size slightly for the pump
      this.updatePumpQueue(bookingData.pump, 1);

      return { success: true, booking: newBooking };
    },

    cancelBooking: function(bookingId) {
      const allBookings = getData(DB_KEYS.BOOKINGS) || [];
      const booking = allBookings.find(b => b.id === bookingId);
      if (!booking) return { success: false, message: "Booking not found." };

      booking.status = "Cancelled";
      setData(DB_KEYS.BOOKINGS, allBookings);

      // Decrement queue size for the pump
      this.updatePumpQueue(booking.pump, -1);

      return { success: true };
    },

    updatePumpQueue: function(pumpName, delta) {
      const pumps = this.getPumps();
      const pump = pumps.find(p => p.name === pumpName);
      if (pump) {
        pump.queue = Math.max(0, pump.queue + delta);
        setData(DB_KEYS.PUMPS, pumps);
      }
    },

    // Support ticketing
    getTickets: function(username) {
      const allTickets = getData(DB_KEYS.TICKETS) || [];
      return allTickets.filter(t => t.username === username);
    },

    addTicket: function(name, email, feedback) {
      const user = this.getLoggedInUser();
      const allTickets = getData(DB_KEYS.TICKETS) || [];
      const newTicket = {
        id: "TKT-" + Math.floor(100 + Math.random() * 900),
        username: user ? user.username : "guest",
        name,
        email,
        feedback,
        status: "Open",
        date: new Date().toLocaleDateString(),
        reply: null
      };
      allTickets.push(newTicket);
      setData(DB_KEYS.TICKETS, allTickets);
      return newTicket;
    }
  };

  // Convert "10:00 AM" to "10:00" for Date constructor parsing safety
  function convertTo24h(timeStr) {
    if (!timeStr) return "00:00";
    // Check if format is already 24h
    if (!timeStr.includes("AM") && !timeStr.includes("PM")) {
      return timeStr;
    }
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") {
      hours = "00";
    }
    if (modifier === "PM") {
      hours = parseInt(hours, 10) + 12;
    }
    return `${hours}:${minutes}`;
  }

  // Initialize immediately
  initDB();

  // Background queue updates to make the site feel alive
  setInterval(() => {
    const pumps = getData(DB_KEYS.PUMPS) || [];
    if (pumps.length === 0) return;
    // Pick a random pump
    const idx = Math.floor(Math.random() * pumps.length);
    const pump = pumps[idx];
    if (pump.available) {
      // queue fluctuations (-1, 0, +1)
      const change = Math.floor(Math.random() * 3) - 1;
      pump.queue = Math.max(1, pump.queue + change);
      // random availability toggle (rarely)
      if (Math.random() < 0.02) {
        pump.available = false;
        pump.queue = 0;
      }
    } else {
      // 5% chance deactivated pump turns back online
      if (Math.random() < 0.05) {
        pump.available = true;
        pump.queue = Math.floor(Math.random() * 8) + 2;
      }
    }
    setData(DB_KEYS.PUMPS, pumps);
  }, 10000); // simulation interval: 10s

})();
