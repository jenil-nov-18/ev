// Small helper to sync header login/register links and show logged-in state
(function(){
    'use strict';
    var CURRENT_KEY = 'ev_currentUser';

    function getCurrent(){
        try { return JSON.parse(localStorage.getItem(CURRENT_KEY)); } catch(e){ return null; }
    }

    function logout(){
        localStorage.removeItem(CURRENT_KEY);
        render();
    }

    function render(){
        var cur = getCurrent();
        var loginEls = document.querySelectorAll('a.login');
        var registerEls = document.querySelectorAll('a.register');
        loginEls.forEach(function(el){
            // remove href to avoid showing URL on hover; use click handler for navigation
            el.removeAttribute('href');
            el.setAttribute('role', 'button');
            if(cur){
                el.textContent = 'Welcome, ' + (cur.firstname || cur.email);
                el.classList.add('logged-in');
                // navigate to profile page when clicked
                el.onclick = function(e){
                    e.preventDefault();
                    // Try a small set of candidate relative paths so the link works
                    // from pages in different folders (Home/, Login_SignUp/, repo root, etc.)
                    var candidates = ['profile.html', 'Home/profile.html', '../Home/profile.html', '../profile.html'];
                    // If running under http(s) we can probe which exists using fetch HEAD; otherwise fall back to trying navigations
                    var tryNavigate = function(path){ window.location.href = path; };

                    if(window.location.protocol.indexOf('http') === 0 && window.fetch){
                        // probe candidates in sequence
                        (function probe(i){
                            if(i >= candidates.length) return tryNavigate(candidates[0]);
                            var p = candidates[i];
                            // use fetch with cache: 'no-store' to avoid cached 404s
                            fetch(p, { method: 'HEAD', cache: 'no-store' }).then(function(resp){
                                if(resp && resp.ok) tryNavigate(p);
                                else probe(i+1);
                            }).catch(function(){ probe(i+1); });
                        })(0);
                    } else {
                        // file:// or fetch not available — just try the most likely paths by navigating
                        for(var j=0;j<candidates.length;j++){
                            tryNavigate(candidates[j]);
                        }
                    }
                };
            } else {
                el.textContent = 'Login';
                el.classList.remove('logged-in');
                el.onclick = function(e){ e.preventDefault(); window.location.href = 'Login_SignUp/Login/login.html'; };
            }
        });
        registerEls.forEach(function(el){
            // remove href to avoid showing URL on hover; use click handler
            el.removeAttribute('href');
            el.setAttribute('role', 'button');
            if(cur){
                // replace register link with logout
                el.textContent = 'Logout';
                el.onclick = function(e){ e.preventDefault(); logout(); };
            } else {
                el.textContent = 'Create an account';
                el.onclick = function(e){ e.preventDefault(); window.location.href = 'Login_SignUp/signup.html'; };
            }
        });
        // Ensure main menu contains Bookings entry (idempotent)
        try {
            var menus = document.querySelectorAll('ul.main-menu');
            menus.forEach(function(menu){
                if(!menu.querySelector('a[href="my_bookings.html"]')){
                    var li = document.createElement('li');
                    li.innerHTML = '<a href="#">Bookings</a><ul class="sub-menu"><li><a href="my_bookings.html">My Bookings</a></li><li><a href="live_status.html">Live Status</a></li></ul>';
                    // append near the end but before Contact if present
                    var contact = menu.querySelector('a[href="contact.html"]');
                    if(contact && contact.parentNode) menu.insertBefore(li, contact.parentNode);
                    else menu.appendChild(li);
                }
                // also insert Profile link if not present
                if(!menu.querySelector('a[href="profile.html"]')){
                    var pli = document.createElement('li');
                    // give Profile a clear visible anchor and class for styling
                    pli.innerHTML = '<a href="profile.html" class="nav-profile">Profile</a>';
                    var contact = menu.querySelector('a[href="contact.html"]');
                    if(contact && contact.parentNode) menu.insertBefore(pli, contact.parentNode);
                    else menu.appendChild(pli);
                }
            });
        } catch(e){ /* ignore menu injection errors */ }

        // Booking count badge next to login (shows number of bookings for current user)
        try {
            var firstLogin = document.querySelector('a.login');
            if(firstLogin){
                var bc = document.getElementById('bookingCount');
                if(!bc){ bc = document.createElement('span'); bc.id = 'bookingCount'; bc.style.marginLeft = '8px'; bc.className = 'badge badge-warning'; firstLogin.parentNode.insertBefore(bc, firstLogin.nextSibling); }
                if(cur && window.EVAuth && window.EVAuth.getBookingsForUser){
                    var list = window.EVAuth.getBookingsForUser(cur.email) || [];
                    bc.textContent = list.length > 0 ? (' ' + list.length) : '';
                    bc.style.display = list.length > 0 ? 'inline-block' : 'none';
                } else {
                    bc.textContent = '';
                    bc.style.display = 'none';
                }
            }
        } catch(e){ /* ignore badge errors */ }
    }

    // expose render so pages can call it after auth-include.js is loaded
    window.EVAuthInclude = { render: render };

    // lightweight style injection so nav links show pointer cursor on hover
    (function injectCursorStyle(){
        try{
            var id = 'ev-auth-include-style';
            if(!document.getElementById(id)){
                var s = document.createElement('style'); s.id = id;
                s.textContent = '.main-menu a, .header-area a, .nav-profile, a.login, a.register { cursor: pointer; }';
                document.head ? document.head.appendChild(s) : document.getElementsByTagName('head')[0].appendChild(s);
            }
        }catch(e){/* ignore */}
    })();

    // auto-run after DOM ready
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', render);
    } else render();
})();
