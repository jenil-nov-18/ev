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
                el.onclick = function(e){ e.preventDefault(); };
            } else {
                el.textContent = 'Login';
                el.classList.remove('logged-in');
                el.onclick = function(e){ e.preventDefault(); window.location.href = '../Login_SignUp/Login/login.html'; };
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
                el.onclick = function(e){ e.preventDefault(); window.location.href = '../Login_SignUp/signup.html'; };
            }
        });
    }

    // expose render so pages can call it after auth-include.js is loaded
    window.EVAuthInclude = { render: render };

    // auto-run after DOM ready
    if(document.readyState === 'loading'){
        document.addEventListener('DOMContentLoaded', render);
    } else render();
})();
