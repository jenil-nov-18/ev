// Simple client-side auth using localStorage
// Warning: This is only for demo/testing. localStorage is not secure for production.
(function(){
    'use strict';

    var STORAGE_KEY = 'ev_users';
    var CURRENT_KEY = 'ev_currentUser';
    var BOOKINGS_KEY = 'ev_bookings';

    function loadUsers(){
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch(e){ return []; }
    }

    function saveUsers(users){
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }

    function findUserByEmail(email){
        var users = loadUsers();
        return users.find(function(u){ return u.email === email; });
    }

    function signupUser(data){
        // basic validation
        if(!data.firstname || !data.email || !data.password){
            return { ok:false, message: 'First name, email and password are required.' };
        }
        if(findUserByEmail(data.email)){
            return { ok:false, message: 'An account with this email already exists.' };
        }
        var users = loadUsers();
        users.push({
            firstname: data.firstname,
            lastname: data.lastname || '',
            email: data.email,
            password: data.password, // plain text for demo only
            phone: data.phone || '',
            county: data.county || '',
            pincode: data.pincode || '',
            address: data.address || '',
            city: data.city || ''
        });
        saveUsers(users);
        return { ok:true };
    }

    function loginUser(identifier, password){
        var users = loadUsers();
        var user = users.find(function(u){ return (u.email === identifier || u.firstname === identifier) && u.password === password; });
        if(!user) return { ok:false, message: 'Invalid credentials' };
        localStorage.setItem(CURRENT_KEY, JSON.stringify({ email: user.email, firstname: user.firstname }));
        return { ok:true, user: user };
    }

    function logout(){
        localStorage.removeItem(CURRENT_KEY);
    }

    // Bookings API (client-side)
    function loadBookings(){
        try { return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || []; } catch(e){ return []; }
    }

    function saveBookings(list){
        localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
    }

    function getCurrentUser(){
        try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); } catch(e){ return null; }
    }

    function bookSeat(seatIndex, timeLabel){
        var cur = getCurrentUser();
        if(!cur) return { ok:false, message: 'Not authenticated' };
        var bookings = loadBookings();
        // Check if already booked
        if(bookings.some(function(b){ return b.seatIndex === seatIndex; })){
            return { ok:false, message: 'Seat already booked' };
        }
        var id = 'b_' + Date.now() + '_' + Math.floor(Math.random()*1000);
        var booking = {
            id: id,
            seatIndex: seatIndex,
            time: timeLabel || null,
            email: cur.email,
            firstname: cur.firstname,
            createdAt: (new Date()).toISOString()
        };
        bookings.push(booking);
        saveBookings(bookings);

        // Also update seats array (keep legacy format: 'true' or 'false')
        var seatsRaw = localStorage.getItem('seats');
        var seats = seatsRaw ? seatsRaw.split(',') : new Array(48).fill('false');
        seats[seatIndex] = 'true';
        localStorage.setItem('seats', seats);

        return { ok:true, booking: booking };
    }

    function getBookings(){
        return loadBookings();
    }

    function getBookingsForUser(email){
        var bookings = loadBookings();
        return bookings.filter(function(b){ return b.email === email; });
    }

    // Cancel a booking by id. Returns {ok:true, booking:...} or {ok:false, message:...}
    function cancelBooking(bookingId){
        var bookings = loadBookings();
        var idx = bookings.findIndex(function(b){ return b.id === bookingId; });
        if(idx === -1) return { ok:false, message: 'Booking not found' };
        var booking = bookings[idx];
        // remove booking
        bookings.splice(idx, 1);
        saveBookings(bookings);
        // free the seat in legacy seats array
        try {
            var seatsRaw = localStorage.getItem('seats');
            var seats = seatsRaw ? seatsRaw.split(',') : new Array(48).fill('false');
            if(typeof booking.seatIndex === 'number') seats[booking.seatIndex] = 'false';
            localStorage.setItem('seats', seats);
        } catch(e){ /* ignore */ }
        return { ok:true, booking: booking };
    }

    // Update user profile (matches by email). Returns {ok:true, user:...} or {ok:false, message:...}
    function updateUser(updated){
        if(!updated || !updated.email) return { ok:false, message: 'Invalid user data' };
        var users = loadUsers();
        var idx = users.findIndex(function(u){ return u.email === updated.email; });
        if(idx === -1) return { ok:false, message: 'User not found' };
        // Only allow updating certain fields
        var allowed = ['firstname','lastname','phone','city','address','pincode','county'];
        allowed.forEach(function(k){ if(typeof updated[k] !== 'undefined') users[idx][k] = updated[k]; });
        saveUsers(users);
        // If current user is this user, update ev_currentUser display name
        try {
            var cur = getCurrentUser();
            if(cur && cur.email === updated.email){
                var newCur = { email: users[idx].email, firstname: users[idx].firstname };
                localStorage.setItem(CURRENT_KEY, JSON.stringify(newCur));
            }
        } catch(e){}
        return { ok:true, user: users[idx] };
    }

    // Expose on window for form handlers and other pages
    window.EVAuth = {
        signupUser: signupUser,
        loginUser: loginUser,
        logout: logout,
        bookSeat: bookSeat,
        cancelBooking: cancelBooking,
        updateUser: updateUser,
        getBookings: getBookings,
        getBookingsForUser: getBookingsForUser,
        getCurrentUser: getCurrentUser,
        // debugging helpers
        _loadUsers: loadUsers,
        _loadBookings: loadBookings
    };
})();
