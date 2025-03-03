(function() {
    console.log('EventTracker.js loaded in Salesforce');
    var endpoint = 'https://webhook-test.com/f7cf3f838d1b1f31d41a70d5f2cd063d'; 
    
    // Make the tracker globally accessible
    window.EventTracker = {};

    // Track current frame only
    var isTopFrame = window.self === window.top;
    console.log('Running in ' + (isTopFrame ? 'top frame' : 'iframe'));

    function sendEvent(data) {
        // Add frame information
        data.frame = isTopFrame ? 'top' : 'iframe';
        
        // Send data using fetch with error handling
        try {
            fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(function(response) {
                console.log('Event sent successfully:', data);
            }).catch(function(error) {
                console.error('Fetch error, falling back to XHR:', error);
                sendEventXHR(data);
            });
        } catch (e) {
            console.error('Error using fetch, falling back to XHR:', e);
            sendEventXHR(data);
        }
    }

    // Fallback XHR method for older browsers
    function sendEventXHR(data) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', endpoint, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    console.log('XHR event sent, status:', xhr.status);
                }
            };
            xhr.send(JSON.stringify(data));
        } catch (e) {
            console.error('Failed to send event via XHR:', e);
        }
    }

    function getUserId() {
        try {
            var userId = localStorage.getItem('sfUserId');
            if (!userId) {
                userId = 'user-' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('sfUserId', userId);
            }
            return userId;
        } catch (e) {
            console.error('Error accessing localStorage:', e);
            return 'anonymous-' + Math.random().toString(36).substr(2, 9);
        }
    }

    function clickHandler(event) {
        try {
            var clickedElement = event.target;
            
            // Basic data that won't cause security issues
            var clickData = {
                event: 'click',
                tag: clickedElement.tagName || 'UNKNOWN',
                id: clickedElement.id || 'No ID',
                class: clickedElement.className || 'No Class',
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userId: getUserId()
            };
            
            // Safely extract text content
            try {
                if (clickedElement.textContent) {
                    clickData.text = clickedElement.textContent.trim().substring(0, 100);
                }
            } catch (e) {
                clickData.text = 'Error extracting text';
            }
            
            // Safely get href for links
            try {
                if (clickedElement.tagName === 'A' && clickedElement.href) {
                    clickData.href = clickedElement.href;
                }
            } catch (e) {
                clickData.href = 'Error extracting href';
            }
            
            console.log('Click event captured!', clickData);
            sendEvent(clickData);
        } catch (e) {
            console.error('Error in click handler:', e);
        }
    }

    // Track page view when script loads
    var pageData = {
        event: 'page_view',
        url: window.location.href,
        title: document.title || '',
        timestamp: new Date().toISOString(),
        userId: getUserId(),
        salesforce: true
    };
    sendEvent(pageData);
    
    // Add click listener safely
    try {
        document.addEventListener('click', clickHandler, true);
        console.log('Click listener attached');
    } catch (e) {
        console.error('Failed to attach click listener:', e);
    }
    
    // Track page unload
    try {
        window.addEventListener('beforeunload', function() {
            var unloadData = {
                event: 'page_unload',
                url: window.location.href,
                timestamp: new Date().toISOString(),
                userId: getUserId()
            };
            
            // Use navigator.sendBeacon if available (most reliable for unload events)
            if (navigator.sendBeacon) {
                navigator.sendBeacon(endpoint, JSON.stringify(unloadData));
            } else {
                // Fallback to synchronous XHR
                var xhr = new XMLHttpRequest();
                xhr.open('POST', endpoint, false); // Synchronous
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(unloadData));
            }
        });
        console.log('Unload listener attached');
    } catch (e) {
        console.error('Failed to attach unload listener:', e);
    }
    
    // Export trackEvent method
    window.EventTracker.trackEvent = function(eventName, eventData) {
        var data = eventData || {};
        data.event = eventName;
        data.url = window.location.href;
        data.timestamp = new Date().toISOString();
        data.userId = getUserId();
        sendEvent(data);
        return true;
    };

    console.log('EventTracker initialized successfully');
})();
