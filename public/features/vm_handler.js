// #vm-output

// unless we are doing something, keep the runtime up

console.log("Injected!")

show_runtime = true;
runtime = 0;
setInterval(() => {
    if (show_runtime) {
        document.querySelector('#vm-output').innerHTML = runtime + " seconds";
    }
    runtime += 1;
}, 1000);


// Isolate LocalStorage

isolated_ls = {};

localStorage = function() {
    return {
        getItem: function(key) {
            return isolated_ls[key];
        },
        setItem: function(key, value) {
            isolated_ls[key] = value;
        },
        removeItem: function(key) {
            delete isolated_ls[key];
        },
        clear: function() {
            isolated_ls = {};
        }
    }
}   

// isolate SessionStorage

isolated_ss = {};

sessionStorage = function() {
    return {
        getItem: function(key) {
            return isolated_ss[key];
        },
        setItem: function(key, value) {
            isolated_ss[key] = value;
        },
        removeItem: function(key) {
            delete isolated_ss[key];
        },
        clear: function() {
            isolated_ss = {};
        }
    }
}

// Indicate we are in VM context for main.html to detect
window.isInVM = true;

// isolate Cookies

isolated_cookies = {};

Object.defineProperty(document, 'cookie', {
    get: function() {
        // Return all cookies as a single string "key1=value1; key2=value2"
        return Object.entries(isolated_cookies).map(([k, v]) => `${k}=${v}`).join('; ');
    },
    set: function(cookie) {
        // Parse cookie string "key=value; ..." and update isolated_cookies
        const parts = cookie.split(';')[0].split('=');
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (value === '') {
            // If empty value, delete cookie
            delete isolated_cookies[key];
        } else {
            isolated_cookies[key] = value;
        }
    }
});
